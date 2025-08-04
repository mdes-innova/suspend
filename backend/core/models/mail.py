"""Mail model class for category app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import os

from core.utils import mail_file_path


class MailStatus(models.TextChoices):
    SUCCESSFUL = "successful", "Successful"
    FAIL = "fail", "Fail"
    IDLE = "idle", "Idle"


class Mail(models.Model):
    subject = models.CharField(max_length=512)
    datetime = models.DateTimeField(default=timezone.now)

    group = models.ForeignKey(
        "Group",
        on_delete=models.SET_NULL,
        null=True,
        related_name='mails'
    )
    sender = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_mails'
    )
    receiver = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_mails'
    )
    group_file = models.ForeignKey(
        "GroupFile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mails'
    )
    documents = models.ManyToManyField(
        "Document",
        related_name='mails'
    )

    confirmed = models.BooleanField(default=False)
    confirmed_hash = models.CharField(
        max_length=64,
        db_index=True,
        unique=True,
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=MailStatus.choices,
        default=MailStatus.IDLE
    )
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} ({self.date})"