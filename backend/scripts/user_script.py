import os
import random
import django
from django.contrib.auth import get_user_model
from django.core.files import File
from datetime import date
import sys

sys.path.append("/app")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()


def create_admin():
    password = os.environ.get('ADMIN_PASSWORD')
    get_user_model().objects.create_superuser(
        username='admin',
        password=password,
        email=None
    )
    print('Admin created.')


if __name__ == "__main__":
    create_admin()
