from rest_framework import serializers
from core.models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Tag serializer class."""
    class Meta:
        """Meta class for tag seriailzer class."""
        model = Tag
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']
    
    def validate_name(self, value):
        # Case-insensitive uniqueness check
        qs = Tag.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A tag with this name already exists.",
                code='unique'
            )
        return value
