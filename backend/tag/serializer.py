from rest_framework import serializers
from core.models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Tag serializer class."""
    class Meta:
        """Meta class for tag seriailzer class."""
        model = Tag
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']

    def create(self, validated_data):
        """Create new tag."""
        if Tag.objects.filter(
                name__iexact=validated_data.get('name')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return Tag.objects.create(**validated_data)
