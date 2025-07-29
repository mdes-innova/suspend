"""Mail model class for category app."""
from django.db import models
from django.core.validators import FileExtensionValidator

from core.utils import mail_file_path


class FromUser(models.Model):
    user = models.OneToOneField(
            "User",
            on_delete=models.CASCADE
        )


class Mail(models.Model):
    subject = models.CharField(max_length=512)
    date = models.DateField(null=True)
    user = models.ForeignKey(
            "User",
            on_delete=models.SET_NULL,
            null=True
        )
    group = models.OneToOneField(
        'Group',
        on_delete=models.SET_NULL,
        null=True,
        related_name="mails"
    )
    to_users = models.ManyToManyField("User", related_name="received_mails",
                                      blank=True)
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
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
