from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint

from apps.chat.models import ChatModelLog
from .models.llama import LlamaEndpoint 

PROVIDERS = {
    'google': 'google',
    'openAI': 'openAI',
    'meta': {
        'llm_rag_no_finetuned': {'endpoint': 'https://outshoot-prenatal-humorist.ngrok-free.dev', 'rag': True, 'finetuned': False},
        'llm_no_finetuned': {'endpoint': 'https://outshoot-prenatal-humorist.ngrok-free.dev', 'rag': False, 'finetuned': False},
        'llm_rag_finetuned': {'endpoint': 'https://outshoot-prenatal-humorist.ngrok-free.dev', 'rag': True, 'finetuned': True},
        'llm_finetuned': {'endpoint': 'https://outshoot-prenatal-humorist.ngrok-free.dev', 'rag': False, 'finetuned': True},
    }
}
    
class ModelFactory():
    def create_model(self, provider, model_name):
        if (provider == PROVIDERS['google']):
            return ChatGoogleGenerativeAI(
                model=model_name,
                streaming = True,
                api_key='AIzaSyDmIwHiXH2AEAPkC4H9M-vVTMkLPeGefDE'
            )
        elif (provider == 'meta'):
            model = PROVIDERS['meta'][model_name]
            return LlamaEndpoint(
                endpoint= model['endpoint'],
                rag=model['rag'],
                is_finetuned=model['finetuned']
            )
        else:
            raise Exception('Unavailable model')
    
class RAGModel():    
    def __init__(self, model):
        self.model = model

    def prompt(self, query, references, streaming=False, chat_history=None):
        if chat_history:
            query = self.prepare_query(chat_history)

        context = '\n'.join([
            f'- {context['text']}'
            for context in references.values()
        ])

        inputs = {
            'I': '### Hướng dẫn: Trả lời ngắn gọn, chính xác câu hỏi về luật giao thông đường bộ Việt Nam.\n\n',
            'Q': f'### Câu hỏi: {query}\n\n',
            'C': f'### Ngữ cảnh: \n{context}\n\n',
            'A': '### Trả lời:',
        }


        messages = inputs

        if streaming: ai_msg = self.model.stream(messages)
        else: ai_msg =  self.model.invoke(messages)

        return ai_msg
    
    def prepare_query(self, chat_history):
        chat_history = [{'query': q, 'response': r} for q, r in chat_history]

        system_message = ('system', f"Given the chat history {chat_history}], rewrite the new question to be standalone and searchable. Just return the rewritten the question.")
        human_message = ('human', f'New question: {query}')
        
        messages = [system_message, human_message]
        ai_msg = self.model.invoke(messages)
        query = ai_msg.content

        return query
    
class RAGSystem():
    instance = None

    def __init__(self):
        self.factory = ModelFactory()
        self.model_provider = ''
        self.model_name = ''

        self.load_latest_model()

    @staticmethod
    def get_instance():
        if (not RAGSystem.instance):
            RAGSystem.instance = RAGSystem()
        
        return RAGSystem.instance

    def load_latest_model(self):
        latest_log = ChatModelLog.objects.order_by('-modified_at').first()
        latest_model = latest_log.model if latest_log else None

        self.model_name = latest_model.model_name if latest_model else 'gemini-2.5-flash'
        self.model_provider = latest_model.provider_name if latest_model else PROVIDERS['google']

    def get_answer(self, query, references, chat_history=None):
        model = RAGModel(self.factory.create_model(self.model_provider, self.model_name))
        ai_msg = model.prompt(query, references, chat_history=chat_history)
        return ai_msg
            


    def get_answer_stream(self, query, references, on_complete=None, chat_history=None):
        model = RAGModel(self.factory.create_model(self.model_provider, self.model_name))
        ai_msg = model.prompt(query, references, streaming=True, chat_history=chat_history)
        response = ''

        for chunk in ai_msg: 
            response += chunk.content
            yield f'data: {chunk.content}\n\n'

        yield f'data: [DONE]\n\n'

        if on_complete is not None:
            on_complete(response)
            
            
        
        




    








