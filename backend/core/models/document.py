"""Document model module."""
from django.db import models
from django.core.validators import FileExtensionValidator
from core.utils import document_file_path


class DocumentCounter(models.Model):
    total = models.PositiveIntegerField(default=0)

    @classmethod
    def increment(cls):
        counter, created = cls.objects.get_or_create(pk=1)
        counter.total += 1
        counter.save()
        return counter.total


class Document(models.Model):
    """Document model class."""
    order_id = models.PositiveIntegerField(editable=False, default=0)
    title = models.CharField(max_length=512)
    date = models.DateField(null=True)
    order_number = models.CharField(max_length=32, null=True)
    order_date = models.DateField(null=True)
    orderred_number = models.CharField(max_length=32, null=True)
    orderred_date = models.DateField(null=True)
    tags = models.ManyToManyField('Tag', related_name='documents')
    urls = models.ManyToManyField('Url', related_name='documents')
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
        related_name='files',
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