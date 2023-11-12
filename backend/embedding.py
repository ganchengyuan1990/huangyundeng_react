import os

from docx2txt import docx2txt
from langchain.embeddings import OpenAIEmbeddings
from langchain.schema import Document
from langchain.vectorstores.qdrant import Qdrant
from qdrant_client import qdrant_client

from src.config import config

question_2_word = {
    '1.新房办证（个人）.docx': ['个人购买的新建商品房办证需要哪些材料 ?'],
    '2.新房办证（单位）.docx': ['单位购买的新建商品房办证需要哪些材料 ?'],
    '21.城中村改造办证告知书（四类全）.docx': ['城中村改造还建房办证需要哪些材料？'],
    '3.不动产存量房过户.docx': ['二手房过户需要哪些材料?', '企业间存量房买卖需要哪些材料?'],
    '4.赠与.docx': ['赠与需要哪些材料?'],
    '6.夫妻婚内加减名.docx': ['夫妻财产约定需要哪些材料？'],
    '5.离婚析产.docx': ['离婚析产需要哪些材料？'],
    '7.抵押.docx': ['抵押需要哪些材料？'],
    '9.遗失公告补证.docx': ['补证需要哪些资料？'],
    '10.拆迁注销.docx': ['房屋拆迁申请房屋注销登记需要哪些资料？'],
    '14.换证.docx': ['换证需要哪些资料？'],
    '20.姓名身份证变更（更名）.docx': ['姓名变更需要哪些资料?'],
}

docs = []
for file in os.listdir("洪山/"):
    if not file.endswith('.docx'):
        continue
    try:
        text = docx2txt.process(f"runtimes/洪山/{file}")
    except Exception:
        print(file, ' cannot parse')
        continue
    docs.append(Document(
        page_content=file, metadata={
            'type': 'article',
            'content': text,
        }))
    if file in question_2_word:
        for question in question_2_word[file]:
            docs.append(Document(
                page_content=question, metadata={
                    'type': 'article',
                    'content': text,
                }))

embeddings = OpenAIEmbeddings()
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=config['qdrant']['url'],
    collection_name='qa_hongshan',
)

client = qdrant_client.QdrantClient(
    url=config['qdrant']['url'], prefer_grpc=True
)
print(client.get_collection('qa_hongshan').vectors_count)

