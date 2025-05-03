from core.models import Document
from .serializer import (
    DocumentDetailSerializer,
    DocumentSerializer,
    FileSerializer
    )
from rest_framework import (
    viewsets
)
from rest_framework.decorators import action
from tag.serializer import TagSerializer
from category.serializer import CategorySerializer
from rest_framework.response import Response
from rest_framework import status


class DocumentView(viewsets.ModelViewSet):
    """Document view."""
    queryset = Document.objects.all().order_by('-id')

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action == 'list':
            return DocumentSerializer
        elif self.action == 'file_upload':
            return FileSerializer
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
        docs = Document.objects.filter(title__iexact=title)
        if not docs.exists():
            return Response({'detail': 'Document not found'},
                            status=status.HTTP_404_NOT_FOUND)

        serializers = []
        for doc in docs:
            serializers.append({'title': doc.title,
                                'created_at': doc.created_at,
                                'tags': TagSerializer(doc.tags.all(),
                                                      many=True).data})
        return Response(serializers)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-title/(?P<title>[^/]+)/category',
        name='document-category-by-title'
    )
    def category_by_title(self, request, title=None):
        """Get category by document's name view."""
        try:
            doc = Document.objects.get(title__iexact=title)
        except Document.DoesNotExist:
            return Response({'detail': 'Document does not exists.'},
                            status.HTTP_404_NOT_FOUND)

        return Response(CategorySerializer(doc.category).data)

    @action(
        detail=True,
        methods=['post'],
        name='document-file-upload'
    )
    def file_upload(self, request, pk=None):
        document = self.get_object()
        serializer = self.get_serializer(document, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_200_OK)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
