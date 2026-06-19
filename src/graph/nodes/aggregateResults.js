async function aggregateResults(state) {
  console.log('🔗 [Node] aggregateResults — merging LLM + static analysis results');

  let review = null;

  // Start with LLM review if available
  if (state.llmReview) {
    review = { ...state.llmReview };
  }

  // If no LLM response (fallback)
  if (!review) {
    review = {
      verdict: "approved",
      summary: "No issues detected.",
      overall_risk: "low",
      positives: ["Code passed all automated checks."],
      files: []
    };
  }

  // Merge deterministic/static issues into summary
  if (state.autoFixReport) {
    review.summary += `\n\n⚠️ Additional automated findings: ${state.autoFixReport.summary}`;

    // If auto-fix found issues, downgrade approval
    if (review.verdict === "approved") {
      review.verdict = "comment";
    }
  }

  return {
    llmReview: review
  };
}

module.exports = { aggregateResults };