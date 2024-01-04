import hashlib
from typing import List

from django.contrib.auth import logout
from django.contrib.sessions.models import Session
from django.http import Http404, HttpResponse
from django.middleware.csrf import get_token
from ninja import Router, Schema
from tencentcloud.common import credential
from tencentcloud.sts.v20180813 import sts_client, models as sts_models

from src.account.account_service import AccountService
from src.account.models import Account
from src.account.serializers import AccountSerializer
from src.base.request_defined import Request
from src.account.utils import get_platform
from src.config import config
from src.utils.api import ApiResponse, ApiResponseResultCode, UserException
from src.utils.wx.wxauth import code2session
from django.core.cache import caches, BaseCache

router = Router()


@router.get('/base', auth=None)
def account_base(request: Request, mini_id: str):
    """ 获取站点基本信息, mini_id可以是host或者小程序appid """
    config = get_platform(mini_id)
    return ApiResponse.success(
        csrf_token=get_token(request),
        title=config.title,
        showLogo=False,
    )


@router.get('/tencent-info', auth=None)
def tencent_info(request: Request, mini_id: str):
    """ 获取站点的腾讯云账号信息 """

    cache: BaseCache = caches['default']
    tmp_secret_id = cache.get('tencent_cloud:TmpSecretId')
    tmp_secret_key = cache.get('tencent_cloud:TmpSecretKey')
    tmp_secret_token = cache.get('tencent_cloud:Token')
    if not tmp_secret_id or not tmp_secret_key:
        # 请求临时key
        cred = credential.Credential(config['tencent_cloud']['secretid'], config['tencent_cloud']['secretkey'])
        client = sts_client.StsClient(cred, "ap-shanghai")

        req = sts_models.GetFederationTokenRequest()
        req.Name = 'aaa'
        req.Policy = '{"statement":[{"action":["asr:*"],"effect":"allow","resource":"*"}],"version":"2.0"}'
        req.Policy = '{"statement":[{"action":["name/asr:*"],"effect":"allow","resource":"*"}],"version":"2.0"}'
        req.DurationSeconds = 7200
        resp = client.GetFederationToken(req)
        tmp_secret_id = resp.Credentials.TmpSecretId
        tmp_secret_key = resp.Credentials.TmpSecretKey
        tmp_secret_token = resp.Credentials.Token
        cache.set('tencent_cloud:TmpSecretId', tmp_secret_id, 3600)
        cache.set('tencent_cloud:TmpSecretKey', tmp_secret_key, 3600)
        cache.set('tencent_cloud:Token', tmp_secret_token, 3600)

    return ApiResponse.success(
        appid=config['tencent_cloud']['appid'],
        secretid=tmp_secret_id,
        secretkey=tmp_secret_key,
        token=tmp_secret_token,
    )


class LoginIn(Schema):
    mini_id: str
    code: str = None
    web_code: str = None

class LoginOut(ApiResponse):
    account: AccountSerializer
    sessionid: str
    need_update_info: bool

@router.post('/login', auth=None, response=LoginOut)
def account_login(request: Request, data: LoginIn):
    """ 登录 """
    openid = request.headers.get('X-Wx-Openid')
    if not openid and data.code:
        session_key, openid = code2session(data.mini_id, data.code)
    if not openid and data.web_code:
        openid = data.web_code
    if openid is None:
        raise UserException('login failed', ApiResponseResultCode.PARAM_ERROR)
    account = AccountService.login_or_register_by_openid(request, data.mini_id, openid)
    session: Session = request.session
    return ApiResponse.success(account=account, sessionid=session.session_key, need_update_info=not account.avatar_url)


class UpLoginIn(Schema):
    username: str
    password: str

class UpLoginOut(ApiResponse):
    account: AccountSerializer
    sessionid: str

@router.post('/up-login', auth=None, response=UpLoginOut)
def account_up_login(request: Request, data: UpLoginIn):
    """ 用户名密码登录 """
    account = AccountService.login_by_username(request, data.username, data.password)
    if account:
        session: Session = request.session
        return ApiResponse.success(account=account, sessionid=session.session_key)
    else:
        raise UserException('用户名/密码错误', result_code=401)


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
    config = get_platform(appid)
    md5 = hashlib.md5()
    text = f'appid={appid}&nickname={nickname}&secret=e839e0365ed1f7&timestamp={timestamp}&userid={userid}'
    md5.update(text.encode('utf-8'))
    md5_hash = md5.hexdigest()
    if md5_hash != sign:
        raise UserException('sign error')
    return ApiResponse.success(url=f'https://{config.host}/?code=1234567890')

