"""Mail model class for category app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import (
    FileExtensionValidator, MinValueValidator, MaxValueValidator)
from django.utils import timezone
import os
import uuid
from core.utils import mail_file_path


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
    subject = models.CharField(max_length=512, blank=True)
    name = models.CharField(max_length=256, blank=True)
    body = models.TextField(blank=True, default='')
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
    section = models.IntegerField(
         validators=[
            MinValueValidator(0),
            MaxValueValidator(3)
            ],
         null=True,
         default=0
    )

    user = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name='mailgroups'
    )
    documents = models.ManyToManyField(
        "Document",
        related_name='mailgroups',
        editable=False
    )
    group = models.ForeignKey(
        "Group",
        on_delete=models.SET_NULL,
        null=True,
        related_name='mailgroups'
    )
    document_no = models.CharField(max_length=32, blank=True)
    document_date = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class Mail(models.Model):
    datetime = models.DateTimeField(null=True)
    isp = models.ForeignKey(
        'ISP',
        on_delete=models.SET_NULL,
        null=True,
        related_name='mails'  
    )
    mail_group = models.ForeignKey(
        MailGroup,
        related_name='mails',
        on_delete=models.CASCADE,
        default=None
    )
    receiver = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_mails'
    )

    confirmed = models.BooleanField(default=False)
    confirmed_uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True
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
    mail_group = models.ForeignKey(
        MailGroup,
        related_name='mail_files',
        on_delete=models.CASCADE,
        default=None
    )
    isp = models.ForeignKey('ISP', on_delete=models.SET_NULL,
                            null=True, default=None)
    mail = models.ForeignKey('Mail', on_delete=models.SET_NULL,
                              null=True, default=None,
                              related_name='mail_files')
    file = models.FileField(
        upload_to=mail_file_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'xlsx', 'xls'])
        ],
        blank=True,
        null=True
    )
    all_isp = models.BooleanField(
        default=False,
        null=True
    )

    original_filename = models.CharField(
        max_length=512,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)