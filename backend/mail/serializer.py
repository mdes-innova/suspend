"""Mail serializer module."""
from rest_framework import serializers
from core.models import Mail,Document, Group, GroupFile
from user.serializer import UserSerializer
from document.serializer import DocumentSerializer
from group.serializer import GroupSerializer, GroupFileSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.utils import timezone
from django.core.files import File
import hashlib, base64
from mail.utils import generate_file
import smtplib, ssl
import os


class MailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        write_only=True
    )
    group = GroupSerializer(read_only=True)
    sender = UserSerializer(read_only=True)
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True
    )
    receiver = UserSerializer(read_only=True)
    group_file_id = serializers.PrimaryKeyRelatedField(
        queryset=GroupFile.objects.all(),
        write_only=True
    )
    group_file = GroupFileSerializer(read_only=True)
    documents = DocumentSerializer(
        read_only=True,
        many=True
    )
    confirmed = serializers.BooleanField(
        read_only=True
    )
    confirmed_hash = serializers.CharField(
        read_only=True
    )

    class Meta:
        model = Mail
        fields = ['id', 'group_id', 'group', 'sender', 'document_no',
                  'document_date', 'speed', 'secret',
                  'receiver_id', 'receiver', 'group_file_id', 'group_file',
                  'documents', 'subject', 'document_no', 'status',
                  'datetime', 'confirmed', 'confirmed_hash', 'created_at',
                  'modified_at']
        read_only_fields = ['id', 'group', 'sender', 'receiver', 'group_file',
                            'documents', 'created_at', 'modified_at', 'confirmed',
                            'confirmed_hash', 'status', 'datetime']

    def create(self, validated_data):
        user = self.context['request'].user
        group = validated_data.pop('group_id')
        group_file = validated_data.pop('group_file_id')
        receiver = validated_data.pop('receiver_id')
        mail = Mail.objects.create(
            sender=user,
            group=group,
            receiver=receiver,
            group_file=group_file,
            datetime=timezone.now(),
            confirmed=False,
            **validated_data
        )
        mail.documents.set(group.documents.all())
        h = hashlib.sha256((str(group_file.id)).encode()).digest()
        mail.confirmed_hash = base64.urlsafe_b64encode(h).decode()
        mail.save(update_fields=['confirmed_hash'])

        context = ssl.create_default_context()
        server = smtplib.SMTP(os.environ.get('MAIL_SMTP_SERVER'),  # type: ignore
                              os.environ.get('MAIL_PORT'))  # type: ignore
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(os.environ.get('MAIL_USER'), os.environ.get('MAIL_PASSWORD'))
        subject = "ระบบระงับการเผยแพร่ซึ่งข้อมูลคอมพิวเตอร์ที่มีความผิดตาม พ.ร.บ. คอมพิวเตอร์"
        body = """ระบบระงับการเผยแพร่ซึ่งข้อมูลคอมพิวเตอร์ที่มีความผิดตาม พ.ร.บ. คอมพิวเตอร์
        กองป้องกันและปราบปรามการกระทำความผิดทางเทคโรโลยีสารสนเทศ"""

        message = f"Subject: {subject}\n\n{body}"

        server.sendmail(os.environ.get('MAIL_USER'), receiver.email,
                        message)
        server.quit()

        return mail
