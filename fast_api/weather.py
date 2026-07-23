import os
import requests
from dotenv import load_dotenv
from pydantic import BaseModel
import httpx

load_dotenv()
API_KEY = os.getenv('API_KEY')

# Read coordinates dynamically from the env configuration
LAT = os.getenv('STORE_LAT')
LON = os.getenv('STORE_LON')

class LocalWeather(BaseModel):
    temperature: float
    humidity: int
    condition: str

async def get_local_weather():
    async with httpx.AsyncClient() as client:
        url = f'https://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric' # use "forecast" to call the 5-day prediction instead of current weather
        
        try:
            response = await client.get(url) # returns a response object first
            response_data = response.json() # must await the response, and then parse the JSON
            forecast_list = response_data.get('list', [])  # This is the big box of 40 packets (Each packet is 3 hours apart)
            
            # grab the specific time packet (number 8 --24 hours into the future)
            tomorrow_data = forecast_list[8] 
            
            # and then we dig inside that packet to grab the specific data
            main_data = tomorrow_data.get('main', {})
            weather_data = tomorrow_data.get('weather', [{}])[0] #grab first item
            
            # finally extract the values and return
            return LocalWeather(
                temperature = float(main_data.get('temp', 0.0)),
                humidity = int(main_data.get('humidity', 0)),
                condition = weather_data.get('main', 'Clear')
            )
        except Exception:
            return None

