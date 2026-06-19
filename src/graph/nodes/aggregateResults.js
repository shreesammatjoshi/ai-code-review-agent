async function aggregateResults(state) {
  console.log('🔗 [Node] aggregateResults — merging LLM + static analysis results');

  // Case 1: LLM already reviewed
  if (state.llmReview) {
    return {
      llmReview: state.llmReview
    };
  }

  // Case 2: deterministic auto-fix issues found
  if (state.autoFixReport) {
    return {
      llmReview: {
        verdict: "comment",
        summary: state.autoFixReport.summary,
        overall_risk: "medium",
        positives: [],
        files: []
      }
    };
  }

  // Case 3: clean PR
  return {
    llmReview: {
      verdict: "approved",
      summary: "No issues detected.",
      overall_risk: "low",
      positives: ["Code passed all automated checks."],
      files: []
    }
  };
}

module.exports = { aggregateResults };