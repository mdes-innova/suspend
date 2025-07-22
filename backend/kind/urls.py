"""Urls module of kind app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KindView 

routers = DefaultRouter()
routers.register('kinds', KindView)

app_name = 'kind'

urlpatterns = [
    path('', include(routers.urls))
]