const Chunk = require("../models/chunk.model");
const { generateEmbedding } = require("./embedding.service");

const hybridSearch = async (query) => {

  // 1️⃣ create embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2️⃣ vector search
  const vectorResults = await Chunk.aggregate([
    {
      $vectorSearch: {
        queryVector: queryEmbedding,
        path: "embedding",
        numCandidates: 100,
        limit: 5,
        index: "chunk_vector_index"
      }
    }
  ]);

  // 3️⃣ keyword search
  const keywordResults = await Chunk.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(5);

  // 4️⃣ merge results
  const combined = [...vectorResults, ...keywordResults];

  return combined;
};

module.exports = hybridSearch;