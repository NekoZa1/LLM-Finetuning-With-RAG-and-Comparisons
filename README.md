# LLM Fine-tuning With RAG and Comparisons

This project builds a Vietnamese question-answering system for the domain of Vietnam's Road Traffic Order and Safety Law. The repository focuses on comparing four LLM configurations:

| Configuration | RAG | Fine-tuning | Description |
| --- | --- | --- | --- |
| Model A | No | No | Base LLM, zero-shot |
| Model B | Yes | No | Base LLM with retrieved context |
| Model C | No | Yes | LoRA/QLoRA fine-tuned LLM |
| Model D | Yes | Yes | Fine-tuned LLM with RAG |

In addition to the experiment notebooks, the repository includes a full-stack web app with a React/Vite frontend, Django backend, and MySQL database for testing the chatbot, user management, courses, files, and quizzes.

## Key Features

- Build a Vietnamese QA dataset from the Road Traffic Order and Safety Law document.
- Parse PDFs, split content into chunks, generate embeddings, and store them in a vector database.
- Implement RAG with ChromaDB in the application code and FAISS in the experiment notebooks.
- Fine-tune Llama 3.2 3B using PEFT LoRA/QLoRA.
- Evaluate models with BLEU, ROUGE, BERTScore, and Recall@5.
- Provide a full-stack web app with React, Django, MySQL, and Docker Compose.

## Architecture Overview

```text
Law PDF / QA dataset
        |
        v
Document parsing -> Chunking -> Embedding -> Vector DB
                                         |
User question -> Retrieve top-k context -> Prompt template -> LLM -> Answer
```

In the web app:

```text
React/Vite frontend
        |
        v
Django API -> MySQL
        |
        v
Vector DB + RAG system -> Gemini or Llama endpoint
```

## Project Structure

```text
.
|-- data/
|   |-- dataset/              # QA, RAG/no-RAG, and human-eval datasets
|   `-- knowledgebase/        # Original law documents in PDF/DOC format
|-- experiments/              # Experiment outputs, metrics, and plots
|-- filehandler/              # PDF parsing and embedding generation
|-- models/                   # LoRA adapters and checkpoints
|-- notebooks/                # Model A/B/C/D experiment notebooks
|-- vectordb/                 # Chroma vector database
|-- web/
|   |-- BE/                   # Django backend
|   |-- FE/                   # React/Vite frontend
|   `-- docker-compose.yml
|-- data-generate.py          # Generates RAG dataset by querying the vector DB
`-- vector_db_init.py         # Initializes the vector DB from the law PDF
```

## Dataset

Main data files:

| File | Purpose |
| --- | --- |
| `data/knowledgebase/36_2024_QH15_444251.pdf` | Original law document used as the knowledge base |
| `data/dataset/data_RAG.json` | QA data with context for RAG |
| `data/dataset/data_no_RAG.json` | QA data without retrieved context |
| `data/dataset/human_eval_50.json` | 50-question human evaluation set |
| `data/dataset/data-v4.json` | Dataset with context generated from the vector DB |

Dataset generation pipeline:

```text
Law PDF -> FileHandler -> chunks + metadata + embeddings -> VectorDB
Question -> VectorDB.query() -> top-k references -> data-v4.json
```

## Reference Results

The metrics below are taken from the notebooks and experiment files in this repository. Some configurations may use different test sets, prompts, or sample counts, so these numbers should be treated as reference results rather than a strict benchmark.

| Model | Setup | BLEU | ROUGE-L | BERTScore | Notes |
| --- | --- | ---: | ---: | ---: | --- |
| A | Base Llama 3.2 3B, no RAG, no fine-tuning | 0.0228 | 0.2411 | 0.6862 | Zero-shot |
| B | RAG + Llama 3.2 3B Instruct, no fine-tuning | 0.0399 | 0.3401 | 0.7400 | Recall@5 = 0.9400 |
| C | LoRA/QLoRA fine-tuning, no RAG | 0.2209 | 0.4394 | 0.7977 | Trained on `data_no_RAG.json` |
| D | LoRA/QLoRA fine-tuning + RAG | 0.2182 | 0.4431 | 0.7451 | Average from a 20-sample experiment |

Overall, fine-tuning improves the model significantly compared with the base LLM. RAG improves grounding and helps the system retrieve legal context, especially for questions that require specific information from the source document.

## Tech Stack

| Area | Technologies |
| --- | --- |
| LLM | Llama 3.2 3B, Llama 3.2 3B Instruct, Gemini |
| Fine-tuning | PEFT, LoRA/QLoRA, bitsandbytes, Transformers |
| Embedding/RAG | Sentence Transformers, ChromaDB, FAISS, LangChain |
| Vietnamese NLP | underthesea, Vietnamese bi-encoder |
| Backend | Django, django-allauth, django-cors-headers, MySQL |
| Frontend | React, Vite, Tailwind CSS, lucide-react |
| DevOps | Docker, Docker Compose |

## Quick Start With Docker

Requirements:

- Docker and Docker Compose
- Required environment variables or credentials for Hugging Face or Gemini if you run the corresponding models/APIs

Run the web app:

```bash
cd web
docker compose up --build
```

After startup:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- MySQL runs inside the `db` service

Docker Compose builds the backend and frontend, waits for MySQL, runs migrations, loads `backup.json`, and starts the Django server.

Stop the app:

```bash
docker compose down
```

## Run the Frontend Separately

```bash
cd web/FE
npm install
npm run dev
```

The frontend calls `http://localhost:8000` by default. You can override it with:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

## Initialize the Vector DB

From the repository root:

```bash
python vector_db_init.py
```

This script reads the PDF in `data/knowledgebase`, parses the content, generates embeddings with the Vietnamese bi-encoder, and stores them in Chroma at `vectordb/chroma_data`.

Then generate a dataset with retrieved context:

```bash
python data-generate.py
```

## Run the Experiment Notebooks

The notebooks are located in `notebooks/`:

| Notebook | Purpose |
| --- | --- |
| `model_A.ipynb` | Evaluate the base LLM without RAG or fine-tuning |
| `model_B (rag).ipynb` | Evaluate the base LLM with RAG |
| `model_C (finetuned).ipynb` | Fine-tune and evaluate the non-RAG model |
| `model_D (finetuned + rag).ipynb` | Fine-tune the model with RAG context |

Running on Colab or Kaggle with a GPU is recommended. Llama 3.2 requires a Hugging Face token with access to Meta's gated model repository.

## Main API Routes

Notable backend routes:

| Route | Purpose |
| --- | --- |
| `GET /api/chat` | List chat sessions |
| `POST /api/chat` | Create a chat session |
| `GET /api/chat/<chat_id>` | Get messages in a session |
| `POST /api/chat/<chat_id>` | Send a question and receive an answer from the RAG system |
| `/auth/*` | Login/logout through django-allauth |
| `/users/*` | User information |
| `/api/instructors/*` | Instructor features |

For `POST`, `PUT`, and `DELETE` requests, the frontend/backend use cookie-based sessions and CSRF tokens.

## Security Notes

- Do not commit real tokens, OAuth secrets, API keys, database passwords, or Django `SECRET_KEY` values to GitHub.
- Move sensitive backend configuration to environment variables or a local `.env` file.
- Generated folders such as `__pycache__`, `.vite`, `node_modules`, large checkpoints, and vector database files should be ignored or managed with Git LFS/artifact storage.
- The ngrok endpoint in the code is suitable for demos only and should not be used as a long-term production configuration.

## Future Improvements

- Standardize one shared test set for all four models A/B/C/D.
- Move model provider settings, API keys, and database configuration to environment variables.
- Add an automated evaluation script that generates the metrics table from notebooks or experiment files.
- Add clearer citations in RAG answers.
- Improve chunking and reranking to increase retrieval accuracy.
- Move large model/checkpoint files out of the Git repository with Git LFS or Hugging Face Hub.

## License

This repository does not currently declare a license. If the project is intended to be public or reusable, consider adding a `LICENSE` file.
