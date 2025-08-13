"""Mail model class for category app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import (
    FileExtensionValidator, MinValueValidator, MaxValueValidator)
from django.utils import timezone
import os
import uuid
from core.utils import mail_file_path
from uuid import uuid4


class MailStatus(models.TextChoices):
    SUCCESSFUL = "successful", "Successful"
    FAIL = "fail", "Fail"
    IDLE = "idle", "Idle"


class MailGroup(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    user = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name='mailgroups'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class Mail(models.Model):
    subject = models.CharField(max_length=512)
    datetime = models.DateTimeField(null=True)
    document_no = models.CharField(max_length=32, blank=True)
    document_date = models.DateTimeField(null=True)
    mail_group = models.ForeignKey(
        MailGroup,
        related_name='mails',
        on_delete=models.CASCADE,
        default=None
    )
    speed = models.IntegerField(
         validators=[
            MinValueValidator(0),
            MaxValueValidator(3)
            ],
         null=True,
    )
    secret = models.IntegerField(
         validators=[
            MinValueValidator(0),
            MaxValueValidator(3)
            ],
         null=True,
    )

    group = models.ForeignKey(
        "Group",
        on_delete=models.SET_NULL,
        null=True,
        related_name='mails'
    )
    receiver = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_mails'
    )
    mail_file = models.ForeignKey(
        "MailFile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mails',
        editable=False
    )
    documents = models.ManyToManyField(
        "Document",
        related_name='mails',
        editable=False
    )

    confirmed = models.BooleanField(default=False)
    confirmed_hash = models.CharField(
        max_length=64,
        db_index=True,
        unique=True,
        null=True,
        blank=True
    )
    confirmed_date = models.DateTimeField(null=True)
    status = models.CharField(
        max_length=20,
        choices=MailStatus.choices,
        default=MailStatus.IDLE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} ({self.datetime})"


class MailFile(models.Model):
    isp = models.ForeignKey('ISP', on_delete=models.SET_NULL,
                            null=True, default=None)
    mail = models.ForeignKey('Mail', on_delete=models.SET_NULL,
                              null=True, default=None,
                              related_name='mail_files')
    file = models.FileField(
        upload_to=mail_file_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf'])
        ],
        blank=True,
        null=True
    )

    original_filename = models.CharField(
        max_length=512,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)