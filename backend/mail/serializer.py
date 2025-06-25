"""Mail serializer module."""
from rest_framework import serializers
from core.models import Mail, FromUser, Group
from user.serializer import UserSerializer
from document.serializer import DocumentSerializer
from group.serializer import GroupSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.core.files import File
from mail.utils import generate_file


class MailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    from_user = UserSerializer(read_only=True)
    from_user_id = serializers.PrimaryKeyRelatedField(
        queryset=FromUser.objects.all(),
        write_only=True,
        required=False
    )
    to_users = UserSerializer(read_only=True, many=True)
    to_user_ids = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True,
        required=True,
        many=True
    )
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        write_only=True,
        required=True
    )
    is_draft = serializers.BooleanField(default=True)

    class Meta:
        model = Mail
        fields = [f.name for f in Mail._meta.fields if f.name != 'file'] +\
            ['from_user_id', 'to_user_ids', 'to_users', 'group_id']

    def create(self, validated_data):
        user = self.context['request'].user
        from_user = FromUser.objects.get_or_create(user=user)[0]
        to_users = validated_data.pop('to_user_ids', [])
        date = validated_data.pop('date', None)
        group = validated_data.pop('group_id', None)

        if not group:
            raise serializers.ValidationError({
                        'error': 'Bad Request - Group not found'
                    })
        documents = DocumentSerializer(group.documents, many=True).data
        mail = Mail.objects.create(from_user=from_user, group=group,
                                   date=date,
                                   **validated_data)
        if len(documents):
            pdf_file_path = generate_file(
                    validated_data['subject'],
                    date,
                    from_user,
                    group,
                    documents
                )
            with open(pdf_file_path, 'rb') as f:
                django_file = File(f)
                mail.file.save(pdf_file_path.split('/')[-1],
                               django_file, save=True)
        mail.to_users.set(to_users)
        return mail


class MailDetailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    from_user = UserSerializer(read_only=True)
    from_user_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True,
        required=False
    )
    to_users = UserSerializer(read_only=True, many=True)
    to_user_ids = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True,
        required=True,
        many=True
    )
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        write_only=True,
        required=True
    )

    class Meta(MailSerializer.Meta):
        fields = MailSerializer.Meta.fields + ['file']
