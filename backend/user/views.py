"""View module for user app."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.models import User
from .serializer import UserSerializer
from .permissions import IsAdminOrStaff

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'retrieve':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrStaff()]