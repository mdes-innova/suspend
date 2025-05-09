"""View module for user app."""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from core.models import User
from .serializer import UserSerializer
from .permissions import IsAdminOrStaff, IsActiveUser
from rest_framework.decorators import action
from rest_framework.response import Response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        match self.action:
            case 'retrieve' | 'me':
                return [IsAuthenticated(), IsActiveUser()]
            case _:
                return [IsAuthenticated(), IsAdminOrStaff(), IsActiveUser()]

    @action(
        detail=False,
        methods=['get'],
        name='user-me'
    )
    def me(self, request):
        """Return the authenticated user's information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
