import os
from distutils.util import strtobool
from typing import Dict

from dotenv import load_dotenv

from src.account.models import Platform

load_dotenv()

config = {
    'debug': True,
    'site_url': 'http://localhost:8000/',
    'SECRET_KEY': 'django-insecure-^leio-ylom9bh^d*$zil_x6(shm#)95&dc@yd#g61ao=rqd5eo',
    'db_default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'fangxt',
        'USER': 'postgres',
        'PASSWORD': '123456',
        'HOST': '127.0.0.1',
        'PORT': '23001',
    },
    'qdrant': {
        'url': "127.0.0.1",
    },
}


def get_platform(mini_id: str) -> Platform:
    """ 获取平台对应的配置信息 """
    platforms = Platform.objects.all()
    default_platform = None
    for platform in platforms:
        if platform.host == mini_id or platform.wx_appid == mini_id:
            return platform
        if platform.as_default:
            default_platform = platform
    else:
        return default_platform



def _merge_envs(config: Dict, prefix: str = None) -> None:
    """
    合并环境变量和配置文件

    For example, a config.ymal file:

        celery_backend: 'db+postgresql://postgres:postgres@postgres:5432/celery'

        rabbitmq:
          host: rabbitmq
          port: 5672

    An env named CELERY_BACKEND will override celery_backend, and an env named RABBITMQ_PORT will
    override rabbitmq[port]

    Avoid:
        a:
          b: 1

        a_b: 2

    The env names of above are the same A_B
    """
    for k, v in config.items():
        if k == 'version':
            continue
        if prefix is None:
            env_name = str(k).upper()
        else:
            env_name = "{}_{}".format(prefix, str(k).upper())
        if isinstance(v, dict):
            _merge_envs(v, prefix=env_name)
            continue
        env_value = os.getenv(env_name)
        if not env_value:
            continue
        if isinstance(v, list):
            # TODO: convert type
            config[k] = list(filter(bool, env_value.split(',')))
            continue
        try:
            klass = type(config[k])
            if klass == bool:
                config[k] = bool(strtobool(env_value))
            else:
                config[k] = klass(env_value)
        except Exception:
            config[k] = env_value


# 合并外部环境，更新config
_merge_envs(config)
