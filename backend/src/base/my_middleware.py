import zoneinfo
from importlib import import_module

from django.conf import settings
from django.core.handlers.wsgi import WSGIRequest
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin


class TokenSessionMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        super().__init__(get_response)
        engine = import_module(settings.SESSION_ENGINE)
        self.SessionStore = engine.SessionStore

    def process_request(self, request: WSGIRequest):
        request._allow_post_method = False
        session_key_in_header = request.headers.get(settings.SESSION_TOKEN_HEADER_NAME)
        session_key_in_query = request.GET.get(settings.SESSION_TOKEN_QUERY_NAME)
        if session_key_in_header:
            request.session = self.SessionStore(session_key_in_header)
            request._allow_post_method = True
        elif session_key_in_query:
            request.session = self.SessionStore(session_key_in_query)


class DefaultTimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        timezone.activate(zoneinfo.ZoneInfo('PRC'))
        return self.get_response(request)
