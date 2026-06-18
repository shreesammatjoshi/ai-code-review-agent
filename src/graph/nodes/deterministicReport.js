/**
 * Handles issues classified as "auto-fix candidates" — clear-cut problems
 * that don't need LLM judgment (e.g. formatting, simple lint violations).
 *
 * For now this is a stub that just formats whatever was classified as
 * auto-fixable into a basic report. Expand later with actual auto-fix logic.
 */
async function deterministicReport(state) {
  console.log('🛠️  [Node] deterministicReport — handling auto-fix candidates');

  const autoFixIssues = state.classifiedIssues?.auto_comment || [];

  if (autoFixIssues.length === 0) {
    console.log('   → no auto-fix candidates');
    return { autoFixReport: null };
  }

  const autoFixReport = {
    count: autoFixIssues.length,
    issues: autoFixIssues,
    summary: `${autoFixIssues.length} issue(s) auto-detected and reported without LLM review.`,
  };

  console.log(`   → ${autoFixIssues.length} auto-fix issue(s) reported`);
  return { autoFixReport };
}

module.exports = { deterministicReport };