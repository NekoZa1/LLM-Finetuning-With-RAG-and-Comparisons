from django.contrib import admin

from .models import ChatModelLog, ChatModel
from apps.chat.langchain import RAGSystem

class ChatModelLogAdmin(admin.ModelAdmin):
    exclude = ['modified_at']
    list_display = ['id', 'model__model_name', 'modified_at']
    ordering = ('-modified_at',)

    def save_model(self, request, obj, form, change):
        rag = RAGSystem.get_instance()
        rag.model_name = obj.model.model_name
        rag.model_provider = obj.model.provider_name
        super().save_model(request, obj, form, change)

class ChatModelAdmin(admin.ModelAdmin):
    list_display = ['model_name', 'provider_name']


admin.site.register(ChatModelLog, ChatModelLogAdmin)
admin.site.register(ChatModel, ChatModelAdmin)