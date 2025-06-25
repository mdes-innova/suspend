"""Link app tests"""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from psycopg2.errors import UniqueViolation

from core.models import Link
from link.serializer import LinkSerializer

from rest_framework.test import APIClient
from rest_framework import status


LINK_URL = reverse('link:link-list')


class LinkSerializerTest(TestCase):
    """Test case for unauthentication."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='test_password'
        )

    def test_get_links_fail(self):
        """Test to get links by unauthenticated user with failure."""
        Link.objects.bulk_create(
            [
               Link(
                url=f'https://example{i}.com'
               ) for i in range(3)
            ]
        )
        res = self.__client.get(LINK_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateStaffTest(TestCase):
    """Test case for authenticated user."""

    @classmethod
    def setUpClass(cls):
        """Setup for the test case"""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='test_password',
            is_staff=True
        )
        cls.__client.force_authenticate(cls.__user)

    def test_get_links_with_success(self):
        """test to get links with success."""
        Link.objects.bulk_create(
            [
                Link(
                    url=f'https://example{i}.com'
                ) for i in range(3)
            ]
        )

        res = self.__client.get(LINK_URL)
        links = Link.objects.all().order_by('id')
        serializers = LinkSerializer(links, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializers.data)

    def test_get_link_with_success(self):
        """test to get a link with success."""
        Link.objects.bulk_create(
            [
                Link(
                        url=f'https://example{i}.com'
                    ) for i in range(3)
            ]
        )

        link = Link.objects.all().order_by('id').first()
        serializer = LinkSerializer(link)
        url = reverse('link:link-detail', args=[serializer.data['id']])
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_link_with_success(self):
        """Test to create link successful."""
        payload = {
            'url': 'https://example.com'
        }

        res = self.__client.post(LINK_URL, payload, format='json')
        link = Link.objects.all().order_by('-id').first()
        serializer = LinkSerializer(link)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, serializer.data)

    def test_create_existing_link_with_fail(self):
        """Test creating a duplicate link fails."""
        payload = {
                'url': 'https://example.com'
            }
        self.__client.post(LINK_URL, payload, format='json')

        # Try again with same casing
        res = self.__client.post(LINK_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['url'][0].code, 'unique')


class PrivateUserTest(TestCase):
    @classmethod
    def setUpClass(cls):
        """Setup for the test case"""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='test_password',
        )
        cls.__client.force_authenticate(cls.__user)

    def test_get_link_with_success(self):
        """test to get a link with success."""
        Link.objects.bulk_create(
            [
                Link(
                        url=f'https://example{i}.com'
                    ) for i in range(3)
            ]
        )

        link = Link.objects.all().order_by('id').first()
        serializer = LinkSerializer(link)
        url = reverse('link:link-detail', args=[serializer.data['id']])
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_link_with_fail(self):
        """Test to create link fail."""
        payload = {
            'url': 'https://example.com'
        }

        res = self.__client.post(LINK_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
