# Celery relies on a feature called Autodiscovery. When the Celery background worker starts, it looks for specific file named 'tasks.py'
# Creating tasks.py gives Celery a clean entry point so it knows exactly which background functions it is allowed to run on a timer or in the background.

from celery import shared_task
from asgiref.sync import async_to_sync
from .services import OrderPredictionService, SpoilageCheckService
from .models import Notification

# cant do async and await bcoz celery is not support
@shared_task
def run_manual_orderpred_check():
    return async_to_sync(OrderPredictionService.fetch_batch_prediction)()

@shared_task
def run_auto_orderpred_check():
    try:
        # Wrap the service call inside the try block so any failure gets caught
        async_to_sync(OrderPredictionService.fetch_batch_prediction)()
        
        # If it succeeds without crashing:
        Notification.objects.create(
            product=None, # no need to specify target obj in batch
            category=Notification.Category.ORDER_PRED,
            level=Notification.Level.INFO,
            message="Auto batch order prediction successfully completed."
        )
        
    except Exception as e:
        # If anything breaks (FastAPI down, internet cut, database glitch):
        Notification.objects.create(
            product=None,
            category=Notification.Category.ORDER_PRED,
            level=Notification.Level.DANGER,
            message=f"Auto batch prediction Failed. Error: {str(e)}"
        )

    
@shared_task
def run_manual_spoilage_check():
    return async_to_sync(SpoilageCheckService.check_spoilage)()

@shared_task
def run_auto_spoilage_check():
    try:
        # Wrap the service call inside the try block so any failure gets caught
        async_to_sync(SpoilageCheckService.check_spoilage)()
        
        # If it succeeds without crashing:
        Notification.objects.create(
            product=None,
            category=Notification.Category.SPOILAGE,
            level=Notification.Level.INFO,
            message="Auto Spoilage check successfully completed."
        )
        
    except Exception as e:
        # If anything breaks (FastAPI down, internet cut, database glitch):
        Notification.objects.create(
            product=None,
            category=Notification.Category.SPOILAGE,
            level=Notification.Level.DANGER,
            message=f"Auto Spoilage check Failed. Error: {str(e)}"
        )
