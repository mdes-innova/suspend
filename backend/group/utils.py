import os
import httpx
from core.models import DocumentFile
from django.core.files.base import ContentFile

def create_document_file(document):
    filename = document.order_filename
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

    document_file = DocumentFile.objects.create(
        document=document,
        original_filename=filename,
    )
    
    document_file.file.save(
        filename,
        ContentFile(res.content),
        save=True 
    )
    