"""Serializer module for isp app."""
from rest_framework import serializers
from core.models import ISP, Mail


class ISPSerializer(serializers.ModelSerializer):
    """Serializer class for isp app."""
    mail_count = serializers.SerializerMethodField()
    class Meta:
        """Meta class for ISPSerializer."""
        model = ISP
        fields = ['id', 'name', 'isp_id', 'documents', 'created_at', 'modified_at',
                  'mail_count']
        read_only_fields = ['id', 'created_at', 'modified_at', 'documents',
                            'mail_count']

    def create(self, validated_data):
        """Create new isp."""
        if ISP.objects.filter(
                name__iexact=validated_data.get('name')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        return ISP.objects.create(**validated_data)
    
    def get_mail_count(self, obj):
        return Mail.objects.filter(receiver__isp=obj).count()