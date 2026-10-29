#!/usr/bin/env node
/**
 * CI Guard: Check that no legacy plan identifiers or removed components exist in the codebase.
 * Enforces criterion #1 of T17.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const repoRoot = path.resolve(__dirname, '../../..');

const PATTERNS = [
  'SubscriptionsPlanType',
  'SubscriptionCenter',
  'BillingOverview',
  'companies_plan',
  'enterprise_plans',
  'platform_enterprise_plans',
  'plan:\\s*[\'"](BASIC|PRO|ENTERPRISE)',
];

const IGNORE_PATTERNS = [
  /node_modules/,
  /prisma[/\\]migrations/,
  /prisma[/\\]schema[/\\]migrations/,
  /prisma[/\\]generated/,
  /[/\\]docs[/\\]/,
  /^[/\\]?docs[/\\]/,
  /check-no-legacy-plans\.js/,
  /\.git/,
  /\.md$/i,
  /\.legacy$/i,
  /verify_schema/,
];

function shouldIgnore(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return IGNORE_PATTERNS.some((pattern) => pattern.test(normalized));
}

// Write patterns to a temporary file to avoid shell escaping issues on Windows
const tmpPatternFile = path.join(os.tmpdir(), `legacy_patterns_${Date.now()}.txt`);
fs.writeFileSync(tmpPatternFile, PATTERNS.join('\n'), 'utf8');

let stdout = '';
try {
  stdout = execFileSync(
    'git',
    [
      '--no-pager',
      'grep',
      '-En',
      '-f',
      tmpPatternFile,
      '--',
      'apps/backend',
      'apps/frontend',
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
} catch (err) {
  // git grep returns exit code 1 if no matches found
  if (err.status === 1) {
    stdout = '';
  } else {
    console.error('[check-no-legacy-plans] git grep error:', err.message);
    try { fs.unlinkSync(tmpPatternFile); } catch (_) {}
    process.exit(1);
  }
} finally {
  try { fs.unlinkSync(tmpPatternFile); } catch (_) {}
}

const lines = stdout.split('\n').map((l) => l.trim()).filter(Boolean);
const violations = [];

for (const line of lines) {
  // Format from git grep -En is: path:line:content
  const match = line.match(/^([^:]+):(\d+):(.*)$/);
  if (!match) continue;
  const [, filePath, lineNum, content] = match;

  if (shouldIgnore(filePath)) continue;

  violations.push({
    file: filePath,
    line: lineNum,
    content: content.trim(),
  });
}

if (violations.length > 0) {
  console.error('\n❌ Legacy plan terms violation detected:');
  violations.forEach((v) => {
    console.error(`  ${v.file}:${v.line} -> ${v.content}`);
  });
  console.error(`\nTotal violations: ${violations.length}\n`);
  process.exit(1);
} else {
  console.log('✅ Legacy plan check passed: 0 legacy plan references found in backend and frontend code.');
  process.exit(0);
}
