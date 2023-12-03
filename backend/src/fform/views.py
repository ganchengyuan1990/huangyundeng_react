from typing import Dict

import qiniu
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from src.base.request_defined import Request
from src.config import config
from src.fform.fform_service import FformService
from src.fform.models import Form, FormFile, FormValue, FormInterface
from src.utils.api import ApiResponse

router = Router()

class CreateFormIn(Schema):
    form_interface_id: int
    primary_column_key: str
    value: str

class CreateFormOut(Schema):
    form_id: int
    values: Dict

@router.post('/create-form', auth=None, response=CreateFormOut)
def 创建表单(request: Request, data: CreateFormIn):
    form_interface = get_object_or_404(FormInterface, id=data.form_interface_id)
    try:
        matched_value = FormValue.objects.get(
            form__status=Form.Status.editing,
            column__form_interface=form_interface,
            column__value_type='primary_string',
            column__key=data.primary_column_key,
            value_string=data.value,
        )
        form = matched_value.form
    except FormValue.DoesNotExist:
        form = Form()
        form.form_interface = form_interface
        form.status = Form.Status.editing
    form.save()
    form.refresh_from_db()

    FformService.upsert_form_values(form, { data.primary_column_key: data.value })
    values = FformService.form_to_values(form)

    return ApiResponse.success(form_id=form.id, values=values)

class GetFormOut(Schema):
    form_id: int
    values: Dict

@router.post('/get-form', auth=None, response=GetFormOut)
def 更新表单(request: Request, form_id: str):
    form = get_object_or_404(Form, id=form_id)
    values = FformService.form_to_values(form)
    return ApiResponse.success(form_id=form.id, values=values)


class UpsertFormIn(Schema):
    form_id: int
    values: Dict

class UpsertFormOut(Schema):
    form_id: int
    values: Dict

@router.post('/upsert-form', auth=None, response=UpsertFormOut)
def 更新表单(request: Request, data: UpsertFormIn):
    form = get_object_or_404(Form, id=data.form_id)
    FformService.upsert_form_values(form, data.values)
    values = FformService.form_to_values(form)

    return ApiResponse.success(form_id=form.id, values=values)


class FormSubmitAuditIn(Schema):
    form_id: int

@router.post('/form-submit-audit', auth=None)
def 表单提交审核(request: Request, data: FormSubmitAuditIn):
    form = get_object_or_404(Form, id=data.form_id)
    form.status = Form.Status.auditing
    form.save()
    return ApiResponse.success()


class FormChangeStatusIn(Schema):
    form_id: int
    target_status: Form.Status.for_ninjia_in()

@router.post('/form-submit-audit', auth=None)
def 表单修改状态(request: Request, data: FormChangeStatusIn):
    form = get_object_or_404(Form, id=data.form_id)
    form.status = data.target_status
    form.save()
    return ApiResponse.success()


@router.get('/upload-token', auth=None)
def 上传form图片的token(request: Request, form_id: str):
    bucket_name = config['qiniu']['obj_bucket']
    q = qiniu.Auth(config['qiniu']['ak'], config['qiniu']['sk'])
    form = get_object_or_404(Form, id=form_id)

    # 上传策略，仅图片
    policy = {
        'forceSaveKey': True,
        'saveKey': 'fform/$(year)$(mon)/$(day)/$(hour)$(min)/$(etag)',
        "mimeLimit": 'image/*',
        'callbackUrl': config['site_url'] + 'api/fform/upload-callback',
        'callbackBody': f'{{"qiniu_key":"$(key)","fprefix":"$(fprefix)","form_id":"{form.id}"}}',
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

@router.post('/upload-callback', auth=None, response=FormFileUploadCallbackOut)
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


