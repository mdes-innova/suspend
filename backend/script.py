import os
import random
import django
from django.contrib.auth import get_user_model
from django.core.files import File
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from core.models import Document, DocumentFile, ISPActivity

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
    ISPActivity.objects.create(**isp_payload)

for xlsx_download_id in xlsx_download_rnds:
    doc = Document.objects.get(pk=xlsx_download_id)
    f = DocumentFile.objects.get(file__endswith='.xlsx',
                                 document=doc)
    isp_payload['file'] = f
    isp_payload['document'] = doc
    ISPActivity.objects.create(**isp_payload)

docs = Document.objects.all()
print(docs)
print("Data saved!")
