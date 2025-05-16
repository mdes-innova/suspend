from rest_framework import (
    viewsets, status
)
from core.models import Group
from .serializer import GroupSerializer


class GroupView(viewsets.ModelViewSet):
    """Group view."""
    queryset = Group.objects.all().order_by('id')
    serializer_class = GroupSerializer