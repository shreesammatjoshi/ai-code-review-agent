/**
 * Test GitHub API connectivity
 */
require('dotenv').config();
const axios = require('axios');

console.log('\n🧪 Testing GitHub API Connection...\n');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.log('⚠️  GITHUB_TOKEN not set - skipping GitHub API test');
  process.exit(0);
}

axios.get('https://api.github.com/user', {
  headers: { 'Authorization': `token ${token}` }
})
.then(res => {
  console.log('✓ GitHub API Connection successful');
  console.log(`✓ Authenticated as: ${res.data.login}`);
  console.log(`✓ Account type: ${res.data.type}`);
  console.log(`✓ Public repos: ${res.data.public_repos}`);
  process.exit(0);
})
.catch(err => {
  console.log('❌ GitHub API Error:', err.response?.data?.message || err.message);
  process.exit(1);
});
