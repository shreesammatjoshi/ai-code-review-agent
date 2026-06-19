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


/**
 * Stop graph if any node returns { error }
 */
function shouldContinue(state) {
  return state.error ? END : 'continue';
}


/**
 * Build review graph
 *
 * Flow:
 *
 * extractDiff
 *      ↓
 * parseDiff
 *   ↙      ↘
 * runAnalysis   syntaxParser
 *        ↓      ↓
 *      classifyIssues
 *             ↓
 *    deterministicReport
 *             ↓
 *        buildPrompt
 *             ↓
 *        runLlmReview
 *             ↓
 *      aggregateResults
 *             ↓
 *       generateReport
 *             ↓
 *        postToGitHub
 */
function buildReviewGraph() {
  const graph = new StateGraph(ReviewState)

    // ============================
    // Register nodes
    // ============================
    .addNode('extractDiff', extractDiff)
    .addNode('parseDiff', parseDiff)
    .addNode('runAnalysis', runAnalysis)
    .addNode('syntaxParser', syntaxParser)
    .addNode('classifyIssues', classifyIssues)
    .addNode('deterministicReport', deterministicReport)
    .addNode('buildPrompt', buildPrompt)
    .addNode('runLlmReview', llmReview)
    .addNode('aggregateResults', aggregateResults)
    .addNode('generateReport', generateReport)
    .addNode('postToGitHub', postToGitHub)


    // ============================
    // Start
    // ============================
    .addEdge('__start__', 'extractDiff')


    // ============================
    // Extract diff → Parse diff
    // ============================
    .addConditionalEdges('extractDiff', shouldContinue, {
      continue: 'parseDiff',
      [END]: END,
    })


    // ============================
    // Parallel static analysis
    // parseDiff → runAnalysis + syntaxParser
    // ============================
    .addConditionalEdges('parseDiff', shouldContinue, {
      continue: 'runAnalysis',
      [END]: END,
    })

    .addEdge('parseDiff', 'syntaxParser')


    // ============================
    // Wait for BOTH branches
    // ============================
    .addEdge('runAnalysis', 'classifyIssues')
    .addEdge('syntaxParser', 'classifyIssues')


    // ============================
    // Sequential pipeline from here
    // ============================

    // Step 1: classify issues
    .addConditionalEdges('classifyIssues', shouldContinue, {
      continue: 'deterministicReport',
      [END]: END,
    })

    // Step 2: deterministic processing
    .addConditionalEdges('deterministicReport', shouldContinue, {
      continue: 'buildPrompt',
      [END]: END,
    })

    // Step 3: prepare LLM prompt
    .addEdge('buildPrompt', 'runLlmReview')

    // Step 4: LLM review
    .addConditionalEdges('runLlmReview', shouldContinue, {
      continue: 'aggregateResults',
      [END]: END,
    })

    // Step 5: merge everything
    .addEdge('aggregateResults', 'generateReport')

    // Step 6: create final markdown
    .addConditionalEdges('generateReport', shouldContinue, {
      continue: 'postToGitHub',
      [END]: END,
    })

    // Step 7: post comment
    .addEdge('postToGitHub', END);

  return graph.compile();
}

module.exports = { buildReviewGraph };