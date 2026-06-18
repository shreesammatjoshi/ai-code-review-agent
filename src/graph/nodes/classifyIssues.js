const { classifyIssues: classify } = require('../../classification/issueClassifier');

async function classifyIssues(state) {
  console.log('📊 [Node] classifyIssues — classifying analysis findings');
  const classifiedIssues = classify(state.analysisIssues || []);
  console.log(`   → llm_queue: ${classifiedIssues.llm_queue.length}, auto: ${classifiedIssues.auto_comment.length}, skip: ${classifiedIssues.skip.length}`);
  return { classifiedIssues };
}

module.exports = { classifyIssues };
