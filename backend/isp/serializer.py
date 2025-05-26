"""Serializer module for isp app."""
from rest_framework import serializers
from core.models import ISP, ISPActivity


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


class ISPActivitySerializer(serializers.ModelSerializer):
    """Serializer for ISP activity model."""
    class Meta:
        model = ISPActivity
        fields = '__all__'
        read_only_fields = ['created_at']

    def create(self, validated_data):
        request = self.context.get('request', None)
        user = getattr(request, 'user', None)
        if user:
            validated_data['user'] = user
        return ISPActivity.objects.create(**validated_data)
