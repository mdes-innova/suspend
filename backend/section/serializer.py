from rest_framework import serializers
from core.models import Section
from django.db import IntegrityError
from django.db.models import Q


class SectionSerializer(serializers.ModelSerializer):
    """Section serializer class."""
    class Meta:
        """Meta class for section seriailzer class."""
        model = Section
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at', 'user']

    def create(self, validated_data):
        """Create new section."""
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        name = (validated_data.get('name') or '').strip()

        if not user:
            raise serializers.ValidationError("User not found in serializer context.")
        if not name:
            raise serializers.ValidationError({"name": "This field is required."}) 

        dup = Section.objects.filter(
            Q(user=user) | Q(user__is_superuser=True),
            name__iexact=name,
        ).exists()
        if dup:
            raise serializers.ValidationError({"name": "Duplicate entry."})

        validated_data['user'] = user

        try:
            return Section.objects.create(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError({"name": "Duplicate entry."})