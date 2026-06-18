const { formatReviewComment } = require('../../github/commentFormatter');

async function generateReport(state) {
  console.log('📄 [Node] generateReport — formatting GitHub comment');
  try {
    const formattedComment = formatReviewComment(state.llmReview, state.metadata);
    return { formattedComment };
  } catch (err) {
    console.error('❌ generateReport failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { generateReport };
