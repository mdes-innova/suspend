from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
import os
from datetime import datetime, timedelta, time
from zoneinfo import ZoneInfo
from rest_framework_simplejwt.tokens import RefreshToken


class FixedExpiryRefreshToken(RefreshToken):
    def set_exp(self, from_time=None, lifetime=None):
        tz = ZoneInfo("Asia/Bangkok")
        from_time = from_time or datetime.now(tz)

        cutoff = datetime.combine(
            from_time.date() + timedelta(days=1),
            time.min,
            tzinfo=tz
        )

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
        elif not user.is_staff:
            raise AuthenticationFailed(
                "Your account isn't allowed to sign in.", code="authorization")
        return data
