"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import ActivitySerializer
from document.serializer import DocumentSerializer
from core.models import ISP, Document, Activity
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class ActivityView(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    queryset = Activity.objects.all().order_by('-created_at')

    @action(
        detail=False,
        methods=['post'],
        url_path='by-activity/(?P<activity>[^/]+)',
    )
    def by_activity(self, request, activity=None):
        user = getattr(request, 'user', None)
        path = request.data.get('path')
        ip_address = request.data.get('ip_address')
        document_id = request.data.get('did')
        document = None
        isp = None

        if user and not user.is_authenticated:
            user = None

        if user and user.is_authenticated:
            isp = getattr(user, 'isp', None)

        if document_id:
            try:
                document = Document.objects.get(pk=document_id)
            except Document.DoesNotExist:
                document = None

        isp_activity = Activity.objects.create(
            user=user,
            activity=activity,
            ip_address=ip_address,
            path=path,
            document=document,
            isp=isp
        )

        res_data = ActivitySerializer(isp_activity).data

        return Response(res_data)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-activity/(?P<activity>[^/]+)',
    )
    def by_activity_dynamic(self, request, activity=None):
        return self.handle_activity_get(request, activity)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-activity',
    )
    def by_activity_static(self, request):
        return self.handle_activity_get(request, None)

    def handle_activity_get(self, request, activity=None):
        user = getattr(request, 'user', None)
        ap = request.query_params.get('ap')
        if not ap:
            ap = 0
        queries = {}
        if activity:
            queries['activity'] = activity
        if user:
            queries['user'] = user

        try:
            count = Activity.objects.filter(
                **queries).count()
            activities = Activity.objects.filter(
                **queries).order_by('-created_at')
            pdf_downloads = len(activities.filter(
                activity='download',
                file__file__endswith='.pdf'
            ))
            xlsx_downloads = len(activities.filter(
                activity='download',
                file__file__endswith='.xlsx'
            ))
            paginator = Paginator(activities, 20)
            return Response({
                'data': ActivitySerializer(
                    paginator.page(int(ap) + 1),
                    many=True).data,
                'count': count,
                'downloads': {
                    'pdf': pdf_downloads,
                    'xlsx': xlsx_downloads
                }
                })
        except Activity.DoesNotExist:
            return Response({'detail': 'ActivityType not found.'},
                            status.HTTP_404_NOT_FOUND)

        # try:
        #     activities = Activity.objects.filter(**queries)\
        #         .order_by('-created_at')
        #     return Response(ActivitySerializer(activities, many=True).data)
        # except Activity.DoesNotExist:
        #     return Response({'detail': 'ActivityType not found.'},
        #                     status.HTTP_404_NOT_FOUND)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-document/(?P<did>[^/]+)',
    )
    def by_document(self, request, did=None):
        user = request.user
        document = None if not did else Document.objects.get(pk=did)
        ap = request.query_params.get('ap')
        queries = {'user': user, 'document': document}

        try:
            count = Activity.objects.filter(
                **queries).count()
            activities = Activity.objects.filter(
                **queries).order_by('-created_at')
            pdf_downloads = len(activities.filter(
                activity='download',
                file__file__endswith='.pdf'
            ))
            xlsx_downloads = len(activities.filter(
                activity='download',
                file__file__endswith='.xlsx'
            ))
            paginator = Paginator(activities, 20)
            return Response({
                'data': ActivitySerializer(
                    paginator.page(int(ap) + 1),
                    many=True).data,
                'count': count,
                'downloads': {
                    'pdf': pdf_downloads,
                    'xlsx': xlsx_downloads
                }
                })
        except Activity.DoesNotExist:
            return Response({'detail': 'ActivityType not found.'},
                            status.HTTP_404_NOT_FOUND)

    def get_permissions(self):
        if self.action == 'by_activity' and self.request.method == 'POST':
            return [AllowAny()]
        return super().get_permissions()
