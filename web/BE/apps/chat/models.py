from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatModel(models.Model):
    model_name = models.TextField()
    provider_name = models.TextField(default='google')
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.model_name

class ChatModelLog(models.Model):
    modified_at = models.DateTimeField(default=timezone.now)
    model = models.ForeignKey(
        ChatModel,
        null=True,
        related_name='logs',
        on_delete=models.SET_NULL
    )
    
class ChatSession(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)

    user = models.ForeignKey(
        User,
        related_name='chat_history',
        on_delete=models.CASCADE
    )

    def get_messages(self):
        return self.messages

class Message(models.Model):
    query = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    used_model = models.ForeignKey(
        ChatModel,
        default=2,
        null=True,
        related_name='used_model',
        on_delete=models.SET_NULL
    )
    
    chat_session = models.ForeignKey(
        ChatSession,
        related_name='messages',
        on_delete=models.CASCADE
    )

# Create your models here.
