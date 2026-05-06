import os

from django.test import TestCase
from django.contrib.auth import get_user_model

from vectordb import VectorDB
from apps.chat.langchain import RAGSystem
from .. models import ChatSession, Message

User = get_user_model()

class TestChat(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email='tester@student.tdtu.edu.vn',
            role='student'
        )

        self.session = ChatSession.objects.create(
            title='Test', 
            user=self.user
        )

    def test_get_refs(self):
        db = VectorDB.get_instance()
        refs = db.query(queries="What is frequency domain?")
        self.assertNotEqual(len(refs), 0)

    def test_construct_answer(self):
        db = VectorDB.get_instance()
        rag = RAGSystem.get_instance()
        query = "What is frequency domain?"

        chat_history = list(Message.objects.values_list('query', 'response'))
        refs = db.query(queries=query)

        def callback(response):
            Message.objects.create(
                query=query,
                response=response,
                chat_session=self.session
            )

            self.assertEqual(Message.objects.count(), 1)

        rag.get_answer(
            chat_history, 
            query,
            refs, 
            on_complete=callback
        ), 