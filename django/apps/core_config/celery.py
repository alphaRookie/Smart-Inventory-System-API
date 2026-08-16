# why not put in settings?
# Celery would try to import settings.py while settings.py is still loading itself. This creates a circular import crash

import os
from celery import Celery

# Sets an environment variable named DJANGO_SETTINGS_MODULE to point to 'core_config.settings'
# Celery is an independent process running outside web server. It needs to know which Django settings file to load so it can access database config, installed apps, and env variables
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_config.settings')

# Creates a new instance of the Celery app to handle all process
app = Celery('core_config')

# Load settings from Django settings that has 'CELERY_' prefix only
app.config_from_object('django.conf:settings', namespace='CELERY')

# scan all app listed in INSTALLED_APPS in settings.py and look for a file named tasks.py
app.autodiscover_tasks() 
