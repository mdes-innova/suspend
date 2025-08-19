"""View module for user app."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsAdminOnlyUser
from core.models import User, ISP
from django.contrib.auth import get_user_model
from .serializer import UserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        else:
            return super().get_permissions()
            
    @action(
        detail=False,
        methods=['get'],
        name='user-me'
    )
    def me(self, request):
        """Return the authenticated user's information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['post'],
        url_path='by-isps'
    )
    def by_isps(self, request):
        isp_ids = request.data.get('isp_ids', [])
        if not len(isp_ids):
            return Response({'error': 'Not found isp id list.'},
                            status.HTTP_400_BADREQUEST)
        users_data = [] 
        for isp_id in isp_ids:
            try:
                isp = ISP.objects.get(id=isp_id)
                user_s = get_user_model().objects.filter(isp=isp).order_by('id')
                user_data = UserSerializer(user_s, many=True).data
                users_data += user_data
                return Response(users_data)
            except ISP.DoesNotExist:
                return Response({'error': 'Invalid id list.'},
                                status.HTTP_400_BADREQUEST)
            except:
                return Response({'error': 'Get users fail.'},
                                status.HTTP_400_BADREQUEST)
                
