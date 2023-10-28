from typing import List

from django.contrib.auth import logout
from django.contrib.sessions.models import Session
from django.middleware.csrf import get_token
from ninja import Router, Schema

from src.account.account_service import AccountService
from src.account.models import Account
from src.account.serializers import AccountSerializer
from src.base.request_defined import Request
from src.utils.api import ApiResponse, ApiResponseResultCode, UserException
from src.utils.wx.wxauth import code2session

router = Router()


@router.get('/base', auth=None)
def account_base(request: Request):
    """ 获取站点基本信息 """
    return ApiResponse.success(csrf_token=get_token(request))


class LoginIn(Schema):
    code: str

class LoginOut(ApiResponse):
    account: AccountSerializer
    sessionid: str

@router.post('/login', auth=None, response=LoginOut)
def account_login(request: Request, data: LoginIn):
    """ 登录 """
    openid = request.headers.get('X-Wx-Openid')
    if not openid:
        session_key, openid = code2session(data.code)
    if openid is None:
        raise UserException('login failed', ApiResponseResultCode.PARAM_ERROR)
    account = AccountService.login_or_register_by_openid(request, openid)
    session: Session = request.session
    return ApiResponse.success(account=account, sessionid=session.session_key)


@router.post('/logout')
def account_logout(request: Request):
    """ 退出登录 """
    logout(request)
    return ApiResponse.success()


class MyInfoOut(ApiResponse):
    account: AccountSerializer

@router.get('/my-info', response=MyInfoOut)
def account_my_info(request: Request):
    """ 获取我的信息 """
    account: Account = request.user
    return ApiResponse.success(account=account)


class UpdateInfoIn(Schema):
    update_keys: List[AccountService.UpdateInfoKeys]
    avatar_url: str = None
    nickname: str = None
    sex: str = None
    email: str = None
    class_name: str = None
    desc: str = None

@router.post('/my-info')
def account_update_my_info(request: Request, data: UpdateInfoIn):
    """ 设置我的信息 """
    account: Account = request.user
    AccountService.update_info(account, data.update_keys, data.dict())
    return ApiResponse.success()

