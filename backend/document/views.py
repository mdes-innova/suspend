from core.models import Document
from .serializer import DocumentDetailSerializer, DocumentSerializer
from rest_framework import (
    viewsets
)


class DocumentView(viewsets.ModelViewSet):
    """"Document view."""
    serializer_class = DocumentDetailSerializer
    queryset = Document.objects.all().order_by('-id')

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action == 'list':
            return DocumentSerializer
        return DocumentDetailSerializer
