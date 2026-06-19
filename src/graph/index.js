const { StateGraph, END } = require('@langchain/langgraph');
const { ReviewState } = require('./state');

const { extractDiff }         = require('./nodes/extractDiff');
const { parseDiff }           = require('./nodes/parseDiff');
const { runAnalysis }         = require('./nodes/runAnalysis');
const { syntaxParser }        = require('./nodes/syntaxParser');
const { classifyIssues }      = require('./nodes/classifyIssues');
const { deterministicReport } = require('./nodes/deterministicReport');
const { buildPrompt }         = require('./nodes/buildPrompt');
const { llmReview }           = require('./nodes/llmReview');
const { aggregateResults }    = require('./nodes/aggregateResults');
const { generateReport }      = require('./nodes/generateReport');
const { postToGitHub }        = require('./nodes/postToGitHub');

function shouldContinue(state) {
  return state.error ? END : 'continue';
}

function routeAfterClassification(state) {
  if (state.error) return END;
  const needsLlm = state.classifiedIssues?.llm_queue?.length > 0;
  return needsLlm ? 'needsAiReview' : 'autoFixOnly';
}

function buildReviewGraph() {
  const graph = new StateGraph(ReviewState)
    .addNode('extractDiff',         extractDiff)
    .addNode('parseDiff',           parseDiff)
    .addNode('runAnalysis',         runAnalysis)
    .addNode('syntaxParser',        syntaxParser)
    .addNode('classifyIssues',      classifyIssues)
    .addNode('deterministicReport', deterministicReport)
    .addNode('buildPrompt',         buildPrompt)
    .addNode('runLlmReview',        llmReview)
    .addNode('aggregateResults',    aggregateResults)
    .addNode('generateReport',      generateReport)
    .addNode('postToGitHub',        postToGitHub)

    .addEdge('__start__', 'extractDiff')

    .addConditionalEdges('extractDiff', shouldContinue, {
      continue: 'parseDiff',
      [END]: END,
    })

    // ONE conditional edge for the error gate
    .addConditionalEdges('parseDiff', shouldContinue, {
      continue: 'runAnalysis',
      [END]: END,
    })
    // Fan-out via a plain edge — coexists fine with the conditional above
    .addEdge('parseDiff', 'syntaxParser')

    .addEdge('runAnalysis',  'classifyIssues')
    .addEdge('syntaxParser', 'classifyIssues')

    .addConditionalEdges('classifyIssues', routeAfterClassification, {
      needsAiReview: 'buildPrompt',
      autoFixOnly:   'deterministicReport',
      [END]: END,
    })

    .addEdge('buildPrompt', 'runLlmReview')
    .addConditionalEdges('runLlmReview', shouldContinue, {
      continue: 'aggregateResults',
      [END]: END,
    })

    .addEdge('deterministicReport', 'aggregateResults')
    .addEdge('aggregateResults', 'generateReport')

    .addConditionalEdges('generateReport', shouldContinue, {
      continue: 'postToGitHub',
      [END]: END,
    })
    .addEdge('postToGitHub', END);

  return graph.compile();
}

module.exports = { buildReviewGraph };