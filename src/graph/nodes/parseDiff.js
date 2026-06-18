const { parseDiff: parse } = require('../../diff/parser');

async function parseDiff(state) {
  console.log('🔎 [Node] parseDiff — parsing unified diff');
  try {
    const parsedDiff = parse(state.rawDiff);
    console.log(`   → ${parsedDiff.length} file(s) parsed`);
    return { parsedDiff };
  } catch (err) {
    console.error('❌ parseDiff failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { parseDiff };
