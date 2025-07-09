from rest_framework import serializers
from core.models import Url, Category
from category.serializer import CategorySerializer


class UrlSerializer(serializers.ModelSerializer):
    """Tag serializer class."""
    category = CategorySerializer(read_only=True, required=False)

    class Meta:
        """Meta class for tag seriailzer class."""
        model = Url
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']
    
    def create(self, validated_data):
        """create new url."""
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
        if Url.objects.filter(
                url=validated_data.get('url')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return Url.objects.create(**validated_data)
