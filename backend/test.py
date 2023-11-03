import qdrant_client
from langchain.chains import LLMChain
from langchain.chat_models import QianfanChatEndpoint

from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
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
    collection_name="qa_huangshi",
)


chat = QianfanChatEndpoint(**{'top_p': 0.4, 'temperature': 0.1, 'penalty_score': 1})
# res = chat([HumanMessage(content="你来讲个笑话")], **{'top_p': 0.4, 'temperature': 0.1, 'penalty_score': 1})
# print(res)

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

llm_chain = LLMChain(prompt=summary_prompt, llm=chat, verbose=True)

query = "我怎么可以在死后把钱给我指定的人？"
found_docs = qdrant.similarity_search(
    query,
    k=4,
    filter=models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.type",
                match=models.MatchValue(value="answer"),
            ),
        ]
    ))
example = '\n=====\n'.join([f'''Question: {doc.metadata['question']}\nAnswer: {doc.page_content}''' for doc in found_docs])

message_summary = llm_chain.predict(example=example, question=query)
print(message_summary)

if __name__ == '__main__':
    print()
