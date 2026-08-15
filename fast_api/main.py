# weather.py is the worker that fetches the data, main.py is the receptionist of the FastAPI application

from fastapi import FastAPI, HTTPException
from weather import get_local_weather, LocalWeather
from pydantic import BaseModel
from fastapi.concurrency import run_in_threadpool
import joblib
import pandas as pd

# Create the main FastAPI application instance
app = FastAPI(title="Smart-Inventory-System")

# A simple home route just to test if the server is alive
@app.get("/")
async def home():
    return {"status": "Successfully running!"}


# This is the request data template that Django must send to FastAPI
class PredictionRequest(BaseModel):
    product_id: int
    product_type: str
    base_demand: int
    current_stock: int
    target_days_prediction: int

# This is what FastAPI will give back to Django
class PredictionResponse(BaseModel):
    product_id: int
    predicted_demand: int
    suggested_order: int

#load model
model = joblib.load("../ml_model/weather_model.joblib")


# Single prediction Endpoint
@app.post("/api/predict-single", response_model=PredictionResponse) # Assigns a spesific value to parameter
async def get_inventory_prediction(request_data: PredictionRequest): # tells FastAPI what type a variable should be
    # 1. Fetch tomorrow's weather automatically
    weather_info = await get_local_weather(target_days=request_data.target_days_prediction) # pass target_days user wanted to weather.py file
    if not weather_info:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast from OpenWeatherMap")
        
    # 2. Format product_type string into binary values (0 or 1) for the model
    cold_boost = 1 if request_data.product_type == "COLD_BOOST" else 0
    heat_boost = 1 if request_data.product_type == "HEAT_BOOST" else 0
    weather_neutral = 1 if request_data.product_type == "WEATHER_NEUTRAL" else 0

    # Match the column sequence used in .csv file
    features_data = [{
        "base_demand": request_data.base_demand,
        "temperature": weather_info.temperature,
        "product_type_COLD_BOOST": cold_boost,
        "product_type_HEAT_BOOST": heat_boost,
        "product_type_WEATHER_NEUTRAL": weather_neutral,
    }]

    features_df = pd.DataFrame(features_data) # transforms raw Python data into a structured 2D table with rows & columns

    # 3. takes these 5 inputs (features), runs them through the tree model, and outputs a calculated number 
    # this part replace running manual if/else logic i had before
    prediction = await run_in_threadpool(model.predict, features_df)
    predicted_demand = max(0, int(prediction[0])) #catch the output

    # 4. Calculate suggested order count
    suggestion = max(0, predicted_demand - request_data.current_stock) # Don't suggest negative order counts(The suggestion only triggers when stock drops below the predicted demand)

    return PredictionResponse(
        product_id=request_data.product_id,
        predicted_demand=predicted_demand,
        suggested_order=suggestion,
    )


class BatchPredictionRequest(BaseModel): # create class so it can handle dot notation
    target_days_prediction: int
    requests_list: list[PredictionRequest]
    
# Bulk prediction Endpoint using List[...]
@app.post("/api/predict-batch", response_model=list[PredictionResponse])
async def get_bulk_inventory_predictions(request_data: BatchPredictionRequest): #if this was a list, it cant handle "request_data.blabla" --list only handle [..]
    
    # 1. Fetch weather once for the whole batch
    weather_info = await get_local_weather(target_days=request_data.target_days_prediction)
    if not weather_info:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast from OpenWeatherMap")

    results = []

    # 2. Loop through every item in the incoming list
    for item in request_data.requests_list:
        cold_boost = 1 if item.product_type == "COLD_BOOST" else 0
        heat_boost = 1 if item.product_type == "HEAT_BOOST" else 0
        weather_neutral = 1 if item.product_type == "WEATHER_NEUTRAL" else 0

        features_data = [{
            "base_demand": item.base_demand,
            "temperature": weather_info.temperature,
            "product_type_COLD_BOOST": cold_boost,
            "product_type_HEAT_BOOST": heat_boost,
            "product_type_WEATHER_NEUTRAL": weather_neutral,
        }]

        features_df = pd.DataFrame(features_data) # transforms raw Python data into a structured 2D table with rows & columns

        prediction = await run_in_threadpool(model.predict, features_df)
        predicted_demand = max(0, int(prediction[0]))
        suggestion = max(0, predicted_demand - item.current_stock) #each item

        # Build each response using the existing PredictionResponse class
        results.append(
            PredictionResponse(
                product_id=item.product_id,
                predicted_demand=predicted_demand,
                suggested_order=suggestion,
            )
        )

    # 3. returns a JSON array [...] matching List[PredictionResponse]
    return results
