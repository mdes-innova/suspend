"""Urls module of url app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UrlView

routers = DefaultRouter()
routers.register('urls', UrlView)

app_name = 'url'

urlpatterns = [
    path('', include(routers.urls))
]
