"""Urls module of section app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectionView

routers = DefaultRouter()
routers.register('sections', SectionView)

app_name = 'section'

urlpatterns = [
    path('', include(routers.urls))
]

