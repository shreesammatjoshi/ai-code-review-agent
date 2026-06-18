const { REVIEW_JSON_SCHEMA } = require('./outputSchema');

/**
 * Builds the full system + user prompt for the LLM code review.
 *
 * @param {Object} opts
 * @param {Object} opts.metadata       - PR metadata (repo, author, title, etc.)
 * @param {Array}  opts.parsedDiff     - Parsed diff files
 * @param {Array}  opts.analysisIssues - Static analysis findings from semgrep
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
function buildReviewPrompt({ metadata, parsedDiff, analysisIssues }) {
  const systemPrompt = `You are a senior software engineer performing a thorough code review on a GitHub Pull Request.

Your job is to:
1. Identify security vulnerabilities, logic errors, performance issues, and maintainability concerns.
2. Praise genuinely good code practices.
3. Be specific, actionable, and constructive — never vague.
4. Focus only on changed code (additions shown with + prefix).
5. Respond ONLY with a valid JSON object matching the schema below. No markdown, no explanation outside the JSON.

JSON SCHEMA:
${REVIEW_JSON_SCHEMA}

Rules:
- "verdict" must be "changes_requested" if any critical/high issues exist, otherwise "approved" or "comment".
- "overall_risk" reflects the highest severity issue found.
- Keep "summary" under 3 sentences.
- "positives" should list 1-3 specific things done well (not generic praise).
- For each issue, provide a concrete "suggestion" and ideally a "fix_snippet".
- If a file has no issues, include it with severity "info" and an empty issues array.`;

  const diffSection = parsedDiff.map(file => {
    const addedCode = file.added_lines.join('\n');
    const removedCode = file.removed_lines.join('\n');
    return `### File: ${file.filename} (${file.language})
Added lines:
\`\`\`
${addedCode || '(none)'}
\`\`\`
Removed lines:
\`\`\`
${removedCode || '(none)'}
\`\`\``;
  }).join('\n\n');

  const staticIssuesSection = analysisIssues.length > 0
    ? `### Static Analysis Findings (Semgrep):
${analysisIssues.map(i =>
  `- [${i.severity.toUpperCase()}] ${i.file}: ${i.description} (rule: ${i.rule_id})\n  Code: \`${i.line}\``
).join('\n')}`
    : '### Static Analysis Findings:\nNo issues found by static analysis.';

  const userPrompt = `## Pull Request: ${metadata.pr_title}
- **Repo:** ${metadata.repo}
- **Author:** ${metadata.author}
- **Base:** \`${metadata.base_branch}\` ← **Head:** \`${metadata.head_branch}\`
- **Files changed:** ${metadata.changed_files}
- **Commits:** ${metadata.commits}

---

## Code Changes:
${diffSection}

---

${staticIssuesSection}

---

Please review the above changes and respond with a JSON review object.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildReviewPrompt };
