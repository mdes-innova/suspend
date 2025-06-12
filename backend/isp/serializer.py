"""Serializer module for isp app."""
from rest_framework import serializers
from core.models import ISP, Activity


class ISPSerializer(serializers.ModelSerializer):
    """Serializer class for isp app."""
    class Meta:
        """Meta class for ISPSerializer."""
        model = ISP
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']

    def create(self, validated_data):
        """Create new isp."""
        if ISP.objects.filter(
                name__iexact=validated_data.get('name')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return ISP.objects.create(**validated_data)
