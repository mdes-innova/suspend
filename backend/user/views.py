"""View module for user app."""
from .serializer import UserSerializer, AuthenticationSerializer

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from django.http import HttpResponse


def HelloView(request):
    return HttpResponse("Hello world!")
    

class UserStatusView(APIView):

    def get(self, request):
        return Response({
            'is_authenticated': request.user.is_authenticated,
            'username': request.user.username,
        })


class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system."""
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class MangeUserView(generics.RetrieveUpdateAPIView):
    """Manage the authentication user."""
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        """Retrive and return the authenticated user."""
        return self.request.user
