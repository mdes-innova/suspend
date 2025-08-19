from django.core.files import File
from datetime import datetime
import os
from django.utils.timezone import localtime
from zoneinfo import ZoneInfo
from babel.dates import format_date
from email.mime.text import MIMEText
import hashlib, base64
import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from io import BytesIO
from openpyxl import Workbook
from email import encoders
from email.header import Header
import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Flowable
from reportlab.lib.styles import getSampleStyleSheet
from zoneinfo import ZoneInfo
from decouple import config
import xml.etree.ElementTree as ET
import fitz
from pathlib import Path


THAI_DIGITS = str.maketrans('0123456789', '๐๑๒๓๔๕๖๗๘๙')

def format_date_th_be(d, fmt='full', thai_digits=False):
    # Use a pattern that omits the era/year and append our own BE year.
    # Adjust patterns if you prefer (these are typical Thai forms).
    patterns = {
        'full':   "EEEEที่ d MMMM",   # e.g., วันอาทิตย์ที่ 17 สิงหาคม
        'long':   "d MMMM",
        'medium': "d MMM",
        'short':  "d/M/yy",
    }
    base = format_date(d, format=patterns.get(fmt, fmt), locale='th_TH')

    be_year = d.year + 543
    year_str = str(be_year)

    if thai_digits:
        base = base.translate(THAI_DIGITS)
        year_str = year_str.translate(THAI_DIGITS)

    return f"{base} พ.ศ. {year_str}"

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
    dev_mode = config('DJANGO_ENV', default='development')
    host_url = config('HOST_URL_DEV',
                      default='http://localhost:3000')\
                          if dev_mode == 'development' else \
                              config('HOST_URL_PROD',
                      default='http://localhost:3000')
                              
    # SMTP server connection
    server = smtplib.SMTP(os.environ.get('MAIL_SMTP_SERVER'), os.environ.get('MAIL_PORT'))
    server.starttls()
    server.login(os.environ.get('MAIL_USER'), os.environ.get('MAIL_PASSWORD'))

    # Email subject and body with non-ASCII characters (Thai in this case)
    subject = mail_group.subject
    documents = mail_group.documents.all()
    thai_buddhist_date = format_date_th_be(mail_group.document_date, fmt='full') 
    content = f"""เรื่อง {subject}<br><br>
    กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม ขอส่งคำสั่งศาลคดีหมายเลข<br><br>
    {'<br>'.join([document.order_no for document in documents])}
    <br><br>
    ตามหนังสือเลขที่ {mail_group.document_no} 
    ลงวันที่ {thai_buddhist_date} รายละเอียดตามไฟล์แนบ<br><br>
    หากได้รับแล้วโปรดกดลิงก์ด้านล่างนี้เพื่อยืนยัน และดำเนินการตามคำสั่งศาลต่อไป<br><br>
    """
    body = f"""
    <html>
        <body>
            <p style="font-size: 16px;">{content}</p>
            <a href="{host_url}/confirm-mail/{mail.confirmed_uuid}"
            style="font-weight: bold; color: blue; font-size: 24px;" 
            target="_blank">{host_url}/confirm-mail/{mail.confirmed_uuid}</a>
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

    for mail_file in mail.mail_files.all():
        file_path = mail_file.file.path
        filename = mail_file.original_filename or\
            os.path.basename(file_path)
        encoded_filename = Header(filename, 'utf-8').encode()
        with open(file_path, 'rb') as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition',
                            f'attachment; filename={encoded_filename}')
            msg.attach(part)

    for document in documents:
        file_path = document.document_file.file.path
        filename = document.document_file.original_filename or\
            os.path.basename(file_path)
        encoded_filename = Header(filename, 'utf-8').encode()
        with open(file_path, 'rb') as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition',
                            f'attachment; filename={encoded_filename}')
            msg.attach(part)

        urls = get_urls(file_path)
        urls_bytes = gen_xlsx_bytes(urls)
        part = MIMEBase('application', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        part.set_payload(urls_bytes)
        encoders.encode_base64(part)
        filename = '_'.join(['urls', filename])
        p = Path(filename)
        xlsx_filename = '.'.join([p.stem, 'xlsx'])
        encoded_filename = Header(xlsx_filename, 'utf-8').encode()
        part.add_header('Content-Disposition',
                        f'attachment; filename={encoded_filename}')
        msg.attach(part)

    server.sendmail(os.environ.get('MAIL_USER'),
                    mail.receiver.email,
                    msg.as_string())
    server.quit()


def get_urls(pdf_path):
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    file_data = doc.embfile_get(0)
    xml_string = file_data.decode("utf-8")
    ns = {'ns': 'https://www.w3schools.com'}
    root = ET.fromstring(xml_string)
    order_data = root.find('ns:OrderData', ns)

    domain_list = order_data.find('ns:DomainList', ns)
    domains = [d.text for d in domain_list.findall('ns:Domain', ns)]

    if not len(domains):
        raise Exception("Empty urls.")

    return domains


def gen_xlsx_bytes(urls):
    data = [
        [idx + 1, url] for idx, url in enumerate(urls)
    ]

    headers = ["ID", "Domain"]

    wb = Workbook()
    ws = wb.active

    if ws:
        ws.title = 'Sheet 1'
        ws.append(headers)
        for row in data:
            ws.append(row)

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()
