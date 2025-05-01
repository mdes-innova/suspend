from core.models import Tag
from .serializer import TagSerializer
from rest_framework import viewsets


class TagView(viewsets.ModelViewSet):
    """Tag view."""
    serializer_class = TagSerializer
    queryset = Tag.objects.all().order_by('id')
