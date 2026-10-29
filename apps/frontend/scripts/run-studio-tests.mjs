#!/usr/bin/env node
/**
 * Studio regression guard (STUDIO-REG-1).
 *
 * Runs every storefront studio suite — `src/storefront/__tests__/studio*.test.tsx`,
 * `storefrontProStudio.test.tsx` and any future `*studio*.test.tsx` file — through
 * the storefront vitest config (which installs the shared test setup: localStorage /
 * matchMedia polyfills, QueryClient helpers and RTL cleanup), then prints a
 * per-file + total summary and exits non-zero if anything fails.
 *
 * Each suite runs in its own vitest process:
 *  - one crashing/hanging suite cannot poison the whole guard (a vitest worker
 *    crash erases every result of that run),
 *  - the summary can always name the file (and cases) that broke.
 *
 * Usage (from anywhere):
 *   node scripts/run-studio-tests.mjs
 *   node scripts/run-studio-tests.mjs --verbose        # stream vitest output
 *   STUDIO_TEST_FILE_TIMEOUT_MS=180000 node scripts/run-studio-tests.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(SCRIPT_DIR, '..');
const TESTS_DIR = join(FRONTEND_ROOT, 'src', 'storefront', '__tests__');
const VITEST_ENTRY = join(FRONTEND_ROOT, 'node_modules', 'vitest', 'vitest.mjs');
const CONFIG_ENTRY = join(SCRIPT_DIR, 'vitest.storefront.config.ts');
const REPORT_DIR = join(FRONTEND_ROOT, 'node_modules', '.cache', 'studio-tests');

const ALWAYS_INCLUDED = ['storefrontProStudio.test.tsx'];
const STUDIO_FILE_PATTERN = /^studio.*\.test\.(ts|tsx)$/;
const PER_FILE_TIMEOUT_MS = Number(process.env.STUDIO_TEST_FILE_TIMEOUT_MS || 300000);

/**
 * Suites that are discovered but cannot run in this harness today, with the
 * reason printed on every run. Empty as of E2E-FIX-1 (studioEditorSmokeE2E.test.tsx now passes cleanly).
 */
const EXCLUDED_SUITES = new Map();

const verbose = process.argv.includes('--verbose');

const fail = (message) => {
  console.error(`\n✖ studio-tests: ${message}`);
  process.exit(1);
};

const discoverSuiteFiles = () => {
  const entries = readdirSync(TESTS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => STUDIO_FILE_PATTERN.test(name) || ALWAYS_INCLUDED.includes(name))
    .sort();
};

const discoveredNames = discoverSuiteFiles();
const excludedNames = discoveredNames.filter((name) => EXCLUDED_SUITES.has(name));
const suiteFiles = discoveredNames
  .filter((name) => !EXCLUDED_SUITES.has(name))
  .map((name) => join('src', 'storefront', '__tests__', name));
const proStudioFile = join('src', 'storefront', '__tests__', 'storefrontProStudio.test.tsx');

if (suiteFiles.length === 0) {
  fail(`no studio suites found under ${TESTS_DIR}`);
}
for (const required of ALWAYS_INCLUDED) {
  if (!suiteFiles.some((file) => file.endsWith(required))) {
    fail(`required suite is missing: ${required}`);
  }
}
if (!existsSync(VITEST_ENTRY)) {
  fail(`vitest is not installed at ${VITEST_ENTRY} (run npm ci in apps/frontend)`);
}
if (!existsSync(CONFIG_ENTRY)) {
  fail(`missing storefront vitest config: ${CONFIG_ENTRY}`);
}

mkdirSync(REPORT_DIR, { recursive: true });

const relativeName = (absolutePath) =>
  String(absolutePath || '').replace(FRONTEND_ROOT, '').replace(/^[\\/]/, '').replace(/\\/g, '/');

const firstLine = (value) =>
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0] || '';

console.log(`▶ Studio regression guard — ${suiteFiles.length} suite(s), one process each`);
console.log(`  config   : ${relativeName(CONFIG_ENTRY)}`);
console.log(`  timeout  : ${Math.round(PER_FILE_TIMEOUT_MS / 1000)}s per suite`);
if (excludedNames.length > 0) {
  console.log('');
  for (const name of excludedNames) {
    console.log(`⚠ EXCLUDED  src/storefront/__tests__/${name}`);
    console.log(`            ${EXCLUDED_SUITES.get(name)}`);
  }
}
console.log('');

const results = [];
let totalCases = 0;
let passedCases = 0;

for (const [index, file] of suiteFiles.entries()) {
  const label = `${String(index + 1).padStart(2, '0')}/${suiteFiles.length}`;
  const reportPath = join(REPORT_DIR, `report-${index}.json`);
  rmSync(reportPath, { force: true });

  const startedAt = Date.now();
  const run = spawnSync(
    process.execPath,
    [
      VITEST_ENTRY,
      'run',
      file,
      '--config',
      CONFIG_ENTRY,
      '--reporter=json',
      `--outputFile=${reportPath}`,
    ],
    {
      cwd: FRONTEND_ROOT,
      stdio: verbose ? 'inherit' : ['ignore', 'ignore', 'pipe'],
      timeout: PER_FILE_TIMEOUT_MS,
      env: { ...process.env, CI: process.env.CI ?? '1' },
    },
  );
  const durationMs = Date.now() - startedAt;
  const timedOut = run.error?.code === 'ETIMEDOUT' || run.signal === 'SIGTERM';

  let assertions = [];
  if (existsSync(reportPath)) {
    try {
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      const fileResults = Array.isArray(report.testResults) ? report.testResults : [];
      assertions = fileResults.flatMap((entry) =>
        Array.isArray(entry.assertionResults) ? entry.assertionResults : [],
      );
    } catch {
      assertions = [];
    }
  }

  const failedAssertions = assertions.filter((assertion) => assertion.status === 'failed');
  totalCases += assertions.length;
  passedCases += assertions.length - failedAssertions.length;

  const crashed = assertions.length === 0 && (timedOut || run.status !== 0);
  const crashedReason = timedOut
    ? `timed out after ${Math.round(PER_FILE_TIMEOUT_MS / 1000)}s (no results)`
    : `vitest exited with code ${run.status ?? 'null'} without reporting results` +
      (firstLine(run.stderr?.toString()) ? `: ${firstLine(run.stderr.toString())}` : '');

  results.push({ file, assertions, failedAssertions, crashed, crashedReason, durationMs });

  if (crashed) {
    console.log(`✖ ${file} — CRASH · ${crashedReason} (${(durationMs / 1000).toFixed(1)}s)`);
  } else if (failedAssertions.length > 0) {
    console.log(
      `✖ ${file} — ${failedAssertions.length}/${assertions.length} failed (${(durationMs / 1000).toFixed(1)}s)`,
    );
  } else {
    console.log(`✔ ${file} — ${assertions.length} passed (${(durationMs / 1000).toFixed(1)}s)`);
  }
}

const failingCases = results.flatMap((result) =>
  result.failedAssertions.map((assertion) => ({
    file: result.file,
    title: String(assertion.fullName || assertion.title || 'unknown'),
    message: firstLine(assertion.failureMessages?.[0]),
  })),
);
const crashedFiles = results.filter((result) => result.crashed);
const failedFiles = results.filter((result) => result.failedAssertions.length > 0);
const proStudioResult = results.find((result) => result.file === proStudioFile);
const proStudioCases = proStudioResult ? proStudioResult.assertions.length : 0;

console.log('');
console.log('──────────── studio-tests summary ────────────');
console.log(`files  : ${results.length} run · ${failedFiles.length} with failures · ${crashedFiles.length} crashed`);
console.log(`excl.  : ${excludedNames.length} (listed above)`);
console.log(`cases  : ${totalCases} total · ${passedCases} passed · ${totalCases - passedCases} failed`);
console.log(`guard  : storefrontProStudio.test.tsx → ${proStudioCases} case(s)`);

if (failingCases.length > 0) {
  console.log('\nfailing cases:');
  for (const entry of failingCases) {
    console.log(`  ✖ ${entry.title}`);
    console.log(`      ${entry.file}`);
    if (entry.message) console.log(`      ${entry.message}`);
  }
}

if (crashedFiles.length > 0) {
  console.log('\ncrashed suites (no case results):');
  for (const entry of crashedFiles) {
    console.log(`  ✖ ${entry.file}`);
    console.log(`      ${entry.crashedReason}`);
  }
}

const failedCount = totalCases - passedCases;
const guardBroken = crashedFiles.length > 0 || failedFiles.length > 0 || proStudioCases < 18;

if (failedCount > 0 || guardBroken) {
  console.log(
    `\n✖ studio-tests FAILED (${failedCount} failing case(s), ${crashedFiles.length} crashed suite(s)).`,
  );
  process.exit(1);
}

console.log('\n✔ studio-tests PASSED.');
