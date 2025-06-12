"""Urls module for activity app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityView


routers = DefaultRouter()
routers.register('activities', ActivityView)

app_name = 'activity'
urlpatterns = [
    path('', include(routers.urls))
]
