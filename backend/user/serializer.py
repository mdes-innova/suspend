"""Serailizer module of User model."""
from django.contrib.auth import (
    get_user_model, authenticate
)
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from isp.serializer import ISPSerializer, ISP
from core.models.user import username_validator
from core.models import GroupDocument, Document, MailStatus


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
    phone = serializers.CharField(required=False, allow_blank=True,
                                        allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True,
                                     allow_null=True)
    received_mail_count = serializers.SerializerMethodField()
    send_mail_count = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    received_document_count = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'password', 'isp', 'isp_id', 'email',
                  'is_staff', 'is_superuser', 'is_active', 'thaiid',
                  'birthdate', 'given_name', 'family_name', 'phone',
                  'created_at', 'modified_at', 'received_mail_count',
                  'send_mail_count', 'document_count',
                  'received_document_count']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5}}
        read_only_fields = ['isp', 'is_superuser', 'is_staff', 'created_at',
                            'modified_at', 'received_mail_count',
                            'send_mail_count', 'document_count',
                            'received_document_count']
    
    def get_received_mail_count(self, obj):
        return obj.received_mails.count()
    
    def get_send_mail_count(self, obj):
        return obj.mailgroups.count()
    
    def get_document_count(self, obj):
        return GroupDocument.objects.filter(
            user=obj
        ).distinct().count()
    
    def get_received_document_count(self, obj):
        return (
            Document.objects
            .filter(
                mailgroups__mails__receiver=obj,
                mailgroups__mails__status=MailStatus.SUCCESSFUL,
            )
            .distinct()
            .count()
        )
     
    def to_internal_value(self, data):
        data['username'] = data.get('username', None) or None
        data['given_name'] = data.get('given_name', None) or None
        data['family_name'] = data.get('family_name', None) or None
        data['birthdate'] = data.get('birthdate', None) or None
        data['phone'] = data.get('phone', None) or None
        return super().to_internal_value(data)

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
