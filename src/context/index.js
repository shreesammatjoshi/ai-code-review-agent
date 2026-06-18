// Context module — future home of vector retrieval and symbol indexing.
// Currently exports stubs so imports don't break.

async function getFileTreeContext(repo) {
  return null;
}

async function getRelevantContext(parsedDiff) {
  return [];
}

module.exports = { getFileTreeContext, getRelevantContext };
