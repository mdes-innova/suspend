"""Urls module for mail app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  MailViews


routers = DefaultRouter()
routers.register('mails', MailViews)

app_name = 'mail'
urlpatterns = [
    path('', include(routers.urls))
]
