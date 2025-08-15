"""Mail serializer module."""
from rest_framework import serializers
from core.models import (
    Mail, MailStatus, Group, ISP, MailFile,
    MailGroup, Document
    )
from user.serializer import UserSerializer
from document.serializer import DocumentSerializer
from group.serializer import GroupSerializer, GroupFileSerializer
from isp.serializer import ISPSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.utils import timezone
from django.core.files import File
import hashlib, base64
from mail.utils import generate_file
import smtplib, ssl
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
import httpx
import io
import tempfile
from datetime import datetime
from babel.dates import format_date


class MailFileSerializer(serializers.ModelSerializer):
    isp_id = serializers.PrimaryKeyRelatedField(
        queryset=ISP.objects.all(),
        write_only=True
    )
    isp = ISPSerializer(read_only=True)

    class Meta:
        model = MailFile
        fields = ['id', 'original_filename',
                  'isp_id', 'isp', 'created_at', 'mail']
        read_only_fields = ['id', 'original_filename',
                            'isp', 'created_at']


class MailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True
    )
    receiver = UserSerializer(read_only=True)
    mail_file_id = serializers.PrimaryKeyRelatedField(
        queryset=MailFile.objects.all(),
        write_only=True
    )
    mail_file = MailFileSerializer(read_only=True)
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
        write_only=True
    )
    document = DocumentSerializer(
        read_only=True
    )

    class Meta:
        model = Mail
        fields = ['id', 'receiver_id', 'receiver', 'mail_file_id', 'mail_file',
                  'status', 'datetime', 'confirmed', 'confirmed_uuid',
                  'confirmed_date', 'created_at', 'modified_at',
                  'mail_group_id', 'document_id', 'document']
        read_only_fields = ['id', 'receiver', 'mail_file', 'created_at',
                            'modified_at', 'confirmed_date',
                            'confirmed', 'confirmed_uuid', 'status',
                            'datetime', 'document']

    def send_email(self, mail, mail_group):
        # SMTP server connection
        server = smtplib.SMTP(os.environ.get('MAIL_SMTP_SERVER'), os.environ.get('MAIL_PORT'))
        server.starttls()
        server.login(os.environ.get('MAIL_USER'), os.environ.get('MAIL_PASSWORD'))

        # Email subject and body with non-ASCII characters (Thai in this case)
        subject = mail_group.subject
        documents = mail_group.documents.all()
        document_ids = list(mail_group.documents.values_list('id', flat=True))
        document_id_index = document_ids.index(mail.document.id)
        content = f"""เรื่อง {subject}<br><br>
        กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม ขอส่งคำสั่งศาล ที่ {document_id_index + 1}/{len(document_ids)}
        คดีหมายเลข {mail.document.order_no} ตามหนังสือเลขที่ {mail_group.document_no} 
        ลงวันที่ {format_date(mail_group.document_date, format='full', locale='th_TH')} 
        รายละเอียดตามไฟล์แนบ<br><br>
        หากได้รับแล้วโปรดกดลิงก์ด้านล่างนี้เพื่อยืนยัน และดำเนินการตามคำสั่งศาลต่อไป<br><br>
        """
        body = f"""
        <html>
            <body>
                <p style="font-size: 16px;">{content}</p>
                <a href="{os.environ.get('NEXT_PUBLIC_FRONTEND')}/confirm-mail/{mail.confirmed_uuid}"
                style="font-weight: bold; color: blue; font-size: 24px;" 
                target="_blank">{os.environ.get('NEXT_PUBLIC_FRONTEND')}/confirm-mail/{mail.confirmed_uuid}</a>
                <br /><br />
                <p style="font-size: 16px;">ติดต่อสอบถาม กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม</p>
                <p style="font-size: 16px;">
                    อีเมล 
                    <a href="mailto:saraban@mdes.go.th" style="color: blue; text-decoration: underline;">
                        saraban@mdes.go.th
                    </a> 
                    โทร 06 4208 6657
                </p>
            </body>
        </html>
        """

        # Create MIME message
        msg = MIMEMultipart()
        msg['From'] = os.environ.get('MAIL_USER')
        msg['To'] = mail.receiver.email
        msg['Subject'] = subject

        # Attach the body as a MIMEText part (use utf-8 encoding)
        # body_part = MIMEText(content, 'plain', 'utf-8')
        body_part = MIMEText(body, 'html', 'utf-8')

        msg.attach(body_part)

        if mail.mail_file.file:
            file_path = mail.mail_file.file.path
            with open(file_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                filename = mail.mail_file.original_filename or\
                    os.path.basename(file_path)
                encoded_filename = Header(filename, 'utf-8').encode()
                part.add_header('Content-Disposition',
                                f'attachment; filename={encoded_filename}')
                msg.attach(part)
        else:
            raise Exception("No group file found.")

        court_order_path = '/app/uploads/court-orders'
        if documents and len(documents) != 0:
            for document in documents:
                if hasattr(document, 'order_filename')\
                    and document.order_filename and\
                        document.order_filename != '':
                    filename = document.order_filename
                    file_path = os.path.join(court_order_path,
                                             filename)
                    if not os.path.exists(file_path):
                        bearer_token = os.environ.get("WEBD_TOKEN")
                        webd_url = os.environ.get("WEBD_URL")
                        res = httpx.post(
                            f'{webd_url}/api/courtorderdownload',
                            headers={
                                'Authorization': f'Bearer {bearer_token}',
                                'Content-Type': 'application/json'
                            },
                            json={
                                'filename': filename
                            }
                        )
                        if (res.status_code != 200):
                            raise Exception("Fetch court order file fail.")

                        os.makedirs(os.path.dirname(file_path), exist_ok=True)
                        with open(file_path, 'wb') as f:
                            f.write(res.content)

                    with open(file_path, 'rb') as attachment:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(attachment.read())
                        encoders.encode_base64(part)
                        filename = document.order_filename or\
                            os.path.basename(file_path)
                        encoded_filename =\
                            Header(filename, 'utf-8').encode()
                        part.add_header('Content-Disposition',
                                        f'attachment; filename={encoded_filename}')
                        msg.attach(part)

        server.sendmail(os.environ.get('MAIL_USER'),
                        mail.receiver.email,
                        msg.as_string())
        # server.sendmail(os.environ.get('MAIL_USER'),
        #                 os.environ.get('MAIL_USER'),
        #                 msg.as_string())
        server.quit()

    def create(self, validated_data):
        mail_file = validated_data.pop('mail_file_id')
        receiver = validated_data.pop('receiver_id')
        mail_group_id = validated_data.pop('mail_group_id')
        document = validated_data.pop('document_id')
        mail_group = MailGroup.objects.get(id=mail_group_id)
        mail = Mail.objects.create(
            receiver=receiver,
            mail_file=mail_file,
            confirmed=False,
            mail_group=mail_group,
            document=document,
            **validated_data
        )
        mail_file.mail = mail
        mail_file.save(update_fields=['mail'])

        try:
            self.send_email(mail, mail_group)
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
    group = GroupSerializer(read_only=True)
    documents = DocumentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = MailGroup
        fields = ['id', 'mails', 'user', 'group_id', 'documents', 'body',
                  'created_at', 'modified_at', 'subject', 'speed',
                  'secret', 'document_no', 'document_date', 'group']
        read_only_fields = ['id', 'mails', 'user', 'created_at',
                            'modified_at', 'group', 'documents']
    
    def create(self, validated_data):
        group = validated_data.pop('group_id')

        created_mailgroup = MailGroup.objects.create(
                user=group.user, group=group, subject=group.title,
                speed=group.speed, secret=group.secret,
                document_no=group.document_no,
                document_date=group.document_date,
                body=group.body,
                **validated_data 
            )
        created_mailgroup.documents.set(group.documents.all())

        return created_mailgroup
