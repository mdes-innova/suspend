"""Tag model module."""
from django.db import models


class Link(models.Model):
    name = models.CharField(max_length=256, default='')
    url = models.URLField(max_length=2000, null=False,
                          default='', unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.__class__.__name__}(name: {self.name}, url: {self.url})'
