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
        try:
            isps = ISP.objects.filter(id__in=isp_ids)
            users = get_user_model().objects.filter(isp__in=isps)\
                .order_by('id')
            users_data = UserSerializer(users, many=True).data
            return Response(users_data)
        except Exception:
            return Response({'error': 'Get users fail.'},
                            status.HTTP_400_BADREQUEST)
                