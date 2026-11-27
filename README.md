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
- **🔐 Role-Based Access Control (RBAC):** Every user account has a strict role level (`Manager`, `Worker`, or `Standard User`).
- **🔑 Secure JWT Auth & Email OTP Recovery:** Supports JWT authentication with automatic token rotation, Google OAuth login, and a 3-step password reset flow with 6-digit codes cached in Redis.
- **🔔 In-App Notification Center:** Tracks batch runs and stock alerts right inside the app with live unread counters, `DANGER`/`WARNING`/`INFO` severity tags, and one-click mark-as-read actions.
- **📊 Complex Analytics Dashboard (Upcoming):** Currently building visual charts and deep reports to track sales trends, spoilage loss savings, shelf turnover, and ML forecast accuracy over time.

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


### 3. React Service — Modern Frontend & Role-Based UI
A fast, responsive web interface built with **React (Vite)**, **React Router**, and **Tailwind CSS** that connects seamlessly to the Django REST API.

- **Strict Role-Based UI Rendering:** Dynamically hides or unlocks navigation links, dropdown, and restricted pages based on the user's role (`Manager`, `Worker`, or `User`).
- **Live Notification Dropdown:** Displays real-time unread alert counters in the top bar with color-coded `DANGER`, `WARNING`, and `INFO` badges.
- **Smooth Auth & Recovery Flows:** Handles JWT sessions, Google social login, and a clean 3-step password reset flow with instant backend error handling and toast feedback.
- **Upcoming Complex Analytics Dashboard:** Preparing interactive data charts and deep inventory reports to turn raw sales, shelf, and spoilage logs into clear business insights.

---

## **Installation**

### **Method 1:** Local Setup (No Docker)
For those who want to run everything directly on their computer.

1. **Clone the repository**
    ```bash
    git clone https://github.com/alphaRookie/Smart-Inventory-System-API.git
    cd pyproject2
    ```

2. **Configure `.env` files**
    Create a `.env` file for both the backend and frontend, and fill in your own configuration, details, and settings by following [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example).

    > [!NOTE]
    > Make sure to create both `.env` file in the exact same level as its `.env.example` (`backend/.env` and `frontend/.env`). Otherwise, you will need to change the `.parent` config path inside `settings.py`.
    

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

4. **Apply Migrations**
    ```bash
    python manage.py migrate
    ```

5. **Train the ML model**
    * Open `ml_model/train_model.ipynb` in VS Code or Jupyter.
    * Select fast_api kernel
    * Click **Run All** cells to create `ml_model/weather_model.joblib`.

6. **Run the services**
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
    * *(This step is required once because `.joblib` is ignored in Git and Docker needs the file exist before building)*

3. **Configure Environment Variables**
    * Create a `.env` file in the root directory with your secrets (same as Local setup above)

4. **Build and Launch Containers**
    * Run the following command in your terminal:
    ```bash
    docker compose up --build
    ```
    * Docker will copy the code (including the generated `weather_model.joblib`) into the container and automatically start all services.
