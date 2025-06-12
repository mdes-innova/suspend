"""ISP model class for category app."""
from django.db import models
from django.db.models.functions import Lower



class ISP(models.Model):
    name = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('name'),
                name='unique_isp_name_ci'
            )
        ]

    def __str__(self):
        """Str return."""
        return f"{self.__class__.__name__}(name='{self.name}')"
