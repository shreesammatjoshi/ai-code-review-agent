/**
 * Classifies static analysis issues into three buckets:
 *   - llm_queue:     Needs LLM review (high/critical severity)
 *   - auto_comment:  Low severity, post a standard comment without LLM
 *   - skip:          Noise / informational only
 */

function classifyIssues(analysisIssues) {
  const llm_queue = [];
  const auto_comment = [];
  const skip = [];

  for (const issue of analysisIssues) {
    if (['critical', 'high'].includes(issue.severity)) {
      llm_queue.push(issue);
    } else if (issue.severity === 'medium') {
      auto_comment.push(issue);
    } else {
      skip.push(issue);
    }
  }

  return { llm_queue, auto_comment, skip };
}

module.exports = { classifyIssues };
