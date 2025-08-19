from core.models import Section
from .serializer import SectionSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When, Value, IntegerField, CharField
from django.db.models.functions import Lower
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound


class SectionView(viewsets.ModelViewSet):
    """Section view."""
    serializer_class = SectionSerializer
    queryset = Section.objects.all().order_by('id')

    def get_queryset(self):
        user = self.request.user
        base = super().get_queryset()
        qs = base.annotate(
        sort_group=Case(
            When(user__is_superuser=True, then=Value(0)),
            When(user=user, user__is_superuser=False, then=Value(1)),
            output_field=IntegerField(),
        ),
        sort_id=Case(
            When(user__is_superuser=True, then='id'),
            output_field=IntegerField(),
        ),
        sort_name=Case(
            When(user=user, user__is_superuser=False, then=Lower('name')),
            default=Value(""),
            output_field=CharField(),
        ),
        ).filter(sort_group__in=[0, 1])

        return qs.order_by('sort_group', 'sort_id', 'sort_name')
    
    def perform_destroy(self, instance):
        user = self.request.user

        if user != instance.user and not user.is_superuser:
            raise PermissionDenied("You are not allowed to delete this section.")
        instance.delete()
    

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()