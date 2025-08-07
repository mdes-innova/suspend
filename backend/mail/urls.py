"""Urls module for mail app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  MailViews, MailFileView


routers = DefaultRouter()
routers.register('mails', MailViews)

mailfile_routers = DefaultRouter()
mailfile_routers.register('mailfiles', MailFileView)

app_name = 'mail'
urlpatterns = [
    path('', include(routers.urls)),
    path('', include(mailfile_routers.urls))
]
