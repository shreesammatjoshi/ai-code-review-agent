const { getLLMReview } = require('../../llm/reviewEngine');

async function llmReview(state) {
  console.log('🤖 [Node] llmReview — calling Groq LLM for review');
  try {
    const llmReview = await getLLMReview({
      metadata: state.metadata,
      parsedDiff: state.parsedDiff,
      analysisIssues: state.analysisIssues || [],
    });
    console.log(`   → verdict: ${llmReview.verdict}, risk: ${llmReview.overall_risk}`);
    return { llmReview };
  } catch (err) {
    console.error('❌ llmReview failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { llmReview };
