"""Testcase module for group serializer."""
from datetime import date

from rest_framework import status
from rest_framework.test import APIClient

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from core.models import Group, KindType
from ..serializer import GroupSerializer


GROUP_URL = reverse('group:group-list')
DOCUMENT_URL = reverse('document:document-list')


def get_group_detail_url(pk):
    return reverse('group:group-detail', args=[pk])


class PublicTest(TestCase):
    """Test for public access."""
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        user_payload = {
            'username': 'user',
            'password': 'user_password_123'
        }
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(**user_payload)

    def test_create_group_fail(self):
        """Test to create group in public fail."""
        payload = {
            'name': 'group1',
        }
        res = self.__client.post(GROUP_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_groups_fail(self):
        """Test to get groups in public fail."""
        payloads = [
                Group(name="name 1", user=self.__user),
                Group(name="name 2", user=self.__user),
            ]
        Group.objects.bulk_create(payloads)
        res = self.__client.get(GROUP_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateTest(TestCase):
    """Test for private access."""
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        user_payload = {
            'username': 'user',
            'password': 'user_password_123'
        }
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(**user_payload)
        cls.__client.force_authenticate(cls.__user)

    def test_create_group_success(self):
        """Test to create group in private success."""
        payload = {
            'name': 'group1'
        }
        res = self.__client.post(GROUP_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_get_groups_success(self):
        """Test to get groups in private success."""
        payloads = [
                Group(name="name 1", user=self.__user),
                Group(name="name 2", user=self.__user),
            ]
        Group.objects.bulk_create(payloads)
        res = self.__client.get(GROUP_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res_data = sorted(res.data, key=lambda x: x['name'])
        groups = Group.objects.order_by('name')
        serializers = GroupSerializer(groups, many=True)

        self.assertEqual(res_data, serializers.data)

    def test_get_groups_post_success(self):
        """Test to get groups in private success."""
        payloads = [
            {
                'name': 'group1',
            },
            {
                'name': 'group2',
                'kind': 'nokind'
            }
        ]

        for payload in payloads:
            self.__client.post(GROUP_URL, payload, format='json')
        res = self.__client.get(GROUP_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res_data = sorted(res.data, key=lambda x: x['name'])
        groups = Group.objects.order_by('name')
        serializers = GroupSerializer(groups, many=True)

        self.assertEqual(res_data, serializers.data)
        self.assertEqual([r['kind'] for r in res_data],
                         ['nokind']*2)

    def test_get_auto_create_group(self):
        """Test to get auto-create group after user creation."""
        payload = {
            'username': 'user1',
            'password': 'user1_password_123'
        }
        user = get_user_model().objects.create_user(**payload)
        group = Group.objects.get(user=user)

        self.assertEqual([
            group.name, group.kind, group.user
        ], [
            'default', 'nokind', user
        ])

    def test_create_group_with_documents_success(self):
        """Test to create assign document to group success."""
        doc_payloads = [
            {
                'title': 'Title x'
            },
            {
                'title': 'Title y'
            },
        ]
        doc_ids = []
        for doc_payload in doc_payloads:
            res = self.__client.post(reverse('document:document-list'),
                                     doc_payload,
                                     format='json')
            doc_ids.append(res.data['id'])
        group_payload = {
            'name': 'group1',
            'document_ids': doc_ids
        }
        res = self.__client.post(GROUP_URL, group_payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(set([r['title'] for r in res.data['documents']]),
                         set([r['title'] for r in doc_payloads]))

    def test_assign_documents_to_group_success(self):
        """Test to assign document to group success."""
        doc_payloads = [
            {
                'title': 'Title x'
            },
            {
                'title': 'Title y'
            },
        ]
        doc_ids = []
        for doc_payload in doc_payloads:
            res = self.__client.post(reverse('document:document-list'),
                                     doc_payload,
                                     format='json')
            doc_ids.append(res.data['id'])
        group_payload = {
            'name': 'group1',
        }
        res = self.__client.post(GROUP_URL, group_payload, format='json')

        url = reverse('group:group-detail', args=[res.data['id']])
        res = self.__client.patch(url, {'document_ids': doc_ids},
                                  format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(set([r['title'] for r in res.data['documents']]),
                         set([r['title'] for r in doc_payloads]))

    def test_assing_the_same_doc_different_users_fail(self):
        """Test to assign the same document to different users with the
        same name of group fail.
        """
        user_1 = get_user_model().objects.create_user(
            username='user_1',
            password='password_1'
        )
        user_2 = get_user_model().objects.create_user(
            username='user_2',
            password='password_2'
        )
        client_1 = APIClient()
        client_2 = APIClient()
        client_1.force_authenticate(user_1)
        client_2.force_authenticate(user_2)

        res_doc = self.__client.post(reverse('document:document-list'),
                                     {'title': 'Title 1'},
                                     format='json')

        res_user1_group = client_1.post(reverse('group:group-list'),
                                        {'name': 'group1'},
                                        format='json')
        res_user2_group = client_2.post(reverse('group:group-list'),
                                        {'name': 'group1'},
                                        format='json')

        url1 = reverse('group:group-detail', args=[res_user1_group.data['id']])
        url2 = reverse('group:group-detail', args=[res_user2_group.data['id']])

        res_update1 = client_1.patch(url1,
                                     {'document_ids': res_doc.data['id']})
        res_update2 = client_2.patch(url2,
                                     {'document_ids': res_doc.data['id']})

        self.assertEqual(res_update1.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update1.data['documents'][0]['title'], 'Title 1')
        self.assertEqual(res_update2.status_code,
                         status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(res_update2.data['detail']),
                         'Some documents are already in a group.')

    def test_assing_the_same_doc_the_same_user_fail(self):
        """Test to assign the same document to the same with the
        different groups fail.
        """
        user_1 = get_user_model().objects.create_user(
            username='user_1',
            password='password_1'
        )
        client_1 = APIClient()
        client_1.force_authenticate(user_1)

        res_doc = self.__client.post(reverse('document:document-list'),
                                     {'title': 'Title 1'},
                                     format='json')

        res_user_group1 = client_1.post(reverse('group:group-list'),
                                        {'name': 'group1'},
                                        format='json')

        res_user_group2 = client_1.post(reverse('group:group-list'),
                                        {'name': 'group2'},
                                        format='json')

        url1 = reverse('group:group-detail', args=[res_user_group1.data['id']])
        url2 = reverse('group:group-detail', args=[res_user_group2.data['id']])

        res_update1 = client_1.patch(url1,
                                     {'document_ids': res_doc.data['id']})
        self.assertEqual(res_update1.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update1.data['documents'][0]['title'], 'Title 1')

        res_update2 = client_1.patch(url2,
                                     {'document_ids': res_doc.data['id']})

        self.assertEqual(res_update2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(res_update2.data['detail'][0]),
            "Some documents are already in other groups for this user.")

    def test_append_documents_success(self):
        """Test to append documents to a group successful.
        """
        doc_payloads1 = [
            {
                'title': 'Title 1'
            },
            {
                'title': 'Title 2'
            }
        ]
        doc_payloads2 = [
            {
                'title': 'Title 3'
            },
        ]
        doc_ids = []
        update_doc_ids = []
        for doc in doc_payloads1:
            res_doc = self.__client.post(reverse('document:document-list'),
                                         doc, format='json')
            doc_ids.append(res_doc.data['id'])
        for doc in doc_payloads2:
            res_doc = self.__client.post(reverse('document:document-list'),
                                         doc, format='json')
            update_doc_ids.append(res_doc.data['id'])

        res_group = self.__client.post(GROUP_URL, {
            'name': 'group1'
        }, format='json')

        url = reverse('group:group-detail', args=[res_group.data['id']])

        res_update1 = self.__client.patch(url,
                                          {'document_ids': doc_ids})

        self.assertEqual(res_update1.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set([doc['id'] for doc in res_update1.data['documents']]),
            set(doc_ids))

        res_update2 = self.__client.patch(url,
                                          {
                                              'document_ids': update_doc_ids,
                                              'mode': 'append',
                                              }, format='json')
        self.assertEqual(res_update2.status_code, status.HTTP_200_OK)

        res_get = self.__client.get(reverse('group:group-detail',
                                            args=[res_group.data['id']]))
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set([doc['id'] for doc in res_get.data['documents']]),
            set(doc_ids + update_doc_ids))

    def test_add_docs_success(self):
        """Test to add documents to groups success."""
        doc1_payloads = [
            {
                'title': f'doc{i}',
                'date': date.today()
            } for i in range(3)
        ]

        doc1_ids = []
        for payload in doc1_payloads:
            res_doc1 = self.__client.post(DOCUMENT_URL, payload, format='json')
            doc1_ids.append(res_doc1.data['id'])

        res_group1 = self.__client.post(GROUP_URL, {
            'name': 'kind1',
            'kind': 'Kind1'
        })

        res_group2 = self.__client.post(GROUP_URL, {
            'name': 'kind2',
            'kind': 'Kind2'
        })

        res_1 = self.__client.patch(
                reverse('group:group-detail', args=[res_group1.data['id']]),
                {'document_ids': doc1_ids},
                format='json'
            )
        res_2 = self.__client.patch(
                reverse('group:group-detail', args=[res_group2.data['id']]),
                {'document_ids': doc1_ids},
                format='json'
            )

        self.assertEqual(res_1.status_code, status.HTTP_200_OK)
        self.assertEqual(res_2.status_code, status.HTTP_200_OK)

    def test_add_docs_fail(self):
        """Test to add documents to groups fail."""
        doc1_payloads = [
            {
                'title': f'doc{i}',
                'date': date.today()
            } for i in range(3)
        ]

        doc1_ids = []
        for payload in doc1_payloads:
            res_doc1 = self.__client.post(DOCUMENT_URL, payload, format='json')
            doc1_ids.append(res_doc1.data['id'])

        res_group1 = self.__client.post(GROUP_URL, {
            'name': 'kind1',
            'kind': 'Kind1'
        })

        res_group2 = self.__client.post(GROUP_URL, {
            'name': 'kind1_2',
            'kind': 'Kind1'
        })

        res_1 = self.__client.patch(
                reverse('group:group-detail', args=[res_group1.data['id']]),
                {'document_ids': doc1_ids},
                format='json'
            )
        res_2 = self.__client.patch(
                reverse('group:group-detail', args=[res_group2.data['id']]),
                {'document_ids': [doc1_ids[1]]},
                format='json'
            )

        self.assertEqual(res_1.status_code, status.HTTP_200_OK)
        self.assertEqual(res_2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_group_by_document_success(self):
        """Test to get a group from a document successful."""
        res_doc = self.__client.post(DOCUMENT_URL, {
            'title': 'Doc1'
        }, format='json')

        res_group = self.__client.post(GROUP_URL, {
            'name': 'group1'
        }, format='json')

        url = reverse('group:group-detail', args=[res_group.data['id']])

        self.__client.patch(url, {
            'document_ids': [res_doc.data['id']]
        }, format='json')

        url = reverse('group:group-by-document',
                      kwargs={'did': res_doc.data['id']})

        res = self.__client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        group = Group.objects.get(pk=res_group.data['id'])
        group_data = GroupSerializer(group).data

        self.assertEqual(group_data, res.data)

    def test_remove_group_from_documents_success(self):
        """Test to get a group from a document successful."""
        doc_payloads1 = [
            {
                'title': 'Title 1'
            },
            {
                'title': 'Title 2'
            },
            {
                'title': 'Title 3'
            },
            {
                'title': 'Title 4'
            }
        ]
        doc_ids = []
        for doc in doc_payloads1:
            res_doc = self.__client.post(reverse('document:document-list'),
                                         doc, format='json')
            doc_ids.append(res_doc.data['id'])

        res_group = self.__client.post(GROUP_URL, {
            'name': 'group1'
        }, format='json')

        url = reverse('group:group-detail', args=[res_group.data['id']])
        self.__client.patch(url, {'document_ids': doc_ids})
        self.__client.patch(url, {'document_ids': doc_ids[-2:],
                                  'mode': 'remove'})
        res_get = self.__client.get(reverse('group:group-detail',
                                            args=[res_group.data['id']]))
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_get.data['documents']) + len(doc_ids[-2:]),
                         len(doc_ids))
        self.assertEqual(set([d['title'] for d in res_get.data['documents']]),
                         set([d['title'] for d in doc_payloads1[:-2]]))
