"""Group model for group app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.validators import (
    FileExtensionValidator, MinValueValidator, MaxValueValidator)
import os
from core.utils import group_file_path


class GroupDocument(models.Model):
    group = models.ForeignKey('Group', on_delete=models.CASCADE)
    document = models.OneToOneField('Document', on_delete=models.CASCADE)
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        default=None,
        null=True
        )

    def save(self, *args, **kwargs):
        if not self.user:
            self.user = self.group.user

        super().save(*args, **kwargs)


class Group(models.Model):
    name = models.CharField(max_length=200)
    document_no = models.CharField(max_length=32, blank=True)
    document_date = models.DateTimeField(null=True)
    title = models.CharField(max_length=256, blank=True)
    body = models.TextField(blank=True, default='')
    speed = models.IntegerField(
         validators=[
            MinValueValidator(0),
            MaxValueValidator(3)
            ],
         null=True
    )
    secret = models.IntegerField(
         validators=[
            MinValueValidator(0),
            MaxValueValidator(3)
            ],
         null=True
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
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='user_groups'
    )
    documents = models.ManyToManyField(
        'Document',
        through='GroupDocument',
        related_name='document_groups'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class GroupFile(models.Model):
    isp = models.ForeignKey('ISP', on_delete=models.SET_NULL,
                            null=True, default=None)
    group = models.ForeignKey('Group', on_delete=models.SET_NULL,
                              null=True, default=None,
                              related_name='group_files')
    file = models.FileField(
        upload_to=group_file_path,
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