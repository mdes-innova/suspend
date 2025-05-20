"""Serializer module for group app."""
from rest_framework import serializers

from core.models import Group, KindType, Document
from document.serializer import DocumentSerializer


class GroupSerializer(serializers.ModelSerializer):
    """Group serializer class."""
    document_ids = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'kind', 'documents', 'document_ids',
                  'created_at', 'modified_at']
        read_only_fields = ['kind', 'documents', 'created_at', 'modified_at']

    def validate(self, data):
        user = data.get('user') or self.context['request'].user
        name = data.get('name')

        if Group.objects.filter(user=user, name=name).exists():
            raise serializers.ValidationError(
                {'detail': 'You already have a group with this name.'}
            )
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', [])
        group = Group.objects.create(user=user, kind=KindType.Playlist,
                                     **validated_data)
        if documents:
            group.documents.set(documents)
        return group

    def update(self, instance, validated_data):
        print("XXXXXXXXXXXX")
        documents = validated_data.pop('document_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if documents is not None:
            instance.documents.set(documents)
        return instance
