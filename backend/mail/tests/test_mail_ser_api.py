"""Testcase of mail serializer API."""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import ISP, Activity, User, Group
from activity.serializer import ActivitySerializer
from group.serializer import GroupSerializer
from user.serializer import UserSerializer

from rest_framework.test import APIClient
from rest_framework import status


USER_URL = reverse('user:user-list')
MAIL_URL = reverse('mail:mail-list')
GROUP_URL = reverse('group:group-list')
DOCUMENT_URL = reverse('document:document-list')


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


class PrivateStaffTest(TestCase):
    """Private test for mail app."""
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass() 
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            username='user',
            password='user@1234',
            is_staff=True
        )  # type: ignore
        cls.__client.force_authenticate(cls.__user)
    
    def test_create_mail_no_file_success(self):
        """Test to create a Mail success."""
        admin_user = get_user_model().objects.create_superuser(
            username='admin',
            password='admin@1234'
        )  # type: ignore
        admin_client = APIClient()
        admin_client.force_authenticate(admin_user)
        receiver_payload = [
            {
                'username': f'user{i}',
                'password': f'user{i}@1234',
            } for i in range(3)
        ]

        res_group = admin_client.post(GROUP_URL, {
            'name': 'group 1',
            'kind': 'Kind1'
        }, format='json')

        receiver_ids = []
        for i in range(3):
            recv_res = admin_client.post(USER_URL, receiver_payload[i],
                                         format='json')
            receiver_ids.append(recv_res.data['id'])

        res = admin_client.post(MAIL_URL, {
            'subject': 'Subject1',
            'to_user_ids': receiver_ids,
            'group_id': res_group.data['id']
        })

        recv_users = UserSerializer(
            get_user_model().objects.filter(pk__in=receiver_ids),
            many=True
        ).data
        self.assertEqual(res.data['subject'], 'Subject1')
        self.assertEqual(res.data['to_users'], recv_users)
        self.assertEqual(res.data['group'], res_group.data)
    
    def test_create_mail_no_file_non_exists_group_fail(self):
        """Test to create a Mail with non exists a group fail."""
        admin_user = get_user_model().objects.create_superuser(
            username='admin',
            password='admin@1234'
        )  # type: ignore
        admin_client = APIClient()
        admin_client.force_authenticate(admin_user)
        receiver_payload = [
            {
                'username': f'user{i}',
                'password': f'user{i}@1234',
            } for i in range(3)
        ]

        res_group = admin_client.post(GROUP_URL, {
            'name': 'group 1',
            'kind': 'Kind1'
        }, format='json')

        receiver_ids = []
        for i in range(3):
            recv_res = admin_client.post(USER_URL, receiver_payload[i],
                                         format='json')
            receiver_ids.append(recv_res.data['id'])

        groups_data = GroupSerializer(
            Group.objects.all(),
            many=True
        ).data
        non_exists_group_id = res_group.data['id'] + 999
        self.assertNotIn(non_exists_group_id,
                         [g['id'] for g in groups_data])
        res = admin_client.post(MAIL_URL, {
            'subject': 'Subject1',
            'to_user_ids': receiver_ids,
            'group_id': non_exists_group_id
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_mail_no_file_no_group_fail(self):
        """Test to create a Mail with no group fail."""
        admin_user = get_user_model().objects.create_superuser(
            username='admin',
            password='admin@1234'
        )  # type: ignore
        admin_client = APIClient()
        admin_client.force_authenticate(admin_user)
        receiver_payload = [
            {
                'username': f'user{i}',
                'password': f'user{i}@1234',
            } for i in range(3)
        ]

        receiver_ids = []
        for i in range(3):
            recv_res = admin_client.post(USER_URL, receiver_payload[i],
                                         format='json')
            receiver_ids.append(recv_res.data['id'])

        res = admin_client.post(MAIL_URL, {
            'subject': 'Subject1',
            'to_user_ids': receiver_ids,
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_mail_with_file_success(self):
        """Test to create a Mail with file success."""
        admin_user = get_user_model().objects.create_superuser(
            username='admin',
            password='admin@1234'
        )  # type: ignore
        admin_client = APIClient()
        admin_client.force_authenticate(admin_user)
        receiver_payload = [
            {
                'username': f'user{i}',
                'password': f'user{i}@1234',
            } for i in range(3)
        ]

        doc_payloads = [
            {
                'title': f'Title {i}'
            } for i in range(3)
        ]

        doc_ids = []
        for doc_payload in doc_payloads:
            res_doc = self.__client.post(DOCUMENT_URL, doc_payload,
                                    format='json')
            self.assertEqual(res_doc.status_code, status.HTTP_201_CREATED)
            doc_ids.append(res_doc.data['id'])

        group_ids = []
        for i in range(3):
            res_group = admin_client.post(GROUP_URL, {
                'name': f'group {i}',
                'kind': 'Kind1',
                'document_ids': [doc_ids[i]]
            }, format='json')
            group_ids.append(res_group.data['id'])

        receiver_ids = []
        for i in range(3):
            recv_res = admin_client.post(USER_URL, receiver_payload[i],
                                         format='json')
            receiver_ids.append(recv_res.data['id'])

        admin_client.post(MAIL_URL, {
            'subject': 'Subject1',
            'to_user_ids': [receiver_ids[0]],
            'group_id': group_ids[0],
            'is_draft': False
        })

        admin_client.post(MAIL_URL, {
            'subject': 'Subject2',
            'to_user_ids': receiver_ids[:2],
            'group_id': group_ids[1],
            'is_draft': False
        })

        admin_client.post(MAIL_URL, {
            'subject': 'Subject3',
            'to_user_ids': [receiver_ids[2]],
            'group_id': group_ids[2],
        })

        res = admin_client.get(MAIL_URL)
        self.assertEqual(len(res.data), 3)
        self.assertNotIn('file', res.data[0].keys())
        self.assertNotIn('file', res.data[-1].keys())

        client = APIClient()
        client.force_authenticate(User.objects.get(id=receiver_ids[0]))
        res = client.get(MAIL_URL)
        self.assertEqual(len(res.data), 2)

        client = APIClient()
        client.force_authenticate(User.objects.get(id=receiver_ids[1]))
        res = client.get(MAIL_URL)
        self.assertEqual(len(res.data), 1)

        client = APIClient()
        client.force_authenticate(User.objects.get(id=receiver_ids[2]))
        res = client.get(MAIL_URL)
        self.assertEqual(len(res.data), 0)
    
    def test_create_mail_non_staff_fail(self):
        """Test to create a Mail success."""
        user = get_user_model().objects.create_user(
            username='userxxx',
            password='userxxx@1234'
        )  # type: ignore
        client = APIClient()
        client.force_authenticate(user)
        receiver_payload = [
            {
                'username': f'user{i}',
                'password': f'user{i}@1234',
            } for i in range(3)
        ]

        res_group = self.__client.post(GROUP_URL, {
            'name': 'group 1',
            'kind': 'Kind1'
        }, format='json')

        receiver_ids = []
        for i in range(3):
            recv_res = self.__client.post(USER_URL, receiver_payload[i],
                                         format='json')
            receiver_ids.append(recv_res.data['id'])

        res = client.post(MAIL_URL, {
            'subject': 'Subject1',
            'to_user_ids': receiver_ids,
            'group_id': res_group.data['id']
        })

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)