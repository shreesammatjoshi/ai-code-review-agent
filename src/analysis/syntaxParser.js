const Parser = require('tree-sitter');

const LANGUAGE_MAP = {
  js:   () => require('tree-sitter-javascript'),
  ts:   () => require('tree-sitter-typescript').typescript,
  py:   () => require('tree-sitter-python'),
  java: () => require('tree-sitter-java'),
};

function collectErrors(node, errors = []) {
  if (node.type === 'ERROR' || node.isMissing) {
    errors.push({
      type: node.isMissing ? 'missing_token' : 'syntax_error',
      line: node.startPosition.row + 1,   // tree-sitter is 0-indexed
      column: node.startPosition.column,
      text: node.text?.slice(0, 80),       // first 80 chars of bad code
    });
  }
  for (const child of node.children) {
    collectErrors(child, errors);
  }
  return errors;
}

async function runSyntaxParse(parsedDiff) {
  const parser = new Parser();
  const results = [];

  for (const file of parsedDiff) {
    const ext = file.filename.split('.').pop();
    const loadLanguage = LANGUAGE_MAP[ext];

    if (!loadLanguage) {
      // unsupported language — skip silently
      continue;
    }

    try {
      parser.setLanguage(loadLanguage());
      const code = file.added_lines.join('\n');
      const tree = parser.parse(code);

      const errors = collectErrors(tree.rootNode);

      results.push({
        file: file.filename,
        language: ext,
        hasErrors: errors.length > 0,
        errors,                          // array of { type, line, column, text }
      });

    } catch (err) {
      // grammar package missing or parse crashed
      console.warn(`⚠️  syntaxParser: skipping ${file.filename} — ${err.message}`);
    }
  }

  return results;
}

module.exports = { runSyntaxParse };