const { askAI } = require("../services/ai.service");
const fs = require("fs");
// pdf-parse@1.x exposes a simple function API
const pdfParse = require("pdf-parse");

const Document = require("../models/document.model");
const Chunk = require("../models/chunk.model");
const { chunkText } = require("../utils/chunkText");
const { generateEmbedding } = require("../services/embedding.service");

const to1dEmbedding = (embedding) => {
  if (!Array.isArray(embedding)) return [];
  if (!Array.isArray(embedding[0])) return embedding;
  return embedding[0];
};

const meanEmbedding = (vectors) => {
  const vecs = vectors.filter((v) => Array.isArray(v) && v.length > 0);
  if (vecs.length === 0) return [];

  const dim = vecs[0].length;
  const sum = new Array(dim).fill(0);

  for (const v of vecs) {
    if (v.length !== dim) continue;
    for (let i = 0; i < dim; i++) sum[i] += v[i];
  }

  for (let i = 0; i < dim; i++) sum[i] /= vecs.length;
  return sum;
};


exports.uploadDocument = async (req, res) => {
  try {

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required (field name: file)" });
    }

    const fileBuffer = fs.readFileSync(file.path);

    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData?.text || "";

    const chunks = chunkText(extractedText, 500).filter((c) => c && c.trim().length > 0);

    const document = await Document.create({
      title: file.originalname,
      fileUrl: file.path,
      fileType: file.mimetype,
      uploadedBy: req.user._id,
      extractedText
    });

    const chunkEmbeddings = [];
    for (let i = 0; i < chunks.length; i++) {

      const embedding = to1dEmbedding(await generateEmbedding(chunks[i]));
      chunkEmbeddings.push(embedding);

      await Chunk.create({
        documentId: document._id,
        text: chunks[i],
        embedding,
        chunkIndex: i
      });
    }

    const docEmbedding = meanEmbedding(chunkEmbeddings);
    if (docEmbedding.length > 0) {
      await Document.updateOne({ _id: document._id }, { $set: { embeddings: docEmbedding } });
    }

    return res.json({
      message: "Document uploaded and chunked successfully",
      documentId: document._id,
      chunksCreated: chunks.length
    });

  } catch (error) {
    console.error("Error in uploadDocument:", error);
    console.error(error?.stack);
    return res.status(500).json({ error: error.message });
  }
};


exports.searchDocuments = async (req, res) => {
  try {

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const documents = await Document.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.json({
      results: documents,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.askQuestion = async (req, res) => {
  try {

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question required" });
    }

    const documents = await Document.find(
      { $text: { $search: question } }
    ).limit(3);

    const context = documents
      .map((doc) => doc.extractedText)
      .join("\n\n");

    const MAX_CONTEXT_CHARS = 4000;
    const trimmedContext = context.slice(0, MAX_CONTEXT_CHARS);

    const answer = await askAI(trimmedContext, question);

    res.json({
      question,
      answer,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.vectorSearch = async (req, res) => {
  try {

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const queryEmbedding = await generateEmbedding(query);

    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "document_vector_index",
          path: "embeddings",
          queryVector: to1dEmbedding(queryEmbedding),
          numCandidates: 100,
          limit: 5,
        },
      },
    ]);

    res.json({
      results,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchChunks = async (req, res) => {
  try {

    const { query } = req.body;

    const queryEmbedding = await generateEmbedding(query);

    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "chunk_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5
        }
      }
    ]);

    res.json({
      chunks: results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};