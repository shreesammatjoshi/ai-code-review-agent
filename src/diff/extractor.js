const axios = require('axios');

async function extractDiff(diffUrl) {
  const response = await axios.get(diffUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3.diff',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    }
  });

  return response.data;
}

module.exports = { extractDiff };