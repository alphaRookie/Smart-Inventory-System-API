import os
import requests
from dotenv import load_dotenv
from pydantic import BaseModel
import httpx

# reads all saved data from .env
load_dotenv()
API_KEY = os.getenv('API_KEY')
LAT = os.getenv('STORE_LAT')
LON = os.getenv('STORE_LON')

class LocalWeather(BaseModel):
    temperature: float
    humidity: int
    condition: str

async def get_local_weather(target_days):
    async with httpx.AsyncClient() as client:
        url = f'https://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric' # use "forecast" to call the 5-day prediction instead of current weather
        
        try:
            response = await client.get(url) # returns a response object first
            response_data = response.json() # must await the response, and then parse the JSON
            forecast_list = response_data.get('list', [])  # This is the big box of 40 packets (Each packet is 3 hours apart)
            
            if not forecast_list: # stop if API_KEY, LAT, or LON are invalid
                print("No forecast list returned from OpenWeatherMap.")
                return None
            
            # grab the specific time packet (number 8 --24 hours into the future * selected days)
            # prevent -1 index (when target_days=0), while keep max index at 39(target_days=40 at highest)
            package_wanted = max(0, min((target_days * 8) - 1, 39)) # If target_days=3, we want 3*8 = 24 packets into the future. Index is 23.
            selected_package = forecast_list[package_wanted] 
            
            # and then we dig inside that packet to grab the specific data
            main_data = selected_package.get('main', {})
            weather_data = selected_package.get('weather', [{}])[0] #grab first item
            
            # finally extract the values and return
            return LocalWeather(
                temperature = float(main_data.get('temp', 0.0)),
                humidity = int(main_data.get('humidity', 0)),
                condition = weather_data.get('main', 'Clear')
            )
        except Exception as e:
            print(f"Error fetching weather: {e}") # exception catches all error, so we need to know what error is that
            return None

