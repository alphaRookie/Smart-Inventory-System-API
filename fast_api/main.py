# weather.py is the worker that fetches the data, main.py is the receptionist of the FastAPI application

from fastapi import FastAPI, HTTPException
from weather import get_local_weather, LocalWeather

# 1. Create the main FastAPI application instance
app = FastAPI(title="Smart-Inventory-System")

# 2. A simple home route just to test if the server is alive
@app.get("/")
def home():
    return {"status": "Successfully running!"}

# 3. The actual API route that Django will talk to
@app.get("/api/weather/future", response_model=LocalWeather)

def fetch_tomorrow_weather():
    # Call the worker function from weather.py
    weather_info = get_local_weather()

    if not weather_info:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast from OpenWeatherMap")
        
    return weather_info # FastAPI turns this into clean JSON automatically
