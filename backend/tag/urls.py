"""Urls module of tag app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TagView

routers = DefaultRouter()
routers.register('tags', TagView)

app_name = 'tag'

urlpatterns = [
    path('', include(routers.urls))
]
