# weather.py is the worker that fetches the data, main.py is the receptionist of the FastAPI application

from fastapi import FastAPI, HTTPException
from weather import get_local_weather, LocalWeather
from pydantic import BaseModel
from ml_engine import predict_demand

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

# Endpoint for order suggestion
@app.post("/api/predict", response_model=PredictionResponse)
async def get_inventory_prediction(request_data: PredictionRequest):
    # 1. Fetch tomorrow's weather automatically
    weather_info = await get_local_weather() 
    if not weather_info:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast from OpenWeatherMap")
        
    # 2. Run AI calculation logic using tomorrow's temperature
    prediction = predict_demand(
        base_demand=request_data.base_demand,
        product_type=request_data.product_type,
        temperature=weather_info.temperature
    )
    
    # 3. Calculate suggested order (Demand minus what we already have on shelves)
    suggestion = prediction - request_data.current_stock
    
    # 4. Return everything back to Django cleanly
    return PredictionResponse(
        product_name=request_data.product_name,
        predicted_demand=prediction,
        suggested_order=max(0, suggestion)  # Don't suggest negative order counts
    )


 