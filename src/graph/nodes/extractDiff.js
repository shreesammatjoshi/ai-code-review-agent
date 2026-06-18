const { extractDiff: fetchDiff } = require('../../diff/extractor');

async function extractDiff(state) {
  console.log('📥 [Node] extractDiff — fetching diff from GitHub');
  try {
    const rawDiff = await fetchDiff(state.metadata.diff_url);
    return { rawDiff };
  } catch (err) {
    console.error('❌ extractDiff failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { extractDiff };
