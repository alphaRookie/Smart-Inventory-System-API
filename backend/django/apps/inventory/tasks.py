# Celery relies on a feature called Autodiscovery. When the Celery background worker starts, it looks for specific file named 'tasks.py'
# Creating tasks.py gives Celery a clean entry point so it knows exactly which background functions it is allowed to run on a timer or in the background.

from celery import shared_task
from asgiref.sync import async_to_sync
from .services import OrderPredictionService, SpoilageNotificationService

# cant do async and await bcoz celery is not support
@shared_task
def run_inventory_check():
    return async_to_sync(OrderPredictionService.fetch_batch_prediction)()
    
@shared_task
def run_spoilage_check():
    return async_to_sync(SpoilageNotificationService.check_spoilage)()
