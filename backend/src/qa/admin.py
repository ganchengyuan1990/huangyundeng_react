from django.contrib import admin
from django.db.models import QuerySet

from src.account.models import Platform, FileUpload
from src.qa.models import HotQuestion


class HotQuestionAdmin(admin.ModelAdmin):
    search_fields = ['region', 'tag', 'standard_question']
    list_display = ('id', 'platform', 'region', 'category_1', 'category_2', 'tag', 'standard_question')
    list_display_links = ('id', 'standard_question')
    list_filter = ('platform', 'region', 'category_1', 'category_2', 'tag')


class PlatformAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'host', 'wx_appid', 'qdrant_collection_name', 'as_default')
    list_display_links = ('id', 'title')

    actions = ['创建qdrant集合']

    def 创建qdrant集合(self, request, queryset: QuerySet[Platform]):
        for item in queryset:

            self.message_user(request, f"{len(df)} records imported successfully.")


admin.site.register(HotQuestion, HotQuestionAdmin)
admin.site.register(Platform, PlatformAdmin)
