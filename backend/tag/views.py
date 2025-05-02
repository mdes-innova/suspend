from core.models import Tag
from .serializer import TagSerializer
from document.serializer import DocumentSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class TagView(viewsets.ModelViewSet):
    """Tag view."""
    serializer_class = TagSerializer
    queryset = Tag.objects.all().order_by('id')

    @action(
        detail=False,
        methods=['get'],
        url_path='by-name/(?P<name>[^/]+)/documents',
        name='tag-documents-by-name' 
    )
    def documents_by_name(self, request, name=None):
        """Get documents from a tag by title view."""
        try:
            tag = Tag.objects.get(name=name)
        except Tag.DoesNotExist:
            return Response({'detail': 'Tag not found.'},
                     status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(DocumentSerializer(tag.documents.all(),
                                               many=True).data)