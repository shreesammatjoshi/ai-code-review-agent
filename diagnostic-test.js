/**
 * Comprehensive diagnostic test for AI Code Review Agent
 * Run: node diagnostic-test.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n🔍 AI Code Review Agent - Diagnostic Test\n');
console.log('='.repeat(60));

// Test 1: Check environment variables
console.log('\n📋 Test 1: Environment Configuration');
console.log('-'.repeat(60));

const requiredEnvVars = ['GROQ_API_KEY'];
const optionalEnvVars = ['GITHUB_TOKEN', 'GITHUB_WEBHOOK_SECRET', 'PORT'];

const missingRequired = requiredEnvVars.filter(v => !process.env[v]);
const missingOptional = optionalEnvVars.filter(v => !process.env[v]);

requiredEnvVars.forEach(v => {
  const status = process.env[v] ? '✓' : '✗';
  console.log(`${status} ${v}: ${process.env[v] ? 'set' : 'MISSING (REQUIRED)'}`);
});

optionalEnvVars.forEach(v => {
  const status = process.env[v] ? '✓' : '○';
  console.log(`${status} ${v}: ${process.env[v] ? 'set' : 'not set'}`);
});

// Test 2: Check core files
console.log('\n📦 Test 2: Core Files Check');
console.log('-'.repeat(60));

const coreFiles = [
  'src/index.js',
  'src/webhook.js',
  'src/llm/reviewEngine.js',
  'src/llm/promptBuilder.js',
  'src/github/prCommenter.js',
  'src/github/commentFormatter.js',
  'src/analysis/securityScanner.js',
  'src/analysis/syntaxParser.js',
  'src/diff/parser.js',
  'src/diff/extractor.js',
  'src/graph/index.js',
  'src/graph/nodes/extractDiff.js',
  'src/graph/nodes/parseDiff.js',
  'src/graph/nodes/runAnalysis.js',
  'src/graph/nodes/llmReview.js',
  'src/graph/nodes/classifyIssues.js',
  'src/graph/nodes/aggregateResults.js',
  'src/graph/nodes/generateReport.js',
  'src/graph/nodes/postToGitHub.js',
  'src/context/fileTreeContext.js',
  'src/context/symbolIndex.js',
  'src/context/vectorRetrieval.js',
];

let filesMissing = 0;
coreFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) filesMissing++;
});

// Test 3: Check npm dependencies
console.log('\n📚 Test 3: NPM Dependencies');
console.log('-'.repeat(60));

const requiredPackages = [
  'groq-sdk',
  '@langchain/langgraph',
  'express',
  'dotenv',
  'axios',
];

let packagesNotFound = 0;
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const installed = fs.existsSync('node_modules');
  
  if (!installed) {
    console.log('✗ node_modules not found - run: npm install');
    packagesNotFound = requiredPackages.length;
  } else {
    requiredPackages.forEach(pkg => {
      const exists = fs.existsSync(`node_modules/${pkg}`);
      console.log(`${exists ? '✓' : '✗'} ${pkg}`);
      if (!exists) packagesNotFound++;
    });
  }
} catch (e) {
  console.log('✗ Error reading package.json:', e.message);
}

// Test 4: Test imports (syntax check)
console.log('\n✅ Test 4: Module Imports (Syntax Check)');
console.log('-'.repeat(60));

try {
  console.log('Loading core modules...');
  require('./src/llm/reviewEngine.js');
  console.log('✓ reviewEngine.js loads successfully');
  
  require('./src/github/commentFormatter.js');
  console.log('✓ commentFormatter.js loads successfully');
  
  require('./src/analysis/securityScanner.js');
  console.log('✓ securityScanner.js loads successfully');
  
  console.log('✓ All core modules can be imported');
} catch (e) {
  console.log('✗ Error importing modules:', e.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary\n');

if (missingRequired.length > 0) {
  console.log('❌ REQUIRED: Set up missing environment variables:');
  console.log(`   Missing: ${missingRequired.join(', ')}`);
  console.log(`\n   Create .env file with your API keys:`);
  console.log(`   - GROQ_API_KEY from https://console.groq.com\n`);
} else {
  console.log('✓ All required environment variables are set\n');
}

if (filesMissing > 0) {
  console.log(`❌ Missing ${filesMissing} core files\n`);
} else {
  console.log('✓ All core files present\n');
}

if (packagesNotFound > 0) {
  console.log(`❌ ${packagesNotFound} npm packages not found - run: npm install\n`);
} else {
  console.log('✓ All required npm packages installed\n');
}

console.log('🚀 Next steps:');
console.log('   1. Create .env file with your GROQ_API_KEY');
console.log('   2. Run the LLM test: npm run test:llm (or: node src/test-llm.js)');
console.log('   3. Start the server: npm start');
console.log('\n');
