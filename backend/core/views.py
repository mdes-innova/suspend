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
        try:
            query_params = request.query_params
            code = query_params.get('code', None)
            state = query_params.get('state', '/')

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
                url,
                headers=headers,
                data=payload,
                )

            data = r.json()
            given_name = data.get('given_name', None)
            family_name = data.get('family_name', None)
            birthdate = data.get('birthdate', None)

            user = get_user_model().objects.get(username='admin') if\
                given_name == 'อานนท์' and family_name == 'สงมูลนาค' and '1993-04-11'\
                    else None
            
            new_refresh = RefreshToken.for_user(user)
            new_access = new_refresh.access_token
            # user = ...  # your logic here
            # user = request.user
            # user = get_user_model().objects.get(username='admin')

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
            if state:
                resp = redirect(state)
            else:
                resp = redirect("/")
            
            resp.set_cookie(
                key="access",
                value=str(new_access),
                max_age=60 * 4.5,
                path="/",
                secure=True,
                httponly=True,
                samesite="Lax"
            )
            resp.set_cookie(
                key="refresh",
                value=str(new_refresh),
                max_age=60 * 60 * 23.9,
                path="/",
                secure=True,
                httponly=True,
                samesite="Lax"
            )
            return resp
        except:
            if not state:
                resp = redirect("/login/?pathname=" + urllib.parse.quote(state, safe=""))
            else:
                resp = redirect("/login")
            return resp