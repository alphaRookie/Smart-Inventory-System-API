# weather.py is the worker that fetches the data, main.py is the receptionist of the FastAPI application

from fastapi import FastAPI, HTTPException
from weather import get_local_weather, LocalWeather
from pydantic import BaseModel
from fastapi.concurrency import run_in_threadpool
import joblib

# Create the main FastAPI application instance
app = FastAPI(title="Smart-Inventory-System")

# A simple home route just to test if the server is alive
@app.get("/")
async def home():
    return {"status": "Successfully running!"}


# The API route to fetch the weather data
@app.get("/api/fetch-weather", response_model=LocalWeather)
async def fetch_tomorrow_weather():
    # Call the worker function from weather.py 
    weather_info = await get_local_weather() # use 'await' for async

    if not weather_info:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast from OpenWeatherMap")
    return weather_info # FastAPI turns this into clean JSON automatically


# This is the request data template that Django must send to FastAPI
class PredictionRequest(BaseModel):
    product_name: str
    product_type: str
    base_demand: int
    current_stock: int

# This is what FastAPI will give back to Django
class PredictionResponse(BaseModel):
    product_name: str
    predicted_demand: int
    suggested_order: int

#load model
model = joblib.load("../ml_model/weather_model.joblib")

# Endpoint for order suggestion
@app.post("/api/predict", response_model=PredictionResponse)
async def get_inventory_prediction(request_data: PredictionRequest):
    # 1. Fetch tomorrow's weather automatically
    weather_info = await get_local_weather() 
    if not weather_info:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast from OpenWeatherMap")
        
    # 2. Format product_type string into binary values (0 or 1) for the model
    cold_boost = 1 if request_data.product_type == "COLD_BOOST" else 0
    heat_boost = 1 if request_data.product_type == "HEAT_BOOST" else 0
    weather_neutral = 1 if request_data.product_type == "WEATHER_NEUTRAL" else 0

    # Match the column sequence used in .csv file
    features = [
        [
            request_data.base_demand,
            weather_info.temperature,
            cold_boost,
            heat_boost,
            weather_neutral,
        ]
    ]

    # 3. takes these 5 inputs (features), runs them through the tree model, and outputs a calculated number 
    # this part replace running manual if/else logic i had before
    prediction = await run_in_threadpool(model.predict, features)
    predicted_demand = max(0, int(prediction[0])) #catch the output

    # 4. Calculate suggested order count
    suggestion = max(0, predicted_demand - request_data.current_stock) # Don't suggest negative order counts(The suggestion only triggers when stock drops below the predicted demand)

    return PredictionResponse(
        product_name=request_data.product_name,
        predicted_demand=predicted_demand,
        suggested_order=suggestion,
    )
