from django.db import models

from src.account.models import Account, Platform
from src.base.models import BaseModel



class HotQuestion(BaseModel):
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE, null=True)
    region = models.CharField('地域', max_length=255, null=True)
    category_1 = models.CharField('大类', max_length=255, null=True)
    category_2 = models.CharField('小类', max_length=255, null=True)
    tag = models.CharField('标签', max_length=255, null=True)
    standard_question = models.CharField('标准问题', max_length=255, null=True)
    similar_questions = models.TextField('相似问题', null=True)
    related_questions = models.TextField('相关问题', null=True)
    standard_answer = models.TextField('常规回答', null=True)


class QaRecord(BaseModel):
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    question = models.CharField('提问', max_length=255, null=True)
    match_question = models.CharField('匹配的问题', max_length=255, null=True)
    top_score = models.FloatField('匹配度', null=True)
    answer_type = models.CharField('回答方式', max_length=255, null=True)
    answer = models.TextField('回答', null=True)


