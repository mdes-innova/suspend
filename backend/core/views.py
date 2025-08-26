from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from decouple import config
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.views import APIView
from django.db import transaction
from decouple import config
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
from django.shortcuts import redirect


def current_time_view(request):
    now = timezone.now().date()
    return JsonResponse({'current_date': now.isoformat()})


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = TokenObtainPairSerializer

    def get_permissions(self):
        return super().get_permissions()


class ThaiIdView(APIView):
    """
    Mint a fresh refresh token for `user` and revoke ALL previous ones.
    Replace `AllowAny` and the user resolution with your condition/callback logic.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        resp = redirect("/")
        # user = ...  # your logic here

        # with transaction.atomic():
            # 2) Mint a brand-new refresh token (and its paired access)
            # new_refresh = RefreshToken.for_user(user)
            # new_access = new_refresh.access_token
            # current_jti = str(new_refresh["jti"])

            # 3) Blacklist all older refresh tokens for this user
            #    (keep the freshly-created one valid)
            # for t in OutstandingToken.objects.filter(user=user).exclude(jti=current_jti):
                # idempotent: get_or_create avoids duplicate blacklist rows
                # BlacklistedToken.objects.get_or_create(token=t)

        # 4) Return or set as cookies (example returns JSON)
        # return Response(
        #     {"refresh": str(new_refresh), "access": str(new_access)},
        #     status=status.HTTP_200_OK,
        # )

        # return Response({'data': 'Hi there!'})
        return resp