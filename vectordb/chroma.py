import chromadb 
import uuid
import json 

from sentence_transformers import SentenceTransformer
from underthesea import word_tokenize

class VectorDB():
    instance = None

    def __init__(self):
        self.model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder')
        self.client = chromadb.PersistentClient(path='./vectordb/chroma_data')
        self.kb = self.client.get_or_create_collection(name='knowledgebase')

    @staticmethod
    def get_instance():
        if (not VectorDB.instance): 
            VectorDB.instance = VectorDB()

        return VectorDB.instance
        
    def add(self, chunks, embeddings, metadatas):
        self.kb.add(
            ids=[str(uuid.uuid4()) for _ in chunks],
            embeddings=embeddings,
            metadatas=metadatas,
            documents=chunks
        )

    def query(self, question, n_results=5):
        embedding = self.model.encode(word_tokenize(question, format='text'))
        results = self.kb.query(query_embeddings=[embedding], n_results=n_results, include=['documents', 'metadatas', 'distances'])
        
        refs = {}
        docs = results['documents'][0]
        metadatas = results['metadatas'][0]
        distances = results['distances'][0]

        for i in range(len(docs)):
            refs[f'reference_{i+1}'] = {
                'text': docs[i],
                'cite': metadatas[i],
                'distance': distances[i]
            }

        return refs





