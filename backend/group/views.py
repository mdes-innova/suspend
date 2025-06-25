from rest_framework import (
    viewsets, status
)
from core.models import Group, Document
from .serializer import GroupSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsActiveUser, IsAdminOrStaff
from rest_framework.permissions import IsAuthenticated


class GroupView(viewsets.ModelViewSet):
    """Group view."""
    queryset = Group.objects.all().order_by('id')
    serializer_class = GroupSerializer

    def get_queryset(self):
        """Get group object data."""
        data = self.queryset.filter(user=self.request.user).order_by('-id')
        return data

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()

    @action(
        detail=False,
        methods=['get'],
        url_path='by-document/(?P<did>[^/]+)',
    )
    def by_document(self, request, did=None):
        try:
            doc = Document.objects.get(pk=did)
            group = Group.objects.get(documents=doc)
            return Response(GroupSerializer(group).data)
        except Document.DoesNotExist:
            return Response({'detail': 'Document not found.'},
                            status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({'detail': 'Group not found.'},
                            status.HTTP_404_NOT_FOUND)