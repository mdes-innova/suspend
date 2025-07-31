from rest_framework import (
    viewsets, status
)
from django.http import FileResponse
from core.models import Group, Document, GroupFile
from .serializer import GroupSerializer, GroupFileSerializer 
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsActiveUser, IsAdminOrStaff
from rest_framework.permissions import IsAuthenticated


class GroupView(viewsets.ModelViewSet):
    """Group view."""
    queryset = Group.objects.all().order_by('-id')
    serializer_class = GroupSerializer

    def get_queryset(self):
        """Get group object data."""
        data = self.queryset.filter(user=self.request.user)
        return data
    
    @action(
        detail=False,
        url_path='group-list',
        methods=['GET']
    )
    def group_list(self, request):
        query_set = self.queryset.exclude(name='Untitled')
        data = GroupSerializer(query_set, many=True).data
        return Response(data)

    # def get_permissions(self):
    #     match self.request.method:
    #         case 'GET':
    #             return [IsAuthenticated()]
    #         case _:
    #             return super().get_permissions()

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
            return Response({})

    @action(
        detail=False,
        methods=['get'],
        url_path='by-name/(?P<name>[^/]+)',
    )
    def by_name(self, request, name=None):
        try:
            if not name:
                raise Group.DoesNotExist
            group = Group.objects.get(name=name)
            return Response(GroupSerializer(group).data)
        except Document.DoesNotExist:
            return Response({'detail': 'Document not found.'},
                            status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({'detail': 'Document not found.'},
                            status.HTTP_404_NOT_FOUND)

    @action(
        detail=True,
        methods=['post'],
        url_path='group-file'
    )
    def group_file(self, request, pk=None):
        original_filename = request.data.get('original_filename', None)
        if not pk or not original_filename:
            return Response({"error": "Cannot create a group file."}, status=400)

        try:
            group = Group.objects.get(pk=pk)
            group_file = GroupFile.objects.create(
                user=request.user,
                group=group,
                original_filename=original_filename,
            )

            serlializer_data = GroupFileSerializer(group_file).data
            return Response(serlializer_data)
        except Exception as e:
            return Response({"error": "Cannot create a group file."}, status=400)

    @action(
        detail=False,
        methods=['post'],
        url_path='upload/(?P<gfid>[^/]+)'
    )
    def upload(self, request, gfid=None):
        file_obj = request.FILES.get("file")

        if not gfid:
            return Response({"error": "Cannot upload group file."}, status=400)

        try:
            group_file = GroupFile.objects.get(pk=gfid)
            group_file.file = file_obj
            group_file.save
            serializer_data = GroupFileSerializer(group_file).data
            return Response(serializer_data)
        except Exception as e:
            return Response({"error": "Cannot upload file."}, status=400)

    @action(
        detail=False,
        methods=['get'],
        url_path='download/(?P<gfid>[^/]+)'
    )
    def download(self, request, gfid=None):

        if not gfid:
            return Response({"error": "Cannot download group file."}, status=400)

        try:
            group_file = GroupFile.objects.get(pk=gfid)
        except GroupFile.DoesNotExist:
            return Response({'detail': "File not available"},
                            status.HTTP_404_NOT_FOUND)
        except:
            return Response({'detail': "File not available"},
                            status.HTTP_404_NOT_FOUND)
        else:
            if group_file:
                return FileResponse(
                    group_file.file.open('rb'),
                    as_attachment=True,
                    filename=str(group_file.original_filename),
                    content_type='application/pdf'
                )
            else:
                return Response({'detail': "File not available"},
                                status.HTTP_404_NOT_FOUND)
