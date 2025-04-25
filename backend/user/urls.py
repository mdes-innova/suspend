"""URLS module for user app"""
from django.urls import path
from .views import (
    CreateUserView, MangeUserView
)


app_name = 'user'

urlpatterns = [
    path('create/', CreateUserView.as_view(), name='create'),
    path('me/', MangeUserView.as_view(), name='me')
]
