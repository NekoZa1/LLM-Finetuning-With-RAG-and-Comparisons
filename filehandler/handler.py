import pathlib, json
import pymupdf.layout
import pymupdf4llm
import subprocess
import traceback

from sentence_transformers import SentenceTransformer
from underthesea import word_tokenize

class FileHandler:
    def __init__(self):
        self.model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder')

    def pdf_handler(self, file_path):
        doc = pymupdf.open(file_path)
        parse = json.loads(pymupdf4llm.to_json(doc))

        chunks = []
        metadata = []
        embeddings = []
        closest_section = "Blank"

        try:
            for page in parse.get('pages', []):
                page_number = page.get('page_number')

                for box in page.get('boxes', []):
                    textlines = box.get('textlines')
                    box_class = box.get('boxclass')

                    if textlines is not None:
                        if box_class == 'page-header': continue

                        box_text = self.get_box_text(textlines)

                        if box_class == 'section-header': 
                            closest_section = box_text

                        elif  len(box_text) > 100: 
                            chunk = box_text
                            embedding = self.model.encode(word_tokenize(chunk, format='text'))

                            embeddings.append(embedding)
                            chunks.append(chunk)
                            metadata.append({
                                'page': page_number,
                                'section_header': closest_section,
                            })

            return chunks, metadata, embeddings
        
        except Exception as e:
            print(traceback.format_exc())
            raise e  

    def get_box_text(self, textlines):
        box_text = ""

        for textline in textlines:
            spans = textline.get('spans')
            if not spans: continue
            
            for span in spans:
                text = span.get('text')
                if text: box_text += text + " "
                    
        return box_text.rstrip()