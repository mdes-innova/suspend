"""Testcase of mail serializer API."""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import ISP, Activity, User
from activity.serializer import ActivitySerializer
from user.serializer import UserSerializer

from rest_framework.test import APIClient
from rest_framework import status


USER_URL = reverse('user:user-list')
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


class PrivateTest(TestCase):
    """Private test for mail app."""
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass() 
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_superuser(
            username='user',
            password='user@1234'
        ) # type: ignore
        cls.__client.force_authenticate(cls.__user)
    
    def test_create_mail_success(self):
        """Test to create a Mail success."""
        receiver_payload = [
            {
                'username': f'user{i}',
                'password': f'user{i}@1234'
            } for i in range(3)
        ]

        receiver_ids = []
        for i in range(3):
            recv_res = self.__client.post(USER_URL, receiver_payload[i],
                                          format='json')
            receiver_ids.append(recv_res.data['id'])
        
        res = self.__client.post(MAIL_URL, {
            'subject': 'Subject1',
            'to_user_ids': receiver_ids,
        })
        print(res.data)

        recv_users = UserSerializer(
            get_user_model().objects.filter(pk__in=receiver_ids),
            many=True
        ).data
        self.assertEqual(res.data['subject'], 'Subject1')
        self.assertEqual(res.data['to_users'], recv_users)