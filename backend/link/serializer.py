from rest_framework import serializers
from core.models import Link


class LinkSerializer(serializers.ModelSerializer):
    """Tag serializer class."""
    class Meta:
        """Meta class for tag seriailzer class."""
        model = Link
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']

    def create(self, validated_data):
        """create new link."""
        if Link.objects.filter(
                url=validated_data.get('url')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return Link.objects.create(**validated_data)
