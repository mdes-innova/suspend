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

    class Meta:
        model = Mail
        fields = ['id', 'receiver_id', 'receiver', 'mail_file_id', 'mail_file',
                  'status', 'datetime', 'confirmed', 'confirmed_uuid',
                  'confirmed_date', 'created_at', 'modified_at', 'mail_group_id']
        read_only_fields = ['id', 'receiver', 'mail_file', 'created_at',
                            'modified_at', 'confirmed_date',
                            'confirmed', 'confirmed_uuid', 'status',
                            'datetime']

    def send_email(self, receiver, mail_file, mail_group, confirmed_uuid):
        # SMTP server connection
        server = smtplib.SMTP(os.environ.get('MAIL_SMTP_SERVER'), os.environ.get('MAIL_PORT'))
        server.starttls()
        server.login(os.environ.get('MAIL_USER'), os.environ.get('MAIL_PASSWORD'))

        # Email subject and body with non-ASCII characters (Thai in this case)
        subject = mail_group.subject
        documents = mail_group.documents.all()
        content = f"""เรียน ผู้ให้บริการอินเทอร์เน็ต<br>
        ด้วย กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม ได้ตรวจพบเนื้อหาที่ไม่เหมาะสมในอินเทอร์เน็ต<br>
        ซึ่งเนื้อหาดังกล่าวเข้าข่ายผิดตามพระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์<br>
        มีผลกระทบต่อประชาชนที่หากล่าช้าอาจทำให้มีการเผยแพร่ในวงกว้าง<br>
        ตามหนังสือเลขที่ {mail_group.document_no} ตามเอกสารแนบ และตามคำสั่งศาล<br><br>
        {'<br>'.join([doc.order_no for doc in documents])}<br><br>
        จึงขอความอนุเคราะห์ท่านโปรดดำเนินการปิดกั้นให้โดยด่วน<br><br>

        ทั้งนี้ กระทรวงฯ อยู่ระหว่างยื่นขอให้ศาลมีคำสั่งระงับการทำให้แพร่หลายซึ่งข้อมูลคอมพิวเตอร์<br>
        หากศาลมีคำสั่งแล้วจะแจ้งให้ทราบในภายหลังต่อไป<br><br>

        เมื่อท่านรับทราบแล้ว กรุณากดยืนยันตามลิงค์ด้านล่าง
        """
        body = f"""
        <html>
            <body>
                <p style="font-size: 16px;">{content}</p>
                <br />
                <a href="{os.environ.get('NEXT_PUBLIC_FRONTEND')}/confirm-mail/{confirmed_uuid}" 
                style="font-weight: bold; color: blue; font-size: 24px;" 
                target="_blank">กรุณากดลิงค์นี้เพื่อยืนยันว่าท่านได้รับทราบแล้ว</a>
                <br />
                <p style="font-size: 16px;">กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม</p>
            </body>
        </html>
        """

        # Create MIME message
        msg = MIMEMultipart()
        msg['From'] = os.environ.get('MAIL_USER')
        msg['To'] = receiver.email
        msg['Subject'] = subject

        # Attach the body as a MIMEText part (use utf-8 encoding)
        # body_part = MIMEText(content, 'plain', 'utf-8')
        body_part = MIMEText(body, 'html', 'utf-8')

        msg.attach(body_part)

        if mail_file.file:
            file_path = mail_file.file.path
            with open(file_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                filename = mail_file.original_filename or\
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
                        receiver.email,
                        msg.as_string())
        # server.sendmail(os.environ.get('MAIL_USER'),
        #                 os.environ.get('MAIL_USER'),
        #                 msg.as_string())
        server.quit()

    def create(self, validated_data):
        mail_file = validated_data.pop('mail_file_id')
        receiver = validated_data.pop('receiver_id')
        mail_group_id = validated_data.pop('mail_group_id')
        mail_group = MailGroup.objects.get(id=mail_group_id)
        mail = Mail.objects.create(
            receiver=receiver,
            mail_file=mail_file,
            confirmed=False,
            mail_group=mail_group, 
            **validated_data
        )
        mail_file.mail = mail
        mail_file.save(update_fields=['mail'])

        try:
            self.send_email(receiver, mail_file, mail_group,
                            mail.confirmed_uuid)
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
        fields = ['id', 'mails', 'user', 'group_id', 'documents',
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
                **validated_data 
            )
        created_mailgroup.documents.set(group.documents.all())

        return created_mailgroup
