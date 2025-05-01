"""Urls module for Category app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryView


routers = DefaultRouter()
routers.register('routers', CategoryView)

app_name = 'category'
urlpatterns = [
    path('', include(routers.urls))
]
