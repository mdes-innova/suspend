"""Section model module."""
from django.db import models
from django.db.models.functions import Lower


class Section(models.Model):
    name = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('name'),
                name='unique_section_name_ci'
            )
        ]

    def __str__(self):
        return f'{self.__class__.__name__}(name: {self.name})'
