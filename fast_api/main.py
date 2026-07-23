# weather.py is the worker that fetches the data, main.py is the receptionist of the FastAPI application

from fastapi import FastAPI, HTTPException
from weather import get_local_weather, LocalWeather

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

 