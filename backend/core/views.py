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
from django.contrib.auth import get_user_model
import os
import requests
from django.utils.dateparse import parse_date
import urllib.parse


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
        query_params = request.query_params
        state = query_params.get('state', '/')
        code = query_params.get('code', '')
        try:
            if not code:
                return Response({'errror': 'Invalid ThaiID authentication'},
                                status.HTTP_400_BAD_REQUEST)

            authorization = os.environ.get('THAIID_AUTH')
            grant_type = "authorization_code"
            redirect_uri = os.environ.get('THAIID_CALLBACK')
            url = os.environ.get('THAIID_ENDPOINT')

            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {authorization}"
                }

            payload = {
                "grant_type": grant_type,
                "code": code,
                "redirect_uri": redirect_uri
            }

            r = requests.post(
                url if url else '',
                headers=headers,
                data=payload,
                )

            data = r.json()
            given_name = data.get('given_name', None)
            family_name = data.get('family_name', None)
            birthdate = data.get('birthdate', None)
            birthdate_d = parse_date(birthdate)

            user = get_user_model().objects.get(
                given_name=given_name,
                family_name=family_name,
                birthdate=birthdate_d
            )
            new_refresh = RefreshToken.for_user(user)
            new_access = new_refresh.access_token
            if state:
                resp = redirect(state)
            else:
                resp = redirect("/")
            
            resp.set_cookie(
                key="access",
                value=str(new_access),
                max_age=int(60*4.5),
                path="/",
                secure=True,
                httponly=True,
                samesite="Lax"
            )
            resp.set_cookie(
                key="refresh",
                value=str(new_refresh),
                max_age=int(60*60*23.9),
                path="/",
                secure=True,
                httponly=True,
                samesite="Lax"
            )
            return resp
        except:
            if not state:
                resp = redirect("/login/?pathname=" +
                                urllib.parse.quote(state, safe=""))
            else:
                resp = redirect("/login")
            return resp
