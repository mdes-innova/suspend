"""Testcase of mail serializer API."""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import ISP, Activity
from activity.serializer import ActivitySerializer

from rest_framework.test import APIClient
from rest_framework import status


MAIL_URL = reverse('mail:mail-list')


class PublicTest(TestCase):
    """Public test for mail app."""
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.__client = APIClient()

    def test_get_mails_fail(self):
        """Test to get mails fail."""
        res = self.__client.get(MAIL_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
