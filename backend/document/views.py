import os
import sys
import xml.etree.ElementTree as ET
import fitz
from core.models import (Document, Group,
                         GroupDocument, DocumentFile)
from .serializer import (
    DocumentSerializer,
    DocumentFileSerializer
    )
from rest_framework import (
    viewsets
)
from django.http import FileResponse
from rest_framework.decorators import action
from tag.serializer import TagSerializer
from category.serializer import CategorySerializer
from group.serializer import GroupSerializer
from url.serializer import UrlSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.cache import cache
import httpx
from datetime import datetime
from django.db.models import Prefetch
from django.http import HttpResponse
from core.utils import gen_xlsx_bytes, get_urls
from pathlib import Path
from urllib.parse import quote


class DocumentView(viewsets.ModelViewSet):
    """Document view."""
    serializer_class = DocumentSerializer
    queryset = Document.objects.all().order_by('-order_id')

    @action(
        detail=False,
        methods=['POST'],
        url_path='document-list'
    )
    def document_list(self, request):
        ids_param = request.data.get('ids', [])
        documents = Document.objects.filter(id__in=ids_param)

        return Response(DocumentSerializer(documents, many=True).data)

    @action(detail=True, methods=['get'])
    def tags(self, request, pk=None):
        """Return tags for a specific document with id."""
        document = self.get_object()
        tags = document.tags.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def urls(self, request, pk=None):
        """Return urls for a specific document with id."""
        document = self.get_object()
        urls = document.urls.all()
        serializer = UrlSerializer(urls, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['post'],
        name='document-file-upload',
        url_path='file-upload'
    )
    def file_upload(self, request, pk=None):
        document = self.get_object()
        file_obj = request.FILES.get("file")
        file_bytes = file_obj.read()
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            file_data = doc.embfile_get(0)
            xml_string = file_data.decode("utf-8")
            ns = {'ns': 'https://www.w3schools.com'}
            root = ET.fromstring(xml_string)
            order_data = root.find('ns:OrderData', ns)

            domain_list = order_data.find('ns:DomainList', ns)
            domains = [d.text for d in domain_list.findall('ns:Domain', ns)]

            if not len(domains):
                raise Exception("Empty urls.")
        except Exception as e:
            if str(e) == "'0' not in EmbeddedFiles array.":
                return Response({"error": "Not found urls."}, status=400)
            elif str(e) == "Empty urls.":
                return Response({"error": "Empty urls."}, status=400)
            else:
                return Response({"error": "Invalid PDF"}, status=400)
        serializer = DocumentFileSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(document=document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(
        detail=False,
        methods=['post'],
        url_path='pdf-upload'
    )
    def pdf_upload(self, request, pk=None):
        file_obj = request.FILES.get("file")
        try:
            document_file = DocumentFile.objects.create(
                original_name=file_obj.name,
                file=file_obj
            )
            serializer_data = DocumentFileSerializer(document_file).data
            return Response({
                'id': serializer_data['id'],
                'name': serializer_data['original_name'],
                },
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": "Cannot upload file."}, status=400)
    
    @action(
        detail=False,
        methods=['get'],
        url_path='pdf-download/(?P<did>[^/]+)'
    )
    def pdf_download(self, request, did=None):
        try:
            document = Document.objects.get(id=did)
        except Document.DoesNotExist:
            return Response({'detail': "Document not available"},
                            status.HTTP_404_NOT_FOUND)
        except:
            return Response({'detail': "File not available"},
                            status.HTTP_404_NOT_FOUND)
        else:
            document_file = document.document_file\
                if hasattr(document, 'document_file') else None
            
            if document_file:
                f = document_file.file
                if f:
                    return FileResponse(
                        f.file.open('rb'),
                        as_attachment=True,
                        filename=str(document.order_filename),
                        content_type='application/pdf'
                    )
                else:
                    raise Exception("No file found")
            else:
                try:
                    filename = document.order_filename
                    bearer_token = os.environ.get("WEBD_TOKEN")
                    webd_url = os.environ.get("WEBD_URL")
                    res = httpx.post(
                        f'{webd_url}/api/courtorderdownload',
                        headers={
                            'Authorization': f'Bearer {bearer_token}',
                            'Content-Type': 'application/json'
                        },
                        json={
                            'filename': filename
                        }
                    )
                    if (res.status_code != 200):
                        return Response({'detail': "Get a file from webD fail."},
                                        status.HTTP_404_NOT_FOUND)
                    
                    resp = HttpResponse(
                        res.content,
                        content_type=res.headers.get('Content-Type', 'application/octet-stream'),
                        status=200,
                    )
                    resp['Content-Disposition'] = res.headers.get('Content-Disposition', f'attachment; filename="{filename}"')
                    if 'Content-Length' in res.headers:
                        resp['Content-Length'] = res.headers['Content-Length']
                    return resp
                except:
                    return Response({'detail': "File not available"},
                                    status.HTTP_404_NOT_FOUND)
    
    @action(
        detail=False,
        methods=['get'],
        url_path='urls-download/(?P<did>[^/]+)'
    )
    def urls_download(self, request, did=None):
        try:
            document = Document.objects.get(id=did)
        except Document.DoesNotExist:
            return Response({'detail': "Document not available"},
                            status.HTTP_404_NOT_FOUND)
        except:
            return Response({'detail': "File not available"},
                            status.HTTP_404_NOT_FOUND)
        else:
            xlsx_bytes = None
            document_file = document.document_file\
                if hasattr(document, 'document_file') else None
            
            filename = Path(document.order_filename) 
            filename = 'urls' + filename.stem + '.xlsx'
            if document_file:
                f = document_file.file
                if f:
                    filepath = f.path
                    urls = get_urls(filepath)
                    xlsx_bytes = gen_xlsx_bytes(urls, document.order_no)
                    resp = HttpResponse(
                        xlsx_bytes,
                        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
                    resp['Content-Disposition'] = f"attachment; filename*=UTF-8''{quote(filename)}"
                    resp['Content-Length'] = str(len(xlsx_bytes))
                    return resp
                else:
                    raise Exception("No file found")
            else:
                try:
                    filename = document.order_filename
                    bearer_token = os.environ.get("WEBD_TOKEN")
                    webd_url = os.environ.get("WEBD_URL")
                    res = httpx.post(
                        f'{webd_url}/api/courtorderdownload',
                        headers={
                            'Authorization': f'Bearer {bearer_token}',
                            'Content-Type': 'application/json'
                        },
                        json={
                            'filename': filename
                        }
                    )
                    if (res.status_code != 200):
                        return Response({'detail': "Get a file from webD fail."},
                                        status.HTTP_404_NOT_FOUND)
                    urls = get_urls(res.content, is_path=False) 
                    xlsx_bytes = gen_xlsx_bytes(urls, document.order_no)
                except Exception as e:
                    print(e)
                    return Response({'detail': "File not available"},
                                    status.HTTP_404_NOT_FOUND)
                else:
                    resp = HttpResponse(
                        xlsx_bytes,
                        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
                    resp['Content-Disposition'] = f"attachment; filename*=UTF-8''{quote(filename)}"
                    resp['Content-Length'] = str(len(xlsx_bytes))
                    return resp

    @action(
        detail=False,
        methods=['get'],
        name='document-file-download',
        url_path='file-download'
    )
    def file_download(self, request, pk):
        file_ext = request.query_params.get('ext', 'pdf')
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
        methods=['post'],
        url_path='clear-selection'
    )
    def clear_selection(self, request):
        user = request.user
        try:
            if user.is_staff:
                cache.set(f'selected-documents-user-{user.username}', {})
        except Exception as e:
            return Response({'error': str(e)},
                                status.HTTP_404_NOT_FOUND)
        return Response({'data': 'Selections cleared.'})

    @action(
        detail=False,
        methods=['get'],
    )
    def content(self, request):
        sorts = request.GET.getlist("sort")  
        decs = request.GET.getlist("decs")
        page = request.GET.get("page", '0')
        page_size = request.GET.get("pagesize", '20')
        q = request.GET.get("q", '')

        sort_keys = {
            'orderDate': 'order_date',
            'orderNo': 'order_no',
            'orderblackNo': 'orderblack_no',
            'orderredNo': 'orderred_no',
            'kindName': 'kind_name'
        }
        for_sorts = []
        for sort_i, sort in enumerate(sorts):
            if decs[sort_i] == 'true':
                for_sorts.append(f'-{sort_keys[sort]}')
            else:
                for_sorts.append(sort_keys[sort])
        qs = (
            Document.objects
            .all()
            .filter(order_no__icontains=q)
            .select_related('groupdocument__group')
            .order_by(*for_sorts)
        )
        page_qs = qs[int(page)*int(page_size): (int(page) + 1) * int(page_size)]
        serializer = self.get_serializer(page_qs, many=True)
        return Response({
            'total': len(qs),
            'data': serializer.data
            })

    @action(
        detail=False,
        methods=['patch'],
        url_path='by-group/(?P<gid>[^/]+)/remove',
        # name='document-category-by-title'
    )
    def remove_by_group(self, request, gid=None): 
        pass

    def get_permissions(self):
        match self.request.method:
            case 'GET':
                return [IsAuthenticated()]
            case _:
                return super().get_permissions()
    # @action(
    #     detail=True,
    #     methods=['get'],
    # )
    # def content_view(self, request, pk=None):
    #     doc = self.queryset.get(pk=pk)
    #     data = DocumentDetailSerializer(doc).data
