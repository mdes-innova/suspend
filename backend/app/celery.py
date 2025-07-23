import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

app = Celery("app")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'update-table-every-30s': {
        'task': 'celr.tasks.update_data_task',
        'schedule': 30.0,  # or use crontab(minute='*/1') for 1-minute interval
    },
}