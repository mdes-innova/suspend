"""Mail serializer module."""
from rest_framework import serializers
from core.models import Mail, IspFile, Document, MailDocument
from user.serializer import UserSerializer
from document.serializer import DocumentSerializer
from group.serializer import GroupSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.core.files import File
from mail.utils import generate_file


class IspFileSerailizer(serializers.ModelSerializer):
    class Meta:
        model = IspFile
        fields = '__all__'


class MailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    user = UserSerializer(read_only=True)
    date = serializers.DateField(required=True, allow_null=False)
    is_draft = serializers.BooleanField(default=True, required=False)

    class Meta:
        model = Mail
        fields = ['id', 'subject', 'date', 'user',
                  'is_draft', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class MailDetailSerializer(serializers.ModelSerializer):
    """Serializer class"""
    isp_files = IspFileSerailizer(read_only=True, many=True)
    to_users = UserSerializer(read_only=True, many=True)
    to_user_ids = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        write_only=True,
        many=True,
        required=True
    )
    document_ids = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta(MailSerializer.Meta):
        fields = MailSerializer.Meta.fields + ['group_id', 'group', 'to_users',
                                               'to_user_ids',
                                               'isp_files', 'description']

    def create(self, validated_data):
        user = self.context['request'].user
        date = validated_data.pop('date', None)
        documents = validated_data.pop('document_ids', [])

        mail = Mail.objects.create(user=user,
                                   date=date,
                                   **validated_data)
        for doc in documents:
            MailDocument.objects.create(mail=mail, document=doc,
                                        user=user)
        # if len(documents):
        #     pdf_file_path = generate_file(
        #             validated_data['subject'],
        #             date,
        #             user,
        #             group,
        #             documents
        #         )
        #     with open(pdf_file_path, 'rb') as f:
        #         django_file = File(f)
        #         mail.file.save(pdf_file_path.split('/')[-1],
        #                        django_file, save=True)
        # mail.to_users.set(to_users)
        return mail
