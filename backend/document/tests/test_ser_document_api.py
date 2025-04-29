"""Test for Document serializer API."""
import os
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