# Smart Inventory System API

This project is built by **asynchronous dual-backend system** using **Django REST Framework** (relational database management, business rules, and background tasks) and **FastAPI** (high-performance Machine Learning inference). This architecture keeps the primary app stays fast while the AI service handles the heavy weather calculations in the background.


## **Key Features**

* **🏬 Flexible Multi-Shelf Storage:** You can distribute a single product across multiple different shelves (Many-to-Many). Updating, adding, and deleting stock instantly updates shelf availability and linked database records in real time.
* **⚡ Automated Shelf Swithing:** When you record a sale, the system automatically takes stock from Shelf #1 first. Once Shelf #1 is empty, it takes from Shelf #2, keeping stock accurate without extra steps.
* **🌤️ Weather-Based Demand Forecasting:** Gets live weather forecast data automatically and uses machine learning to predict demand based on product type (like hot or cold weather items)
* **⚙️ Adaptive Configuration Settings:** 
    * **Order Prediction**: You can adjust how many days of past sales to analyze (`LOOKBACK_DAYS_SALES`) or how far into the future to predict (`TARGET_DAYS_PREDICTION`).
    * **Spoilage Check**: You can set lower boundaries like if you want to be notified if some product will be expired in 7 days (`DAYS_TO_EXPIRE=7`)
* **⏱️ Customizable Background Jobs:** You can decide to run Spoilage check or Order prediction every selected days you want in `.env`(for example to run it every day or every 3 days, at exact customizable hour and minutes). 
* **🚨 Smart Spoilage Detection (No Spam):** Calculates the financial risk of possibility products to be expired. If an item will sell out before expiring, the system skips the warning so your feed stays clean.
* **📱 Instant Telegram Lock-Screen Alerts:** When real spoilage risk is detected, the system formats a clean summary and sends a push notification straight to your Telegram.
* **📦 Zero Manual Setup & Dependency Care:** No need to manually install packages or worry about conflicting versions. Whether running locally with `pipenv install` or launching via Docker, all required packages and exact versions install automatically thanks to `Pipfile` and `Pipfile.lock`.

---

## **Architecture**

### 1. Django Service — Core Engine & Business Logic
The main system that manages your database, inventory rules, background tasks, and alerts.

* **Smart Stock Updates:** Handles complex multi-shelf math so stock numbers stay completely accurate when adding, selling or moving items.
* **Fast Async Communication:** Django communicates with FastAPI asynchronously using `httpx` to keep the main web app non-blocking and fast.
* **Single & Batch AI Forecasting:** Predict stock needs for a single product or recalculate your entire warehouse in one HTTP request. Sending all items in a single batch instead of sending dozens of individual API calls.
* **Safety Checks:** Stops human errors before saving—blocking negative profit margins, overfilled shelves, duplicate names, or expired item sales.
* **Clean Documentation:** Creates clean interactive API web pages (Swagger & Redoc) to test all Endpoints.


### 2. FastAPI Service — AI Predictions & Weather Data
A fast, lightweight service built purely for machine learning predictions and fetching weather data.

* **Keeps Main Web App Fast:** Handles the heavy ML calculations separately so Django stays super responsive.
* **Live Weather Fetching:** Grabs weather forecasts from OpenWeatherMap in the background without freezing the server.
* **Threaded Math Processing:** Runs heavy Machine Learning calculations in background worker threads so API requests do not lag.
* **Custom ML Training Pipeline (`.ipynb`):** Trained a custom `RandomForestRegressor` model from scratch using Scikit-Learn, checked accuracy using MAE and R^2 scores, and saved the trained model directly as a `.joblib` file.

---

## **Installation**

### **Method 1:** Local Setup (No Docker)
For those who want to run everything directly on their computer.

1. **Clone the repository**
```bash
git clone https://github.com/alphaRookie/Smart-Inventory-System-API.git
cd pyproject2
```

2. **Configure `.env` file**
Create a `.env` file in your project root containing all of these configuration:
> [!NOTE]
> Make sure to create `.env` file in the project root, otherwise you need to change `.parent` config path inside `settings.py`
```env
# ----- Django Core Settings -----
SECRET_KEY=...
DEBUG=True # Set to False in production
ALLOWED_HOSTS=127.0.0.1,localhost

# ----- Database Configuration -----
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_HOST=127.0.0.1
DB_PORT=5432

# ----- Order Prediction Parameters -----
LOOKBACK_DAYS_SALES=... # find all sales data for the past ... days (to calculate avg daily demand)
TARGET_DAYS_PREDICTION=... # number of upcoming days to predict stock demand (limit to 5 by OpenWeather)

# ----- Spoilage Check Parameter -----
DAYS_TO_EXPIRE=... # for example, if you choose 7, you will be notified if a certain product will be expired in 7 days

# ----- Automatic background Task Scheduler ----- 
# for example: this will auto-run inventory check every 2 days, exactly at 1:15
RUN_INVENTORY_CHECK_EVERY=2 # day based
H_INV_CHECK=1 # hour(24-hour format: 0-23)
M_INV_CHECK=15 # minute

RUN_SPOILAGE_CHECK_EVERY=... 
H_SPOIL_CHECK=...
M_SPOIL_CHECK=...

# ----- Spoilage Notification Alert via Telegram -----
TELEGRAM_BOT_TOKEN=... # Secret API Token obtained from Telegram @BotFather
TELEGRAM_CHAT_ID=... # Target Telegram chat/user ID for receiving notifications


# ---------- OpenWeather Api Setting ----------
# create account and get the api_key from openweatherapi 
API_KEY=...

# get coordinate: go to google maps, and right click your exact location, the first row will show LAT & LON
STORE_LAT=...
STORE_LON=...
```

3. **Install dependencies**
* **Django:**
```bash
cd django/apps
pipenv install
```
* **FastAPI:**
```bash
cd fast_api
pipenv install
```

4. **Train the ML model**
* Open `ml_model/train_model.ipynb` in VS Code or Jupyter.
* Select fast_api kernel
* Click **Run All** cells to create `ml_model/weather_model.joblib`.

5. **Run the services**
* **Terminal 1 (Django):**
```bash
cd django/apps
python manage.py runserver 8000
```
* **Terminal 2 (FastAPI):**
```bash
cd fast_api
uvicorn main:app --reload --port 8001
```


### **Method 2:** Docker User Setup

For those who want to run the full application inside isolated containers.

1. **Clone the repository**
```bash
git clone https://github.com/alphaRookie/Smart-Inventory-System-API.git
cd pyproject2
```

2. **Train the ML Model Locally (Required)**
* Open `ml_model/train_model.ipynb` using Jupyter Notebook / VS Code.
* Select fast_api kernel
* Click **Run All** to generate `ml_model/weather_model.joblib` on your machine.
* *(This step is required once because `.joblib` is ignored in Git and Docker needs the file present before building)*.

3. **Configure Environment Variables**
* Create a `.env` file in the root directory with your secrets (same as Local setup above)

4. **Build and Launch Containers**
* Run the following command in your terminal:
```bash
docker compose up --build
```
* Docker will copy the code (including the generated `weather_model.joblib`) into the container and automatically start all services.
