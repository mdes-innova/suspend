""" Test models module. """
from django.test import TestCase
from django.contrib.auth import get_user_model


class UserModelTest(TestCase):
    """ Test user model class. """
    def test_create_user(self):
        """
            Test create a user.
        """
        user_data = {
            'email': 'arnon@example.com',
            'password': 'sample123'
        }
        user = get_user_model().objects.create_user(
            email=user_data['email'],
            password=user_data['password']
        )

        self.assertEqual(user.email, user_data['email'])
        self.assertTrue(user.check_password(user_data['password']))

    def test_user_email_nomalized(self):
        """ Test email normalization for user. """
        users_data = [
            ('test@Example.com', 'test@example.com'),
        ]

        for user_data in users_data:
            user = get_user_model().objects.create_user(email=user_data[0])
            user.refresh_from_db()
            self.assertEqual(user.email, user_data[1])

    def test_create_superuser(self):
        """ Test create a superuser """
        user_data = {
            'email': 'admin@example.com',
            'password': 'password123'
        }

        user = get_user_model().objects.create_superuser(
            email=user_data['email'],
            password=user_data['password']
            )

        self.assertEqual(user.email, user_data['email'])
        self.assertTrue(user.check_password(user_data['password']))
