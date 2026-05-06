from django.apps import AppConfig
from vectordb import VectorDB

class InstructorConfig(AppConfig):
    name = 'apps.instructor'

    def ready(self):
        VectorDB.get_instance()
    
    