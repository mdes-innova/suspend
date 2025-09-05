from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
import os
from datetime import datetime, timedelta, time
from zoneinfo import ZoneInfo
from rest_framework_simplejwt.tokens import RefreshToken


class FixedExpiryRefreshToken(RefreshToken):
    def set_exp(self, from_time=None, lifetime=None):
        tz = ZoneInfo("Asia/Bangkok")
        now = datetime.now(tz)

        next_day = now.date() + timedelta(days=1)
        cutoff = datetime(next_day.year, next_day.month, next_day.day, 0, 0, 0, tzinfo=tz)

        self.payload["exp"] = int(cutoff.timestamp())

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return FixedExpiryRefreshToken.for_user(user)

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if os.environ.get('LOGIN_OPTIONS', 'normal') == 'thaiid' and not\
                getattr(user, "thaiid", False):
            raise AuthenticationFailed(
                "Your account isn't allowed to sign in.", code="authorization")
        elif getattr(user, 'isp', None):
            raise AuthenticationFailed(
                "Your account isn't allowed to sign in.", code="authorization")
        return data
