"""View module for user app."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from core.models import User
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
