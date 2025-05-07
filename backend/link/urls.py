"""Urls module of link app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LinkView

routers = DefaultRouter()
routers.register('links', LinkView)

app_name = 'link'

urlpatterns = [
    path('', include(routers.urls))
]
