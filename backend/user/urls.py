"""URLS module for user app"""
from django.urls import path
from .views import (
    CreateUserView, MangeUserView, UserStatusView
)


app_name = 'user'

urlpatterns = [
    path('status/', UserStatusView.as_view(), name='status'),
    path('create/', CreateUserView.as_view(), name='create'),
    path('me/', MangeUserView.as_view(), name='me'),
]
