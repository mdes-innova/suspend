"""Tag model module."""
from django.db import models


class Tag(models.Model):
    title = models.CharField(max_length=256, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.__class__.__name__}(title: {self.title})'
