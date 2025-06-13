""" Admin module for core app. """
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (
    User,
    Document, DocumentFile,
    Tag,
    Category,
    Link,
    ISP,
    Group, GroupDocument,
    Activity
)


class UserAdmin(BaseUserAdmin):
    ordering = ['id']
    list_display = ['username']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'is_active',
                       'is_staff', 'is_superuser'),
        }),
    )


admin.site.register(User, UserAdmin)

admin.site.register(Document)
admin.site.register(DocumentFile)
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(ISP)
admin.site.register(Link)
admin.site.register(Group)
admin.site.register(GroupDocument)
admin.site.register(Activity)
