import os
import random
import django
from django.contrib.auth import get_user_model
from django.core.files import File
from datetime import date
import sys

sys.path.append("/app")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from core.models import Kind

KINDS = [
    'พนัน',
    'ลิขสิทธิ์',
    'สถาบัน',
    'ลามก',
    'บิดเบือน/หลอกลวง',
    'อาวุธปืน',
    'บุหรี่ไฟฟ้า',
    'รับตั้งครรภ์แทน       ',
    'ดอกเบี้ยเกินอัตรา',
    'ศาสนา',
    'โฆษณาเครื่องดื่มแอลกอฮอล์',
    'น้ำกระท่อม',
    'Hate Speech',
    'ค้าประเวณี',
    'กัญชา',
    'ข่าวปลอม',
    'อาหารและยา',
    'เอกสารปลอม',
    'อื่นๆ'
]


def create_all_kinds():
    Kind.objects.all().delete()
    Kind.objects.bulk_create([
        Kind(name=kind, kind_id=i if i < len(KINDS) - 1 else 999)\
            for i, kind in enumerate(KINDS)
    ])

    print("All kinds are created.")


if __name__ == '__main__':
    if len(sys.argv) == 1:
        create_all_kinds()