from typing import List

import qdrant_client
from django.db import connection
from langchain.chains import LLMChain
from langchain.chat_models import QianfanChatEndpoint
from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import HumanMessagePromptTemplate, ChatPromptTemplate
from langchain.vectorstores.qdrant import Qdrant
from ninja import Router, Schema
from qdrant_client import models

from src.base.request_defined import Request
from src.config import config
from src.account.utils import get_platform
from src.qa.models import HotQuestion, QaRecord, QaRecordFeedback
from src.utils.api import ApiResponse

router = Router()


class AIn(Schema):
    question: str

class AOut(ApiResponse):
    record_id: str
    answer: str
    related_questions: List[str] = None

@router.post('/a', response=AOut)
def 获取答案(request: Request, data: AIn):
    embeddings = OpenAIEmbeddings()

    client = qdrant_client.QdrantClient(
        url=config['qdrant']['url'], prefer_grpc=True
    )
    platform = get_platform(request.user.mini_id)
    qdrant = Qdrant(
        client=client,
        embeddings=embeddings,
        collection_name=platform.qdrant_collection_name,
    )

    # 尝试搜索一个最贴切的问答
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
                platform=platform,
                account=request.user,
                question=data.question,
                match_question=doc.page_content,
                top_score=score,
                answer_type='direct',
                answer='',
            )
            qr.save()
            return ApiResponse.success(record_id=qr.id, answer=doc.metadata['answer'])

    # 尝试搜索一些的文档，让AI自行发挥
    found_docs = qdrant.similarity_search_with_score(
        data.question,
        filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.type",
                    match=models.MatchValue(value="article"),
                ),
            ]
        ))
    if len(found_docs) > 0:
        doc, score = found_docs[0]
        if score > 0.9:
            chat = QianfanChatEndpoint(**{'top_p': 0.4, 'temperature': 0.1, 'penalty_score': 1})
            human_message_prompt = HumanMessagePromptTemplate.from_template("""
            你是房地产法律法规方面的专家，现在，请你先看一下下面的文档，再回答最后给出的问题。
            仅根据给出的信息回答，如果给出的参考信息无法回答，只需要回答:"您的问题暂时无法回答，敬请期待"。

            参考文档:
            ===============
            {article}
            ===============

            Question: {question}
            Answer: """)
            summary_prompt = ChatPromptTemplate.from_messages([human_message_prompt])

            llm_chain = LLMChain(prompt=summary_prompt, llm=chat)
            final_answer = llm_chain.predict(article=doc.metadata['content'], question=data.question)
            qr = QaRecord(
                platform=platform,
                account=request.user,
                question=data.question,
                match_question=doc.page_content,
                top_score=score,
                answer_type='ai',
                answer=final_answer,
            )
            qr.save()
            return ApiResponse.success(record_id=qr.id, answer=final_answer)

    # 尝试搜索一些的问答，组装成可用的答案
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
        if score > 0.6:
            chat = QianfanChatEndpoint(**{'top_p': 0.4, 'temperature': 0.1, 'penalty_score': 1})
            human_message_prompt = HumanMessagePromptTemplate.from_template("""
            你是房地产法律法规方面的专家，现在，请你先看一下几个参考问答，再回答最后给出的问题。
            仅根据给出的信息回答，如果给出的参考信息无法回答，只需要回答:"您的问题暂时无法回答，敬请期待"。

            参考问答:
            ===============
            {example}
            ===============

            Question: {question}
            Answer: """)
            summary_prompt = ChatPromptTemplate.from_messages([human_message_prompt])

            llm_chain = LLMChain(prompt=summary_prompt, llm=chat)

            example = '\n=====\n'.join(
                [f'''Question: {doc.metadata['question']}\nAnswer: {doc.page_content}''' for (doc, score) in found_docs])

            final_answer = llm_chain.predict(example=example, question=data.question)
            qr = QaRecord(
                platform=platform,
                account=request.user,
                question=data.question,
                match_question=doc.metadata['question'],
                top_score=score,
                answer_type='ai',
                answer=final_answer,
            )
            qr.save()
            return ApiResponse.success(record_id=qr.id, answer=final_answer)

    # 继续检查这个问题中包含什么样的tag

    related_question_models = (
        HotQuestion.objects
        .raw("""
WITH
  exist_tags AS (SELECT * FROM qa_hotquestion_tag WHERE %s ILIKE '%%' || tag || '%%'),
  tag_similarity AS (
    SELECT
      qa_hotquestion.*,
      (SELECT sum(1.0 / exist_tags.tag_count)
       FROM jsonb_array_elements_text(qa_hotquestion.tags) t1
       JOIN exist_tags ON t1.value=exist_tags.tag) AS similarity_count
    FROM qa_hotquestion
  )
SELECT *
FROM tag_similarity
WHERE similarity_count>0
ORDER BY similarity_count DESC
LIMIT 5;
""", [data.question]))
    if len(related_question_models) > 0:
        questions = [qm.standard_question for qm in related_question_models]
        qr = QaRecord(
            platform=platform,
            account=request.user,
            question=data.question,
            match_question='na',
            top_score=0,
            answer_type='',
            answer='',
        )
        qr.save()
        return ApiResponse.success(record_id=1, answer='您是否想问：', related_questions=questions)

    qr = QaRecord(
        platform=platform,
        account=request.user,
        question=data.question,
        match_question='na',
        top_score=0,
        answer_type='',
        answer='',
    )
    qr.save()

    return ApiResponse.success(record_id=qr.id, answer='您的问题暂时无法回答，敬请期待')


class FeedbackIn(Schema):
    record_id: str
    attitude: str
    message: str

@router.post('/feedback')
def 热门问题(request: Request, data: FeedbackIn):
    feedback = QaRecordFeedback()
    feedback.record_id = data.record_id
    feedback.attitude = data.attitude
    feedback.message = data.message
    feedback.save()

    return ApiResponse.success()


class HotQuestionOut(ApiResponse):
    questions: List[str]
    tags: List[str]

@router.get('/hot_questions', auth=None, response=HotQuestionOut)
def 热门问题(request: Request, tag: str = '', category_2: str = ''):
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
    category_2s = [
        '抵押',
        '转移登记',
        '办理资料清单',
        '新房办证',
        '法律法规',
        '联系方式',
        '名词解释',
        '收费标准',
        '便民服务',
        '跨区/异地办理',
    ]
    if tag == '' and category_2 == '':
        questions = [
            '二手房过户需要什么材料？',
            '新房办证需要提供什么资料？',
            '无房证明怎么开具？',
            '如何查询我名下的房产信息？',
            '不动产登记能否委托他人代办？',
            '离婚析产需要什么材料？',
            '如何申请不动产登记上门服务？',
            '委托人或者受托人可以解除委托合同吗？',
            '领证方式有哪些？',
            '房产可以办理二次抵押吗？',
        ]
    elif tag != '':
        question_models = HotQuestion.objects.filter(tag=tag).all()
        questions = [qm.standard_question for qm in question_models]
    elif category_2 != '':
        question_models = HotQuestion.objects.filter(category_2=category_2).all()
        questions = [qm.standard_question for qm in question_models]
    else:
        question_models = HotQuestion.objects.filter(tag=tag, category_2=category_2).all()
        questions = [qm.standard_question for qm in question_models]
    return ApiResponse.success(questions=questions, tags=tags, category_2s=category_2s)
