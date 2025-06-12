"""View module for ISP app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import ISPSerializer
from document.serializer import DocumentSerializer
from core.models import ISP, Document, Activity
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class ISPView(viewsets.ModelViewSet):
    serializer_class = ISPSerializer
    queryset = ISP.objects.all().order_by('id')

    @action(
        detail=False,
        methods=['get'],
        url_path='by-name/(?P<name>[^/]+)/documents',
        name='isp-documents-by-name'
    )
    def documents_by_name(self, request, name=None):
        docs = Document.objects.filter(isp__name__iexact=name)
        if not docs.exists():
            return Response({'detail': 'Document not found.'},
                            status.HTTP_404_NOT_FOUND)
        return Response(DocumentSerializer(docs, many=True).data)

