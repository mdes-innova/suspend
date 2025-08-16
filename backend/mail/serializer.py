"""Mail serializer module."""
from rest_framework import serializers
from core.models import (
    Mail, MailStatus, Group, ISP, MailFile,
    MailGroup, Document, GroupFile
    )
from user.serializer import UserSerializer
from document.serializer import DocumentSerializer
from group.serializer import GroupSerializer, GroupFileSerializer
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

    class Meta:
        model = MailFile
        fields = ['id', 'original_filename', 'group_file_id',
                  'mail_group', 'mail_group_id',
                  'group_file', 'isp', 'created_at', 'mail']
        read_only_fields = ['id', 'original_filename', 'mail_group'
                            'isp', 'created_at', 'mail']
    
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
    mail_file_ids = serializers.PrimaryKeyRelatedField(
        queryset=MailFile.objects.all(),
        write_only=True,
        many=True,
        required=False,
        allow_null=True
    )
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
    document_id = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(),
        write_only=True,
        allow_null=True
    )
    document = DocumentSerializer(
        read_only=True
    )
    section = serializers.IntegerField()

    class Meta:
        model = Mail
        fields = ['id', 'receiver_id', 'receiver',
                  'status', 'datetime', 'confirmed', 'confirmed_uuid',
                  'confirmed_date', 'created_at', 'modified_at', 'mail_files',
                  'mail_group_id', 'document_id', 'document', 'section']
        read_only_fields = ['id', 'receiver', 'mail_file', 'created_at',
                            'modified_at', 'confirmed_date', 'mail_files',
                            'confirmed', 'confirmed_uuid', 'status',
                            'datetime', 'document']

    def create(self, validated_data):
        mail_files = validated_data.pop('mail_file_ids', None)
        receiver = validated_data.pop('receiver_id')
        mail_group_id = validated_data.pop('mail_group_id')
        document = validated_data.pop('document_id', None)
        section = validated_data.data.pop('section', 0)
        mail_group = MailGroup.objects.get(id=mail_group_id)
        mail = Mail.objects.create(
            receiver=receiver,
            confirmed=False,
            mail_group=mail_group,
            document=document,
            **validated_data
        )
        if mail_files:
            for mail_file in mail_files.objects.all():
                mail_file.mail = mail
                mail_file.save(update_fields=['mail'])

        try:
            if (section == 0):
                send_email(mail, mail_group, mail_files)
            else:
                send_email(mail, mail_group, mail_files)
            mail.status = MailStatus.SUCCESSFUL
            mail.datetime = timezone.now()
        except Exception as e:
            print(e)
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

    class Meta:
        model = MailGroup
        fields = ['id', 'mails', 'user', 'group_id', 'documents', 'body',
                  'created_at', 'modified_at', 'subject', 'speed', 'name',
                  'secret', 'document_no', 'document_date', 'group']
        read_only_fields = ['id', 'mails', 'user', 'created_at', 'name',
                            'modified_at', 'group', 'documents']
    
    def create(self, validated_data):
        group = validated_data.pop('group_id')

        created_mailgroup = MailGroup.objects.create(
                user=group.user, group=group, subject=group.title,
                speed=group.speed, secret=group.secret,
                document_no=group.document_no,
                document_date=group.document_date,
                body=group.body,
                name=group.name,
                **validated_data 
            )
        created_mailgroup.documents.set(group.documents.all())

        return created_mailgroup
