""" Core app models. """
from django.contrib.auth.models import (
        AbstractBaseUser, PermissionsMixin, BaseUserManager
    )
from django.db import models
from django.core.validators import RegexValidator
from core.models.isp import ISP


username_validator = RegexValidator(
    regex=r'^[a-zA-Z0-9_]+$',
    message="Username can only contain letters, numbers," +
    " and underscores. No spaces or special characters."
)


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.full_clean()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username=username,
                                password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    username = models.CharField(
        max_length=150,
        unique=True,
        null=True,
        validators=[username_validator],
    )
    isp = models.ForeignKey(
        ISP,
        on_delete=models.SET_NULL,
        related_name='users',
        null=True,
        default=None,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.username or 'Unnamed User'
