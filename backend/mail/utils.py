from django.core.files import File
from datetime import datetime
import httpx
import os
from babel.dates import format_date
from email.mime.text import MIMEText
import hashlib, base64
import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Flowable
from reportlab.lib.styles import getSampleStyleSheet


def generate_file(subject, date, user, group, documents):
    pdf_path =\
        f'/tmp/mail/{subject}-{date if date else ""}-{user.id}-{group.id}.pdf'
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    doc = SimpleDocTemplate(pdf_path)
    styles = getSampleStyleSheet()

    content: list[Flowable] = [
        Paragraph("This is a paragraph that will wrap" + " " +
                  "automatically and follow document flow.", styles["Normal"])]

    doc.build(content)

    return pdf_path

def send_email(mail, mail_group):
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
