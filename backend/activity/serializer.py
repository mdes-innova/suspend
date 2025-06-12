"""Serializer module for activity app."""
from rest_framework import serializers
from core.models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for ISP activity model."""
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['created_at']

    def create(self, validated_data):
        request = self.context.get('request', None)
        user = getattr(request, 'user', None)
        if user:
            validated_data['user'] = user
        return Activity.objects.create(**validated_data)
