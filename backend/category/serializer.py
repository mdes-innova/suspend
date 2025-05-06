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

    def validate_name(self, value):
        # Case-insensitive uniqueness check
        qs = Category.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A tag with this name already exists.",
                code='unique'
            )
        return value
