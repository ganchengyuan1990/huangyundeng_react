import qdrant_client
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores.qdrant import Qdrant
from ninja import Router, Schema
from qdrant_client import models

from src.base.request_defined import Request
from src.config import config
from src.utils.api import ApiResponse

router = Router()


class AIn(Schema):
    question: str

class AOut(ApiResponse):
    answer: str

@router.post('/a', auth=None, response=AOut)
def 获取答案(request: Request, data: AIn):
    embeddings = OpenAIEmbeddings()

    client = qdrant_client.QdrantClient(
        url=config['qdrant']['url'], prefer_grpc=True
    )
    qdrant = Qdrant(
        client=client,
        embeddings=embeddings,
        collection_name="my_documents",
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
        print(doc)
        print(score)
        return ApiResponse.success(answer=doc.metadata['answer'])
    return ApiResponse.success(answer='该问题尚还无法回答，敬请期待')
