from django.http import HttpResponseNotFound
from core.models import RequestLog


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            # Skip static/media requests
            if not request.path.startswith(('/static/', '/media/')):
                RequestLog.objects.create(
                    path=request.path,
                    method=request.method,
                    user=request.user if request.user.is_authenticated else None,
                    ip_address=get_client_ip(request),
                )
        except Exception as e:
            # Optional: log this to console or file logger
            print(f"[LOGGING FAILED] {e}")
            return HttpResponseNotFound("Resource not found")

        # Logging succeeded → continue to view
        return self.get_response(request)
