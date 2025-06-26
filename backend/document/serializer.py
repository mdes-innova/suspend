"""Document serializer module."""
from rest_framework import serializers
from core.models import Document, Tag, Category, Link, DocumentFile
from tag.serializer import TagSerializer
from category.serializer import CategorySerializer
from link.serializer import LinkSerializer
from django.db.utils import IntegrityError


class DocumentSerializer(serializers.ModelSerializer):
    """Document seriaizer class without a description field."""
    tags = TagSerializer(many=True, required=False, read_only=True)
    links = LinkSerializer(many=True, required=False, read_only=True)

    class Meta:
        """Meta class for Document serializer."""
        model = Document
        fields = ['id', 'title', 'date', 'links', 'tags', 'order_id',
                  'order_number', 'order_date', 'orderred_number',
                  'orderred_date', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at', 'order_id']


class FileSerializer(serializers.ModelSerializer):
    """Image serializer class."""
    class Meta:
        """Meta class for FileSerializer."""
        model = DocumentFile
        fields = ['id', 'original_name', 'file', 'uploaded_at']        


class DocumentDetailSerializer(DocumentSerializer):
    """Document detail serializer with a description field."""
    files = FileSerializer(many=True, read_only=True)

    class Meta(DocumentSerializer.Meta):
        """Meta class for Document detail serializer."""
        fields = DocumentSerializer.Meta.fields + ['description', 'files']

    def create(self, validated_data):
        tags_data = self.initial_data.get('tags', [])
        links_data = self.initial_data.get('links', [])

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

        link_objects = []
        try:
            for link in links_data:
                if isinstance(link, str):
                    link_objects.append(Link.objects.get_or_create(
                        url=link)[0])
                elif isinstance(link, dict):
                    link_objects.append(Link.objects.get_or_create(
                        url=link['url'])[0])
                else:
                    raise serializers.ValidationError({
                        'error': 'Bad Request - Integrity constraint violation'
                        })
        except (IntegrityError, KeyError):
            raise serializers.ValidationError({
                'error': 'Bad Request - Integrity constraint violation'
                })
        doc.links.set(link_objects)

        return doc
    
    def get_files(self, obj):
        return [{'id': f.id, 'file': f.file.url} for f in obj.files.all()]
