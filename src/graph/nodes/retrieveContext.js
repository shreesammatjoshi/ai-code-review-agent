// Placeholder for future vector/symbol context retrieval.
// Will enrich parsedDiff with repo-level context for better reviews.
async function retrieveContext(state) {
  console.log('📚 [Node] retrieveContext — (skipped, no vector store configured)');
  return {};
}

module.exports = { retrieveContext };
