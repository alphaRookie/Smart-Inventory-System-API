FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 1. set WORKDIR to '/app' first, bcoz Pipfile is located in folder root, not inside 'apps/' folder
WORKDIR /app

# 2. install Pipenv and copy All dependency i have inside my Pipfile
RUN pip install --no-cache-dir pipenv
COPY django/Pipfile django/Pipfile.lock  /app/
RUN pipenv install --system --deploy

# 3. copy source code (the folder name is 'django/' in local, changed to be 'app/' in container)
COPY django/  /app/

# 4. set final WORKDIR where manage.py lives (easier to run cmd)
WORKDIR /app/apps

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
