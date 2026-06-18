const { postComment } = require('../../github/prCommenter');

async function postToGitHub(state) {
  console.log('📬 [Node] postToGitHub — posting comment to PR');
  try {
    const postResult = await postComment(
      state.metadata.repo,
      state.metadata.pr_number,
      state.formattedComment
    );
    console.log(`   → Comment posted: ${postResult.html_url}`);
    return { postResult };
  } catch (err) {
    console.error('❌ postToGitHub failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { postToGitHub };
