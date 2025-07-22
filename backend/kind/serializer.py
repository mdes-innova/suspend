from rest_framework import serializers
from core.models import Kind


class KindSerializer(serializers.ModelSerializer):
    """Kind serializer class."""
    class Meta:
        """Meta class for tag seriailzer class."""
        model = Kind
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at', 'kind_id']


    def create(self, validated_data):
        """Create new kind."""
        print(validated_data)
        if Kind.objects.filter(
                name__iexact=validated_data.get('name')).exists():
            raise serializers.ValidationError("Duplicate entry.")
        kinds = Kind.objects.all()
        kind_id = 0
        if len(kinds):
            if Kind.objects.order_by('-kind_id')[0].kind_id == 999:
                kind_id = Kind.objects.order_by('-kind_id')[1].kind_id + 1
            else:
                kind_id = Kind.objects.order_by('-kind_id')[0].kind_id + 1
        validated_data['kind_id'] = kind_id
        return Kind.objects.create(**validated_data)