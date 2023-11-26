import hashlib
from typing import List

import qiniu
from django.contrib.auth import logout
from django.contrib.sessions.models import Session
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from src.account.account_service import AccountService
from src.account.models import Account
from src.account.serializers import AccountSerializer
from src.base.request_defined import Request
from src.account.utils import get_platform
from src.config import config
from src.fform.models import Form, FormFile
from src.utils.api import ApiResponse, ApiResponseResultCode, UserException
from src.utils.wx.wxauth import code2session

router = Router()


@router.get('/upload-token')
def 上传form图片的token(request: Request, form_id: str):
    bucket_name = config['qiniu']['obj_bucket']
    q = qiniu.Auth(config['qiniu']['ak'], config['qiniu']['sk'])
    form = get_object_or_404(Form, id=form_id)

    # 上传策略，仅图片
    policy = {
        'forceSaveKey': True,
        'saveKey': 'fform/$(year)$(mon)/$(day)/$(hour)$(min)/$(etag)',
        "mimeLimit": 'image/*',
        'callbackUrl': config['site_url'] + 'api/base/img/upload-callback',
        'callbackBody': f'{"qiniu_key":"$(key)","fprefix":"$(fprefix)","form_id":{form.id}}',
        'callbackBodyType': 'application/json',
    }
    token = q.upload_token(bucket_name, None, 3600, policy)

    return ApiResponse.success(token=token)


class FormFileUploadCallbackIn(Schema):
    fprefix: str
    qiniu_key: str
    form_id: str

class FormFileUploadCallbackOut(ApiResponse):
    form_file_id: str
    private_url: str

@router.get('/upload-callback', auth=None, response=FormFileUploadCallbackOut)
def 处理上传的文件(request: Request, data: FormFileUploadCallbackIn):
    q = qiniu.Auth(config['qiniu']['ak'], config['qiniu']['sk'])
    bucket_host = config['qiniu']['obj_host']
    problem_file_url = f'http://{bucket_host}/{data.qiniu_key}'
    private_url = q.private_download_url(problem_file_url, expires=3600)

    form = get_object_or_404(Form, id=data.form_id)
    form_file = FormFile()
    form_file.form = form
    form_file.fname = data.fprefix
    form_file.key = data.qiniu_key
    form_file.in_use = True
    form_file.save()

    return ApiResponse.success(form_file_id=form_file.id, private_url=private_url)


