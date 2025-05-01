"""Document model module."""
from django.db import models


class Document(models.Model):
    """Document model class."""
    title = models.CharField(max_length=512)
    tags = models.ManyToManyField('Tag')
    description = models.TextField(blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(name='by_title_created_at',
                                    fields=['title', 'created_at'])
            ]

    def __str__(self):
        return "{}(title={}, created_at={})".format(
            self.__class__.__name__, self.title, self.created_at
        )
