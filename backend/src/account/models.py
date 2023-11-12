from django.apps import apps
from django.contrib.auth.hashers import make_password
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

from src.base.models import BaseModel

class AccountManager(UserManager):
    def _create_user(self, username, email, password, **extra_fields):
        """
        自定义的创建用户，覆盖了之前错误的email处理
        Create and save a user with the given username, email, and password.
        """
        if not username:
            raise ValueError("The given username must be set")
        email = email and self.normalize_email(email) or None
        # Lookup the real model class from the global app registry so this
        # manager method can be used in migrations. This is fine because
        # managers are by definition working on the real model.
        GlobalUserModel = apps.get_model(
            self.model._meta.app_label, self.model._meta.object_name
        )
        username = GlobalUserModel.normalize_username(username)
        user = self.model(username=username, email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user
    pass


class Account(BaseModel, AbstractUser):

    objects = AccountManager()

    avatar_url = models.CharField(max_length=255, null=True)
    nickname = models.CharField(max_length=255, default='')
    mini_id = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(null=True, unique=True, default=None)
    class_name = models.EmailField(null=True, default=None)

    MALE = 'MALE'
    FEMALE = 'FEMALE'
    OTHER = 'OTHER'
    SEX_DICT = {
        MALE: '男',
        FEMALE: '女',
        OTHER: '其他',
    }
    sex = models.CharField(
        max_length=255,
        choices=SEX_DICT.items(),
        null=True,
    )

    desc = models.TextField()


class Platform(BaseModel):
    title = models.CharField('站点名称', max_length=255)
    host = models.CharField('域名', max_length=255)
    logo = models.CharField('logo', max_length=255)
    wx_appid = models.CharField(max_length=255)
    wx_appsecret = models.CharField(max_length=255)
    qdrant_collection_name = models.CharField(max_length=255)

    as_default = models.BooleanField('是否作为无法匹配的默认配置')
