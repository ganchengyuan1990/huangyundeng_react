from enum import Enum
from typing import Optional, Dict, List

from django.contrib.auth import login, authenticate
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, validate_email
from django.http import HttpRequest

from src.account.models import Account
from src.utils.api import UserException, ApiResponseResultCode


class AccountService(object):
    @staticmethod
    def login_or_register_by_openid(request: HttpRequest, mini_id: str, openid: str) -> Optional[Account]:
        """ openid注册 """
        account: Account = None
        try:
            account = Account.objects.filter(username=mini_id+openid).get()
        except Account.DoesNotExist:
            pass
        if not account:
            account = Account.objects.create_user(mini_id+openid, mini_id=mini_id, nickname='')
        login(request, account)
        return account

    @staticmethod
    def login(request: HttpRequest, account: Account):
        """ 用户对象直接登录 """
        login(request, account)

    @staticmethod
    def login_by_username(request: HttpRequest, username: str, password: str) -> Optional[Account]:
        """ 用户名或邮箱登录 """
        try:
            # 检查邮箱合法性，合法则为邮箱登录
            validate_email(username)
            account = authenticate(request, username=Account.objects.get(email=username).username, password=password)
        except:
            # 否则是用户名登录
            account = authenticate(request, username=username, password=password)
        if account is not None:
            login(request, account)
            return account
        else:
            return None

    class UpdateInfoKeys(Enum):
        nickname = 'nickname'
        sex = 'sex'
        email = 'email'
        class_name = 'class_name'
        desc = 'desc'
        avatar_url = 'avatar_url'

    @staticmethod
    def update_info(account: Account, update_keys: List[UpdateInfoKeys], update_values: Dict[UpdateInfoKeys, str]):
        """ 修改资料 """
        update_fields = []
        if AccountService.UpdateInfoKeys.nickname in update_keys:
            update_fields.append('nickname')
            account.nickname = update_values['nickname']
        if AccountService.UpdateInfoKeys.sex in update_keys:
            update_fields.append('sex')
            # 检查性别合法性
            if update_values['sex'] not in Account.SEX_DICT:
                raise UserException('sex not in choices', result_code=ApiResponseResultCode.AccountInfoForSex)
            account.sex = update_values['sex']
        if AccountService.UpdateInfoKeys.email in update_keys:
            update_fields.append('email')
            if update_values['email']:
                if len(update_values['email']) > 254:
                    raise UserException('too long', result_code=ApiResponseResultCode.AccountInfoForEmail)
                try:
                    # 检查邮箱合法性
                    validate_email(update_values['email'])
                except ValidationError as e:
                    raise UserException(e.message, result_code=ApiResponseResultCode.AccountInfoForEmail)
            account.email = update_values['email']
        if AccountService.UpdateInfoKeys.desc in update_keys:
            update_fields.append('desc')
            account.desc = update_values['desc']
        if AccountService.UpdateInfoKeys.class_name in update_keys:
            update_fields.append('class_name')
            account.class_name = update_values['class_name']
        if AccountService.UpdateInfoKeys.avatar_url in update_keys:
            update_fields.append('avatar_url')
            account.avatar_url = update_values['avatar_url']

        account.save(update_fields=update_fields)
