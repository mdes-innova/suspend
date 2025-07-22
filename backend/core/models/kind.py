"""Kind model module."""
from django.db import models
from django.db.models.functions import Lower


class Kind(models.Model):
    name = models.CharField(max_length=256)
    kind_id = models.IntegerField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('name'),
                name='unique_kind_name_ci'
            )
        ]

    def __str__(self):
        return f'{self.__class__.__name__}(name: {self.name})'
