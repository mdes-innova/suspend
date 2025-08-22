"""View module for user app."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsAdminOnlyUser
from core.models import User, ISP
from django.contrib.auth import get_user_model
from .serializer import UserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        else:
            return super().get_permissions()
    
    def perform_update(self, serializer):
        inst_user = serializer.instance
        user = self.request.user
        if user != inst_user and not user.is_superuser:
            raise PermissionDenied("You are not allowed to update this user.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user != instance and not user.is_superuser:
            raise PermissionDenied("You are not allowed to delete this user.")
        instance.delete()
    
    @action(
        detail=True,
        methods=['post'],
        url_path='update-user'
    ) 
    def update_user(self, request, pk=None):
        user_model = get_user_model()
        try:
            user = user_model.objects.get(id=pk)
        except user_model.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            me = request.user
            if user != me and not getattr(me, "is_superuser", False):
                raise PermissionDenied("You are not allowed to update this user.") 

            serializer = UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            password = serializer.validated_data.pop("password", None)
            for attr, value in serializer.validated_data.items():
                setattr(user, attr, value)

            if password:
                user.set_password(password)

            user.save()
            return Response(UserSerializer(user).data)
        except Exception as e:
            print(e)
            return Response({'error': 'Update user fail.'},
                            status.HTTP_400_BAD_REQUEST)
            
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
                
    @action(
        detail=False,
        methods=['get'],
        url_path='by-isp/(?P<ispid>[^/]+)'
    )
    def by_isp(self, request, ispid=None):
        isp_id = ispid
        if not isp_id:
            return Response({'error': 'Not found isp id list.'},
                            status.HTTP_400_BADREQUEST)
        users_data = [] 
        try:
            isp = ISP.objects.get(id=isp_id)
            users = get_user_model().objects.filter(isp=isp)\
                .order_by('id')
            users_data = UserSerializer(users, many=True).data
            return Response(users_data)
        except ISP.DoesNotExist:
            return Response({'error': 'Isp not found.'},
                            status.HTTP_400_BADREQUEST)
        except Exception:
            return Response({'error': 'Get users fail.'},
                            status.HTTP_400_BADREQUEST)