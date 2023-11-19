from typing import List

import qdrant_client
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
        if score > 0.9:
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
            '未成年人房屋由谁申请登记？',
            '预告登记和网签备案的区别是什么？',
            '赠与合同可以撤销吗？',
            '什么是保障性住房？',
            '农房可以买卖或赠与方式转让吗？',
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
