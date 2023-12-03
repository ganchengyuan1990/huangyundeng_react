from django.db import models

from src.account.models import Account, Platform
from src.base.models import BaseModel, BaseModelEnum


class FormInterface(BaseModel):
    name = models.CharField('表单名称', max_length=255)


class FormColumn(BaseModel):
    form_interface = models.ForeignKey(FormInterface, on_delete=models.CASCADE)
    key = models.CharField('key', max_length=255)
    name = models.CharField('name', max_length=255)
    tip = models.CharField('tip', max_length=255, null=True)
    class ValueType(BaseModelEnum):
        primary_string = 'primary_string'
        string = 'string'
        boolean = 'boolean'
        file = 'file'
    value_type = models.CharField(max_length=255, choices=ValueType.model_items(), default=ValueType.string)
    validator = models.JSONField('验证规则', default=dict())

    class Meta:
        unique_together = ('form_interface', 'key')


class Form(BaseModel):
    form_interface = models.ForeignKey(FormInterface, on_delete=models.CASCADE)

    class Status(BaseModelEnum):
        editing = 'editing'
        auditing = 'auditing'
        confirmed = 'confirmed'
    status = models.CharField(max_length=255, choices=Status.model_items(), default=Status.editing)


class FormFile(BaseModel):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    fname = models.CharField('文件原名', max_length=255, null=True)
    key = models.CharField('文件名', max_length=255)
    in_use = models.BooleanField('是否在用', default=True)

    def __str__(self):
        return f'{self.in_use} {self.fname}({self.key})'


class FormValue(BaseModel):
    form = models.ForeignKey(Form, related_name='values', on_delete=models.CASCADE)
    column = models.ForeignKey(FormColumn, on_delete=models.CASCADE)
    value_string = models.CharField(max_length=255, null=True)
    value_boolean = models.BooleanField(null=True)
    value_file = models.ForeignKey(FormFile, on_delete=models.CASCADE, null=True)


