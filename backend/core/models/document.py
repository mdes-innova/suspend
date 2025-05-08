"""Document model module."""
import os
import uuid
from django.db import models
from core.models.category import Category
from django.db.models.functions import Lower
from django.core.validators import FileExtensionValidator


def document_file_path(instance, filename):
    """Generate file path for new recipe file."""
    ext = os.path.splitext(filename)[1]
    filename = '{}{}'.format(uuid.uuid4(), ext)
    return os.path.join('uploads', 'document', filename)


class Document(models.Model):
    """Document model class."""
    title = models.CharField(max_length=512)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='documents',
        null=True,
        blank=True,
        default=None
    )
    tags = models.ManyToManyField('Tag', related_name='documents')
    links = models.ManyToManyField('Link', related_name='documents')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    file = models.FileField(
            upload_to=document_file_path,
            validators=[
                    FileExtensionValidator(
                            allowed_extensions=['pdf', 'docx', 'txt']
                        )
                ],
            blank=True,
            null=True
        )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('title'), 'created_at',
                name='by_title_created_at_ci'
            )
        ]

    def __str__(self):
        return "{}(title={}, created_at={})".format(
            self.__class__.__name__, self.title, self.created_at
        )
