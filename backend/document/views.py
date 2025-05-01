from core.models import Document
from .serializer import DocumentDetailSerializer, DocumentSerializer
from rest_framework import (
    viewsets
)
from rest_framework.decorators import action
from tag.serializer import TagSerializer
from rest_framework.response import Response
from rest_framework import status


class DocumentView(viewsets.ModelViewSet):
    """Document view."""
    queryset = Document.objects.all().order_by('-id')

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action == 'list':
            return DocumentSerializer
        return DocumentDetailSerializer

    @action(detail=True, methods=['get'])
    def tags(self, request, pk=None):
        """Return tags for a specific document with id."""
        document = self.get_object()
        tags = document.tags.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-title/(?P<title>[^/]+)/tags',
        name='document-tags-by-title'
    )
    def tags_by_title(self, request, title=None):
        """Return tags for a specific document with title."""
        try:
            docs = Document.objects.filter(title=title).all()
        except Document.DoesNotExist:
            return Response({'detail': 'Document not found'},
                            status=status.HTTP_404_NOT_FOUND)

        serializers = []
        for doc in docs:
            serializers.append({'title': doc.title,
                                'created_at': doc.created_at,
                                'tags': TagSerializer(doc.tags.all(),
                                                      many=True).data})
        return Response(serializers)