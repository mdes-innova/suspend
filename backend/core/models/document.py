"""Document model module."""
from django.db import models
from core.models.category import Category
from django.db.models.functions import Lower

class Document(models.Model):
    """Document model class."""
    title = models.CharField(max_length=512)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True
    )
    tags = models.ManyToManyField('Tag', related_name='documents')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('title'), 'created_at',
                name='by_title_created_at_ci'
            )
        ]

    def __str__(self):
        return "{}(title={}, created_at={})".format(
            self.__class__.__name__, self.title, self.created_at
        )
