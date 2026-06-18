const { runSyntaxParse } = require('../../analysis/syntaxParser');

async function syntaxParser(state) {
  console.log('🌳 [Node] syntaxParser — parsing AST for syntax errors');
  try {
    const syntaxIssues = await runSyntaxParse(state.parsedDiff);
    const errorCount = syntaxIssues.filter(f => f.hasErrors).length;
    console.log(`   → ${errorCount} file(s) have syntax errors`);
    return { syntaxIssues };
  } catch (err) {
    console.warn('⚠️  syntaxParser node failed:', err.message);
    return { syntaxIssues: [] };   // never fatal
  }
}

module.exports = { syntaxParser };