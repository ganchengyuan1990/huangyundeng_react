from typing import List

import qdrant_client
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores.qdrant import Qdrant
from ninja import Router, Schema
from qdrant_client import models

from src.base.request_defined import Request
from src.config import config
from src.qa.models import HotQuestion, QaRecord
from src.utils.api import ApiResponse

router = Router()


class AIn(Schema):
    question: str

class AOut(ApiResponse):
    answer: str

@router.post('/a', response=AOut)
def 获取答案(request: Request, data: AIn):
    embeddings = OpenAIEmbeddings()

    client = qdrant_client.QdrantClient(
        url=config['qdrant']['url'], prefer_grpc=True
    )
    qdrant = Qdrant(
        client=client,
        embeddings=embeddings,
        collection_name=config['qdrant']['collection_name'],
    )

    found_docs = qdrant.similarity_search_with_score(
        data.question,
        k=1,
        filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.type",
                    match=models.MatchValue(value="question"),
                ),
            ]
        ))
    if len(found_docs) > 0:
        doc, score = found_docs[0]
        if score > 0.95:
            qr = QaRecord(
                account=request.user,
                question=data.question,
                match_question=doc.page_content,
                top_score=score,
                answer_type='direct',
                answer='',
            )
            qr.save()
            return ApiResponse.success(answer=doc.metadata['answer'])

    found_docs = qdrant.similarity_search_with_score(
        data.question,
        filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.type",
                    match=models.MatchValue(value="answer"),
                ),
            ]
        ))
    if len(found_docs) > 0:
        doc, score = found_docs[0]
        if score > 0.8:
            qr = QaRecord(
                account=request.user,
                question=data.question,
                match_question=doc.metadata['question'],
                top_score=0,
                answer_type='ai',
                answer=doc.page_content,
            )
            qr.save()
            return ApiResponse.success(answer=doc.page_content)

    qr = QaRecord(
        account=request.user,
        question=data.question,
        match_question='na',
        top_score=0,
        answer_type='',
        answer='',
    )
    qr.save()

    return ApiResponse.success(answer='您的问题暂时无法回答，敬请期待')


class HotQuestionOut(ApiResponse):
    questions: List[str]
    tags: List[str]

@router.get('/hot_questions', auth=None, response=HotQuestionOut)
def 热门问题(request: Request, tag: str = ''):
    tags = [
        '使用权',
        '继承',
        '地役权',
        '经营权',
        '集体所有',
        '物权',
        '抵押',
        '遗嘱',
        '承包地',
        '居住权',
    ]
    if tag == '':
        questions = [
            '不动产登记档案查询方式有哪些？',
            '无房证明怎么开具？',
            '遗产按照什么顺序继承？',
            '什么是保障性住房？',
            '不动产登记可以预约办证么？',
            '什么情况下继承人丧失继承权？',
            '建筑区划内哪些部分属于业主共有？',
            '委托人或者受托人可以解除委托合同吗？',
            '土地经营权可以出租、入股、抵押吗？',
            '最高额抵押担保的债权确定前，抵押权人与抵押人可以通过协议变更哪些内容？',
        ]
    else:
        question_models = HotQuestion.objects.filter(tag=tag).all()
        questions = [qm.standard_question for qm in question_models]
    return ApiResponse.success(questions=questions, tags=tags)
