"""Test create user module."""
from datetime import datetime, timedelta, timezone
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.db.utils import IntegrityError
from unittest.mock import patch
from django.core.exceptions import ValidationError
from django.db import transaction
from user.serializer import UserSerializer
from rest_framework import status
from rest_framework.test import APIClient
from core.models import ISP


CREATE_USER_URL = reverse('user:user-list')
TOKEN_URL = reverse('token_obtain_pair')
REFRESH_TOKEN_URL = reverse('token_refresh')


def create_user(**params):
    """Create a user function, returning a user."""
    user = get_user_model().objects.create_user(**params)
    return user


class TestCreateUser(TestCase):
    """Test for create user class"""
    def setUp(self):
        self.client = APIClient()

    def test_create_user_without_auth_fail(self):
        """Test to create a user without authentication failure."""
        payload = {
            'password': 'testpass123',
            'username': 'Testname'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_with_nonstaff_fail(self):
        """Test to create a user without staff failure."""
        user = get_user_model().objects.create_user(
            username='arnon',
            password='password123'
        )
        self.client.force_authenticate(user)
        payload = {
            'password': 'testpass123',
            'username': 'Testname'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_user_with_wrong_username_fail(self):
        """Test to create a user with wrong username failure."""
        with self.assertRaises(ValidationError):
            user = get_user_model().objects.create_user(
                username='a* ',
                password='password123'
            )

        user = get_user_model().objects.create_superuser(
                username='admin',
                password='password123'
            )
        self.client.force_authenticate(user)
        payload = {
                'username': 'a* ',
                'password': 'password123'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', res.data.keys())

    def test_create_user_success(self):
        """Test to create a user successful."""
        user = get_user_model().objects.create_superuser(
                username='admin',
                password='password123'
            )
        self.client.force_authenticate(user)
        payload = {
                'username': 'arnon',
                'password': 'password123'
        }
        res = self.client.post(CREATE_USER_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)


class AdminUserTest(TestCase):
    """Test with admin user."""
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.__client = APIClient()
        admin_user = get_user_model().objects.create_superuser(
            username='admin',
            password='password123'

        )
        cls.__client.force_authenticate(admin_user)

    def test_user_with_email_exists_error(self):
        """Test if existing email."""
        payload = {
            'username': 'admin',
            'password': 'testpass123'
        }
        try:
            with transaction.atomic():
                get_user_model().objects.create(**payload)
        except IntegrityError:
            pass
        res = self.__client.post(CREATE_USER_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', res.data)

    def test_create_user_with_isp_success(self):
        """Test to create user with isp."""
        payload = {
            'username': 'admin1',
            'password': 'testpass123',
        }
        res = self.__client.post(CREATE_USER_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, {
            'id': res.data['id'],
            'username': 'admin1',
            'isp': None,
            'is_staff': False,
            'is_active': True
        })

        payload = {
            'username': 'admin2',
            'password': 'testpass123',
            'isp': None
        }
        res = self.__client.post(CREATE_USER_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data, {
            'id': res.data['id'],
            'username': 'admin2',
            'isp': None,
            'is_staff': False,
            'is_active': True
        })

        isp = ISP.objects.create(
            name="New isp1",
            isp_id=0
        )

        payload = {
            'username': 'admin3',
            'password': 'testpass123',
            'isp_id': isp.id,
            'is_staff': False,
        }

        res = self.__client.post(CREATE_USER_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual({'username': res.data['username'],
                          'isp_id': isp.id}, {
            'username': 'admin3',
            'isp_id': isp.id
        })

        payload = {
            'username': 'arnon', 'password': 'Arnon@1234', 'isp_id': isp.id,
            'is_staff': False
        }
        res = self.__client.post(CREATE_USER_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual({'username': res.data['username'],
                          'isp_id': isp.id}, {
            'username': 'arnon',
            'isp_id': isp.id
        })

    def test_password_too_short_error(self):
        """Test if password to short."""
        payload = {
            'email': 'test@example.com',
            'password': '123',
            'name': 'Test name'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_get_access_token_success(self):
        """Test get tokens from a user successful."""
        payload = {
            'username': 'arnon',
            'password': 'test_password'
        }
        get_user_model().objects.create_user(**payload)
        res = self.client.post(TOKEN_URL, {
            'username': payload['username'],
            'password': payload['password'],
            'ip_address': '::1'
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(set(res.data.keys()), {'access', 'refresh'})
        self.assertTrue(all(bool(value) for value in res.data.values()))

    def test_get_access_token_fake_user_fail(self):
        """Test to get tokens from a fake user failure."""
        payload = {
            'username': 'Testname',
            'password': 'test_password',
        }
        fake_payload = {
            'username': 'Fakename',
            'password': 'fake_password'
        }

        get_user_model().objects.create_user(**payload)
        res = self.client.post(TOKEN_URL, {
            'username': payload['username'],
            'password': payload['password'],
            'ip_address': '::1'
        })
        fake_res = self.client.post(TOKEN_URL, {
            'username': fake_payload['username'],
            'password': fake_payload['password']
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(set(res.data.keys()), {'access', 'refresh'})
        self.assertTrue(all(bool(value) for value in res.data.values()))
        self.assertEqual(fake_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_refresh_token_success(self):
        """Test to get refresh token success."""
        payload = {
            'username': 'Testname',
            'password': 'test_password',
        }
        get_user_model().objects.create_user(**payload)
        res = self.client.post(TOKEN_URL, {
            'username': payload['username'],
            'password': payload['password'],
            'ip_address': '::1'
        })
        refresh = res.data['refresh']
        new_res = self.client.post(REFRESH_TOKEN_URL, {
            'refresh': refresh
        })

        self.assertEqual(new_res.status_code, status.HTTP_200_OK)
        self.assertEqual(set(new_res.data.keys()), {'access'})
        self.assertTrue(bool(new_res.data['access']))

    def test_get_access_token_with_non_expired_refresh_success(self):
        """Test to get access token with non-expired refresh token successful.
        """
        payload = {
            'username': 'Testname',
            'password': 'test_password'
        }
        user = get_user_model().objects.create_user(**payload)
        refresh = RefreshToken.for_user(user)
        refresh.set_exp(
            from_time=datetime.now(timezone.utc) - timedelta(days=1))
        expired_refresh_token = str(refresh)

        res = self.client.post(REFRESH_TOKEN_URL,
                               {'refresh': expired_refresh_token})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(set(res.data.keys()), {'access'})
        self.assertTrue(bool(res.data['access']))

    def test_get_access_token_with_expired_refresh_fail(self):
        """Test to get access token with expired refresh token failure."""
        payload = {
            'password': 'test_password',
            'username': 'Testname'
        }
        user = get_user_model().objects.create_user(**payload)
        refresh = RefreshToken.for_user(user)
        refresh.set_exp(
            from_time=datetime.now(timezone.utc) - timedelta(days=10))
        expired_refresh_token = str(refresh)

        res = self.client.post(REFRESH_TOKEN_URL,
                               {'refresh': expired_refresh_token})

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('token_not_valid', str(res.content))

    def test_retrieve_user_unauthorized(self):
        """Test authentication is required for users."""
        res = self.client.get(CREATE_USER_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateUserApiTest(TestCase):
    """Test API requests that require authentication."""
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.__user = get_user_model().objects.create_superuser(
            username="Testname",
            password='test-user-password123',
            isp=None,
            is_staff=True
        )
        cls.__url = reverse('user:user-detail',
                                      args=[cls.__user.pk])
        cls.__client = APIClient()
        cls.__client_for_token = APIClient()
        cls.__client.force_authenticate(cls.__user)

    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in user."""
        res = self.__client.get(self.__url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, {
            'id': res.data['id'],
            'username': self.__user.username,
            'isp': None,
            'is_staff': True,
            'is_active': True
        })

    def test_retriveve_profile_fail(self):
        """Test to get profile with no unauthenticated user."""
        res = self.__client_for_token.get(self.__url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retriveve_profile_success(self):
        """Test to get profile with access token user."""
        payload = {
            'username': 'Tokenname',
            'password': 'tokenpass123',
            'isp': None,
            'is_staff': True
        }
        payload_with_ip = {
            'username': 'Tokenname',
            'password': 'tokenpass123',
            'ip_address': '::1',
            'isp': None,
            'is_staff': True
        }
        payload_check = {
            'username': 'Tokenname',
            'password': 'tokenpass123',
            'isp': None,
            'is_staff': True,
            'is_active': True
        }
        user = get_user_model().objects.create_user(**payload)
        url = reverse('user:user-detail', args=[user.pk])
        response = self.__client_for_token.post(TOKEN_URL, payload_with_ip,
                                                format='json')
        access_token = response.data['access']
        self.__client_for_token.credentials(
                HTTP_AUTHORIZATION=f'Bearer {access_token}'
            )
        response = self.__client_for_token.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data,
                         {'id': response.data['id']} |
                         {k: v for k, v in payload_check.items()
                          if k != 'password'})

        access_token = AccessToken.for_user(user)
        access_token.set_exp(
            from_time=datetime.now(timezone.utc) - timedelta(seconds=4*60))
        access_token = str(access_token)
        self.__client_for_token.credentials(
                HTTP_AUTHORIZATION=f'Bearer {access_token}'
            )
        response = self.__client_for_token.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data,
                         {'id': response.data['id']} |
                         {k: v for k, v in payload_check.items()
                          if k != 'password'})

    def test_retrive_me_profile_success(self):
        """Test to get the profile of me."""
        url = reverse('user:user-me')
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data,
                         {
                            'id': res.data['id'],
                            'username': 'Testname', 'isp': None,
                            'is_staff': True, 'is_active': True
                            })

    # def test_retrive_me_profile_with_non_active_fail(self):
    #     """Test to get the profile of me with non active failure."""
    #     url = reverse('user:user-me')
    #     user = {
    #         'username': 'Nonadmin',
    #         'password': 'password123'
    #     }
    #     nonadmin_user = get_user_model().objects.create_user(
    #         **user
    #     )
    #     client = APIClient()
    #     client.force_authenticate(nonadmin_user)
    #     res = client.get(url)
    #     self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
    #     self.assertEqual(res.data['detail'].code, 'permission_denied')

    def test_retriveve_profile_expired_token_fail(self):
        """Test to get profile with expired access token failure."""
        payload = {
            'username': 'Tokenname',
            'password': 'tokenpass123'
        }
        user = get_user_model().objects.create_user(**payload)
        url = reverse('user:user-detail', args=[user.pk])
        access_token = AccessToken.for_user(user)
        access_token.set_exp(
            from_time=datetime.now(timezone.utc) - timedelta(seconds=6*60)
        )
        access_token = str(access_token)
        self.__client_for_token.credentials(
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        response = self.__client_for_token.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user_profile(self):
        """Test udpating the user."""
        update_payload = {
            'username': 'Updatedname',
            'password': 'newpass123'
        }

        res = self.__client.patch(self.__url, update_payload)

        self.__user.refresh_from_db()
        self.assertEqual(self.__user.username, update_payload['username'])
        self.assertTrue(self.__user.check_password(update_payload['password']))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_user_confict_username(self):
        """Test updating the user with conficting username."""
        self.__user.refresh_from_db()
        update_payload = {
            'username': 'Testname',
            'password': 'newpass123'
        }
        res = self.__client.patch(self.__url, update_payload)

        self.__user.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class TwoFactorTest(TestCase):
    """Test for 2FA admin login."""

    @classmethod
    def setUpClass(cls):
        """Setup for class test."""
        super().setUpClass()
        cls.__super_payload = {
            'username': 'super',
            'password': 'super_password123',
        }
        cls.__user_payload = {
            'username': 'user',
            'password': 'user_password123',
        }
        cls.__super_user = get_user_model()\
            .objects.create_superuser(
                **cls.__super_payload
            )
        cls.__user = get_user_model()\
            .objects.create_user(
                **cls.__user_payload
            )

    def test_qr_code_setup_creates_device(self):
        """Test to setup qrcode."""
        self.client.login(
            username=self.__super_payload['username'],
            password=self.__super_payload['password']
        )
        TOTPDevice.objects.filter(user=self.__super_user).delete()
        response = self.client.get(reverse('two_factor:setup'))
        self.assertContains(response, 'Enable Two-Factor Authentication')
        response = self.client.post(reverse('two_factor:setup'), {
            'setup_view-current_step': 'welcome',
        })

        qr_response = self.client.get('/account/two_factor/qrcode/')

        self.assertEqual(qr_response.status_code, 200)
        self.assertEqual(qr_response['Content-Type'],
                         'image/svg+xml; charset=utf-8')
        self.assertGreater(len(qr_response.content), 100)


class PrivateUserTest(TestCase):
    """Test API requests that require authentication."""
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.__user = get_user_model().objects.create_user(
            username="Testname",
            password='test-user-password123',
        )  # type: ignore
        cls.__client = APIClient()
        cls.__client.force_authenticate(cls.__user)

    def test_get_users_fail(self):
        """Test to get users fail."""
        res = self.__client.get(CREATE_USER_URL)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_user_fail(self):
        """Test to create user fail."""
        res = self.__client.get(CREATE_USER_URL, {
            'username': 'arnon',
            'password': 'arnon@3339'
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_my_user_success(self):
        """Test to get users success."""
        res = self.__client.get(reverse('user:user-me'))

        user_data = UserSerializer(self.__user).data
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, user_data)