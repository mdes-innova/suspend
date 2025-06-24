"""Group model for group app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse


class KindType(models.TextChoices):
    Kind1 = "Kind1", "kind1"
    Kind2 = "Kind2", "kind2"
    Kind3 = "Kind3", "kind3"
    Kind4 = "Kind4", "kind4"
    Nokind = "Nokind", "nokind"


class GroupDocument(models.Model):
    group = models.ForeignKey('Group', on_delete=models.CASCADE)
    document = models.ForeignKey('Document', on_delete=models.CASCADE)
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        default=None,
        null=True
        )
    document_kind = models.CharField(max_length=20, default=KindType.Nokind)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['document', 'document_kind'],
                name='unique_document_kind_per_document'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.user:
            self.user = self.group.user

        if not self.document_kind:
            self.document_kind = self.document.kind

        super().save(*args, **kwargs)


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
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'],
                                    name='unique_group_per_user')
        ]
