from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('chat', views.chat_session_view, name='chat_session_view'),
    path('chat/<int:chat_id>', views.chat_view, name='chat_view'),
]