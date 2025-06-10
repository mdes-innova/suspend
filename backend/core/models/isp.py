"""ISP model class for category app."""
from django.db import models
from django.db.models.functions import Lower


class Activity(models.TextChoices):
    Login = "Login", "login"
    Logout = "Logout", "logout"
    Visit = "Visit", "visit"
    Download = "Download", "download"


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


class ISPActivity(models.Model):
    ip_address = models.CharField(max_length=16)
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    isp = models.ForeignKey('ISP', on_delete=models.CASCADE, null=True)
    file = models.ForeignKey('DocumentFile', on_delete=models.CASCADE,
                             null=True)
    document = models.ForeignKey('Document', on_delete=models.CASCADE,
                                 null=True)
    path = models.URLField(max_length=2000)
    activity = models.CharField(
        max_length=20,
        choices=Activity.choices
    )
    created_at = models.DateTimeField(auto_now_add=True)
