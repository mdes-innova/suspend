"""Mail model class for category app."""
from django.db import models
from django.db.models.functions import Lower


class FromUser(models.Model):
    user = models.OneToOneField(
            "User",
            on_delete=models.CASCADE
        )


class ToUser(models.Model):
    user = models.OneToOneField(
            "User",
            on_delete=models.CASCADE
        )


class Mail(models.Model):
    subject = models.CharField(max_length=512)
    from_user = models.ForeignKey(
            "FromUser",
            on_delete=models.CASCADE
        )
    to_users = models.ManyToManyField(
        'ToUser',
        default=None,
        blank=True
    )
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
