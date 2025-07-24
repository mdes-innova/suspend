"""Serializer module for group app."""
from rest_framework import serializers
from django.db.utils import IntegrityError
from django.contrib.auth import get_user_model
from core.models import Group, Document, GroupDocument
from document.serializer import DocumentSerializer
from user.serializer import UserSerializer


class GroupSerializer(serializers.ModelSerializer):
    """Group serializer class."""
    document_ids = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    documents = DocumentSerializer(many=True, read_only=True)

    user = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'documents', 'document_ids', 'user',
            'created_at', 'modified_at'
            ]
        read_only_fields = ['documents', 'user', 'created_at', 'modified_at']

    def create(self, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', [])
        group = Group.objects.create(user=user, **validated_data)
        for doc in documents:
            GroupDocument.objects.create(group=group, document=doc,
                                         user=user)
        return group

    def update(self, instance, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', None)
        mode = self.context['request'].data.get('mode', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if documents is not None:
            try:
                if mode == 'append':
                    had_doc_ids = list(
                        GroupDocument.objects
                        .filter(group=instance)
                        .values_list('document_id', flat=True)
                    )
                    doc_ids = [getattr(doc, 'id') for doc in documents]
                    new_doc_ids = set(doc_ids).difference(had_doc_ids)
                    for doc_id in new_doc_ids:
                        GroupDocument.objects.create(
                            group=instance,
                            document=Document.objects.get(id=doc_id),
                            user=user
                            )
                elif mode == 'remove':
                    GroupDocument.objects.filter(
                        group=instance,
                        document__in=documents
                        ).delete()
                else:
                    GroupDocument.objects.filter(group=instance).delete()
                    for doc in documents:
                        GroupDocument.objects.create(
                            group=instance,
                            document=doc,
                            user=user
                        )
            except IntegrityError:
                raise serializers.ValidationError(
                    {
                        'detail':
                            'Some documents are already in a group.'
                    }
                )
        return instance
