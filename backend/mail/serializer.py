"""Mail serializer module."""
from rest_framework import serializers
from core.models import (
    Mail, MailStatus, Group, ISP, MailFile,
    MailGroup, Document, GroupFile
    )
from user.serializer import UserSerializer
from document.serializer import DocumentSerializer
from group.serializer import GroupSerializer, GroupFileSerializer
from section.serializer import SectionSerializer
from isp.serializer import ISPSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.utils import timezone
from django.core.files import File
from mail.utils import generate_file
from .utils import send_email


class MailFileSerializer(serializers.ModelSerializer):
    group_file_id = serializers.PrimaryKeyRelatedField(
        queryset=GroupFile.objects.all(),
        write_only=True
    )
    group_file = GroupFileSerializer(
        read_only=True
    )
    mail_group_id = serializers.PrimaryKeyRelatedField(
        queryset=MailGroup.objects.all(),
        write_only=True,
    )
    mail_group = GroupSerializer(
        read_only=True
    )
    isp = ISPSerializer(
        read_only=True
    )

    class Meta:
        model = MailFile
        fields = ['id', 'original_filename', 'group_file_id',
                  'mail_group', 'mail_group_id',
                  'group_file', 'isp', 'created_at']
        read_only_fields = ['id', 'original_filename', 'mail_group'
                            'isp', 'created_at']
    
    def create(self, validated_data):
        group_file = validated_data.pop('group_file_id')
        mail_group = validated_data.pop('mail_group_id')
        mail_file = MailFile.objects.create(
            isp=group_file.isp,
            original_filename=group_file.original_filename,
            mail_group=mail_group 
        )
        gf_file = group_file.file
        with gf_file.open('rb') as f:
            mail_file.file.save(gf_file.name.split('/')[-1], File(f))
            mail_file.save()

        return mail_file


class MailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True
    )
    receiver = UserSerializer(read_only=True)
    mail_files = MailFileSerializer(
        read_only=True,
        many=True
        )
    confirmed = serializers.BooleanField(
        read_only=True
    )
    confirmed_uuid = serializers.CharField(
        read_only=True
    )
    confirmed_date = serializers.DateTimeField(
        read_only=True
    )
    mail_group_id = serializers.UUIDField(write_only=True)
    isp = ISPSerializer(
        read_only=True
    )
    all_isp = serializers.BooleanField(
        allow_null=True,
        required=False
    )

    class Meta:
        model = Mail
        fields = ['id', 'receiver_id', 'receiver', 'isp', 'all_isp',
                  'status', 'datetime', 'confirmed', 'confirmed_uuid',
                  'confirmed_date', 'created_at', 'modified_at', 'mail_files',
                  'mail_group_id']
        read_only_fields = ['id', 'receiver', 'mail_file', 'created_at',
                            'modified_at', 'confirmed_date', 'mail_files',
                            'confirmed', 'confirmed_uuid', 'status',
                            'datetime', 'isp']

    def create(self, validated_data):
        receiver = validated_data.pop('receiver_id')
        mail_group_id = validated_data.pop('mail_group_id')
        mail_group = MailGroup.objects.get(id=mail_group_id)
        group = mail_group.group
        mail = Mail.objects.create(
            receiver=receiver,
            confirmed=False,
            mail_group=mail_group,
            **validated_data
        )

        if MailFile.objects.filter(
                mail_group=mail_group,
                isp=receiver.isp
                ).exists():
            mail_files = MailFile.objects.filter(
                mail_group=mail_group,
                isp=receiver.isp
            )
            mail.mail_files.set(mail_files)
        else:
            new_mail_files = []
            group_files_isp = group.group_files.filter(isp=receiver.isp)  # type: ignore
            if group:
                for group_file in group_files_isp:
                    if group_file:
                        filename = group_file.original_filename
                        mail_file = MailFile.objects.create(
                            mail_group=mail_group,
                            isp=receiver.isp,
                            original_filename=filename
                        )

                        gf_file = group_file.file
                        if gf_file:
                            mail_file.file.save(
                                filename,
                                gf_file.file,
                                save=True
                            )
                        new_mail_files.append(mail_file)
            mail.mail_files.set(new_mail_files)

        try:
            if str(mail_group.section.name) == 'ปกติ':
                send_email(mail, mail_group, section=False)
            else:
                send_email(mail, mail_group, section=True)
            mail.status = MailStatus.SUCCESSFUL
            mail.datetime = timezone.now()
            documents = mail_group.documents.all()
            receiver.isp.documents.add(*documents)
        except Exception as e:
            # print(e)
            mail.status = MailStatus.FAIL

        mail.save(update_fields=['status', 'datetime'])

        return mail


class MailGroupSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    mails = MailSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        write_only=True
    )
    name = serializers.CharField(
        required=False
    )
    group = GroupSerializer(read_only=True)
    documents = DocumentSerializer(
        many=True,
        read_only=True
    )
    allisp_mail_files = serializers.SerializerMethodField()
    section = SectionSerializer(
        read_only=True
    )

    class Meta:
        model = MailGroup
        fields = ['id', 'mails', 'user', 'group_id', 'documents', 'body', 'allisp_mail_files',
                  'created_at', 'modified_at', 'subject', 'speed', 'name',
                  'secret', 'document_no', 'document_date', 'group', 'section']
        read_only_fields = ['id', 'mails', 'user', 'created_at', 'name', 'allisp_mail_files',
                            'modified_at', 'group', 'documents', 'section']
    
    def get_allisp_mail_files(self, obj):
        data = obj.mail_files.filter(all_isp=True)
        return MailFileSerializer(data, many=True).data

    
    def create(self, validated_data):
        group = validated_data.pop('group_id')

        created_mailgroup = MailGroup.objects.create(
                user=group.user, group=group, subject=group.title,
                speed=group.speed, secret=group.secret,
                document_no=group.document_no,
                document_date=group.document_date,
                body=group.body,
                name=group.name,
                section=group.section,
                **validated_data 
            )
        created_mailgroup.documents.set(group.documents.all())

        if created_mailgroup.section.name != 'ปกติ':
            all_group_files = group.group_files.filter(
                all_isp=True
            )

            if len(all_group_files):
                for gf in all_group_files.all():
                    mail_file = MailFile.objects.create(
                        mail_group=created_mailgroup,
                        all_isp=True,
                        original_filename=gf.original_filename
                    )
                    gf_file = gf.file
                    if gf_file:
                        mail_file.file.save(
                            gf.original_filename,
                            gf_file.file,
                            save=True
                        )

        return created_mailgroup
