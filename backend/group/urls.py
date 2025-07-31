"""Urls module for group app."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import GroupView, GroupFileView


group_routers = DefaultRouter()
group_routers.register('groups', GroupView)

groupfile_routers = DefaultRouter()
groupfile_routers.register('files', GroupFileView)

app_name = 'group'

urlpatterns = [
    path('', include(group_routers.urls)),
    path('', include(groupfile_routers.urls))
]
