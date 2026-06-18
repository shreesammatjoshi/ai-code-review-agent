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

/**
 * After classification, route to the LLM path if there are issues that
 * need deep review, otherwise go straight to the deterministic report.
 * NOTE: both paths still run independently below and merge at aggregateResults —
 * this conditional only decides whether the LLM path is worth invoking at all.
 */
function routeAfterClassification(state) {
  if (state.error) return END;
  const needsLlm = state.classifiedIssues?.llm_queue?.length > 0;
  return needsLlm ? 'needsAiReview' : 'autoFixOnly';
}

function buildReviewGraph() {
  const graph = new StateGraph(ReviewState)
    // ---- Register all nodes ----
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

    // ---- Entry point ----
    .addEdge('__start__', 'extractDiff')

    .addConditionalEdges('extractDiff', shouldContinue, {
      continue: 'parseDiff',
      [END]: END,
    })

    // ---- Fan-out: parseDiff triggers BOTH analysis nodes in parallel ----
    // Two separate addConditionalEdges calls from the same source node —
    // LangGraph registers both, and when 'continue' fires, BOTH targets run.
    .addConditionalEdges('parseDiff', shouldContinue, {
      continue: 'runAnalysis',
      [END]: END,
    })
    .addConditionalEdges('parseDiff', shouldContinue, {
      continue: 'syntaxParser',
      [END]: END,
    })

    // ---- Fan-in: classifyIssues waits for BOTH parallel nodes to finish ----
    .addEdge('runAnalysis',  'classifyIssues')
    .addEdge('syntaxParser', 'classifyIssues')

    // ---- Branch: LLM path vs deterministic-only path ----
    .addConditionalEdges('classifyIssues', routeAfterClassification, {
      needsAiReview: 'buildPrompt',
      autoFixOnly:   'deterministicReport',
      [END]: END,
    })

    // ---- LLM path ----
    .addEdge('buildPrompt', 'runLlmReview')
    .addConditionalEdges('runLlmReview', shouldContinue, {
      continue: 'aggregateResults',
      [END]: END,
    })

    // ---- Deterministic-only path also runs alongside (auto-fix issues
    //      always get reported, regardless of which branch triggered) ----
    .addEdge('deterministicReport', 'aggregateResults')

    // ---- Merge point: both paths converge here ----
    .addEdge('aggregateResults', 'generateReport')

    .addConditionalEdges('generateReport', shouldContinue, {
      continue: 'postToGitHub',
      [END]: END,
    })
    .addEdge('postToGitHub', END);

  return graph.compile();
}

module.exports = { buildReviewGraph };