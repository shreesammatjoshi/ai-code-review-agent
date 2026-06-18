/**
 * Structured output schema for the LLM review response.
 * The LLM is prompted to return JSON matching this shape.
 */

/**
 * @typedef {Object} FileReview
 * @property {string} filename
 * @property {'critical'|'high'|'medium'|'low'|'info'} severity
 * @property {string} summary       - One-line summary of issues in this file
 * @property {Issue[]} issues
 */

/**
 * @typedef {Object} Issue
 * @property {string} type          - e.g. 'security', 'performance', 'style', 'logic', 'maintainability'
 * @property {'critical'|'high'|'medium'|'low'} severity
 * @property {string} description   - What the problem is
 * @property {string} suggestion    - How to fix it
 * @property {string} [code_snippet] - The problematic code (optional)
 * @property {string} [fix_snippet]  - Suggested fixed code (optional)
 */

/**
 * @typedef {Object} ReviewOutput
 * @property {'approved'|'changes_requested'|'comment'} verdict
 * @property {string} summary        - High-level summary of the whole PR
 * @property {FileReview[]} files
 * @property {string[]} positives    - Things done well
 * @property {string} overall_risk   - 'low' | 'medium' | 'high' | 'critical'
 */

const REVIEW_JSON_SCHEMA = `{
  "verdict": "approved" | "changes_requested" | "comment",
  "summary": "string",
  "overall_risk": "low" | "medium" | "high" | "critical",
  "positives": ["string"],
  "files": [
    {
      "filename": "string",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "summary": "string",
      "issues": [
        {
          "type": "security" | "performance" | "style" | "logic" | "maintainability",
          "severity": "critical" | "high" | "medium" | "low",
          "description": "string",
          "suggestion": "string",
          "code_snippet": "string (optional)",
          "fix_snippet": "string (optional)"
        }
      ]
    }
  ]
}`;

module.exports = { REVIEW_JSON_SCHEMA };
