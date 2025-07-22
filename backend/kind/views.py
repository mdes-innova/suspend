from core.models import Kind
from .serializer import KindSerializer
from document.serializer import DocumentSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class KindView(viewsets.ModelViewSet):
    """Kind view."""
    serializer_class = KindSerializer 
    queryset = Kind.objects.all().order_by('kind_id')

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()