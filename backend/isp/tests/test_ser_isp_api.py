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


class PrivateISPSerialzierTest(TestCase):
    """Test class for private ISP serializer."""
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='Testuser',
            password='Test_password123'
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

    # def test_unauth_user_visit_success(self):
    #     """Test to store unauthenticated user login."""
    #     url = reverse('isp:isp-activity-by-activity',
    #                   kwargs={'activity': 'login'})
    #     client = APIClient()
    #     res = client.post(url, {
    #         'ip_address': '127.0.0.1',
    #         'path': 'login'
    #     })

    #     self.assertEqual(res.status_code, status.HTTP_200_OK)
    #     self.assertEqual(res.data, ActivitySerializer(
    #             Activity.objects.get(pk=res.data['id'])
    #         ).data)

    # def test_auth_user_visit_success(self):
    #     """Test to store authenticated user login."""
    #     url = reverse('isp:isp-activity-by-activity',
    #                   kwargs={'activity': 'visit'})
    #     print(url)
    #     res = self.__client.post(url, {
    #         'ip_address': '127.0.0.1',
    #         'path': 'login'
    #     })

    #     self.assertEqual(res.status_code, status.HTTP_200_OK)
    #     self.assertEqual(res.data, ActivitySerializer(
    #             Activity.objects.get(pk=res.data['id'])
    #         ).data)

    # def test_get_activity_static_success(self):
    #     """Test to get activity static."""
    #     url = reverse('isp:isp-activity-by-activity',
    #                   kwargs={'activity': 'visit'})
    #     res = self.__client.post(url, {
    #         'ip_address': '127.0.0.1',
    #         'path': 'login'
    #     })
    #     url = reverse('isp:isp-by-activity-static')
    #     res = self.__client.get(url)

    #     self.assertEqual(res.status_code, status.HTTP_200_OK)
    #     self.assertEqual(len(res.data), 1)
    #     self.assertEqual(set((
    #         res.data[0]['ip_address'],
    #         res.data[0]['path'])), set((
    #             '127.0.0.1',
    #             'login'
    #         )))