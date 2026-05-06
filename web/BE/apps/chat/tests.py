from django.test import TestCase

import vectordb
import langchain


refs = vectordb.query(['What is CRF?'])
ai_msg = langchain.prompt('What is CRF?', refs)

print(ai_msg.content)





