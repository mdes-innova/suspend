"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import MailSerializer
from document.serializer import DocumentSerializer
from core.models import Mail
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class MailViews(viewsets.ModelViewSet):
    serializer_class = MailSerializer
    queryset = Mail.objects.all().order_by('-created_at')