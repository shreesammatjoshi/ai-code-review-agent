/**
 * Formats a structured LLM ReviewOutput into a GitHub Markdown comment.
 */

const SEVERITY_EMOJI = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
  info: '⚪',
};

const VERDICT_EMOJI = {
  approved: '✅',
  changes_requested: '❌',
  comment: '💬',
};

const TYPE_EMOJI = {
  security: '🔒',
  performance: '⚡',
  style: '🎨',
  logic: '🧠',
  maintainability: '🔧',
};

/**
 * @param {Object} review  - The parsed ReviewOutput from the LLM
 * @param {Object} metadata - PR metadata
 * @returns {string} GitHub Markdown comment
 */
function formatReviewComment(review, metadata) {
  const verdict = VERDICT_EMOJI[review.verdict] || '💬';
  const risk = SEVERITY_EMOJI[review.overall_risk] || '⚪';

  const lines = [];

  // Header
  lines.push(`## ${verdict} AI Code Review — \`${metadata.pr_title}\``);
  lines.push('');
  lines.push(`> ${review.summary}`);
  lines.push('');
  lines.push(`**Overall Risk:** ${risk} \`${(review.overall_risk || 'low').toUpperCase()}\` &nbsp;|&nbsp; **Verdict:** \`${review.verdict}\``);
  lines.push('');

  // Positives
  if (review.positives && review.positives.length > 0) {
    lines.push('### 👍 What\'s Good');
    for (const p of review.positives) {
      lines.push(`- ${p}`);
    }
    lines.push('');
  }

  // File-by-file issues
  const filesWithIssues = (review.files || []).filter(f => f.issues && f.issues.length > 0);
  const filesClean = (review.files || []).filter(f => !f.issues || f.issues.length === 0);

  if (filesWithIssues.length > 0) {
    lines.push('### 🔍 Issues Found');
    lines.push('');

    for (const file of filesWithIssues) {
      const fileSeverity = SEVERITY_EMOJI[file.severity] || '⚪';
      lines.push(`<details>`);
      lines.push(`<summary>${fileSeverity} <strong>${file.filename}</strong> — ${file.summary}</summary>`);
      lines.push('');

      for (const issue of file.issues) {
        const typeEmoji = TYPE_EMOJI[issue.type] || '⚠️';
        const issueRisk = SEVERITY_EMOJI[issue.severity] || '⚪';
        lines.push(`#### ${typeEmoji} ${issueRisk} [${issue.severity.toUpperCase()}] ${issue.type}`);
        lines.push('');
        lines.push(`**Problem:** ${issue.description}`);
        lines.push('');
        lines.push(`**Suggestion:** ${issue.suggestion}`);

        if (issue.code_snippet) {
          lines.push('');
          lines.push('**Problematic code:**');
          lines.push('```');
          lines.push(issue.code_snippet);
          lines.push('```');
        }

        if (issue.fix_snippet) {
          lines.push('');
          lines.push('**Suggested fix:**');
          lines.push('```');
          lines.push(issue.fix_snippet);
          lines.push('```');
        }

        lines.push('');
      }

      lines.push(`</details>`);
      lines.push('');
    }
  }

  // Clean files summary
  if (filesClean.length > 0) {
    lines.push(`### ✅ Clean Files (${filesClean.length})`);
    lines.push(filesClean.map(f => `\`${f.filename}\``).join(', '));
    lines.push('');
  }

  // Handle raw fallback
  if (review._raw) {
    lines.push('### ⚠️ Raw LLM Output (parsing failed)');
    lines.push('```');
    lines.push(review._raw.slice(0, 1000));
    lines.push('```');
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push(`*🤖 Reviewed by AI Code Review Agent | [${metadata.repo}#${metadata.pr_number}](https://github.com/${metadata.repo}/pull/${metadata.pr_number})*`);

  return lines.join('\n');
}

module.exports = { formatReviewComment };
