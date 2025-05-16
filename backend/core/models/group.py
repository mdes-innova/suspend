"""Group model for group app."""
from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse


class KindType(models.TextChoices):
    Pinned = "Pinned", "pinned"
    Playlist = "Playlist", "playlist"
    Done = "Done", "done"
    Nokind = "Nokind", "nokind"


class Group(models.Model):
    """Group model for group app."""
    name = models.CharField(max_length=200, blank=False, null=False)
    kind = models.CharField(
        max_length=20,
        choices=KindType.choices,
        default=KindType.Nokind
    )
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=False
    )
    documents = models.ManyToManyField(
        'Document',
        related_name='groups'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'],
                                    name='unique_group_per_user')
        ]

    def __str__(self):
        return f"Group(name={self.name}, kind={self.kind})"

    def get_absolute_url(self):
        return reverse('group:group-detail', kwargs={"pk": self.pk})
