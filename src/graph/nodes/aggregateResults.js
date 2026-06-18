// Aggregates LLM output with static analysis results.
// Currently a pass-through; can be extended to merge/deduplicate findings.
async function aggregateResults(state) {
  console.log('🔗 [Node] aggregateResults — merging LLM + static analysis results');
  return {};
}

module.exports = { aggregateResults };
