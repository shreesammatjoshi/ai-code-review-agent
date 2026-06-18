/**
 * LangGraph state definition for the AI Code Review pipeline.
 * Each key is the shared state passed between graph nodes.
 */

const { Annotation } = require('@langchain/langgraph');

const ReviewState = Annotation.Root({
  // GitHub PR metadata
  metadata: Annotation({ reducer: (_, b) => b }),

  // Raw unified diff string from GitHub
  rawDiff: Annotation({ reducer: (_, b) => b }),

  // Parsed diff: array of { filename, language, added_lines, removed_lines, chunks, hunks }
  parsedDiff: Annotation({ reducer: (_, b) => b }),

  // Security/static analysis issues from semgrep
  analysisIssues: Annotation({ reducer: (_, b) => b }),

  // Classified: { llm_queue: [...], auto_comment: [...], skip: [...] }
  classifiedIssues: Annotation({ reducer: (_, b) => b }),

  // LLM-generated structured review
  llmReview: Annotation({ reducer: (_, b) => b }),

  // Final formatted comment markdown
  formattedComment: Annotation({ reducer: (_, b) => b }),

  // GitHub API response after posting
  postResult: Annotation({ reducer: (_, b) => b }),

  syntaxIssues: Annotation({ reducer: (_, b) => b }),

  autoFixReport: Annotation({ reducer: (_, b) => b }),

  // Any error encountered
  error: Annotation({ reducer: (_, b) => b }),
});

module.exports = { ReviewState };
