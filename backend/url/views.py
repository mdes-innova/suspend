from core.models import Url, Document
from .serializer import UrlSerializer
from document.serializer import DocumentSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from urllib.parse import unquote


class UrlView(viewsets.ModelViewSet):
    """Url view."""
    serializer_class = UrlSerializer
    queryset = Url.objects.all().order_by('id')

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()
    
    @action(
        detail=False,
        methods=['GET'],
        url_path='by-document/(?P<did>[^/]+)/urls'
    )
    def by_document(self, request, did=None):
        doc = Document.objects.get(pk=did)
        urls = doc.urls
        return Response(UrlSerializer(urls, many=True).data)
