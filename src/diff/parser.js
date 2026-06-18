function parseDiff(rawDiff) {
  const files = [];
  let currentFile = null;

  const lines = rawDiff.split('\n');

  for (const line of lines) {

    // new file detected
    if (line.startsWith('diff --git')) {
      if (currentFile) files.push(currentFile);

      currentFile = {
        filename: '',
        language: '',
        added_lines: [],
        removed_lines: [],
        chunks: [],
      };
    }

    // extract filename
    else if (line.startsWith('+++ b/')) {
      currentFile.filename = line.replace('+++ b/', '');
      currentFile.language = detectLanguage(currentFile.filename);
    }

    // added line
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      currentFile.added_lines.push(line.slice(1).trim());
    }

    // removed line
    else if (line.startsWith('-') && !line.startsWith('---')) {
      currentFile.removed_lines.push(line.slice(1).trim());
    }

    // chunk header e.g @@ -0,0 +1,2 @@
    else if (line.startsWith('@@')) {
      currentFile.chunks.push(line);
    }
  }

  // push last file
  if (currentFile) files.push(currentFile);

  return files;
}

function detectLanguage(filename) {
  const ext = filename.split('.').pop();
  const map = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
  };
  return map[ext] || 'unknown';
}

module.exports = { parseDiff };