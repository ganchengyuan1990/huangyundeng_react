import pandas
import qdrant_client
from langchain.chat_models import QianfanChatEndpoint
from langchain.chat_models.base import HumanMessage
import os

from langchain.embeddings import QianfanEmbeddingsEndpoint, OpenAIEmbeddings
from bs4 import BeautifulSoup
from langchain.schema import Document
from langchain.vectorstores.qdrant import Qdrant
from qdrant_client import models

embeddings = OpenAIEmbeddings()

url = "127.0.0.1"
client = qdrant_client.QdrantClient(
    url=url, prefer_grpc=True
)
qdrant = Qdrant(
    client=client,
    embeddings=embeddings,
    collection_name="my_documents",
)

query = "什么是遗赠扶养协议？"
found_docs = qdrant.similarity_search_with_score(
    query,
    k=1,
    filter=models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.type",
                match=models.MatchValue(value="question"),
            ),
        ]
    ))
if len(found_docs)>0:
    doc, score = found_docs[0]
    print(doc)
    print(score)

if __name__ == '__main__':
    print()
