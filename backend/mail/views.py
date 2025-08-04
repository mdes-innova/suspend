"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import MailSerializer
from user.serializer import UserSerializer
from core.models import Mail, ISP
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny


class MailViews(viewsets.ModelViewSet):
    serializer_class = MailSerializer
    queryset = Mail.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'confirm':
            return [AllowAny()]
        else:
            if self.request.method == 'GET':
                return [IsAuthenticated()]
            else:
                return super().get_permissions()

    @action(
        detail=False,
        methods=['GET'],
        url_path='confirm/(?P<hcode>[^/]+)'
    )
    def confirm(self, request, hcode=None):
        if not hcode:
            Response({'error': 'No hash code found.'})

        try:
            mail = self.queryset.get(confirmed_hash=hcode)
            mail.confirmed = True
            mail.save(update_fields=['confirmed'])
            return Response(MailSerializer(mail).data)
        except Exception as e:
            return Response({'error': 'No group file found.'})
    
    @action(
        detail=False,
        methods=["POST"],
        url_path='send'
    )
    def send(self, request):
        data = request.data.copy()
        isp_id = data.pop('isp_id', None)
        if not isp_id:
            return Response({'error': 'Isp not found.'})

        isp = ISP.objects.get(id=isp_id)
        receivers = isp.users.all()  # type: ignore
        if not receivers or len(receivers) == 0:
            return Response({'error': 'Recievers not found.'})

        for receiver in receivers:
            data['receiver_id'] = receiver.id
            serializer = MailSerializer(data=data)
            print(data)
            if serializer.is_valid():
                serializer.save
        
        return Response({
            'data': "Mail has been being successfully sent."
        })
        
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        else:
            return Mail.objects.filter(receiver=user).distinct()