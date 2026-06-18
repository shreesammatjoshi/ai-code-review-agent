/**
 * Test the full LLM review pipeline locally without a GitHub webhook.
 * Run: node src/test-llm.js
 */
require('dotenv').config();
const { getLLMReview } = require('./llm/reviewEngine');
const { formatReviewComment } = require('./github/commentFormatter');

const MOCK_METADATA = {
  pr_number: 42,
  pr_title: 'Add user authentication endpoint',
  author: 'dev-user',
  repo: 'org/myapp',
  base_branch: 'main',
  head_branch: 'feature/auth',
  diff_url: '',
  commits: 2,
  changed_files: 1,
};

const MOCK_PARSED_DIFF = [
  {
    filename: 'src/auth.js',
    language: 'javascript',
    added_lines: [
      "const express = require('express');",
      "const router = express.Router();",
      "router.post('/login', async (req, res) => {",
      "  const { username, password } = req.body;",
      "  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;",
      "  const result = await db.query(query);",
      "  if (result.rows.length > 0) {",
      "    req.session.user = result.rows[0];",
      "    res.json({ success: true });",
      "  } else {",
      "    res.json({ success: false });",
      "  }",
      "});",
    ],
    removed_lines: [],
  },
];

const MOCK_ANALYSIS_ISSUES = [
  {
    file: 'auth.js',
    line: "const query = `SELECT * FROM users WHERE username='${username}'...`",
    rule_id: 'javascript.injection.sql-injection',
    severity: 'critical',
    description: 'SQL injection via string interpolation in query',
    needs_llm: true,
  },
];

async function main() {
  console.log('🧪 Running LLM review test...\n');

  const review = await getLLMReview({
    metadata: MOCK_METADATA,
    parsedDiff: MOCK_PARSED_DIFF,
    analysisIssues: MOCK_ANALYSIS_ISSUES,
  });

  console.log('\n📋 Structured Review:');
  console.log(JSON.stringify(review, null, 2));

  const comment = formatReviewComment(review, MOCK_METADATA);
  console.log('\n💬 Formatted GitHub Comment:\n');
  console.log(comment);
}

main().catch(console.error);
