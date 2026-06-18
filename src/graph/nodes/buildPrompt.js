// This node is a pass-through — prompt building happens inside llmReview.
// Kept as a stub for future pre-processing (context retrieval, token budget, etc.)
async function buildPrompt(state) {
  console.log('📝 [Node] buildPrompt — preparing review context');
  return {};
}

module.exports = { buildPrompt };
