from django.db.models.signals import pre_save
from django.dispatch import receiver
from core.models import Document, DocumentCounter


@receiver(pre_save, sender=Document)
def assign_count(sender, instance, **kwargs):
    if instance._state.adding and not instance.order_id:
        instance.order_id = DocumentCounter.increment()
