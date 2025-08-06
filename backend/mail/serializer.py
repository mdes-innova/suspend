"""Mail serializer module."""
from rest_framework import serializers
from core.models import Mail, MailStatus, Group, GroupFile
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
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
import httpx
import io
import tempfile


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
    confirmed_date = serializers.DateTimeField(
        read_only=True
    )

    class Meta:
        model = Mail
        fields = ['id', 'mail_group_id', 'group', 'sender', 'document_no',
                  'document_date', 'speed', 'secret', 'group_id',
                  'receiver_id', 'receiver', 'group_file_id', 'group_file',
                  'documents', 'subject', 'document_no', 'status',
                  'datetime', 'confirmed', 'confirmed_hash', 'confirmed_date',
                  'created_at',
                  'modified_at']
        read_only_fields = ['id', 'group', 'sender', 'receiver', 'group_file',
                            'documents', 'created_at', 'modified_at',
                            'confirmed_date',
                            'confirmed', 'confirmed_hash', 'status',
                            'datetime']

    def send_email(self, receiver, group_file, group, confirmed_hash):
        # SMTP server connection
        server = smtplib.SMTP(os.environ.get('MAIL_SMTP_SERVER'), os.environ.get('MAIL_PORT'))
        server.starttls()
        server.login(os.environ.get('MAIL_USER'), os.environ.get('MAIL_PASSWORD'))

        # Email subject and body with non-ASCII characters (Thai in this case)
        subject = group.title
        content = f"""เรียน ผู้ให้บริการอินเทอร์เน็ต<br>
        ด้วย กระทรวงดิจิหัลเพื่อเศรษฐกิจและสังคม ได้ตรวจพบเนื้อหาที่ไม่เหมาะสมในอินเทอร์เน็ต<br>
        ซึ่งเนื้อหาดังกล่าวเข้าข่ายผิดตามพระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์<br>
        มีผลกระทบต่อประชาชนที่หากล่าช้าอาจทำให้มีการเผยแพร่ในวงกว้าง<br>
        ตามหนังสือเลขที่ {group.document_no} ตามเอกสารแนบ<br>
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
                <a href="{os.environ.get('NEXT_PUBLIC_FRONTEND')}/mail/confirm/{confirmed_hash}" 
                style="font-weight: bold; color: blue; font-size: 24px;" 
                target="_blank">กรุณากดลิงค์นี้เพื่อยืนยันว่าท่านได้รับทราบแล้ว</a>
                <br />
                <p style="font-size: 16px;">กระทรวงดิจิหัลเพื่อเศรษฐกิจและสังคม</p>
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

        if group_file.file:
            file_path = group_file.file.path
            with open(file_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                filename = group_file.original_filename or\
                    os.path.basename(file_path)
                encoded_filename = Header(filename, 'utf-8').encode()
                part.add_header('Content-Disposition',
                                f'attachment; filename={encoded_filename}')
                msg.attach(part)
        else:
            raise Exception("No group file found.")

        court_order_path = '/app/uploads/court-orders'
        documents = group.documents.all()
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
                        with open(file_path, 'wb') as f:
                            f.write(res.content)

                    with open(file_path, 'rb') as attachment:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(attachment.read())
                        encoders.encode_base64(part)
                        filename = group_file.original_filename or\
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
        user = self.context['request'].user
        group = validated_data.pop('group_id')
        group_file = validated_data.pop('group_file_id')
        receiver = validated_data.pop('receiver_id')
        mail = Mail.objects.create(
            sender=user,
            group=group,
            receiver=receiver,
            group_file=group_file,
            confirmed=False,
            **validated_data
        )
        mail.documents.set(group.documents.all())

        h = hashlib.sha256((str(mail.id)).encode()).digest()  # type: ignore
        mail.confirmed_hash = base64.urlsafe_b64encode(h).decode()
        mail.save(update_fields=['confirmed_hash'])

        try:
            self.send_email(receiver, group_file, group,
                            mail.confirmed_hash)
            mail.status = MailStatus.SUCCESSFUL
            mail.datetime = timezone.now()
        except:
            mail.status = MailStatus.FAIL


        mail.save(update_fields=['status', 'datetime'])

        return mail
