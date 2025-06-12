"""ISP serializer test for isp app."""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import ISP, Activity
from activity.serializer import ActivitySerializer

from rest_framework.test import APIClient
from rest_framework import status


ACTIVITY_URL = reverse('activity:activity-list')


class PublicISPSerializerTest(TestCase):
    """Test class for public ISP serializer."""
    @classmethod
    def setUpClass(cls):
        """Setup for test class."""
        super().setUpClass()
        cls.__client = APIClient()

    def test_get_categories_fail(self):
        """Test to get categories with unauthenticated user failure."""
        res = self.__client.get(ACTIVITY_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateISPSerialzierTest(TestCase):
    """Test class for private Activity serializer."""
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

    def test_unauth_user_visit_success(self):
        """Test to store unauthenticated user login."""
        url = reverse('activity:activity-by-activity',
                      kwargs={'activity': 'login'})
        client = APIClient()
        res = client.post(url, {
            'ip_address': '127.0.0.1',
            'path': 'login'
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, ActivitySerializer(
                Activity.objects.get(pk=res.data['id'])
            ).data)

    def test_auth_user_visit_success(self):
        """Test to store authenticated user login."""
        url = reverse('activity:activity-by-activity',
                      kwargs={'activity': 'visit'})
        res = self.__client.post(url, {
            'ip_address': '127.0.0.1',
            'path': 'login'
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, ActivitySerializer(
                Activity.objects.get(pk=res.data['id'])
            ).data)

    def test_get_activity_static_success(self):
        """Test to get activity static."""
        url = reverse('activity:activity-by-activity',
                      kwargs={'activity': 'visit'})
        res = self.__client.post(url, {
            'ip_address': '127.0.0.1',
            'path': 'login'
        })
        url = reverse('activity:activity-by-activity-static')
        res = self.__client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
