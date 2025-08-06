"""Serializer module for group app."""
from rest_framework import serializers
from django.db.utils import IntegrityError
from django.contrib.auth import get_user_model
from core.models import Group, Document, GroupDocument, GroupFile, ISP
from document.serializer import DocumentSerializer
from user.serializer import UserSerializer
from isp.serializer import ISPSerializer


class GroupFileSerializer(serializers.ModelSerializer):
    isp_id = serializers.PrimaryKeyRelatedField(
        queryset=ISP.objects.all(),
        write_only=True
    )
    isp = ISPSerializer(read_only=True)

    class Meta:
        model = GroupFile
        fields = ['id', 'isp_id', 'isp', 'file', 'original_filename',
                  'created_at', 'modified_at']
        read_only_fields = ['id', 'isp', 'file', 'created_at',
                            'modified_at']


class GroupSerializer(serializers.ModelSerializer):
    """Group serializer class."""
    document_ids = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    document_no = serializers.CharField(allow_blank=True, required=False)
    document_date = serializers.DateTimeField(allow_null=True, required=False)
    title = serializers.CharField(allow_blank=True, required=False)
    speed = serializers.IntegerField(allow_null=True, required=False)
    secret = serializers.IntegerField(allow_null=True, required=False)
    documents = DocumentSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'documents', 'document_ids', 'user',
            'document_no', 'document_date', 'title', 'speed', 'secret',
            'created_at', 'modified_at'
            ]
        read_only_fields = ['documents', 'user', 'created_at', 'modified_at']

    def create(self, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', [])
        group = Group.objects.create(user=user, **validated_data)
        group.documents.set(documents)
        return group

    def update(self, instance, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', [])
        mode = self.context['request'].data.get('mode', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if documents:
            try:
                if mode == 'append':
                    had_doc_ids = set(
                        GroupDocument.objects
                        .filter(group=instance)
                        .values_list('document_id', flat=True)
                    )
                    new_docs = [doc for doc in documents if doc.id not in had_doc_ids]
                    GroupDocument.objects.bulk_create([
                        GroupDocument(group=instance, document=doc, user=user)
                        for doc in new_docs
                    ])

                elif mode == 'remove':
                    GroupDocument.objects.filter(group=instance, document__in=documents).delete()

                else:  # reset
                    GroupDocument.objects.filter(group=instance).delete()
                    GroupDocument.objects.bulk_create([
                        GroupDocument(group=instance, document=doc, user=user)
                        for doc in documents
                    ])

            except IntegrityError:
                raise serializers.ValidationError({
                    'detail': 'Some documents are already in a group.'
                })

        return instance
