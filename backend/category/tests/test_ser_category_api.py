"""Category serializer test for category app."""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import Category
from category.serializer import CategorySerializer

from rest_framework.test import APIClient
from rest_framework import status


CATEGORY_URL = reverse('category:category-list')


class PublicCategorySerializerTest(TestCase):
    """Test class for public Category serializer."""
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()

    def test_get_categories_fail(self):
        """Test to get categories with unauthenticated user failure."""
        res = self.__client.get(CATEGORY_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateCategorySerialzierTest(TestCase):
    """Test class for private Category serializer."""
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            email='Test user',
            password='Test_password123'
        )
        cls.__client.force_authenticate(cls.__user)

    def test_get_categories_success(self):
        """Test to get categories successful."""
        payload = [
            Category(
                name=f'Category {i}'
            ) for i in range(3)
        ]

        Category.objects.bulk_create(payload)
        categories = Category.objects.all().order_by('id')
        serializers = CategorySerializer(categories, many=True)
        res = self.__client.get(CATEGORY_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializers.data)

    def test_create_category_success(self):
        """Test to create a category successful."""
        payload = {'name': 'New category'}
        res = self.__client.post(CATEGORY_URL, payload, format='json')

        category = Category.objects.first()
        serializer = CategorySerializer(category)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, serializer.data)

    def test_create_existing_category_fail(self):
        """Test to create an existing category failure."""
        payload = {'name': 'New category'}
        Category.objects.create(**payload)
        res = self.__client.post(CATEGORY_URL, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['name'][0].code, 'unique')
