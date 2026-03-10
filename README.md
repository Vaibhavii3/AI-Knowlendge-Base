This project is a **backend AI knowledge base** that lets you turn PDFs into a searchable, question‑answering system using **retrieval‑augmented generation (RAG)**.

You can:
- Upload PDFs,
- Automatically extract and chunk the text,
- Generate dense vector embeddings,
- Search semantically and by keyword,
- And ask natural‑language questions that are answered using the content of your documents.

The goal is to look and behave like a **mini internal documentation assistant** you could plug into any app.

---

## What this project does

- **User authentication (JWT)**
  - Register, login, and get the current user.
  - Protect all document and AI endpoints with a bearer token.

- **Document → Knowledge base pipeline**
  - Accept **PDF uploads** (Multer, stored on disk).
  - Extract full text from PDFs.
  - Split text into overlapping chunks.
  - Generate **384‑dimensional embeddings** for each chunk using **Hugging Face Inference**.
  - Store documents and chunks in **MongoDB** with both text and vector representations.

- **Search over your knowledge**
  - **Keyword search** using MongoDB text indexes (title, extracted text, chunk text).
  - **Vector search** using MongoDB Atlas vector indexes for:
    - Whole documents (`embeddings` field),
    - Individual chunks (`embedding` field).
  - **Hybrid search** that combines vector + keyword results to retrieve the most relevant chunks.

- **Ask questions with context (RAG)**
  - Take a question from the user.
  - Retrieve the most relevant documents/chunks.
  - Build a trimmed context window.
  - Call **Groq** with a modern LLaMA‑3.1 model to generate a grounded answer.
  - Return both the answer and the source chunks/documents so the user can see *where* the answer came from.

---

## Technologies used

- **Runtime / Framework**
  - Node.js, Express

- **Data & search**
  - MongoDB, Mongoose
  - MongoDB Atlas **vector search** for document + chunk embeddings
  - MongoDB **text indexes** for keyword search

- **AI / ML**
  - **Hugging Face Inference API** for sentence embeddings  
    (`sentence-transformers/all-MiniLM-L6-v2`)
  - **Groq Chat Completions API** for LLM answers  
    (upgraded to a LLaMA‑3.1 based chat model)

- **Other**
  - Multer for file uploads
  - PDF parsing for text extraction
  - JWT (`jsonwebtoken`) + bcrypt for auth

---

## How it works

1. **Authenticate**
   - Client registers/logs in and receives a JWT.
   - All knowledge base and AI routes are behind `Authorization: Bearer <token>`.

## API docs (Swagger)

After starting the server, open Swagger UI at:
- `http://localhost:5000/api-docs`

If you set a different port, use:
- `http://localhost:<PORT>/api-docs`

2. **Ingest documents**
   - Upload a PDF or call the demo‑ingest endpoint.
   - The backend parses the PDF, extracts text, chunks it, embeds each chunk, and stores everything in MongoDB.
   - A document‑level embedding is computed by averaging chunk embeddings, enabling fast document‑level vector search.

3. **Search**
   - **Keyword search**: simple queries over titles and full text.
   - **Vector search**: semantic similarity queries like _“backend api phases”_ or _“how do I deploy the API?”_.
   - **Hybrid search**: combines both to feed the RAG pipeline with the most relevant context.

4. **Ask AI**
   - User sends a natural‑language question.
   - The backend retrieves context from the knowledge base and trims it to fit model limits.
   - Groq generates an answer grounded in the retrieved context.
   - The response includes both the **answer** and the **supporting chunks/documents**.

---

## Why this project matters (what it shows)

This project demonstrates that you can:
- Design and implement a **production‑style backend API** (auth, error handling, env configuration).
- Build a full **RAG pipeline** end‑to‑end: ingestion, embeddings, vector search, and LLM prompting.
- Integrate multiple external services (MongoDB Atlas, Hugging Face, Groq) in a clean way.





