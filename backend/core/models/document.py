"""Document model module."""
from django.db import models
from core.models.category import Category
from django.db.models.functions import Lower
from django.core.validators import FileExtensionValidator
from core.utils import document_file_path


class Document(models.Model):
    """Document model class."""
    title = models.CharField(max_length=512)
    date = models.DateField(null=True)
    section = models.BigIntegerField(null=True)
    red_number = models.CharField(max_length=32, null=True)
    black_number = models.CharField(max_length=32, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='documents',
        null=True,
        blank=True,
    )
    tags = models.ManyToManyField('Tag', related_name='documents')
    links = models.ManyToManyField('Link', related_name='documents')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{}(title={}, created_at={})".format(
            self.__class__.__name__, self.title, self.created_at
        )


class DocumentFile(models.Model):
    original_name = models.CharField(max_length=2000, blank=True, null=True)
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='files'
    )
    file = models.FileField(
        upload_to=document_file_path,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'txt', 'xlsx', 'xls'])
        ],
        blank=True,
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)