"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import MailSerializer, MailDetailSerializer
from user.serializer import UserSerializer
from core.models import Mail, FromUser, User
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class MailViews(viewsets.ModelViewSet):
    serializer_class = MailSerializer
    queryset = Mail.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action in ['list', 'create']:
            return MailSerializer
        elif self.action == 'retrieve':
            return MailDetailSerializer
        return MailSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset().filter(
                from_user__user=user
                )
        else:
            return super().get_queryset().filter(
                    to_users=user, is_draft=False
                )

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()
