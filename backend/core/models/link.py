"""Tag model module."""
from django.db import models
from django.db.models.functions import Lower


class Link(models.Model):
    name = models.CharField(max_length=256, default='')
    url = models.URLField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('url'),
                name='unique_link_url_ci'
            )
        ]

    def __str__(self):
        return f'{self.__class__.__name__}(name: {self.name}, url: {self.url})'
