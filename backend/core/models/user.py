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
        if extra_fields.get('thaiid'):
            if not (extra_fields.get('given_name') and
                    extra_fields.get('family_name') and
                    extra_fields.get('birthdate')):
                raise ValueError('ThaiID user needs given_name ' +
                                 'family_name and birthdate.')
        elif not extra_fields.get('thaiid'):
            if not username:
                raise ValueError('Username is required.')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.full_clean()
        if not extra_fields.get('thaiid'):
            for k in ('given_name', 'family_name', 'birthdate'):
                extra_fields[k] = None
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
        blank=True,
        validators=[username_validator],
    )
    isp = models.ForeignKey(
        ISP,
        on_delete=models.SET_NULL,
        related_name='users',
        null=True,
        default=None,
        blank=True,
    )
    given_name = models.CharField(max_length=50, null=True,
                                  blank=True, default=None)
    family_name = models.CharField(max_length=50, null=True,
                                   blank=True, default=None)
    birthdate = models.DateField(null=True, default=None, blank=True)
    thaiid = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email = models.EmailField(blank=True, null=True, unique=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['given_name', 'family_name', 'birthdate'],
                                    name='unique_given_name_family_name_birthdate'),
        ]

    def __str__(self):
        if (self.given_name and self.family_name):
            return f"{self.given_name} {self.family_name}"
        if self.username:
            return self.username
        return f"User {self.id}"

    def clean(self):
        super().clean()
        if self.username == "":
            self.username = None
