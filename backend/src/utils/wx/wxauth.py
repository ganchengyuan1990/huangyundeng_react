# coding=utf-8
"""
https://github.com/ws999/wx-app
@version: 2018/1/18 018
@author: Suen
@contact: sunzh95@hotmail.com
@file: wxauth
@time: 10:43
@note:  ??
"""

from __future__ import unicode_literals

import json

import requests

from src.account.models import Platform
from src.account.utils import get_platform
from src.utils.logger import logger

base_url = 'https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={code}&grant_type=authorization_code'


def code2session(mini_id: str, code: str):
    platform = get_platform(mini_id)
    url = base_url.format(appid=platform.wx_appid, secret=platform.wx_appsecret, code=code)
    try:
        resp = requests.post(url=url, timeout=3)
        content = json.loads(resp.content)
        assert content.get('openid')
    except ValueError:
        logger.error('failed: json loads code2session response error')
        return None, None
    except AssertionError:
        logger.error(f'failed: weixin code2session params error({content.get("errcode")}): {content.get("errmsg")}')
        return None, None
    except:
        logger.error('failed: weixin code2session remote error')
        return None, None
    else:
        logger.info('success: code2session')
        return content['session_key'], content['openid'],


if __name__ == '__main__':
    print(code2session(Platform.objects.get(as_default=True), "0114x0ml2tow494hmWkl2Sn7Xf04x0mE"))
