from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from .models import Activity
from decouple import config
from django.http import JsonResponse
from django.utils import timezone


def current_time_view(request):
    now = timezone.now().date()
    return JsonResponse({'current_date': now.isoformat()})


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = TokenObtainPairSerializer

    def get_permissions(self):
        print(super().get_permissions())
        return super().get_permissions()

    def post(self, request, *args, **kwargs):
        ip_address = request.data.pop('ip_address', '')
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            raise

        user = serializer.user
        isp = getattr(user, 'isp', None)

        try:
            Activity.objects.create(
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
