import pathlib, json
import pymupdf.layout
import pymupdf4llm
import subprocess
import traceback
import fpdf

FILES_PATH = './media/files'
TMP_PATH = '../../../media/temp'

def parsing_and_chunking(file):
    try:
        if (file['ext'] in ('.doc', '.docx')): file = convert_doc_to_pdf(file)
        elif (file['ext'] in ('.txt')): file = convert_txt_to_pdf(file)

        chunks, metadatas = pdf_handler(file)
        return chunks, metadatas

    except Exception as e:
        raise e 
    
def convert_txt_to_pdf(file):
    pdf = fpdf.FPDF('P', 'mm', 'A4')

    pdf.add_page()
    pdf_width = 210
    pdf_height = 297
    pdf_margins = 10
    pdf.set_font('Arial', size=13)

    max_line_width = pdf_width - 2 * pdf_margins
    word_space = 2

    with open(f'{FILES_PATH}/{file['saved_name']}', encoding='utf-8') as f:
        for line in f:
            line_width = 0

            for word in line.split(' '):
                word_size = pdf.get_string_width(word)
                line_width += word_size + word_space

                if (line_width > max_line_width):
                    pdf.cell(0, 5, '', 0, 1, 'L')
                    line_width = word_size + word_space
                
                pdf.cell(word_size + word_space, 5, word, 0, 0, 'L')
            pdf.cell(0, 5, '', 0, 1, 'L')

    file['saved_name'] = file['saved_name'].replace(file['ext'], '.pdf')
    file['ext'] = '.pdf'

    pdf.output(f'{FILES_PATH}/{file['saved_name']}')
    return file

def convert_doc_to_pdf(file):
    subprocess.run([
        'libreoffice',
        '--headless',
        '--convert-to', 'pdf',
        f'{FILES_PATH}/{file['saved_name']}',
        '--outdir', FILES_PATH
    ], check=True)

    file['saved_name'] = file['saved_name'].replace(file['ext'], '.pdf')
    file['ext'] = '.pdf'

    return file
    
def pdf_handler(file):
    doc = pymupdf.open(f'{FILES_PATH}/{file['saved_name']}')
    parse = json.loads(pymupdf4llm.to_json(doc))

    chunks = []
    metadata = []
    closest_section = "Blank"

    try:
        for page in parse.get('pages', []):
            page_number = page.get('page_number')

            for box in page.get('boxes', []):
                textlines = box.get('textlines')
                box_class = box.get('boxclass')

                if textlines is None:
                    if box_class == 'formula':
                        chunks.append("Mathematical formula omitted")
                        metadata.append({
                            'page': page_number,
                            'file_name': file['name'],
                            'section_header': closest_section,
                            'file_saved_name': file['saved_name']
                        })
                else:     
                    if box_class == 'page-header': continue
                    box_text = ""

                    for textline in textlines:
                        spans = textline.get('spans')
                        if not spans: continue
                        
                        for span in spans:
                            text = span.get('text')
                            if text:
                                box_text += text + " "
                                
                    box_text = box_text.rstrip()

                    if box_class == 'section-header': 
                        closest_section = box_text

                    elif  len(box_text) > 100: 
                        chunks.append(box_text)
                        metadata.append({
                            'page': page_number,
                            'file_name': file['name'],
                            'section_header': closest_section,
                            'file_saved_name': file['saved_name']
                        })

        return chunks, metadata
    
    except Exception as e:
        print(traceback.format_exc())
        raise e
