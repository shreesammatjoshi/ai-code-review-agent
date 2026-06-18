require('dotenv').config();
const { postComment } = require('./github/prCommenter');

async function test() {
  const result = await postComment(
    'shreesammatjoshi/ai-code-review-agent',  // your repo
7,                                          // an existing PR number
    '🤖 Test comment from AI Code Review Agent'
  );
  console.log('✅ Comment posted:', result.html_url);
}

test();