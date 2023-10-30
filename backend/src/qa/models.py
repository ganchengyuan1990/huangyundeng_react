from django.db import models

from src.account.models import Account
from src.base.models import BaseModel


class HotQuestion(BaseModel):
    region = models.CharField('地域', max_length=255, null=True)
    category_1 = models.CharField('大类', max_length=255, null=True)
    category_2 = models.CharField('小类', max_length=255, null=True)
    tag = models.CharField('标签', max_length=255, null=True)
    standard_question = models.CharField('标准问题', max_length=255, null=True)


class QaRecord(BaseModel):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    question = models.CharField('提问', max_length=255, null=True)
    match_question = models.CharField('匹配的问题', max_length=255, null=True)
    top_score = models.FloatField('匹配度', null=True)
    answer_type = models.CharField('回答方式', max_length=255, null=True)
    answer = models.TextField('回答', null=True)


