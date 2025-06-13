"""Serializer module for group app."""
from rest_framework import serializers

from core.models import Group, KindType, Document, GroupDocument
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
        read_only_fields = ['documents', 'created_at', 'modified_at']

    def validate(self, data):
        user = self.context['request'].user
        name =\
            data.get('name') or self.instance.name if self.instance else None

        # Validate unique group name per user
        group_qs = Group.objects.filter(user=user, name=name)
        if self.instance:
            group_qs = group_qs.exclude(pk=self.instance.pk)
        if group_qs.exists():
            raise serializers.ValidationError(
                {'detail': 'You already have a group with this name.'}
            )

        # Validate that documents are not already in other groups for this user
        documents = data.get('document_ids', [])
        if documents:
            conflicting_docs = Document.objects.filter(
                groups__user=user,
                groups__kind=self.instance.kind if self.instance else None
            ).exclude(groups=self.instance if self.instance else None).filter(
                pk__in=[doc.pk for doc in documents]
            ).distinct()
            if conflicting_docs.exists():
                raise serializers.ValidationError(
                    {
                        'detail':
                            'Some documents are already in other' +
                            ' groups for this user.'
                    }
                )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', [])
        kind = validated_data.pop('kind', 'nokind')
        group = Group.objects.create(user=user, kind=kind, **validated_data)
        for doc in documents:
            GroupDocument.objects.create(group=group, document=doc,
                                         user=user)
        return group

    def update(self, instance, validated_data):
        user = self.context['request'].user
        documents = validated_data.pop('document_ids', None)
        append = self.context['request'].data.get('append', False)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if documents is not None:
            # Clear and re-add only allowed documents
            if append:
                had_doc_ids = list(
                    GroupDocument.objects
                    .filter(group=instance)
                    .values_list('document_id', flat=True)
                )
                doc_ids = [getattr(doc, 'id') for doc in documents]
                new_doc_ids = set(doc_ids).difference(had_doc_ids)
                for doc_id in new_doc_ids:
                    GroupDocument.objects.create(group=instance,
                                                 document=Document.objects
                                                 .get(id=doc_id),
                                                 user=user)
            else:
                GroupDocument.objects.filter(group=instance).delete()
                for doc in documents:
                    GroupDocument.objects.create(group=instance,
                                                 document=doc,
                                                 user=user,
                                                 document_kind=instance.kind)
        return instance
