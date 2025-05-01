"""Test for Document serializer API."""
from datetime import datetime

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import Document
from document.serializer import DocumentSerializer, DocumentDetailSerializer

from rest_framework.test import APIClient
from rest_framework import status


DOCUMENT_URL = reverse('document:document-list')

class DocumentSerializerTest(TestCase):
    """Test class for document serializer"""

    @classmethod
    def setUpClass(cls):
        """Setup for the test class."""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            name='Test name',
            email='test@example.com',
            password='test1234567890'
        )

    def test_get_document_with_unauthentication_fail(self):
        """Get documents with unauthenticated user."""
        res = self.__client.get(DOCUMENT_URL)
        Document.objects.bulk_create([
            Document(
                title=f'Test title {i}',
                description=f'Test description {i}'
            ) for i in range(3)
        ])

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateSerializerTest(TestCase):
    """Test class for private document serializer."""

    @classmethod
    def setUpClass(cls):
        """Setup for the class test."""
        super().setUpClass()
        cls.__client = APIClient()
        cls.__user = get_user_model().objects.create_user(
            name='Test name',
            email='test@example.com',
            password='test1234567890'
        )
        cls.__client.force_authenticate(cls.__user)

    def test_get_documents_success(self):
        documents = Document.objects.bulk_create([
            Document(
                    title=f'Test title {i}',
                    description=f'Test description {i}'
                ) for i in range(3)
            ])
        res = self.__client.get(DOCUMENT_URL)

        documents = Document.objects.all().order_by('-id')
        serializer = DocumentSerializer(documents, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_get_document_success(self):
        Document.objects.bulk_create([
            Document(
                    title=f'Test title {i}',
                    description=f'Test description {i}'
                ) for i in range(3)
            ])

        document = Document.objects.all().order_by('id').first()
        serializer = DocumentDetailSerializer(document)
        url = reverse('document:document-detail', args=[serializer.data['id']])
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_document_with_tags_success(self):
        """Test to create documents with tags."""
        payloads = [{
            'title': f'New title {i}',
            'description': f'New description {i}',
            'tags': [
                {'name': f'Tag {j}'}
                for j in range(i)
            ]
        } for i in range(3)]
        res_data = []
        for payload in payloads:
            res_create = self.__client.post(
                    DOCUMENT_URL, payload, format='json'
                )
            res_data.append(res_create.data)
            self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)

        payloads = [{
            'title': f'New title {3 + i}',
            'description': f'New description {3 + i}',
            'tags': [
                f'Tag {3 + j}'
                for j in range(i)
            ]
        } for i in range(3)]

        for payload in payloads:
            res_create = self.__client.post(
                    DOCUMENT_URL, payload, format='json'
                )
            res_data.append(res_create.data)
            self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)

        payloads = [{
            'title': f'New title {6 + i}',
            'description': f'New description {6 + i}',
            'tags': [
                'Tag 6', {'name': 'Tag 7'}, 'Tag 8'
            ]
        } for i in range(3)]

        for payload in payloads:
            res_create = self.__client.post(
                    DOCUMENT_URL, payload, format='json'
                )
            res_data.append(res_create.data)
            self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)

        documents = Document.objects.all()
        serializers = DocumentDetailSerializer(documents, many=True)
        self.assertEqual(sorted(serializers.data, key=lambda x: x['id']),
                         sorted(res_data, key=lambda x: x['id']))

    def test_get_tags_from_document_success(self):
        """Test to get tags from a document."""
        payload = {
            'title': 'Title',
            'tags': ['Tag 1', 'Tag 2']
        }

        res_create = self.__client.post(DOCUMENT_URL, payload, format='json')
        created_id = res_create.data['id']
        url = reverse('document:document-tags',
                      kwargs={'pk': created_id})
        res_tags = self.__client.get(url)
        tags = res_tags.data
        doc = DocumentSerializer(Document.objects.get(pk=created_id))

        self.assertEqual(res_tags.status_code, status.HTTP_200_OK)
        self.assertEqual(sorted(tags, key=lambda x: x['id']),
                         sorted(doc.data['tags'], key=lambda x: x['id']))

        res_create = self.__client.post(DOCUMENT_URL, payload, format='json')
        url = reverse('document:document-tags-by-title',
                      kwargs={'title': 'Title'})
        res = self.__client.get(url)
        res_data = res.data
        docs = DocumentSerializer(Document.objects.filter(title='Title'),
                                  many=True).data
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), len(docs))
        self.assertEqual(
           {
                res_data[0]['title'], res_data[0]['created_at'],
                res_data[1]['title'], res_data[1]['created_at']
           },
            {
                docs[0]['title'], datetime.fromisoformat(docs[0]['created_at'].replace('Z', '+00:00')),
                docs[1]['title'], datetime.fromisoformat(docs[1]['created_at'].replace('Z', '+00:00')),
            }
        )

    def test_get_documents_from_tag_success(self):
        """Test to get documents from a tag."""
        pass
        # payloads = [
        #     {
        #         'title': 'Title 1',
        #         'tags': ['Tag 1', 'Tag 2']
        #     },
        #     {
        #         'title': 'Title 2',
        #         'tags': ['Tag 1', 'Tag 3']
        #     }
        # ]

        # for payload in payloads:
        #     res_create = self.__client.post(DOCUMENT_URL, payload,
        #                                     format='json')
        
        # res_docs = self.__client.get(url)