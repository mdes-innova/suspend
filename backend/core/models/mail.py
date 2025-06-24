"""Mail model class for category app."""
from django.db import models
from django.core.validators import FileExtensionValidator

from core.utils import document_file_path


class FromUser(models.Model):
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
        'User',
    )
    is_draft = models.BooleanField(default=True)
    file = models.FileField(
        upload_to=document_file_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf'])
        ],
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
