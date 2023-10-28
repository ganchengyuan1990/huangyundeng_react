from typing import Union

from django.contrib.sessions.models import Session
from django.http import HttpRequest

from src.account.models import Account


class Request(HttpRequest):
    """
    不做实际使用，仅供IDE代码提示
    """
    user: Union[Account]
    session: Session
