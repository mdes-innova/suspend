"""Test for Document serializer API."""
import os
from tempfile import NamedTemporaryFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files import File
from datetime import datetime
from PIL import Image

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from core.models import Document, Category
from document.serializer import DocumentSerializer, DocumentDetailSerializer
from tag.serializer import TagSerializer, Tag

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
        cls.__categories = Category.objects.bulk_create(
            [
                Category(name=f'Category {i}')
                for i in range(3)
            ]
        )

    def test_get_document_with_unauthentication_fail(self):
        """Get documents with unauthenticated user."""
        res = self.__client.get(DOCUMENT_URL)
        Document.objects.bulk_create([
            Document(
                title=f'Test title {i}',
                description=f'Test description {i}',
                category=self.__categories[i]
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
        cls.__categories = Category.objects.bulk_create(
            [
                Category(name=f'Category {i}')
                for i in range(3)
            ]
        )

    def test_get_documents_success(self):
        documents = Document.objects.bulk_create([
            Document(
                    title=f'Test title {i}',
                    description=f'Test description {i}',
                    category=self.__categories[i]
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
                    description=f'Test description {i}',
                    category=self.__categories[i]
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
            'category': self.__categories[i].name,
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
            'category': self.__categories[i].name,
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
            'category': self.__categories[i].name,
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
            'category': 'Category 1',
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
        payloads = [
            {
                'title': 'Title 1',
                'category': 'Category 1',
                'tags': ['Tag 1', 'Tag 2']
            },
            {
                'title': 'Title 2',
                'category': 'Category 2',
                'tags': ['Tag 1', 'Tag 3']
            }
        ]

        for payload in payloads:
            res_create = self.__client.post(DOCUMENT_URL, payload,
                                            format='json')
            self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)

        tags = ['Tag 1', 'Tag 2', 'Tag 3']
        seriailizer_tags = TagSerializer(Tag.objects.all(), many=True)
        self.assertEqual(set(tags),
                         set([s['name'] for s in seriailizer_tags.data]))

        tag = Tag.objects.first()
        serializer = TagSerializer(tag) 
        url = reverse('tag:tag-detail', args=(serializer.data['id'],))
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

        url = reverse('tag:tag-documents-by-name', kwargs={'name': 'Tag 1'})
        res_docs = self.__client.get(url)
        self.assertEqual(res_docs.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_docs.data), 2)
        self.assertEqual({'Title 1', 'Title 2'},
                         set([res_docs.data[0]['title'], res_docs.data[1]['title']]))

        url = reverse('tag:tag-documents-by-name', kwargs={'name': 'Tag 2'})
        res_docs = self.__client.get(url)
        self.assertEqual(res_docs.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_docs.data), 1)
        self.assertEqual('Title 1', res_docs.data[0]['title'])

        url = reverse('tag:tag-documents-by-name', kwargs={'name': 'Tag 3'})
        res_docs = self.__client.get(url)
        self.assertEqual(res_docs.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_docs.data), 1)
        self.assertEqual('Title 2', res_docs.data[0]['title'])

    def test_create_document_with_category_success(self):
        """Test to create documents with category successful."""
        payloads = [
            {
                'title': 'Document 1',
                'category': 'Category 1'
            },
            {
                'title': 'Document 2',
                'category': 'Category 1'
            },
            {
                'title': 'Document 3',
                'category': 'Category 1'
            },
            {
                'title': 'Document 4',
                'category': 'Category 2'
            },
            {
                'title': 'Document 4',
                'category': {
                    'name': 'Category 3'
                }
            }
        ]

        res_data = []
        for payload in payloads:
            res = self.__client.post(DOCUMENT_URL, payload, format='json')
            self.assertEqual(res.status_code, status.HTTP_201_CREATED)
            del res.data['description']
            res_data.append(res.data)
        docs = Document.objects.order_by('title').all()
        serializers = DocumentSerializer(docs, many=True)
        self.assertEqual(sorted(res_data, key=lambda x: x['id']),
                        serializers.data)

    def test_get_documents_by_category_name_success(self):
        """Test to get a document by category' name successful."""
        payloads = [
            {
                'title': 'Title 1',
                'category': 'Category 1'
            },
            {
                'title': 'Title 2',
                'category': 'Category 1'
            }
        ]

        for payload in payloads:
            self.__client.post(DOCUMENT_URL, payload, format='json')

        url = reverse('category:category-documents-by-name',
                      kwargs={'name': 'Category 1'})
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        self.assertEqual(set([d['title'] for d in res.data]), {'Title 1', 'Title 2'})

        url = reverse('category:category-documents-by-name',
                      kwargs={'name': 'category 1'})
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        self.assertEqual(set([d['title'] for d in res.data]), {'Title 1', 'Title 2'})

    def test_get_documnet_by_category_name_fail(self):
        """Test to get a document by category' name failure."""
        payloads = [
            {
                'title': 'Title 1',
                'category': 'Category 1'
            },
            {
                'title': 'Title 2',
                'category': 'Category 2'
            }
        ]

        for payload in payloads:
            self.__client.post(DOCUMENT_URL, payload, format='json')

        url = reverse('category:category-documents-by-name',
                      kwargs={'name': 'Category 3'})
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_category_by_document_title_success(self):
        """Test to get a category by document's title successful."""
        payload = {
            'title': 'Title',
            'category': 'Category'
        }
        self.__client.post(DOCUMENT_URL, payload, format='json')

        url = reverse('document:document-category-by-title',
                      kwargs={'title': 'Title'})
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Category')

        url = reverse('document:document-category-by-title',
                      kwargs={'title': 'title'})
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Category')

    def test_get_category_by_document_title_fail(self):
        """Test to get a category by document's title failure."""
        payload = {
            'title': 'Title',
            'category': 'Category'
        }
        self.__client.post(DOCUMENT_URL, payload, format='json')

        url = reverse('document:document-category-by-title',
                      kwargs={'title': 'Title1'})
        res = self.__client.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class ImageUploadTest(TestCase):
    """Testcase for image uploading."""
    @classmethod
    def setUpClass(cls):
        """Setup for testcase"""
        super().setUpClass()
        user = {
            'email': 'test1@example.com',
            'password': 'Password_123'
        }
        user = get_user_model().objects.create_user(**user)
        cls.__client = APIClient()
        cls.__client.force_authenticate(user)

        document_payload = {
            'title': 'Title',
            'description': 'Description',
            'category': 'Category',
            'tags': ['Tag 1', 'Tag 2']
        }

        category = Category.objects.create(
            name=document_payload['category']
        )

        cls.__document = Document.objects.create(
            title=document_payload['title'],
            category=category,
            description=document_payload['description']
        )
        tags = Tag.objects.bulk_create(
            [
                Tag(name=tag_name)
                for tag_name in document_payload['tags']
            ]
        )
        cls.__document.tags.set(tags)

    def tearDown(self):
        """Clear testcase after finished."""
        super().tearDown()
        self.__document.file.delete()

    def test_upload_file_success(self):
        """Test uploading an image to a recipe."""
        url = reverse('document:document-file-upload',
                      args=[self.__document.pk])
        with NamedTemporaryFile(suffix='.pdf') as temp:
            temp.write(b'Test file content')
            temp.seek(0)
            django_file = File(temp, name='example.pdf') 
            payload = {'file': django_file}
            res = self.__client.post(url, payload, format='multipart')

        self.__document.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('file', res.data)
        self.assertTrue(os.path.exists(self.__document.file.path))

    def test_upload_file_bad_request(self):
        """Test uploading invalid image."""
        url = reverse('document:document-file-upload',
                      args=[self.__document.pk])
        payload = {'file': 'nofile'}
        res = self.__client.post(url, payload, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        with NamedTemporaryFile(suffix='.png') as temp:
            temp.write(b'Test file content')
            temp.seek(0)
            django_file = File(temp, name='example.png') 
            payload = {'file': django_file}
            res = self.__client.post(url, payload, format='multipart')

        self.__document.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
