"""Document model module."""
from django.db import models
from django.core.validators import FileExtensionValidator
from core.utils import document_file_path


# class DocumentCounter(models.Model):
#     total = models.PositiveIntegerField(default=0)

#     @classmethod
#     def increment(cls):
#         counter, created = cls.objects.get_or_create(pk=1)
#         counter.total += 1
#         counter.save()
#         return counter.total


class Document(models.Model):
    """Document model class."""
    order_id = models.PositiveIntegerField(editable=False,
                                           unique=True, default=0)
    order_no = models.CharField(max_length=32, unique=True, default=None,
                                editable=False)
    order_list = models.CharField(max_length=32, default=None,
                                  editable=False, null=True)
    order_date = models.DateField(null=True,
                                  editable=False)
    order_filename = models.CharField(max_length=256, default=None,
                                      editable=False, null=True)
    orderred_no = models.CharField(max_length=32, default=None,
                                   editable=False, null=True)
    orderred_date = models.DateField(null=True, default=None,
                                     editable=False)
    orderblack_no = models.CharField(max_length=32, default=None,
                                     editable=False, null=True)
    orderblack_date = models.DateField(null=True, default=None,
                                       editable=False)
    isp_no = models.CharField(max_length=32, default=None, null=True,
                              editable=False)
    isp_date = models.DateField(null=True, default=None,
                                editable=False)

    kind_id = models.PositiveIntegerField(editable=False,
                                          null=True,
                                          default=None)
    kind_name = models.CharField(max_length=128, editable=False,
                                 null=True, default=None)

    # order_number = models.CharField(max_length=32, null=True)
    # order_date = models.DateField(null=True)
    # orderred_number = models.CharField(max_length=32, null=True)
    # orderred_date = models.DateField(null=True)

    createdate = models.DateTimeField(null=True, editable=False, default=None)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "{}(title={}, created_at={})".format(
            self.__class__.__name__, self.order_no, self.created_at
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
            FileExtensionValidator(allowed_extensions=['pdf'])
        ],
        blank=True,
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)