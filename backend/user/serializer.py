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
    email = serializers.EmailField(required=False)
    is_superuser = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(required=False)
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    thaiid = serializers.BooleanField(required=False, allow_null=True)
    birthdate = serializers.DateField(required=False, allow_null=True)
    given_name = serializers.CharField(required=False, allow_blank=True,
                                       allow_null=True)
    family_name = serializers.CharField(required=False, allow_blank=True,
                                        allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True,
                                     allow_null=True)

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'password', 'isp', 'isp_id', 'email',
                  'is_staff', 'is_superuser', 'is_active', 'thaiid',
                  'birthdate', 'given_name', 'family_name']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5}}
        read_only_fields = ['isp', 'is_superuser']
    
    def to_internal_value(self, data):
        data['username'] = data.get('username', None) or None
        data['given_name'] = data.get('given_name', None) or None
        data['family_name'] = data.get('family_name', None) or None
        data['birthdate'] = data.get('birthdate', None) or None
        return super().to_internal_value(data)
    
    def validate(self, attrs):
        """Validate the user data."""
        username = attrs.get('username', None)
        given_name = attrs.get('given_name', None)
        family_name = attrs.get('family_name', None)
        birthdate = attrs.get('birthdate', None)
        thaiid = attrs.get('thaiid', False)

        if thaiid:
            if not (given_name and family_name and birthdate):
                raise serializers.ValidationError(
                    "given_name, family_name and birthdate are required for Thai ID users."
                )
            if username:
                raise serializers.ValidationError(
                    "username should not be provided for Thai ID users."
                )
        else:
            if not username:
                raise serializers.ValidationError(
                    "username is required for non-Thai ID users."
                )
            if given_name or family_name or birthdate:
                raise serializers.ValidationError(
                    "given_name, family_name and birthdate should not be provided for non-Thai ID users."
                )
        
        return attrs

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        username = validated_data.pop('username', None)
        isp = validated_data.pop('isp_id', None)
        return get_user_model().objects.create_user(
            username=username, isp=isp, **validated_data)

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
