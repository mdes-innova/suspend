"""Serializer module for category app."""
from rest_framework import serializers
from core.models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer class for category app."""
    class Meta:
        """Meta class for CategorySerializer."""
        model = Category
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']

    def create(self, validated_data):
        """Create new category."""
        if Category.objects.filter(
                name__iexact=validated_data.get('name')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return Category.objects.create(**validated_data)
