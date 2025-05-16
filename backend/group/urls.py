"""Urls module for group app."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import GroupView


routers = DefaultRouter()
routers.register('groups', GroupView)

app_name = 'group'

urlpatterns = [
    path('', include(routers.urls))
]
