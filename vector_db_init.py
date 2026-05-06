from dotenv import load_dotenv
load_dotenv()

from vectordb import VectorDB
from filehandler import FileHandler

vector_db = VectorDB()
handler = FileHandler()

chunks, metadata, embeddings = handler.pdf_handler('./data/knowledgebase/36_2024_QH15_444251.pdf')
vector_db.add(chunks, embeddings, metadata)