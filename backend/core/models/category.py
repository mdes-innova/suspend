"""Category model class for category app."""
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=512, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Str return."""
        return f"{self.__class__.__name__}(name='{self.name}')"
