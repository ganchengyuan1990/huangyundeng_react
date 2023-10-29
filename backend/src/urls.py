"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
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
from django.contrib import admin
from django.http import HttpResponse, HttpRequest
from django.urls import path
from ninja import NinjaAPI
from ninja.errors import HttpError
from ninja.security import APIKeyQuery, APIKeyHeader

from src.utils.api import UserException, ApiResponse, ApiResponseResultCode
from src.qa.views import router as router_router
from src.account.views import router as account_router


class InvalidMethod(Exception):
    pass


class InvalidLogin(Exception):
    pass

# 以下两个都是兼容Ninja的模拟，实际验证在TokenSessionMiddleware和Django的AuthenticationMiddleware中

class FakeQueryAuth(APIKeyQuery):
    param_name = 'token'

    def authenticate(self, request: HttpRequest, key):
        return None


class FakeHeaderAuth(APIKeyHeader):
    param_name = 'Authorization'

    def authenticate(self, request: HttpRequest, key):
        if request.method not in ['OPTIONS', 'GET'] and not request._allow_post_method:
            # 想要发送post请求，只有 session_key_in_header 才可以
            # _allow_post_method 来自 TokenSessionMiddleware
            raise InvalidMethod('only get request can use query token')

        if not request.user.is_authenticated:
            raise InvalidLogin('not login')
        return request.user


api = NinjaAPI(auth=[FakeHeaderAuth(), FakeQueryAuth()])
api.add_router("/account/", account_router, tags=['account'])
api.add_router("/qa/", router_router, tags=['qa'])


@api.exception_handler(UserException)
def user_api_exception(request, e: UserException):
    return api.create_response(
        request,
        ApiResponse.error(e.result_code, e.msg),
        status=ApiResponseResultCode.PARAM_ERROR,
    )

@api.exception_handler(HttpError)
def http_exception(request, e: HttpError):
    return api.create_response(
        request,
        ApiResponse.error(e.status_code, str(e)),
        status=e.status_code,
    )

@api.exception_handler(InvalidLogin)
def http_exception(request, e: InvalidLogin):
    return api.create_response(
        request,
        ApiResponse.error(ApiResponseResultCode.AUTH_REQUIRE, str(e)),
        status=ApiResponseResultCode.AUTH_REQUIRE
    )

@api.exception_handler(InvalidMethod)
def http_exception(request, e: InvalidMethod):
    return api.create_response(
        request,
        ApiResponse.error(ApiResponseResultCode.NOT_ACCEPTABLE, str(e)),
        status=ApiResponseResultCode.NOT_ACCEPTABLE
    )


def healthy_check(request):
    return HttpResponse("0")

urlpatterns = [
    path('healthy-check', healthy_check),
    path('admin/', admin.site.urls),
    path("api/", api.urls),
]
