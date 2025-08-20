"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView
)
from django.contrib import admin
from two_factor.admin import AdminSiteOTPRequired
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from two_factor.urls import urlpatterns as tf_urls
from core.views import CustomTokenObtainPairView, current_time_view

admin.site.__class__ = AdminSiteOTPRequired

urlpatterns = [
    path('api/current-time/', current_time_view, name='current_time'),
    path('api/f2a/', include(tf_urls)),  # replaces the login view with a 2FA flow
    path('api/admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),

    path('api/user/', include('user.urls')),
    path('api/document/', include('document.urls')),
    path('api/tag/', include('tag.urls')),
    path('api/section/', include('section.urls')),
    path('api/url/', include('url.urls')),
    path('api/category/', include('category.urls')),
    path('api/isp/', include('isp.urls')),
    path('api/group/', include('group.urls')),
    path('api/activity/', include('activity.urls')),
    path('api/mail/', include('mail.urls')),

    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='api-schema'),
        name='api-docs',
    )
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )