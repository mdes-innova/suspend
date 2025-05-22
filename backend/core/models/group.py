"""Group model for group app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse


class GroupDocument(models.Model):
    group = models.ForeignKey('Group', on_delete=models.CASCADE)
    document = models.ForeignKey('Document', on_delete=models.CASCADE)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'document'],
                name='unique_document_per_user'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.user:
            self.user = self.group.user
        super().save(*args, **kwargs)


class KindType(models.TextChoices):
    Pinned = "Pinned", "pinned"
    Playlist = "Playlist", "playlist"
    Done = "Done", "done"
    Nokind = "Nokind", "nokind"


class Group(models.Model):
    name = models.CharField(max_length=200)
    kind = models.CharField(
        max_length=20,
        choices=KindType.choices,
        default=KindType.Nokind
    )
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
