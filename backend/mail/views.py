"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import MailSerializer
from user.serializer import UserSerializer
from core.models import Mail, MailStatus, Group, GroupFile
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import uuid
import urllib.parse


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
        methods=['POST'],
        url_path='confirm'
    )
    def confirm(self, request):
        hcode = request.data.get('hash', None)
        if not hcode:
            Response({'error': 'No hash code found.'})

        try:
            decoded_hash = urllib.parse.unquote(hcode)
            mail = self.queryset.get(confirmed_hash=decoded_hash)
            mail.confirmed = True
            mail.save(update_fields=['confirmed'])
            return Response(MailSerializer(mail).data)
        except Exception as e:
            return Response({'error': 'Confirm mail fail.'})
    
    @action(
        detail=False,
        methods=["POST"],
        url_path='send-mails'
    )
    def send_mails(self, request):
        group_id = request.data.get('group_id', None)
        if not group_id:
            return Response({'error': 'No group id input.'})
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found.'})

        mail_group_id = uuid.uuid4()
        document_no = group.document_no
        group_files = GroupFile.objects.filter(group=group)

        for group_file in group_files:
            isp = group_file.isp
            receivers = isp.users.all()  # type: ignore
            for receiver in receivers:
                try:
                    data = {
                        'mail_group_id': mail_group_id,
                        'group_id': group.id,  # type: ignore
                        'document_no': document_no,
                        'document_date': group.document_date,
                        'subject': group.title,
                        'speed': group.speed,
                        'secret': group.secret,
                        'group_file_id': group_file.id,  # type: ignore
                        'receiver_id': receiver.id
                    }
                    serializer = MailSerializer(data=data, context={'request': request})
                    if serializer.is_valid():
                        serializer.save()
                except:
                    pass
        # data = request.data.copy()
        # isp_id = data.pop('isp_id', None)
        # if not isp_id:
        #     return Response({'error': 'Isp not found.'})

        # isp = ISP.objects.get(id=isp_id)
        # if not receivers or len(receivers) == 0:
        #     return Response({'error': 'Recievers not found.'})

        # for receiver in receivers:
        #     data['receiver_id'] = receiver.id
        #     serializer = MailSerializer(data=data)
        #     print(data)
        #     if serializer.is_valid():
        #         serializer.save

        return Response({
            'data': "Mail has been being successfully sent."
        })

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        else:
            return Mail.objects.filter(receiver=user,
                                       statsu=MailStatus.SUCCESSFUL).distinct()
