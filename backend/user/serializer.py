"""Serailizer module of User model."""
from django.contrib.auth import (
    get_user_model, authenticate
)
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from isp.serializer import ISPSerializer, ISP
from core.models.user import username_validator


class UserSerializer(serializers.ModelSerializer):
    """UserSerializer class."""
    isp = ISPSerializer(read_only=True)
    isp_id = serializers.PrimaryKeyRelatedField(
        queryset=ISP.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'password', 'isp', 'isp_id', 'is_staff', 'is_active']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5}}
        read_only_fields = ['isp']

    def validate_username(self, value):
        try:
            username_validator(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)  # raise DRF's HTTP 400 error
        return value

    def validate(self, data):
        print(data)
        return data

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        if get_user_model().objects.filter(
                username=validated_data.get('username')).exists():
            raise serializers.ValidationError("Duplicate entry.")

        # isp = validated_data.pop('isp_id', None)
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update and return user."""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user


class AuthenticationSerializer(serializers.Serializer):
    """Serializer for the user auth token."""
    username = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        username = attrs['username']
        password = attrs['password']

        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )

        if not user:
            msg = _("Unable to authenticate with provided credentials.")
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs
