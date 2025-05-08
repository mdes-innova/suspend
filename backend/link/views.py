from core.models import Link
from .serializer import LinkSerializer
from document.serializer import DocumentSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from urllib.parse import unquote


class LinkView(viewsets.ModelViewSet):
    """Link view."""
    serializer_class = LinkSerializer
    queryset = Link.objects.all().order_by('id')

    @action(
        detail=False,
        methods=['get'],
        url_path=r'by-url/(?P<url>.+)/documents',
        name='link-documents-by-url'
    )
    def documents_by_url(self, request, url=None):
        """Get documents from a tag by title view."""
        url = unquote(url)
        try:
            link = Link.objects.get(url=url)
        except Link.DoesNotExist:
            return Response({'detail': 'Link not found.'},
                            status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(DocumentSerializer(link.documents.all(),
                                               many=True).data)
