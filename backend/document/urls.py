"""Urls module of document app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentView

routers = DefaultRouter()
routers.register('documents', DocumentView)

app_name = 'document'

urlpatterns = [
    path('', include(routers.urls))
]
