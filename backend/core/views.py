from .serializer import CustomTokenObtainPairSerializer
from .utils import get_tokens, set_cookies
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from django.http import JsonResponse
from django.contrib.auth import get_user_model
import os
import requests
from django.utils.dateparse import parse_date
import urllib.parse
from .permissions import IsAdminOrStaff
from rest_framework.exceptions import AuthenticationFailed

@api_view(['GET'])
@permission_classes([AllowAny])
def login_options_view(request):
    return Response({'login_options': os.environ.get('LOGIN_OPTIONS', 'normal')})

@api_view(['GET'])
@permission_classes([IsAdminOrStaff])
def set_tokens_view(request):
    user = request.user
    if not user:
        raise AuthenticationFailed(
            "User not found.", code="authorization")

    if os.environ.get('LOGIN_OPTIONS', 'normal') == 'thaiid' and not\
            getattr(user, "thaiid", False):
        raise AuthenticationFailed(
            "Your account isn't allowed to sign in.", code="authorization")
    elif getattr(user, 'isp', None):
        raise AuthenticationFailed(
            "Your account isn't allowed to sign in.", code="authorization")

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    response = JsonResponse({"access": str(access), "refresh": str(refresh)})
    response.set_cookie(
        key="access",
        value=str(access),
        max_age=int(60*4.5),
        path="/",
        secure=True,
        httponly=True,
        samesite="Lax"
    )
    response.set_cookie(
        key="refresh",
        value=str(refresh),
        max_age=int(60*60*7.95),
        path="/",
        secure=True,
        httponly=True,
        samesite="Lax"
    )

    return response


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class ThaiIdView(APIView):
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

            if not birthdate or not given_name or not family_name:
                raise Exception("Invalid ThaiID authentication")
            birthdate_d = parse_date(birthdate)

            user = get_user_model().objects.get(
                given_name=given_name,
                family_name=family_name,
                birthdate=birthdate_d
            )

            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            if state:
                resp = redirect(state)
            else:
                resp = redirect("/")
            
            resp.set_cookie(
                key="access",
                value=str(access),
                max_age=int(60*4.5),
                path="/",
                secure=True,
                httponly=True,
                samesite="Lax"
            )
            resp.set_cookie(
                key="refresh",
                value=str(refresh),
                max_age=int(60*60*7.95),
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
