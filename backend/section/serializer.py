from rest_framework import serializers
from core.models import Section


class SectionSerializer(serializers.ModelSerializer):
    """Section serializer class."""
    class Meta:
        """Meta class for section seriailzer class."""
        model = Section
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']

    def create(self, validated_data):
        """Create new section."""
        if Section.objects.filter(
                name__iexact=validated_data.get('name')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return Section.objects.create(**validated_data)
