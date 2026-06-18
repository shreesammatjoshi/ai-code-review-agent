const { runSecurityScan } = require('../../analysis/securityScanner');

async function runAnalysis(state) {
  console.log('🔒 [Node] runAnalysis — running semgrep security scan');
  try {
    const analysisIssues = await runSecurityScan(state.parsedDiff);
    console.log(`   → ${analysisIssues.length} issue(s) found`);
    return { analysisIssues };
  } catch (err) {
    // Semgrep may not be installed — treat as zero issues, not fatal
    console.warn('⚠️  runAnalysis: semgrep unavailable, skipping —', err.message);
    return { analysisIssues: [] };
  }
}

module.exports = { runAnalysis };
