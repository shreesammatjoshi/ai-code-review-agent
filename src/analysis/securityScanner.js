const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function runSecurityScan(parsedDiff) {
  // create a temp directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'semgrep-'));

  try {
    // write each changed file to temp directory
    for (const file of parsedDiff) {
      const filePath = path.join(tempDir, path.basename(file.filename));
      const content = file.added_lines.join('\n');
      fs.writeFileSync(filePath, content);
    }

    // run semgrep against temp directory
    const results = await runSemgrep(tempDir);

    // map results back to our format
    return formatResults(results, parsedDiff);

  } finally {
    // always clean up temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function runSemgrep(targetDir) {
  return new Promise((resolve, reject) => {
    const cmd = `semgrep --config=auto --config=p/secrets --config=p/python --json ${targetDir}`;

    exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
      // semgrep returns exit code 1 when it finds issues
      // so we shouldn't treat that as an error
      if (error && !stdout) {
        return reject(new Error(`Semgrep failed: ${stderr}`));
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse semgrep output: ${e.message}`));
      }
    });
  });
}

function formatResults(semgrepOutput, parsedDiff) {
  const issues = [];

  for (const finding of semgrepOutput.results || []) {
    issues.push({
      file: path.basename(finding.path),
      line: finding.extra.lines.trim(),
      rule_id: finding.check_id,
      severity: normalizeSeverity(finding.extra.severity),
      description: finding.extra.message,
      needs_llm: ['ERROR', 'WARNING'].includes(finding.extra.severity),
    });
  }

  return issues;
}

function normalizeSeverity(semgrepSeverity) {
  const map = {
    'ERROR': 'critical',
    'WARNING': 'high',
    'INFO': 'low',
  };
  return map[semgrepSeverity] || 'low';
}

module.exports = { runSecurityScan };