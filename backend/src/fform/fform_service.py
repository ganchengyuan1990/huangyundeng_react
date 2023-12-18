from typing import Dict

import qiniu
from django.core.files.storage import Storage, storages

from src.config import config
from src.fform.models import Form, FormColumn, FormValue, FormFile


class FformService(object):
    @staticmethod
    def upsert_form_values(form: Form, values: Dict) -> Dict:
        """ 返回form所有的值 """
        form_columns = FormColumn.objects.filter(form_interface=form.form_interface, key__in=values.keys()).all()
        if len(values.keys()) != len(form_columns):
            keys = list(values.keys())
            for form_column in form_columns:
                keys.remove(form_column.key)
            raise Exception('These keys not exists: ' + ''.join(keys))

        for form_column in form_columns:
            if form.values.filter(column__key=form_column.key).exists():
                form_value = form.values.get(column__key=form_column.key)
            else:
                form_value = FormValue(form=form, column=form_column)
            if form_column.value_type == FormColumn.ValueType.string or form_column.value_type == FormColumn.ValueType.primary_string:
                form_value.value_string = values[form_column.key]
            elif form_column.value_type == FormColumn.ValueType.boolean:
                form_value.value_boolean = values[form_column.key]
            elif form_column.value_type == FormColumn.ValueType.file:
                form_file = FormFile.objects.get(id=values[form_column.key])
                if form_file.form_id != form.id:
                    raise Exception('File not exists ' + values[form_column.key])
                form_value.value_file = form_file
            form_value.save()

        return values

    @staticmethod
    def form_to_values(form: Form) -> Dict:
        """ 返回form所有的值 """
        q = qiniu.Auth(config['qiniu']['ak'], config['qiniu']['sk'])
        bucket_host = config['qiniu']['obj_host']

        form_values = form.values.all()
        values = {}
        for form_value in form_values:
            if form_value.column.value_type == FormColumn.ValueType.string or form_value.column.value_type == FormColumn.ValueType.primary_string:
                values[form_value.column.key] = form_value.value_string
            elif form_value.column.value_type == FormColumn.ValueType.boolean:
                values[form_value.column.key] = form_value.value_boolean
            elif form_value.column.value_type == FormColumn.ValueType.file:
                if form_value.value_file.save_type == FormFile.SaveType.qiniu:
                    problem_file_url = f'http://{bucket_host}/{form_value.value_file.key}'
                    private_url = q.private_download_url(problem_file_url, expires=3600)
                elif form_value.value_file.save_type == FormFile.SaveType.minio:
                    storage_manager: Storage = storages['minio']
                    private_url = storage_manager.url(form_value.value_file.key)
                else:
                    raise Exception('unknown file type')

                values[form_value.column.key] = {
                    'id': form_value.value_file.id,
                    'fname': form_value.value_file.fname,
                    'url': private_url,
                }
        return values
