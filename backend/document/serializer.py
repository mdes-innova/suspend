"""Document serializer module."""
from rest_framework import serializers
from core.models import Document, Tag, Category, Url, DocumentFile
from tag.serializer import TagSerializer
from category.serializer import CategorySerializer
from url.serializer import UrlSerializer
from django.db.utils import IntegrityError


class DocumentSerializer(serializers.ModelSerializer):
    """Document seriaizer class without a description field."""
    active = serializers.SerializerMethodField()
    group_id = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()

    class Meta:
        """Meta class for Document serializer."""
        model = Document
        fields = ['id', 'order_id', 'order_no', 'order_list', 'order_date',
                  'order_filename', 'orderred_no', 'orderred_date',
                  'kind_id', 'kind_name', 'active', 'group_id', 'group_name',
                  'orderblack_no', 'orderblack_date', 'isp_no', 'isp_date',
                  'createdate', 'created_at']
        read_only_fields = fields
    
    def get_active(self, obj):
        return not hasattr(obj, 'groupdocument')

    def get_group_id(self, obj):
        gd = getattr(obj, 'groupdocument', None)
        return gd.group_id if gd else None

    def get_group_name(self, obj):
        gd = getattr(obj, 'groupdocument', None)
        return gd.group.name if gd else None

class FileSerializer(serializers.ModelSerializer):
    """Image serializer class."""
    class Meta:
        """Meta class for FileSerializer."""
        model = DocumentFile
        fields = ['id', 'original_name', 'file', 'uploaded_at']        

    def get_files(self, obj):
        return [{'id': f.id, 'file': f.file.url} for f in obj.files.all()]
