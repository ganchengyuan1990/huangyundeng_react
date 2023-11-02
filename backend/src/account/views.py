import hashlib
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
def account_base(request: Request, mini_id: int):
    """ 获取站点基本信息 """
    if mini_id == 1:
        return ApiResponse.success(
            csrf_token=get_token(request),
            title='黄云登',
            showLogo=True,
        )
    return ApiResponse.success(
        csrf_token=get_token(request),
        title='房小通',
        showLogo=False,
    )


class LoginIn(Schema):
    code: str

class LoginOut(ApiResponse):
    account: AccountSerializer
    sessionid: str
    need_update_info: bool

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
    return ApiResponse.success(account=account, sessionid=session.session_key, need_update_info=not not account.avatar_url)


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


@router.get('/get-web-url', auth=None)
def 获取web版链接(request: Request, appid: str, sign: str, timestamp: int, nickname: str, userid: str):
    if appid == 'wx07755a85c868c35d':
        md5 = hashlib.md5()
        text = f'appid={appid}&nickname={nickname}&secret=e839e0365ed1f7&timestamp={timestamp}&userid={userid}'
        md5.update(text.encode('utf-8'))
        md5_hash = md5.hexdigest()
        if md5_hash != sign:
            raise UserException('sign error')
        return ApiResponse.success(url='https://huangshi.aichan.info/?code=1234567890')
    return ApiResponse.success()

