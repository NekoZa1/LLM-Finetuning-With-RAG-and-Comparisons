import os

from django.test import TestCase
from django.contrib.auth import get_user_model

from vectordb import VectorDB
from apps.chat.langchain import RAGSystem
from .. models import ChatSession, Message

User = get_user_model()

class TestViewChat(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email='tester@student.tdtu.edu.vn',
            role='student'
        )

        self.session = ChatSession.objects.create(
            title='Test', 
            user=self.user
        )

    def test_get_chat_history(self):
        self.client.force_login(self.user)

        response = self.client.get('/api/chat')
        data = response.json()

        self.assertEqual(len(data.get('chatSession')), 1)
        self.assertEqual(response.status_code, 200)

    def test_create_chat_session(self):
        self.client.force_login(self.user)

        self.client.post(
            '/api/chat', 
            content_type='application/json',
            data={'title': "Demo"}
        )

        self.assertEqual(ChatSession.objects.count(), 2)

    def test_rename_chat_session(self):
        self.client.force_login(self.user)
        
        self.client.put(
            f'/api/chat/{self.session.id}',
            content_type='application/json',
            data={'title': "Demo2"}
        )

        self.session.refresh_from_db()
        self.assertEqual(self.session.title, "Demo2")

    def test_delet_chat_session(self):
        self.client.force_login(self.user)
        self.client.delete(f'/api/chat/{self.session.id}')
        self.assertEqual(ChatSession.objects.count(), 0)