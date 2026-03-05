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
