from django.db import models


class ActivityType(models.TextChoices):
    Login = "Login", "login"
    Logout = "Logout", "logout"
    Visit = "Visit", "visit"
    Download = "Download", "download"


class Activity(models.Model):
    ip_address = models.CharField(max_length=32)
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    isp = models.ForeignKey('ISP', on_delete=models.CASCADE, null=True)
    file = models.ForeignKey('DocumentFile', on_delete=models.CASCADE,
                             null=True)
    document = models.ForeignKey('Document', on_delete=models.CASCADE,
                                 null=True)
    path = models.URLField(max_length=2000)
    activity = models.CharField(
        max_length=20,
        choices=ActivityType.choices
    )
    created_at = models.DateTimeField(auto_now_add=True)
