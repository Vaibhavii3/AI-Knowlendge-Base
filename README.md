# AI Knowledge Base (RAG) API

Node/Express + MongoDB backend for uploading documents, chunking + embedding them, searching them (keyword + vector), and asking questions using retrieved context (RAG).

## Features

- **Auth (JWT)**: register, login, get current user.
- **Document ingest (PDF)**: upload a PDF, extract text, split into chunks, generate embeddings, store chunks in MongoDB.
- **Search**
  - **Keyword search**: MongoDB text search over chunks/documents.
  - **Vector search**: MongoDB `$vectorSearch` over chunk embeddings (and document-level embeddings).
  - **Hybrid search**: merges vector + keyword results.
- **Q&A (RAG)**
  - Retrieve relevant chunks via hybrid search
  - Send retrieved context + question to Groq LLM to generate an answer

## Tech stack

- **Server**: Express
- **DB**: MongoDB + Mongoose
- **Embeddings**: Hugging Face Inference API (`sentence-transformers/all-MiniLM-L6-v2`)
- **LLM**: Groq Chat Completions API (`llama3-8b-8192`)
- **Uploads**: Multer (stores files in `uploads/`)

## Project structure

- `src/server.js`: loads env, connects Mongo, starts HTTP server
- `src/app.js`: Express app + route mounting
- `src/routes/*`: API routes
- `src/controllers/*`: request handlers
- `src/services/*`: embedding, hybrid search, RAG, LLM calls
- `src/models/*`: Mongoose models (`User`, `Document`, `Chunk`)

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-knowledge-base
JWT_SECRET=change_me
GROQ_API_KEY=your_key_here
HF_API_KEY=your_huggingface_api_key
```

3. Run the API

```bash
npm run dev
```

API base URL: `http://localhost:5000`

## API overview

All protected endpoints require:

`Authorization: Bearer <JWT>`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login` (returns `token`)
- `GET /api/auth/me`

### Documents

- `POST /api/documents/upload` (multipart form-data, field name: `file`)
- `GET /api/documents/search?q=...` (text search over documents)
- `POST /api/documents/ask` (answers using top matching documents as context)

### Search + AI

- `POST /api/search/search` (hybrid search over chunks)
- `POST /api/ai/ask` (RAG: retrieve chunks via hybrid search, then answer via Groq)
- `POST /api/documents/search-chunks` (vector search over chunks)
- `POST /api/documents/vector-search` (vector search over document-level embeddings)

## Notes on vector search

Endpoints using `$vectorSearch` require MongoDB vector search support (commonly MongoDB Atlas) and corresponding vector indexes:

- Chunk vectors: index name `chunk_vector_index` on `Chunk.embedding`
- Document vectors: index name `document_vector_index` on `Document.embeddings`

If those indexes (or vector search support) are not present, vector-search endpoints will error, but the rest of the API can still work.

