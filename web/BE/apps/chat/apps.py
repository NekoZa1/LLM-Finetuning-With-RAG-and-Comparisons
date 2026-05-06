from django.apps import AppConfig
from vectordb import VectorDB


class ChatConfig(AppConfig):
    name = 'apps.chat'

    def ready(self):
        VectorDB.get_instance()
