"""Mail model class for category app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
import os

from core.utils import mail_file_path


class FromUser(models.Model):
    user = models.OneToOneField(
            "User",
            on_delete=models.CASCADE
        )


class MailDocument(models.Model):
    mail = models.ForeignKey('Mail', on_delete=models.CASCADE)
    document = models.OneToOneField('Document', on_delete=models.CASCADE)
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        default=None,
        null=True
        )

    def save(self, *args, **kwargs):
        if not self.user:
            self.user = self.mail.user

        super().save(*args, **kwargs)


class Mail(models.Model):
    subject = models.CharField(max_length=512)
    date = models.DateField(null=True)
    user = models.ForeignKey(
            "User",
            on_delete=models.SET_NULL,
            null=True
        )
    documents = models.ManyToManyField(
        'Document',
        through='MailDocument',
        related_name='mails'
    )
    description = models.TextField(blank=True, null=True)
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class IspFile(models.Model):
    user = models.ForeignKey('User', on_delete=models.SET_NULL,
                             null=True, default=None)
    mail = models.ForeignKey('Mail', on_delete=models.SET_NULL,
                             null=True, default=None,
                             related_name='isp_files')
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

    def save(self, *args, **kwargs):
        # Only set original_filename if a new file is uploaded
        if self.file and not self.original_filename:
            self.original_filename = os.path.basename(self.file.name)
        super().save(*args, **kwargs)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
