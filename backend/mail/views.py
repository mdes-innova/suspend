"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import MailSerializer, MailDetailSerializer
from user.serializer import UserSerializer
from core.models import Mail, IspFile
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class MailViews(viewsets.ModelViewSet):
    serializer_class = MailSerializer
    queryset = Mail.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return MailDetailSerializer
        return MailSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        else:
            return Mail.objects.filter(isp_files__user=user).distinct()

    @action(
        detail=False,
        url_path='isp',
        methods=['GET']
    )
    def isp(self, request):
        return Response(MailSerializer(
            super().get_queryset().filter(is_draft=False), many=True
            ).data)

    @action(
        detail=False,
        url_path='draft',
        methods=['GET']
    )
    def draft(self, request):
        return Response(MailSerializer(
            super().get_queryset().filter(is_draft=True), many=True
            ).data)

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()
