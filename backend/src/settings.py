import os
from pathlib import Path
import time

CUR_PATH = os.path.dirname(os.path.realpath(__file__))  
LOG_PATH = os.path.join(os.path.dirname(CUR_PATH), 'logs') # LOG_PATH是存放日志的路径
if not os.path.exists(LOG_PATH): os.mkdir(LOG_PATH)  # 如果不存在这个logs文件夹，就自动创建一个

# Build paths inside the project like this: BASE_DIR / 'subdir'.
from .config import config

BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config['debug']

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'src.base',
    'src.account',
    'src.qa',
    'src.fform',

    'minio_storage',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'src.base.my_middleware.TokenSessionMiddleware',
    'src.base.my_middleware.DefaultTimezoneMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'src.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'src.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    'default': config['db_default'],
}

# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# logger config
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        # 日志格式
        'standard': {
            'format': '[%(asctime)s] [%(filename)s:%(lineno)d] [%(module)s:%(funcName)s] '
                      '[%(levelname)s]- %(message)s'},
        'simple': {  # 简单格式
            'format': '%(levelname)s %(message)s'
        },
    },
    # 过滤
    'filters': {
    },
    # 定义具体处理日志的方式
    'handlers': {
        # 默认记录所有日志
        'default': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_PATH, 'all-{}.log'.format(time.strftime('%Y-%m-%d'))),
            'maxBytes': 1024 * 1024 * 5,  # 文件大小
            'backupCount': 5,  # 备份数
            'formatter': 'standard',  # 输出格式
            'encoding': 'utf-8',  # 设置默认编码，否则打印出来汉字乱码
        },
        # 输出错误日志
        'error': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_PATH, 'error-{}.log'.format(time.strftime('%Y-%m-%d'))),
            'maxBytes': 1024 * 1024 * 5,  # 文件大小
            'backupCount': 5,  # 备份数
            'formatter': 'standard',  # 输出格式
            'encoding': 'utf-8',  # 设置默认编码
        },
        # 控制台输出
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'standard'
        },
        # 输出info日志
        'info': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_PATH, 'info-{}.log'.format(time.strftime('%Y-%m-%d'))),
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 5,
            'formatter': 'standard',
            'encoding': 'utf-8',  # 设置默认编码
        },
    },
    # 配置用哪几种 handlers 来处理日志
    'loggers': {
        # 类型 为 django 处理所有类型的日志， 默认调用
        'django': {
            'handlers': ['default', 'console'],
            'level': 'INFO',
            'propagate': False
        },
        # log 调用时需要当作参数传入
        'log': {
            'handlers': ['error', 'info', 'console', 'default'],
            'level': 'INFO',
            'propagate': True
        },
    }
}
LOGS_DIR = '/data/logs/'

# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'en-us'
# LANGUAGE_CODE = 'zh-CN'

USE_I18N = True

USE_TZ = False
TIME_ZONE = 'PRC'

AUTH_USER_MODEL = 'account.Account'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = 'django_static/'
STATIC_ROOT = '/django_static/'

STORAGES = {
    # ...
    "minio": {
        "BACKEND": "minio_storage.storage.MinioMediaStorage",
        "OPTIONS": {},
    },
}

MINIO_STORAGE_ENDPOINT = config['minio']['endpoint']
MINIO_STORAGE_ACCESS_KEY = config['minio']['access_key']
MINIO_STORAGE_SECRET_KEY = config['minio']['secret_key']
MINIO_STORAGE_USE_HTTPS = False
MINIO_STORAGE_MEDIA_OBJECT_METADATA = {"Cache-Control": "max-age=1000"}
MINIO_STORAGE_MEDIA_BUCKET_NAME = 'local-media'
MINIO_STORAGE_MEDIA_BACKUP_BUCKET = 'Recycle Bin'
MINIO_STORAGE_MEDIA_BACKUP_FORMAT = '%c/'
MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
MINIO_STORAGE_MEDIA_USE_PRESIGNED = True
MINIO_STORAGE_AUTO_CREATE_MEDIA_POLICY = 'NONE'
MINIO_STORAGE_STATIC_BUCKET_NAME = 'local-static'
MINIO_STORAGE_AUTO_CREATE_STATIC_BUCKET = True

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# 测试运行方式
TEST_RUNNER = 'snapshottest.django.TestRunner'

# 自定义的token与session机制

SESSION_TOKEN_HEADER_NAME = 'Authorization'
SESSION_TOKEN_QUERY_NAME = 'token'