"""View module for ISP app."""
from rest_framework import viewsets
from .serializer import ISPSerializer, ISPActivitySerializer
from document.serializer import DocumentSerializer
from core.models import ISP, Document, ISPActivity
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class ISPView(viewsets.ModelViewSet):
    serializer_class = ISPSerializer
    queryset = ISP.objects.all().order_by('id')

    @action(
        detail=False,
        methods=['get'],
        url_path='by-name/(?P<name>[^/]+)/documents',
        name='isp-documents-by-name'
    )
    def documents_by_name(self, request, name=None):
        docs = Document.objects.filter(isp__name__iexact=name)
        if not docs.exists():
            return Response({'detail': 'Document not found.'},
                            status.HTTP_404_NOT_FOUND)
        return Response(DocumentSerializer(docs, many=True).data)

    @action(
        detail=False,
        methods=['post'],
        url_path='by-activity/(?P<activity>[^/]+)/activity',
        name='isp-activity-by-activity'
    )
    def activity_by_activity(self, request, activity=None):
        user = getattr(request, 'user', None)
        path = request.data.get('path')
        ip_address = request.data.get('ip_address')
        document_id = request.data.get('did')  # if using "did" in payload
        document = None
        isp = None

        # Sanitize unauthenticated users
        if user and not user.is_authenticated:
            user = None

        if user and user.is_authenticated:
            isp = getattr(user, 'isp', None)

        if document_id:
            try:
                document = Document.objects.get(pk=document_id)
            except Document.DoesNotExist:
                document = None

        isp_activity = ISPActivity.objects.create(
            user=user,
            activity=activity,
            ip_address=ip_address,
            path=path,
            document=document,
            isp=isp
        )

        return Response(ISPActivitySerializer(isp_activity).data)

    def get_permissions(self):
        if self.action == 'activity_by_activity':
            return [AllowAny()]  # Allow unauthenticated users for this action
        return super().get_permissions()
