"""View module for Category app."""
from rest_framework import viewsets
from .serializer import CategorySerializer
from document.serializer import DocumentSerializer
from core.models import Category, Document
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response


class CategoryView(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all().order_by('id')

    @action(
        detail=False,
        methods=['get'],
        url_path='by-name/(?P<name>[^/]+)/documents',
        name='category-documents-by-name'
    )
    def documents_by_name(self, request, name=None):
        docs = Document.objects.filter(category__name__iexact=name)
        if not docs.exists():
            return Response({'detail': 'Document not found.'},
                            status.HTTP_404_NOT_FOUND)
        return Response(DocumentSerializer(docs, many=True).data)