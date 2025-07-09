"""Url app tests"""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from psycopg2.errors import UniqueViolation

from core.models import Url, Category
from url.serializer import UrlSerializer

from rest_framework.test import APIClient
from rest_framework import status


URL_URL = reverse('url:url-list')
DOCUMENT_URL = reverse('document:document-list')


class UrlSerializerTest(TestCase):
    """Test case for unauthentication."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='test_password'
        )

    def test_get_urls_fail(self):
        """Test to get urls by unauthenticated user with failure."""
        Url.objects.bulk_create(
            [
               Url(
                url=f'https://example{i}.com'
               ) for i in range(3)
            ]
        )
        res = self.__client.get(URL_URL)
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

    def test_get_urls_with_success(self):
        """test to get urls with success."""
        Url.objects.bulk_create(
            [
                Url(
                    url=f'https://example{i}.com'
                ) for i in range(3)
            ]
        )

        res = self.__client.get(URL_URL)
        urls = Url.objects.all().order_by('id')
        serializers = UrlSerializer(urls, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializers.data)

    def test_get_url_with_success(self):
        """test to get a url with success."""
        Url.objects.bulk_create(
            [
                Url(
                        url=f'https://example{i}.com'
                    ) for i in range(3)
            ]
        )

        url = Url.objects.all().order_by('id').first()
        serializer = UrlSerializer(url)
        url = reverse('url:url-detail', args=[serializer.data['id']])
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_url_with_success(self):
        """Test to create url successful."""
        payload = {
            'url': 'https://example.com'
        }

        res = self.__client.post(URL_URL, payload, format='json')
        url = Url.objects.all().order_by('-id').first()
        serializer = UrlSerializer(url)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, serializer.data)

    def test_create_existing_url_with_fail(self):
        """Test creating a duplicate url fails."""
        payload = {
                'url': 'https://example.com'
            }
        self.__client.post(URL_URL, payload, format='json')

        # Try again with same casing
        res = self.__client.post(URL_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['url'][0].code, 'unique')

    def test_create_url_with_category_success(self):
        """Test to create a url with a category."""
        Category.objects.create(
            name='category1'
        )

        res_1 = self.__client.post(URL_URL, {
            'url': "https://example1.com"
        }, format='json')

        res_2 = self.__client.post(URL_URL, {
            'url': "https://example2.com",
            'category': 'category1'
        }, format='json')
        res_3 = self.__client.post(URL_URL, {
            'url': "https://example3.com",
            'category': 'category2'
        }, format='json')

        res_4 = self.__client.post(URL_URL, {
            'url': "https://example4.com",
            'category': {
                'name': 'category1'
            }
        }, format='json')

        res_5 = self.__client.post(URL_URL, {
            'url': "https://example5.com",
            'category': {
                'name': 'category4'
            }
        }, format='json')

        self.assertEqual(res_1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_3.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_4.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_5.status_code, status.HTTP_201_CREATED)

    def test_get_urls_by_document(self):
        """Test to get urls from a document."""
        urls = Url.objects.bulk_create(
            [
                Url(url=f'https://example{i}.com')
                for i in range(10)
            ]
        )

        urls_data = UrlSerializer(urls, many=True).data

        res_doc_1 = self.__client.post(DOCUMENT_URL, {
            'title': 'Title 1',
            'urls': [url['url'] for url in urls_data[:4]]
        }, format='json')
        res_doc_2 = self.__client.post(DOCUMENT_URL, {
            'title': 'Title 2',
            'urls': [url['url'] for url in urls_data[4:]]
        }, format='json')

        url_1 = reverse('url:url-by-document',
                        kwargs={'did': res_doc_1.data['id']})
        url_2 = reverse('url:url-by-document',
                        kwargs={'did': res_doc_2.data['id']})

        res_urls_1 = self.__client.get(url_1)
        res_urls_2 = self.__client.get(url_2)

        self.assertEqual(res_urls_1.status_code, status.HTTP_200_OK)
        self.assertEqual(res_urls_2.status_code, status.HTTP_200_OK)
        self.assertEqual(set([r['id'] for r in res_urls_1.data]),
                         set([r['id'] for r in urls_data[:4]]))
        self.assertEqual(set([r['id'] for r in res_urls_2.data]),
                         set([r['id'] for r in urls_data[4:]]))


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

    def test_get_url_with_success(self):
        """test to get a url with success."""
        Url.objects.bulk_create(
            [
                Url(
                        url=f'https://example{i}.com'
                    ) for i in range(3)
            ]
        )

        url = Url.objects.all().order_by('id').first()
        serializer = UrlSerializer(url)
        url = reverse('url:url-detail', args=[serializer.data['id']])
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_url_with_fail(self):
        """Test to create url fail."""
        payload = {
            'url': 'https://example.com'
        }

        res = self.__client.post(URL_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
