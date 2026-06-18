const axios = require('axios');

async function postComment(repo, prNumber, commentBody) {
  const url = `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`;

  const response = await axios.post(
    url,
    { body: commentBody },
    {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  return response.data;
}

module.exports = { postComment };