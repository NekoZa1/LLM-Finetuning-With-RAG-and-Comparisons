from sentence_transformers import SentenceTransformer
from underthesea import word_tokenize

import chromadb 
import uuid
import json 

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
        
    def add(self, chunks, metadatas):
        self.kb.add(
            ids=[str(uuid.uuid4()) for _ in chunks],
            metadatas=metadatas,
            documents=chunks
        )

    def update(self, file_new_name, file_saved_name):
        result = self.kb.get(
            where={'file_saved_name': file_saved_name}
        )

        self.kb.delete(ids=result['ids'])

        self.kb.add(
            ids=result['ids'],
            documents=result['documents'],
            embeddings=result['embeddings'],
            metadatas=[{**metadata, 'file_name': file_new_name} for metadata in result['metadatas']]
        )

    def delete(self, file_saved_name):
        self.kb.delete(
            where={'file_saved_name': file_saved_name}
        )

    def query(self, queries: list[str], n_results=5):
        embedding = self.model.encode(word_tokenize(queries[0], format='text'))
        results = self.kb.query(query_embeddings=[embedding], n_results=n_results)
        
        refs = {}
        docs = results['documents'][0]
        metadatas = results['metadatas'][0]

        for i in range(len(docs)):
            refs[f'reference_{i+1}'] = {
                'text': docs[i],
                'cite': metadatas[i]
            }

        return refs





