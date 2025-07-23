from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now


class RequestLog(models.Model):
    path = models.CharField(max_length=2048)
    method = models.CharField(max_length=10)
    user = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"[{self.method}] {self.path} from {self.ip_address or 'Unknown'} by {self.user or 'Anonymous'}"
