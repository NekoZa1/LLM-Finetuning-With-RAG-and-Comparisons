import json
from dotenv import load_dotenv
from vectordb import VectorDB

load_dotenv()
vector_db = VectorDB()

def PROMPT_TEMPLATE(context, question): 
    context = '\n'.join([
        f'- {context['text']}'
        for context in context.values()
    ])

    prompt = (
        '### Hướng dẫn: Trả lời câu hỏi dựa trên ngữ cảnh.\n\n'
        f'### Câu hỏi: {question}\n\n'
        f'### Ngữ cảnh:\n{context}'
        f'\n\n### Trả lời:'
    )

    return prompt

data = []
with open("./data/dataset/data-v3.json", newline='', encoding="utf-8") as f:
    q_a_pairs = json.load(f)
    for pair in q_a_pairs:
        q, c, a = pair.values()
        c = vector_db.query(q)
        
        data.append({
            'Q': q,
            'C': c,
            'A': a
        })


with open('./data/dataset/data-v4.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(data, ensure_ascii=False, indent=4))
        



