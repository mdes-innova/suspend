from celery import shared_task
from django.utils.timezone import now
from core.models import Document
import os
from datetime import datetime
from django.utils import timezone
import httpx
import redis


r = redis.StrictRedis(host='redis', port=6379, db=0)


@shared_task(bind=True)
def update_data_task(self):
    lock_id = "lock:update_data_task"
    have_lock = r.set(lock_id, "true", nx=True, ex=60)
    if have_lock:
        try:
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
            new_data = filter(lambda x: int(x['order_id']) in new_ids, db_court_orders)

            for d in new_data:
                createdate = None
                if d['creatdate']:
                    the_date = datetime.strptime(d['creatdate'], "%Y-%m-%d %H:%M:%S")
                    createdate = timezone.make_aware(the_date)

                doc = Document.objects.create(
                    order_id=int(d['order_id']) if d['order_id'] != "" else None,
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
                    kind_id=int(d['group_id']) if d['group_id'] != "" else None,
                    kind_name=d['group_name'] if d['group_name'] != "" else None,
                    createdate=createdate
                )
                print(f"Added order: {doc.order_id}.")
            return "Document database updated"
        finally:
            r.delete(lock_id)
    else:
        print("Task skipped due to existing lock.")
