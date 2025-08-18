from core.models import Section
from .serializer import SectionSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When, Value, IntegerField, Subquery
from django.db.models.functions import Lower


class SectionView(viewsets.ModelViewSet):
    """Section view."""
    serializer_class = SectionSerializer
    queryset = Section.objects.all().order_by('id')

    def get_queryset(self):
        query = super().get_queryset()
        first_pk = query.order_by('id').values('pk')[:1]
        qs = Section.objects.order_by(
            Case(
                When(pk=Subquery(first_pk), then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            ),
            Lower('name'),
            'id',
        )
        return qs
    

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()