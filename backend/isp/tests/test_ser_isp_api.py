"""ISP serializer test for isp app."""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import ISP
from isp.serializer import ISPSerializer

from rest_framework.test import APIClient
from rest_framework import status


ISP_URL = reverse('isp:isp-list')


class PublicISPSerializerTest(TestCase):
    """Test class for public ISP serializer."""
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()

    def test_get_categories_fail(self):
        """Test to get categories with unauthenticated user failure."""
        res = self.__client.get(ISP_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateStaffTest(TestCase):
    """Test class for private ISP serializer."""
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='Test_password123',
            is_staff=True
        )
        cls.__client.force_authenticate(cls.__user)

    def test_get_categories_success(self):
        """Test to get categories successful."""
        payload = [
            ISP(
                name=f'ISP {i}'
            ) for i in range(3)
        ]

        ISP.objects.bulk_create(payload)
        categories = ISP.objects.all().order_by('id')
        serializers = ISPSerializer(categories, many=True)
        res = self.__client.get(ISP_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializers.data)

    def test_create_isp_success(self):
        """Test to create a isp successful."""
        payload = {'name': 'New isp'}
        res = self.__client.post(ISP_URL, payload, format='json')

        isp = ISP.objects.first()
        serializer = ISPSerializer(isp)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, serializer.data)

    def test_create_existing_isp_fail(self):
        """Test to create an existing isp failure."""
        payload = {'name': 'New isp'}
        ISP.objects.create(**payload)
        res = self.__client.post(ISP_URL, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data[0].code, 'invalid')

        payload = {'name': 'new isp'}
        res = self.__client.post(ISP_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data[0].code, 'invalid')


class PrivateUserTest(TestCase):
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='Test_password123',
        )
        cls.__client.force_authenticate(cls.__user) 
    
    def test_create_fail(self):
        """Test to create fail."""
        payload = {'name': 'New isp'}
        res = self.__client.post(ISP_URL, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_success(self):
        """Test to get success."""
        payload = [
            ISP(
                name=f'ISP {i}'
            ) for i in range(3)
        ]

        ISP.objects.bulk_create(payload)
        categories = ISP.objects.all().order_by('id')
        serializers = ISPSerializer(categories, many=True)
        res = self.__client.get(ISP_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializers.data)