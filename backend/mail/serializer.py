"""Mail serializer module."""
from rest_framework import serializers
from core.models import Mail
from django.db.utils import IntegrityError


class MailSerializer(serializers.ModelSerializer):
    """Serializer class"""

    class Meta:
        model = Mail
        fields = '__all__'
