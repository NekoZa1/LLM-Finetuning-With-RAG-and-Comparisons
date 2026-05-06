import json

from django.shortcuts import render
from django.forms.models import model_to_dict
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, StreamingHttpResponse

from . import models
from vectordb import VectorDB
from apps.chat.langchain import RAGSystem

@login_required
def chat_session_view(request):
    if request.method == 'GET':
        chat_session = models.ChatSession.objects \
        .filter(user=request.user) \
        .all().values()

        return JsonResponse(
            {'chatSession': list(chat_session)},
            safe=False
        )
    
    elif request.method == 'POST':        
        body = json.loads(request.body)
        chat = models.ChatSession.objects.create(
            title=body.get('title'),
            user=request.user
        )

        return JsonResponse(
            {'chatId': chat.id},
            status=201
        )

@login_required
def chat_view(request, chat_id):
    chat = models.ChatSession.objects.filter(pk=chat_id)

    if chat.exists():
        chat = chat.get()

        if request.method == 'GET':
            messages = list(chat.get_messages().values('query', 'response'))
            return JsonResponse(
                {
                    'chat': model_to_dict(chat),
                    'messages': messages
                },
                safe=False
            )
        
        elif request.method == 'POST':
            body = json.loads(request.body)
            query = body.get('query')

            db = VectorDB.get_instance()
            rag = RAGSystem.get_instance()
            # chat_history = list(models.Message.objects.values_list('query', 'response'))

            refs = db.query(queries=[query])

            if (not body.get('streaming', False)):
                response = rag.get_answer(query, refs)
                models.Message.objects.create(
                    query=query,
                    response=response,
                    used_model = models.ChatModel.objects.get(model_name=rag.model_name),
                    chat_session = chat
                )
                return JsonResponse(
                    {'response': response},
                    status=200
                )
            
            else:
                return StreamingHttpResponse(
                    rag.get_answer_stream(
                        query, 
                        refs, 
                        streaming=True,
                        on_complete=lambda response: models.Message.objects.create(
                            query=query,
                            response=response,
                            used_model = models.ChatModel.objects.get(model_name=rag.model_name),
                            chat_session = chat
                        )
                    ), 

                    content_type='text/event-stream'
                )
            

        elif request.method == 'PUT':
            body = json.loads(request.body)
            chat.title = body.get('title', chat.title)
            chat.save()

            return JsonResponse(
                {'chat': model_to_dict(chat)}, 
                status=200
            )

        else:
            chat.delete()

            return JsonResponse(
                {'chat': model_to_dict(chat)}, 
                status=200
            )
    else:
        return JsonResponse(
            {'error': "Chat session not found"},
            status=404
        )
