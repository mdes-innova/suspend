from rest_framework import permissions

class IsAdminOrStaff(permissions.BasePermission):
    """
    Allows access only to staff or admin users.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )