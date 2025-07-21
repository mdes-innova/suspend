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

from core.models import ISP

ISPS = {
    1: 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)',
    2: 'บริษัท เคิร์ซ จำกัด',
    3: 'บริษัท จัสเทล เน็ทเวิร์ค จำกัด',
    4: 'บริษัท ซิมโฟนี่ คอมมูนิเคชั่น จำกัด (มหาชน)',
    5: 'บริษัท ซีเอส ล็อกซอินโฟ จำกัด (มหาชน)',
    6: 'บริษัท ดีแทค ไตรเน็ต จำกัด',
    7: 'บริษัท ทริปเปิลที บรอดแบนด์ จำกัด (มหาชน)',
    8: 'บริษัท ทรู อินเทอร์เน็ต คอร์ปอเรชั่น จำกัด',
    9: 'บริษัท ที.ซี.ซี. เทคโนโลยี จำกัด',
    10: 'บริษัท โตโยต้า ทูโช ซิสเท็มส์ (ประเทศไทย) จำกัด',
    12: 'บริษัท แปซิฟิค อินเทอร์เน็ต (ประเทศไทย) จำกัด',
    13: 'บริษัท ยูไนเต็ด อินฟอร์เมชั่น ไฮเวย์ จำกัด',
    14: 'บริษัท สามารถ อินโฟเนต จำกัด',
    15: 'บริษัท อินเตอร์เนต โซลูชั่น แอนด์ เซอร์วิส โพรวายเดอร์ จำกัด',
    16: 'บริษัท แอดวานซ์ ไวร์เลส เน็ทเวอร์ค จำกัด',
    17: 'บริษัท เค เอส ซี คอมเมอร์เชียล อินเตอร์เนต จำกัด',
    18: 'บริษัท อินเทอร์เน็ตประเทศไทย จำกัด (มหาชน)',
    19: 'บริษัท เอ็นทีที (ประเทศไทย) จำกัด',
    20: 'บริษัท โปรเอ็น คอร์ป จำกัด (มหาชน)',
    21: 'บริษัท โอทาโร จำกัด'
}

def create_all_isps():
    ISP.objects.all().delete()
    ISP.objects.bulk_create([
        ISP(name=v, isp_id=k)
            for k, v in ISPS.items()
    ])

    print("All isps are created.")

def delelte_all():
    ISP.objects.all().delete()    

if __name__ == '__main__':
    if len(sys.argv) == 1:
        create_all_isps()
    elif sys.argv[1] == '--delete':
        delelte_all()