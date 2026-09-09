FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# even tho another dockerfile called 'app/' too, they are actually separated by diff container
WORKDIR /app

# Install Pipenv and copy All dependency i have inside my Pipfile
RUN pip install --no-cache-dir pipenv
COPY fast_api/Pipfile fast_api/Pipfile.lock  /app/
RUN pipenv install --system --deploy

# copy what inside fast_api & ml_model folder(in local) code to container folder named 'app/'
# so now this container carries app/fast_api and app/ml_model
COPY fast_api/  /app/fast_api 
COPY ml_model/  /app/ml_model

# set fast_api to be the main so that cmd can run
WORKDIR /app/fast_api

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
