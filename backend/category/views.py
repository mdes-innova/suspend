"""View module for Category app."""
from rest_framework import viewsets
from .serializer import CategorySerializer
from core.models import Category


class CategoryView(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all().order_by('id')
