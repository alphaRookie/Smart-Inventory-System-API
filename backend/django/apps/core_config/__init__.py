# aim: loads the Celery app automatically whenever Django starts

from .celery import app as celery_app #look inside celery.py

__all__ = ('celery_app',)
