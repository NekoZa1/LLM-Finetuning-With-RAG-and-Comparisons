import requests
from langchain_core.runnables import RunnableSerializable

class LlamaEndpoint(RunnableSerializable):
    endpoint: str
    is_finetuned: bool
    rag: bool

    def invoke(self, input, config = None, **kwargs):
        prompt = self.prepare_prompt(input)
        is_rag = 'rag' if self.rag else 'no-rag'
        endpoint = f'{self.endpoint}/api/{is_rag}/query?is_finetuned={self.is_finetuned}'

        response = requests.post(endpoint, json={'text': prompt})
        response.raise_for_status()

        return response.json()['answer']
    
    def prepare_prompt(self, input):
        if self.rag:
            return input['I'] + input['Q'] + input['C'] + input['A']
        else:
            return input['I'] + input['Q'] + input['A']

        