"""Tag model module."""
from django.db import models
from core.models import Category


class Url(models.Model):
    name = models.CharField(max_length=256, null=True)
    url = models.URLField(max_length=2000, null=False,
                          unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='urls',
        null=True,
    )
    id_address = models.CharField(max_length=256, null=True)
    country = models.CharField(max_length=256, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.__class__.__name__}(name: {self.name}, url: {self.url})'
