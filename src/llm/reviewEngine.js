const Groq = require('groq-sdk');
const { buildReviewPrompt } = require('./promptBuilder');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Run the full LLM review given PR context.
 *
 * @param {Object} opts
 * @param {Object} opts.metadata
 * @param {Array}  opts.parsedDiff
 * @param {Array}  opts.analysisIssues
 * @returns {Promise<Object>} Parsed ReviewOutput JSON
 */
async function getLLMReview({ metadata, parsedDiff, analysisIssues }) {
  const { systemPrompt, userPrompt } = buildReviewPrompt({ metadata, parsedDiff, analysisIssues });

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });

  const raw = response.choices[0].message.content;

  // Strip markdown fences if model wraps in ```json
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('⚠️  LLM returned non-JSON:', raw.slice(0, 300));
    // Return a fallback review so the pipeline doesn't crash
    return {
      verdict: 'comment',
      summary: 'AI review could not parse structured output. Raw response attached.',
      overall_risk: 'low',
      positives: [],
      files: [],
      _raw: raw,
    };
  }
}

module.exports = { getLLMReview };
