"""Group model for group app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse


class GroupDocument(models.Model):
    group = models.ForeignKey('Group', on_delete=models.CASCADE)
    document = models.OneToOneField('Document', on_delete=models.CASCADE)
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        default=None,
        null=True
        )

    def save(self, *args, **kwargs):
        if not self.user:
            self.user = self.group.user

        super().save(*args, **kwargs)


class Group(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='group_documents'
    )
    documents = models.ManyToManyField(
        'Document',
        through='GroupDocument',
        related_name='groups'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'],
                                    name='unique_group_per_user')
        ]
