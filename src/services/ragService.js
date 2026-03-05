const hybridSearch = require("./hybridSearchService");
const { askAI } = require("./ai.service");

const askQuestion = async (question) => {

  // 1 search documents
  const results = await hybridSearch(question);

  // 2 extract text
  const context = results
    .map(chunk => chunk.text)
    .join("\n\n");

  // 3 send to LLM
  const answer = await askAI(context, question);

  return {
    answer,
    sources: results
  };
};

module.exports = askQuestion;