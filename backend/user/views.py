"""View module for user app."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import User
from .serializer import UserSerializer
from .permissions import IsAdminOrStaff
from rest_framework.decorators import action
from rest_framework.response import Response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'retrieve':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrStaff()]

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        name='user-me'
    )
    def me(self, request):
        """Return the authenticated user's information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
