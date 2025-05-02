"""Document serializer module."""
from rest_framework import serializers
from core.models import Document, Tag, Category
from tag.serializer import TagSerializer
from category.serializer import CategorySerializer
from django.db.utils import IntegrityError


class DocumentSerializer(serializers.ModelSerializer):
    """Document seriaizer class without a description field."""
    tags = TagSerializer(many=True, required=False, read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        """Meta class for Document serializer."""
        model = Document
        fields = ['id', 'title', 'category', 'tags', 'created_at',
                  'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class DocumentDetailSerializer(DocumentSerializer):
    """Document detail serializer with a description field."""
    class Meta(DocumentSerializer.Meta):
        """Meta class for Document detail serializer."""
        fields = DocumentSerializer.Meta.fields + ['description']

    def create(self, validated_data):
        tags_data = self.initial_data.get('tags', [])
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
        doc = Document.objects.create(**validated_data)
        tag_objects = []
        try:
            for tag in tags_data:
                if isinstance(tag, str):
                    tag_objects.append(Tag.objects.get_or_create(
                        name=tag)[0])
                elif isinstance(tag, dict):
                    tag_objects.append(Tag.objects.get_or_create(
                        name=tag['name'])[0])
                else:
                    raise serializers.ValidationError({
                        'error': 'Bad Request - Integrity constraint violation'
                        })
        except (IntegrityError, KeyError):
            raise serializers.ValidationError({
                'error': 'Bad Request - Integrity constraint violation'
                })
        doc.tags.set(tag_objects)
        return doc


class FileSerializer(serializers.ModelSerializer):
    """Image serializer class."""
    class Meta:
        """Meta class for FileSerializer."""
        model = Document
        fields = ['id', 'file']
        read_only_fields = ['id']
        extra_kwargs = {'file': {'required': 'True'}}
