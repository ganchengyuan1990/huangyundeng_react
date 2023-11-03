import pandas
from langchain.chat_models import QianfanChatEndpoint
from langchain.chat_models.base import HumanMessage
import os

from langchain.embeddings import QianfanEmbeddingsEndpoint, OpenAIEmbeddings
from bs4 import BeautifulSoup
from langchain.schema import Document
from langchain.vectorstores.qdrant import Qdrant

# embeddings = QianfanEmbeddingsEndpoint(
#     model='bge-large-zh',
#     # endpoint='bge-large-zh',
# )
# res = embeddings.embed_query("hi")
# print(res)
embeddings = OpenAIEmbeddings()

# 读取Excel文件
excel_file = '不动产问答库_通用+黄石.xlsx'
df = pandas.read_excel(excel_file)

docs = []

for item in df.iloc:
    # 使用BeautifulSoup解析答案
    if type(item['常规回答']) != str or not item['常规回答']:
        print(item)
        continue
    soup = BeautifulSoup(item['常规回答'], 'html5lib')
    plain_text = soup.get_text(separator='\n')

    docs.append(Document(page_content=item['标准问题'], metadata={
        '地域': item['地域'],
        '大类': item['大类'],
        '小类': item['小类'],
        '标签': item['标签'],
        'type': 'question',
        'question_type': 1,
        'answer': plain_text,
    }))
    if type(item['相似问题']) == str and len(item['相似问题']) > 10:
        for similar_question in item['相似问题'].split('？ '):
            docs.append(Document(page_content=similar_question + '?', metadata={
                '地域': item['地域'],
                '大类': item['大类'],
                '小类': item['小类'],
                '标签': item['标签'],
                'type': 'question',
                'question_type': 2,
                'answer': plain_text,
            }))
    # if type(item['相关问题']) == str and len(item['相关问题']) > 10:
    #     for similar_question in item['相关问题'].split('？ '):
    #         docs.append(Document(page_content=similar_question + '?', metadata={
    #             '地域': item['地域'],
    #             '大类': item['大类'],
    #             '小类': item['小类'],
    #             '标签': item['标签'],
    #             'type': 'question',
    #             'question_type': 3,
    #             'answer': plain_text,
    #         }))
    docs.append(Document(page_content=plain_text, metadata={
        '地域': item['地域'],
        '大类': item['大类'],
        '小类': item['小类'],
        '标签': item['标签'],
        'type': 'answer',
        'question': item['标准问题'],
    }))

print(len(docs))
url = "127.0.0.1"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    force_recreate=True,
    url=url,
    collection_name="qa_huangshi",
)

if __name__ == '__main__':
    print()
