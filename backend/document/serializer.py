"""Document serializer module."""
from rest_framework import serializers
from core.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Document seriaizer class without a description field."""
    class Meta:
        """Meta class for Document serializer."""
        model = Document
        fields = ['id', 'title', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class DocumentDetailSerializer(DocumentSerializer):
    """Document detail serializer with a description field."""
    class Meta(DocumentSerializer.Meta):
        """Meta class for Document detail serializer."""
        fields = DocumentSerializer.Meta.fields + ['description']
