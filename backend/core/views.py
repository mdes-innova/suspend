from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from .models import ISPActivity
from decouple import config


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            # Log or modify error response here if needed
            raise

        user = serializer.user
        isp = getattr(user, 'isp', None)
        ip_address = request.data.get('ip_address')

        try:
            ISPActivity.objects.create(
                user=user,
                activity='login',
                ip_address=ip_address,
                path=config('POSTGRES_DB', default='https://localhost:3000') +
                '/login',
                isp=isp
            )
        except Exception:
            raise
        data = serializer.validated_data

        return Response(data, status=status.HTTP_200_OK)
