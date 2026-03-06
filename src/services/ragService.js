const hybridSearch = require("./hybridSearchService");
const { askAI } = require("./ai.service");

const askQuestion = async (question) => {

  // 1 search documents
  const results = await hybridSearch(question);

  // 2 extract text
  const context = results
    .map(chunk => chunk.text)
    .join("\n\n");

    const MAX_CONTEXT_CHARS = 4000;
    const trimmedContext = context.slice(0, MAX_CONTEXT_CHARS);
    // 3 send to LLM
    const answer = await askAI(trimmedContext, question);

  return {
    answer,
    sources: results
  };
};

module.exports = askQuestion;