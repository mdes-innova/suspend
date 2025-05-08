"""Urls module for ISP app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ISPView


routers = DefaultRouter()
routers.register('categories', ISPView)

app_name = 'isp'
urlpatterns = [
    path('', include(routers.urls))
]
