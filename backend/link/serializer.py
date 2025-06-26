from rest_framework import serializers
from core.models import Link, Category


class LinkSerializer(serializers.ModelSerializer):
    """Tag serializer class."""
    class Meta:
        """Meta class for tag seriailzer class."""
        model = Link
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']

    def create(self, validated_data):
        """create new link."""
        category_data = self.initial_data.get('category', None)

        category_obj = None
        if category_data:
            if isinstance(category_data, str):
                category_obj =\
                    Category.objects.get_or_create(name=category_data)[0]
            elif isinstance(category_data, dict):
                category_obj =\
                    Category.objects.get_or_create(**category_data)[0]
            else:
                raise serializers.ValidationError({
                        'error': 'Bad Request - Integrity constraint violation'
                    })

            if not category_obj:
                raise serializers.ValidationError({
                    'error': 'Bad Request - Category field is required.'
                    })
        validated_data['category'] = category_obj

        if Link.objects.filter(
                url=validated_data.get('url')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return Link.objects.create(**validated_data)
