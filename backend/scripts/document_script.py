import os
import time
import sys
import random
import django
from django.contrib.auth import get_user_model
from django.core.files import File
from datetime import date
import httpx
from datetime import datetime
from django.utils import timezone

sys.path.append("/app")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from core.models import Document, DocumentFile, Activity

def create_dummy_documents():
    Document.objects.all().delete()

    # Insert a new book
    document_payloads = [
        {
            'title': f'Title {i}',
            'date': date.today()
        } for i in range(40)
    ]
    document_ids = []
    num_pdf_dowloads = 21
    num_xlsx_downloads = 20

    for dpi, dp in enumerate(document_payloads):
        doc = Document.objects.create(**dp)
        document_ids.append(doc.id)

        with open('./file.pdf', 'rb') as f:
            django_file = File(f)
            uploaded = DocumentFile(
                original_name='file.pdf',
                file=django_file,
                document=doc
            )
            uploaded.save()

        with open('./file.xlsx', 'rb') as f:
            django_file = File(f)
            uploaded = DocumentFile(
                original_name='file.xlsx',
                file=django_file,
                document=doc
            )
            uploaded.save()

    pdf_download_rnds = random.choices(document_ids,
                                        k=num_pdf_dowloads)
    xlsx_download_rnds = random.choices(document_ids,
                                        k=num_xlsx_downloads)

    isp_payload = {
        'user': None,
        'activity': 'download',
        'ip_address': '::1',
        'path': 'https://example.com',
        'isp': None
    }
    for pdf_download_id in pdf_download_rnds: 
        doc = Document.objects.get(pk=pdf_download_id)
        f = DocumentFile.objects.get(file__endswith='.pdf',
                                    document=doc)
        isp_payload['file'] = f
        isp_payload['document'] = doc
        Activity.objects.create(**isp_payload)

    for xlsx_download_id in xlsx_download_rnds:
        doc = Document.objects.get(pk=xlsx_download_id)
        f = DocumentFile.objects.get(file__endswith='.xlsx',
                                    document=doc)
        isp_payload['file'] = f
        isp_payload['document'] = doc
        Activity.objects.create(**isp_payload)

    docs = Document.objects.all()
    print(docs)
    print("Data saved!")


def update_documents():
    # while True:
    #     try:
    bearer_token = os.environ.get("WEBD_TOKEN")
    webd_url = os.environ.get("WEBD_URL")
    res = httpx.post(
        f'{webd_url}/api/getcourtorder',
        headers={
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json'
        }
    )
    if res.status_code != 200:
        raise Exception('Fail to get court orders from WebD.')

    db_data = res.json()
    db_court_orders = db_data['urllist'] 
    db_oder_ids = set([int(new['order_id']) for new in db_court_orders])

    data = Document.objects.all()
    order_ids = set([d.order_id for d in data])

    new_ids = db_oder_ids - order_ids
    new_data = filter(lambda x: x['order_id'] in new_ids, db_court_orders)

    for d in new_data:
        createdate = None
        if d['creatdate']:
            the_date = datetime.strptime(d['creatdate'], "%Y-%m-%d %H:%M:%S")
            createdate = timezone.make_aware(the_date)

        Document.objects.create(
            order_id=d['order_id'] if d['order_id'] != "" else None,
            order_no=d['order_no'] if d['order_no'] != "" else None,
            order_list=d['order_list'] if d['order_list'] != "" else None,
            order_date=datetime.strptime(d['order_date'], "%Y-%m-%d")
            if d['order_date'] != "" else None,
            order_filename=d['order_filename'] if d['order_filename'] !=
            "" else None,
            orderred_no=d['orderred_no'] if d['orderred_no'] != "" else None,
            orderred_date=datetime.strptime(d['orderred_date'], "%Y-%m-%d")
            if d['orderred_date'] != "" else None,
            orderblack_no=d['orderblack_no'] if d['orderblack_no'] !=
            "" else None,
            orderblack_date=datetime.strptime(d['orderblack_date'], "%Y-%m-%d")
            if d['orderblack_date'] != "" else None,
            isp_no=d['isp_no'] if d['isp_no'] != "" else None,
            isp_date=datetime.strptime(d['isp_date'], "%Y-%m-%d")
            if d['isp_date'] != "" else None,
            kind_id=d['group_id'] if d['group_id'] != "" else None,
            kind_name=d['group_name'] if d['group_name'] != "" else None,
            createdate=createdate
        )
        # except Exception as e:
        #     print(e)
        # time.sleep(1)


if __name__ == '__main__':
    if len(sys.argv) == 1:
        update_documents()
