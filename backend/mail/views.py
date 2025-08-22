"""View module for activity app."""
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import viewsets
from .serializer import MailSerializer, MailFileSerializer, MailGroupSerializer
from user.serializer import UserSerializer
from core.models import (
        Mail, MailStatus, Group, GroupFile, MailFile, MailGroup,
        ISP
    )
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from django.http import FileResponse
import uuid
import urllib.parse
from core.permissions import IsAdminOnlyUser
from django.utils import timezone
from django.core.files.base import File


class MailGroupViews(viewsets.ModelViewSet):
    serializer_class = MailGroupSerializer
    queryset = MailGroup.objects.all().order_by('-created_at')

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        else:
            return self.queryset.filter(receiver=user,
                                        mail_status=MailStatus.SUCCESSFUL)\
                                            .distinct()
    
    def perform_update(self, serializer):
        mail_group = serializer.instance
        user = self.request.user

        if user != mail_group.user or not user.is_superuser:
            raise PermissionDenied("You are not allowed to update this mail group.")
        serializer.save() 
    
    @action(
        detail=False,
        methods=['get'],
        url_path='by-isp/(?P<isp>[^/]+)'
    )
    def by_isp(self, request, isp=None):
        queryset = self.queryset
        try:
            isp = ISP.objects.get(id=isp)
            data = queryset.filter(mails_isp=isp)
            return Response(self.serializer_class(data).data)
        except ISP.DoesNotExist:
            return Response({'error': 'Isp not found.'},
                            status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Isp not found.'},
                            status.HTTP_400_BAD_REQUEST)


class MailViews(viewsets.ModelViewSet):
    serializer_class = MailSerializer
    queryset = Mail.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'confirm':
            return [AllowAny()]
        elif self.action in ['send_mails', 'send_mail']:
            return super().get_permissions()
        else:
            if self.request.method == 'GET':
                return [IsAuthenticated()]
            else:
                return [IsAdminOnlyUser()]

    @action(
        detail=False,
        methods=['POST'],
        url_path='confirm'
    )
    def confirm(self, request):
        confirmed_uuid = request.data.get('confirmed_uuid', None)
        if not confirmed_uuid:
            Response({'error': 'No confirmed uuid code found.'},
                     status=status.HTTP_400_BAD_REQUEST)

        try:
            mail = self.queryset.get(confirmed_uuid=confirmed_uuid)
            if not mail.confirmed:
                mail.confirmed = True
                mail.confirmed_date = timezone.now()
                mail.save(update_fields=['confirmed', 'confirmed_date'])
            return Response(MailSerializer(mail).data)
        except Exception as e:
            return Response({'error': 'Confirm mail fail.'},
                            status=status.HTTP_400_BAD_REQUEST)
    
    @action(
        detail=False,
        methods=["POST"],
        url_path='send-mails'
    )
    def send_mails(self, request):
        group_id = request.data.get('group_id', None)
        if not group_id:
            return Response({'error': 'No group id input.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found.'},
                            status=status.HTTP_400_BAD_REQUEST)

        mail_group_id = uuid.uuid4()
        document_no = group.document_no
        group_files = GroupFile.objects.filter(group=group)

        mail_files = []
        for gf in group_files:
            mail_file = MailFile.objects.create(
                isp=gf.isp,
                original_filename=gf.original_filename
            )

            gf_file = gf.file
            with gf_file.open('rb') as f:
                mail_file.file.save(gf_file.name.split('/')[-1], File(f))
                mail_file.save()
            mail_files.append(mail_file)

        for mail_file in mail_files:
            isp = mail_file.isp
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
                        'mail_file_id': mail_file.id,  # type: ignore
                        'receiver_id': receiver.id
                    }
                    serializer = MailSerializer(data=data, context={'request': request})
                    if serializer.is_valid():
                        serializer.save()
                except:
                    pass
        return Response({
            'data': str(mail_group_id)
        })

    @action(
        detail=False,
        methods=["POST"],
        url_path='send-mail'
    )
    def send_mail(self, request):
        mail_group_id = request.data.get('mail_group_id', None)
        receiver_id = request.data.get('receiver_id', None)

        try:
            mail_group = MailGroup.objects.get(id=mail_group_id)
            receiver = get_user_model().objects.get(id=receiver_id)
        except MailGroup.DoesNotExist:
            return Response({'error': 'Mail group not found.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except get_user_model().DoesNotExist:
            return Response({'error': 'Receiver not found.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Inputs fail.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            data = {
                'receiver_id': receiver.id,
                'mail_group_id': mail_group.id,
            }
            serializer = MailSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response({'error': 'Bad request.'},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'error': 'Send mail fail.'},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["POST"],
        url_path='send-isp-mail'
    )
    def send_isp_mail(self, request):
        mail_group_id = request.data.get('mail_group_id', None)
        isp_id = request.data.get('isp_id', None)

        try:
            mail_group = MailGroup.objects.get(id=mail_group_id)
            isp = ISP.objects.get(id=isp_id)
        except MailGroup.DoesNotExist:
            return Response({'error': 'Mail group not found.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except ISP.DoesNotExist:
            return Response({'error': 'ISP not found.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'error': 'Inputs fail.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = isp.users
            data = {
                'receiver_id': receiver.id,
                'mail_group_id': mail_group.id,
            }
            serializer = MailSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response({'error': 'Bad request.'},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'error': 'Send mail fail.'},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["GET"],
        url_path='staff-mails'
    ) 
    def staff_mails(self, request):
        mail_group_ids = (
            self.queryset
            .exclude(mail_group_id__isnull=True)
            .values_list('mail_group_id', flat=True)
            .distinct()
        )
        data = []

        for mail_group_id in mail_group_ids:
            objs = self.queryset.filter(mail_group_id=mail_group_id)\
                .distinct().order_by('created_at')
            obj = objs.first()
            obj_confirms = len(objs.filter(confirmed=True))
            obj_sends = len(objs.filter(status='successful'))
            if obj:
                document_no = obj.document_no
                created_at = obj.created_at
                n_documents = len(obj.documents.all())
                data.append({
                    'mail_group_id': str(mail_group_id),
                    'document_no': document_no,
                    'created_at': created_at,
                    'num_documents': n_documents,
                    'sends': f'{obj_sends}/{len(objs)}',
                    'confirms': f'{obj_confirms}/{len(objs)}'
                })
        return Response(data)
    
    @action(
        detail=False,
        methods=['GET'],
        url_path='group-mail/(?P<gmid>[^/]+)'
    )
    def group_mail(self, request, gmid=None):
        if not gmid:
            return Response({
                'error': 'Mail group id not found.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        mails = Mail.objects.filter(mail_group_id=gmid)
        if not mails or not len(mails):
            return Response({
                'error': 'Empty mails.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = MailSerializer(mails, many=True) 
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        else:
            return Mail.objects.filter(receiver=user,
                                       statsu=MailStatus.SUCCESSFUL).distinct()


class MailFileView(viewsets.ModelViewSet):
    serializer_class = MailFileSerializer
    queryset = MailFile.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [IsAdminOnlyUser()]

    @action(
        detail=False,
        methods=['get'],
        url_path='download/(?P<fid>[^/]+)'
    )
    def download(self, request, fid=None):
        if not fid:
            return Response({"error": "Cannot download group file."}, status=400)

        try:
            mail_file = MailFile.objects.get(pk=fid)
        except MailFile.DoesNotExist:
            return Response({'detail': "File not available"},
                            status.HTTP_404_NOT_FOUND)
        except:
            return Response({'detail': "File not available"},
                            status.HTTP_404_NOT_FOUND)
        else:
            if mail_file:
                return FileResponse(
                    mail_file.file.open('rb'),
                    as_attachment=True,
                    filename=str(mail_file.original_filename),
                    content_type='application/pdf'
                )
            else:
                return Response({'detail': "File not available"},
                                status.HTTP_404_NOT_FOUND)