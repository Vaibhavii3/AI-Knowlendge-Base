const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

exports.generateEmbedding = async (text) => {
  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY is not set in environment");
  }

  try {
    const response = await axios.post(
      HF_EMBEDDING_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "HF featureExtraction error:",
      error.response?.data || error.message
    );
    throw new Error(
      "Hugging Face error: " +
        JSON.stringify(error.response?.data || error.message)
    );
  }
};