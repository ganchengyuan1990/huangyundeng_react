from typing import Dict, List

from ninja import ModelSchema

from ninja import ModelSchema

from src.fform.fform_service import FformService
from src.fform.models import Form, FormInterface, FormColumn




class FormColumnSerializer(ModelSchema):

    class Config:
        model = FormColumn
        model_fields = ('key', 'name', 'tip', 'value_type', )


class FormInterfaceSerializer(ModelSchema):
    columns: List[FormColumnSerializer]

    class Config:
        model = FormInterface
        model_fields = ('name', )


class FormSerializer(ModelSchema):
    form_interface: FormInterfaceSerializer
    values: Dict
    @staticmethod
    def resolve_values(f: Form):
        return FformService.form_to_values(f)

    class Config:
        model = Form
        model_fields = ('id', 'status', 'submit_time', 'audit_time')