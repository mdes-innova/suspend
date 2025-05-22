from django.db import models
from django.contrib.auth import get_user_model


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


