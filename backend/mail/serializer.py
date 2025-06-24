"""Mail serializer module."""
from rest_framework import serializers
from core.models import Mail, FromUser
from user.serializer import UserSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError


class MailSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = Mail
        fields = [f.name for f in Mail._meta.fields] +\
            ['from_user_id', 'to_user_ids', 'to_users']

    def create(self, validated_data):
        from_user = FromUser.objects.create(user=self.context['request'].user)
        to_users = validated_data.pop('to_user_ids', [])
        mail = Mail.objects.create(from_user=from_user, **validated_data)
        mail.to_users.set(to_users)
        return mail