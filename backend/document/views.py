import os
from core.models import Document, Activity, GroupDocument, DocumentFile
from .serializer import (
    DocumentDetailSerializer,
    DocumentSerializer,
    FileSerializer
    )
from rest_framework import (
    viewsets
)
from django.http import FileResponse
from rest_framework.decorators import action
from tag.serializer import TagSerializer
from category.serializer import CategorySerializer
from link.serializer import LinkSerializer
from rest_framework.response import Response
from rest_framework import status


class DocumentView(viewsets.ModelViewSet):
    """Document view."""
    queryset = Document.objects.all().order_by('-id')

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action == 'list':
            return DocumentSerializer
        elif self.action == 'file_upload':
            return FileSerializer
        return DocumentDetailSerializer

    def list(self, request, *args, **kwargs):
        user = request.user

        selected_qs = self.queryset.filter(groups__user=user).distinct()
        unselected_qs = self.queryset.exclude(groups__user=user).distinct()

        # Serialize and add `selected` flag
        selected_data = DocumentSerializer(selected_qs, many=True).data
        for item in selected_data:
            item['selected'] = True

        unselected_data = DocumentSerializer(unselected_qs, many=True).data
        for item in unselected_data:
            item['selected'] = False

        # Combine and sort by ID
        combined = selected_data + unselected_data
        combined_sorted = sorted(combined, key=lambda x: x['id'])

        return Response(combined_sorted)

    @action(detail=True, methods=['get'])
    def tags(self, request, pk=None):
        """Return tags for a specific document with id."""
        document = self.get_object()
        tags = document.tags.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-title/(?P<title>[^/]+)/tags',
        name='document-tags-by-title'
    )
    def tags_by_title(self, request, title=None):
        """Return tags for a specific document with title."""
        docs = Document.objects.filter(title__iexact=title)
        if not docs.exists():
            return Response({'detail': 'Document not found'},
                            status=status.HTTP_404_NOT_FOUND)

        serializers = []
        for doc in docs:
            serializers.append({'title': doc.title,
                                'created_at': doc.created_at,
                                'tags': TagSerializer(doc.tags.all(),
                                                      many=True).data})
        return Response(serializers)

    @action(detail=True, methods=['get'])
    def links(self, request, pk=None):
        """Return links for a specific document with id."""
        document = self.get_object()
        links = document.links.all()
        serializer = LinkSerializer(links, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-title/(?P<title>[^/]+)/links',
        name='document-links-by-title'
    )
    def links_by_title(self, request, title=None):
        """Return links for a specific document with title."""
        docs = Document.objects.filter(title__iexact=title)
        if not docs.exists():
            return Response({'detail': 'Document not found'},
                            status=status.HTTP_404_NOT_FOUND)

        serializers = []
        for doc in docs:
            serializers.append({'title': doc.title,
                                'created_at': doc.created_at,
                                'links': LinkSerializer(doc.links.all(),
                                                        many=True).data})
        return Response(serializers)

    @action(
        detail=False,
        methods=['get'],
        url_path='by-title/(?P<title>[^/]+)/category',
        name='document-category-by-title'
    )
    def category_by_title(self, request, title=None):
        """Get category by document's name view."""
        try:
            doc = Document.objects.get(title__iexact=title)
        except Document.DoesNotExist:
            return Response({'detail': 'Document does not exists.'},
                            status.HTTP_404_NOT_FOUND)

        return Response(CategorySerializer(doc.category).data)

    @action(
        detail=True,
        methods=['post'],
        name='document-file-upload',
        url_path='file-upload'
    )
    def file_upload(self, request, pk=None):
        document = self.get_object()
        serializer = FileSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(document=document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True,
        methods=['post'],
        name='document-file-download',
        url_path='file-download'
    )
    def file_download(self, request, pk):
        file_ext = request.data.get('ext')
        if not file_ext:
            file_ext = 'pdf'
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'detail': "Document not available"},
                            status.HTTP_404_NOT_FOUND)
        else:
            if len(DocumentFile.objects.filter(document=document)) == 0:
                return Response({'detail': "File not available"},
                                status.HTTP_404_NOT_FOUND)
            f = DocumentFile.objects.filter(
                document=document, file__iendswith='.' + file_ext)\
                .order_by('-id').first()
            if f:
                filename = f.file.name.split('/')[-1]
                return FileResponse(
                    f.file.open('rb'),
                    as_attachment=True,
                    filename=filename,
                    content_type=f'application/{file_ext}'
                )
            else:
                return Response({'detail': "File not available"},
                                status.HTTP_404_NOT_FOUND)

    @action(
        detail=False,
        methods=['get'],
    )
    def content(self, request):
        user = request.user
        data = DocumentSerializer(self.queryset, many=True).data
        for d in data:
            doc = self.queryset.get(pk=d['id'])
            files = (DocumentDetailSerializer(doc).data)['files']
            files = sorted(files, key=lambda x: x['id'], reverse=True)
            # pdf_file = None
            # xlsx_file = None
            # for f in files:
            #     _, fname = f['original_name']
            #     if not pdf_file and 'pdf' in fname:
            #         pdf_file = fname
            #     if not xlsx_file and ('xlsx' in fname or 'xls' in fname):
            #         xlsx_file = fname
            # d['pdf'] = pdf_file
            # d['xlsx'] = xlsx_file
            pdf_downloads = Activity.objects.filter(
                document=doc,
                activity='download',
                file__file__endswith='.pdf'
                )
            xlsx_downloads = Activity.objects.filter(
                document=doc,
                activity='download',
                file__file__endswith='.xlsx'
                )
            d['downloads'] = f'{len(pdf_downloads)}/{len(xlsx_downloads)}'
            try:
                GroupDocument.objects.get(document=doc, user=user)
                d['active'] = False
            except GroupDocument.DoesNotExist:
                d['active'] = True
            d['selected'] = False

        return Response(data)
    
    # @action(
    #     detail=True,
    #     methods=['get'],
    # )
    # def content_view(self, request, pk=None):
    #     doc = self.queryset.get(pk=pk)
    #     data = DocumentDetailSerializer(doc).data
