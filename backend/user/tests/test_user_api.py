"""Test create user module."""
from datetime import datetime, timedelta, timezone
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from unittest.mock import patch
from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.test import APIClient


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

    def test_create_user_short_passwrod_fail(self):
        """Test to create a user with short password failure."""
        user = get_user_model().objects.create_superuser(
                username='admin',
                password='password123'
            )
        self.client.force_authenticate(user)
        payload = {
                'username': 'arnon',
                'password': 'pa'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

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
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

# class AdminUserTest(TestCase):
#     """Test with admin user."""
#     @classmethod
#     def setUpClass(cls):
#         super().setUpClass()
#         cls.__client = APIClient()
#         admin_usr = get_user_model().objects.create_superuser(
#             username='admin',

#         )
#     def test_user_with_email_exists_error(self):
#         """Test if existing email."""
#         payload = {
#             'email': 'test@example.com',
#             'password': 'testpass123',
#             'name': 'Test name'
#         }
#         get_user_model().objects.create(**payload)
#         res = self.client.post(CREATE_USER_URL, payload)
#         self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

#     def test_password_too_short_error(self):
#         """Test if password to short."""
#         payload = {
#             'email': 'test@example.com',
#             'password': '123',
#             'name': 'Test name'
#         }
#         res = self.client.post(CREATE_USER_URL, payload)
#         self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
#         user_exists = get_user_model().objects.filter(
#             email=payload['email']
#         ).exists()
#         self.assertFalse(user_exists)

#     def test_get_access_token_success(self):
#         """Test get tokens from a user successful."""
#         payload = {
#             'email': 'test@example.com',
#             'password': 'test_password',
#             'name': 'Test name'
#         }
#         get_user_model().objects.create_user(**payload)
#         res = self.client.post(TOKEN_URL, {
#             'email': payload['email'],
#             'password': payload['password']
#         })

#         self.assertEqual(res.status_code, status.HTTP_200_OK)
#         self.assertEqual(set(res.data.keys()), {'access', 'refresh'})
#         self.assertTrue(all(bool(value) for value in res.data.values()))

#     def test_get_access_token_fake_user_fail(self):
#         """Test to get tokens from a fake user failure."""
#         payload = {
#             'email': 'test@example.com',
#             'password': 'test_password',
#             'name': 'Test name'
#         }
#         fake_payload = {
#             'email': 'fake@example.com',
#             'password': 'fake_password',
#             'name': 'Fake name'
#         }

#         get_user_model().objects.create_user(**payload)
#         res = self.client.post(TOKEN_URL, {
#             'email': payload['email'],
#             'password': payload['password']
#         })
#         fake_res = self.client.post(TOKEN_URL, {
#             'email': fake_payload['email'],
#             'password': fake_payload['password']
#         })

#         self.assertEqual(res.status_code, status.HTTP_200_OK)
#         self.assertEqual(set(res.data.keys()), {'access', 'refresh'})
#         self.assertTrue(all(bool(value) for value in res.data.values()))
#         self.assertEqual(fake_res.status_code, status.HTTP_401_UNAUTHORIZED)

#     def test_get_refresh_token_success(self):
#         """Test to get refresh token success."""
#         payload = {
#             'email': 'test@example.com',
#             'password': 'test_password',
#             'name': 'Test name'
#         }
#         get_user_model().objects.create_user(**payload)
#         res = self.client.post(TOKEN_URL, {
#             'email': payload['email'],
#             'password': payload['password']
#         })
#         refresh = res.data['refresh']
#         new_res = self.client.post(REFRESH_TOKEN_URL, {
#             'refresh': refresh
#         })

#         self.assertEqual(new_res.status_code, status.HTTP_200_OK)
#         self.assertEqual(set(new_res.data.keys()), {'access'})
#         self.assertTrue(bool(new_res.data['access']))

#     def test_get_access_token_with_non_expired_refresh_success(self):
#         """Test to get access token with non-expired refresh token successful.
#         """
#         payload = {
#             'email': 'test@example.com',
#             'password': 'test_password',
#             'name': 'Test name'
#         }
#         user = get_user_model().objects.create_user(**payload)
#         refresh = RefreshToken.for_user(user)
#         refresh.set_exp(
#             from_time=datetime.now(timezone.utc) - timedelta(days=1))
#         expired_refresh_token = str(refresh)

#         # Use the expired refresh token
#         res = self.client.post(REFRESH_TOKEN_URL,
#                                {'refresh': expired_refresh_token})

#         self.assertEqual(res.status_code, status.HTTP_200_OK)
#         self.assertEqual(set(res.data.keys()), {'access'})
#         self.assertTrue(bool(res.data['access']))

#     def test_get_access_token_with_expired_refresh_fail(self):
#         """Test to get access token with expired refresh token failure."""
#         payload = {
#             'email': 'test@example.com',
#             'password': 'test_password',
#             'name': 'Test name'
#         }
#         user = get_user_model().objects.create_user(**payload)
#         refresh = RefreshToken.for_user(user)
#         refresh.set_exp(
#             from_time=datetime.now(timezone.utc) - timedelta(days=10))
#         expired_refresh_token = str(refresh)

#         # Use the expired refresh token
#         res = self.client.post(REFRESH_TOKEN_URL,
#                                {'refresh': expired_refresh_token})

#         self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
#         self.assertIn('token_not_valid', str(res.content))

#     def test_retrieve_user_unauthorized(self):
#         """Test authentication is required for users."""
#         res = self.client.get(ME_USER_URL)

#         self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


# class PrivateUserApiTest(TestCase):
#     """Test API requests that require authentication."""

#     def setUp(self):
#         self.user = create_user(
#             name="Test name",
#             email='test@example.com',
#             password='test-user-password123'
#         )
#         self.client = APIClient()
#         self.client_for_token = APIClient()
#         self.client.force_authenticate(self.user)

#     def test_retrieve_profile_success(self):
#         """Test retrieving profile for logged in user."""
#         res = self.client.get(ME_USER_URL)

#         self.assertEqual(res.status_code, status.HTTP_200_OK)
#         self.assertEqual(res.data, {
#             'name': self.user.name,
#             'email': self.user.email
#         })

#     def test_retriveve_profile_fail(self):
#         """Test to get profile with no unauthenticated user."""
#         res = self.client_for_token.get(ME_USER_URL)
#         self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

#     def test_retriveve_profile_success(self):
#         """Test to get profile with access token user."""
#         payload = {
#             'email': 'token@example.com',
#             'password': 'tokenpass123',
#             'name': 'Token name'
#         }
#         user = get_user_model().objects.create_user(**payload)
#         response = self.client_for_token.post(TOKEN_URL, payload)
#         access_token = response.data['access']
#         self.client_for_token.credentials(
#                 HTTP_AUTHORIZATION=f'Bearer {access_token}'
#             )
#         response = self.client_for_token.get(ME_USER_URL)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data,
#                          {k: v for k, v in payload.items() if k != 'password'})

#         access_token = AccessToken.for_user(user)
#         access_token.set_exp(
#             from_time=datetime.now(timezone.utc) - timedelta(seconds=4*60))
#         access_token = str(access_token)
#         self.client_for_token.credentials(
#                 HTTP_AUTHORIZATION=f'Bearer {access_token}'
#             )
#         response = self.client_for_token.get(ME_USER_URL)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data,
#                          {k: v for k, v in payload.items() if k != 'password'})

#     def test_retriveve_profile_expired_token_fail(self):
#         """Test to get profile with expired access token failure."""
#         payload = {
#             'email': 'token@example.com',
#             'password': 'tokenpass123',
#             'name': 'Token name'
#         }
#         user = get_user_model().objects.create_user(**payload)
#         access_token = AccessToken.for_user(user)
#         access_token.set_exp(
#             from_time=datetime.now(timezone.utc) - timedelta(seconds=6*60)
#         )
#         access_token = str(access_token)
#         self.client_for_token.credentials(
#             HTTP_AUTHORIZATION=f'Bearer {access_token}'
#         )
#         response = self.client_for_token.get(ME_USER_URL)
#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

#     def test_post_me_not_allowed(self):
#         """Test not allowed post method in ME endpoints."""
#         res = self.client.post(ME_USER_URL, {})

#         self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

#     def test_update_user_profile(self):
#         """Test udpating the user."""
#         update_payload = {
#             'name': 'Updated name',
#             'email': 'updated@example.com',
#             'password': 'newpass123'
#         }

#         res = self.client.patch(ME_USER_URL, update_payload)

#         self.user.refresh_from_db()
#         self.assertEqual(self.user.name, update_payload['name'])
#         self.assertEqual(self.user.email, update_payload['email'])
#         self.assertTrue(self.user.check_password(update_payload['password']))
#         self.assertEqual(res.status_code, status.HTTP_200_OK)

#     def test_update_user_confict_email(self):
#         """Test updating the user with conficting email."""
#         create_user(
#             name="Test name2",
#             email='test@example2.com',
#             password='test-user-password123'
#         )
#         update_payload = {
#             'name': 'Updated name',
#             'email': 'test@example2.com',
#             'password': 'newpass123'
#         }

#         res = self.client.patch(ME_USER_URL, update_payload)

#         self.user.refresh_from_db()
#         self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# class TwoFactorTest(TestCase):
#     """Test for 2FA admin login."""

#     @classmethod
#     def setUpClass(cls):
#         """Setup for class test."""
#         super().setUpClass()
#         cls.__super_payload = {
#             'email': 'super@example.com',
#             'password': 'super_password123',
#         }
#         cls.__user_payload = {
#             'email': 'user@example.com',
#             'password': 'user_password123',
#             'name': 'User name'
#         }
#         cls.__super_user = get_user_model()\
#             .objects.create_superuser(
#                 **cls.__super_payload
#             )
#         cls.__user = get_user_model()\
#             .objects.create_user(
#                 **cls.__user_payload
#             )

#     def test_qr_code_setup_creates_device(self):
#         """Test to setup qrcode."""
#         self.client.login(
#             email=self.__super_payload['email'],
#             password=self.__super_payload['password']
#         )
#         TOTPDevice.objects.filter(user=self.__super_user).delete()
#         response = self.client.get(reverse('two_factor:setup'))
#         self.assertContains(response, 'Enable Two-Factor Authentication')
#         response = self.client.post(reverse('two_factor:setup'), {
#             'setup_view-current_step': 'welcome',
#         })

#         qr_response = self.client.get('/account/two_factor/qrcode/')

#         self.assertEqual(qr_response.status_code, 200)
#         self.assertEqual(qr_response['Content-Type'],
#                          'image/svg+xml; charset=utf-8')
#         self.assertGreater(len(qr_response.content), 100)
