from celery import shared_task
from django.db import transaction
from django.utils import timezone
from core.models import Document
from datetime import datetime
import os
import httpx
import redis

# Reuse a small client pool; Celery worker is long-lived.
_http = httpx.Client(timeout=httpx.Timeout(10.0, connect=5.0), follow_redirects=True)

r = redis.StrictRedis(host=os.getenv("REDIS_HOST", "redis"), port=int(os.getenv("REDIS_PORT", "6379")), db=0)

def _parse_date(d, fmt="%Y-%m-%d"):
    if not d:
        return None
    # Make timezone-aware (assumes input is naive local or UTC; adjust if needed)
    dt = datetime.strptime(d, fmt)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    return dt

def _parse_datetime(d, fmt="%Y-%m-%d %H:%M:%S"):
    if not d:
        return None
    dt = datetime.strptime(d, fmt)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    return dt

@shared_task(bind=True, autoretry_for=(httpx.RequestError,), retry_backoff=True, retry_kwargs={"max_retries": 5})
def update_data_task(self):
    # Use redis-py lock helper for safety
    lock = r.lock("lock:update_data_task", timeout=300, blocking_timeout=1)  # 5 min TTL
    if not lock.acquire(blocking=False):
        # Another worker is doing the job
        return "Skipped (lock held)"

    try:
        bearer_token = os.environ.get("WEBD_TOKEN")
        webd_url = os.environ.get("WEBD_URL")
        if not bearer_token or not webd_url:
            raise RuntimeError("WEBD_TOKEN/WEBD_URL not configured")

        res = _http.post(
            f"{webd_url}/api/getcourtorder",
            headers={
                "Authorization": f"Bearer {bearer_token}",
                "Content-Type": "application/json",
            },
        )
        res.raise_for_status()
        body = res.json()
        incoming = body.get("urllist", []) or []

        # Build set of incoming order_ids (as int) — cheap and small compared to full table scan
        incoming_ids = {int(item["order_id"]) for item in incoming if str(item.get("order_id", "")).strip().isdigit()}
        if not incoming_ids:
            return "No incoming IDs"

        # Fetch only the IDs we might insert (memory-friendly)
        existing_ids = set(
            Document.objects.filter(order_id__in=incoming_ids).values_list("order_id", flat=True)
        )
        new_ids = incoming_ids - existing_ids
        if not new_ids:
            return "No new documents"

        # Filter incoming payload to new records only
        to_insert = []
        for d in incoming:
            try:
                oid_raw = d.get("order_id")
                if oid_raw is None or not str(oid_raw).strip().isdigit():
                    continue
                oid = int(oid_raw)
                if oid not in new_ids:
                    continue

                doc = Document(
                    order_id=oid,
                    order_no=d.get("order_no") or None,
                    order_list=d.get("order_list") or None,
                    order_date=_parse_date(d.get("order_date")),
                    order_filename=d.get("order_filename") or None,
                    orderred_no=d.get("orderred_no") or None,
                    orderred_date=_parse_date(d.get("orderred_date")),
                    orderblack_no=d.get("orderblack_no") or None,
                    orderblack_date=_parse_date(d.get("orderblack_date")),
                    isp_no=d.get("isp_no") or None,
                    isp_date=_parse_date(d.get("isp_date")),
                    kind_id=int(d["group_id"]) if str(d.get("group_id", "")).strip().isdigit() else None,
                    kind_name=d.get("group_name") or None,
                    createdate=_parse_datetime(d.get("creatdate")),  # upstream field name kept
                )
                to_insert.append(doc)
            except Exception:
                # Skip malformed row; you can log detail if desired
                continue

        if not to_insert:
            return "No valid new documents"

        # Bulk insert in batches to reduce memory/transaction overhead
        with transaction.atomic():
            Document.objects.bulk_create(to_insert, ignore_conflicts=True, batch_size=500)

        return f"Inserted {len(to_insert)} new documents"
    finally:
        try:
            lock.release()
        except redis.exceptions.LockError:
            pass
