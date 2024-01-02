import pandas
from bs4 import BeautifulSoup
from django import forms
from django.contrib import admin
from django.db.models import QuerySet
from django.forms import ModelForm

from src.account.models import FileUpload
from src.qa.models import HotQuestion


class FileUploadForm(ModelForm):
    class Meta:
        model = FileUpload
        fields = '__all__'
        widgets = {
            'file': forms.ClearableFileInput(),
        }


class FileUploadAdmin(admin.ModelAdmin):
    form = FileUploadForm

    actions = ['导入热门题库']

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj=obj, **kwargs)
        form.base_fields['platform'].required = False
        return form

    def 导入热门题库(self, request, queryset: QuerySet[FileUpload]):
        for item in queryset:
            df = pandas.read_excel(item.file)
            df = df.where(pandas.notna(df), None)
            for index, row in df.iterrows():
                soup = BeautifulSoup(row['常规回答'], 'html5lib')
                plain_text = soup.get_text(separator='\n')
                HotQuestion.objects.create(
                    platform=item.platform,
                    region=row['地域'],
                    category_1=row['大类'],
                    category_2=row['小类'],
                    tags=row['标签'].split('，'),
                    standard_question=row['标准问题'],
                    similar_questions=row['相似问题'],
                    related_questions=row['相关问题'],
                    standard_answer=plain_text,
                )

            self.message_user(request, f"{len(df)} records imported successfully.")


admin.site.register(FileUpload, FileUploadAdmin)
