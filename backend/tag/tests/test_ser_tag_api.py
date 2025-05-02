"""Tag app tests"""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from psycopg2.errors import UniqueViolation

from core.models import Tag
from tag.serializer import TagSerializer

from rest_framework.test import APIClient
from rest_framework import status


TAG_URL = reverse('tag:tag-list')


class TagSerializerTest(TestCase):
    """Test case for unauthentication."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            name='Test user',
            email='test@example.com',
            password='test_password'
        )

    def test_get_tags_fail(self):
        """Test to get tags by unauthenticated user with failure."""
        Tag.objects.bulk_create(
            [
               Tag(
                   name=f'Name {i}'
               ) for i in range(3)
            ]
        )
        res = self.__client.get(TAG_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateTagSerializerTest(TestCase):
    """Test case for authenticated user."""

    @classmethod
    def setUpClass(cls):
        """Setup for the test case"""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            name='Test user',
            email='test@example.com',
            password='test_password'
        )
        cls.__client.force_authenticate(cls.__user)

    def test_get_tags_with_success(self):
        """test to get tags with success."""
        Tag.objects.bulk_create(
            [
                Tag(
                    name=f'Name {i}'
                ) for i in range(3)
            ]
        )

        res = self.__client.get(TAG_URL)
        tags = Tag.objects.all().order_by('id')
        serializers = TagSerializer(tags, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializers.data)

    def test_get_tag_with_success(self):
        """test to get a tag with success."""
        Tag.objects.bulk_create(
            [
                Tag(name=f'Name {i}') for i in range(3)
            ]
        )

        tag = Tag.objects.all().order_by('id').first()
        serializer = TagSerializer(tag)
        url = reverse('tag:tag-detail', args=[serializer.data['id']])
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_tag_with_success(self):
        """Test to create tag successful."""
        payload = {
            'name': 'Tag 1'
        }

        res = self.__client.post(TAG_URL, payload, format='json')
        tag = Tag.objects.all().order_by('-id').first()
        serializer = TagSerializer(tag)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, serializer.data)

    def test_create_existing_tag_with_fail(self):
        """Test creating a duplicate tag fails case-insensitively."""
        payload = {'name': 'Tag 1'}
        self.__client.post(TAG_URL, payload, format='json')

        # Try again with same casing
        res = self.__client.post(TAG_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['name'][0].code, 'unique')

        # Try again with different casing
        res = self.__client.post(TAG_URL, {'name': 'tag 1'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['name'][0].code, 'unique')
