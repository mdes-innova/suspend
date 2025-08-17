"""Signal module for group app."""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from core.models import Group


@receiver(post_save, sender=get_user_model())
def create_user_group(sender, instance, created, **kwargs):
    if not instance.is_staff:
        return
    else:
        if created:
            Group.objects.create(name='default', user=instance)

