import os
import uuid
import xml.etree.ElementTree as ET
import fitz
from io import BytesIO
from openpyxl import Workbook
from datetime import datetime, timedelta, time
from zoneinfo import ZoneInfo
from rest_framework_simplejwt.tokens import RefreshToken


def document_file_path(instance, filename):
    """Generate file path for new recipe file."""
    ext = os.path.splitext(filename)[1]
    filename = '{}{}'.format(uuid.uuid4(), ext)
    return os.path.join('uploads', 'document', filename)


def mail_file_path(instance, filename):
    """Generate file path for new recipe file."""
    ext = os.path.splitext(filename)[1]
    filename = '{}{}'.format(uuid.uuid4(), ext)
    return os.path.join('uploads', 'mail', filename)


def group_file_path(instance, filename):
    """Generate file path for new recipe file."""
    ext = os.path.splitext(filename)[1]
    filename = '{}{}'.format(uuid.uuid4(), ext)
    return os.path.join('uploads', 'group', filename)

def get_urls(source, is_path=True):
    if is_path:
        with open(source, 'rb') as f:
            pdf_bytes = f.read()
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    else:
        doc = fitz.open(stream=source, filetype="pdf")

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


def gen_xlsx_bytes(urls, order_no):
    data = [
        [idx + 1, url] for idx, url in enumerate(urls)
    ]

    headers = ["ID", f"Domain ({order_no})"]

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


def get_tokens(user):
    tz = ZoneInfo("Asia/Bangkok")
    now = datetime.now(tz)

    next_day = now.date() + timedelta(days=1)
    cutoff = datetime(next_day.year, next_day.month, next_day.day, 0, 0, 0, tzinfo=tz)

    lifetime = cutoff - now

    refresh = RefreshToken.for_user(user)
    refresh.set_exp(from_time=now, lifetime=lifetime)

    access = refresh.access_token
    return {"refresh": str(refresh), "access": str(access),
            "lifetime": int(lifetime.total_seconds())}


def set_cookies(refresh, access, resp):
    resp.set_cookie(
        key="access",
        value=str(access),
        max_age=int(60*4.5),
        path="/",
        secure=True,
        httponly=True,
        samesite="Lax"
    )
    resp.set_cookie(
        key="refresh",
        value=str(refresh),
        max_age=int(60*60*7.95),
        path="/",
        secure=True,
        httponly=True,
        samesite="Lax"
    )

    return resp
