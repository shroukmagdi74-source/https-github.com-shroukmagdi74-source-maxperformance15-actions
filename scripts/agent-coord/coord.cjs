#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

const TTL_DEFAULT_MIN = 90;

function coordHome() {
  const env = process.env.COORD_HOME;
  return env ? path.resolve(env) : path.join(os.homedir(), '.agent-coordination');
}

function ensureHome() {
  const h = coordHome();
  const locks = path.join(h, 'locks');
  if (!fs.existsSync(locks)) {
    fs.mkdirSync(locks, { recursive: true });
  }
  return h;
}

function toplevel(repoPath = process.cwd()) {
  try {
    const out = execSync('git rev-parse --show-toplevel', { cwd: repoPath, encoding: 'utf-8' });
    return out.trim();
  } catch (e) {
    console.error(`not a git repository: ${repoPath}`);
    process.exit(5);
  }
}

function lockFile(root) {
  const norm = path.normalize(root).toLowerCase();
  const key = crypto.createHash('sha1').update(norm).digest('hex').slice(0, 16);
  return path.join(ensureHome(), 'locks', `${key}.json`);
}

function readLock(root) {
  const f = lockFile(root);
  if (!fs.existsSync(f)) return null;
  try {
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
  } catch {
    return null;
  }
}

function writeLock(root, data) {
  const f = lockFile(root);
  const tmp = `${f}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, f);
}

function clearLock(root) {
  const f = lockFile(root);
  if (fs.existsSync(f)) {
    try { fs.unlinkSync(f); } catch {}
  }
}

function logEvent(data) {
  const now = Date.now() / 1000;
  const iso = new Date().toISOString();
  const ev = { ts: now, when: iso, ...data };
  const logPath = path.join(ensureHome(), 'log.jsonl');
  fs.appendFileSync(logPath, JSON.stringify(ev) + '\n', 'utf-8');
}

function isActive(lock) {
  if (!lock) return false;
  const ttl = parseInt(lock.ttl_min || TTL_DEFAULT_MIN, 10);
  const hb = parseFloat(lock.heartbeat || lock.started || 0);
  const now = Date.now() / 1000;
  return (now - hb) < ttl * 60;
}

function defaultAgent() {
  return process.env.COORD_AGENT || 'antigravity';
}

function runGit(args, cwd, ignoreError = false) {
  try {
    const res = spawnSync('git', args, { cwd, encoding: 'utf-8' });
    if (!ignoreError && res.status !== 0) {
      return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
    }
    return { status: 0, stdout: res.stdout || '', stderr: res.stderr || '' };
  } catch (err) {
    return { status: 1, stdout: '', stderr: err.message };
  }
}

const args = process.argv.slice(2);
const cmd = args[0] || 'status';

function parseFlags() {
  const flags = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const k = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[k] = next;
        i++;
      } else {
        flags[k] = true;
      }
    }
  }
  return flags;
}

const root = toplevel();
const flags = parseFlags();

if (cmd === 'status') {
  const lock = readLock(root);
  if (!lock) {
    console.log(`repo: ${root}\nlock: NONE (free to claim)`);
  } else {
    const active = isActive(lock);
    console.log(`repo: ${root}`);
    console.log(`lock: ${active ? 'ACTIVE' : 'STALE (reclaimable)'} — owner=${lock.agent} task=${JSON.stringify(lock.task)}`);
    console.log(`      started=${lock.started_iso || ''} heartbeat=${lock.heartbeat_iso || ''} ttl=${lock.ttl_min} min`);
    if (lock.scope) console.log(`      scope: ${lock.scope}`);
  }
} else if (cmd === 'claim') {
  const agent = flags.agent || defaultAgent();
  const task = flags.task || 'unnamed-task';
  const scope = flags.scope || '';
  const ttl = parseInt(flags.ttl || TTL_DEFAULT_MIN, 10);
  const current = readLock(root);

  if (current && isActive(current) && current.agent !== agent && !flags.reclaim) {
    console.error(`lock held by another agent: ${current.agent} (task: ${current.task})`);
    process.exit(3);
  }

  const now = Date.now() / 1000;
  const iso = new Date().toISOString();
  const lockData = {
    agent,
    task,
    scope,
    started: now,
    started_iso: iso,
    heartbeat: now,
    heartbeat_iso: iso,
    ttl_min: ttl,
    repo: root,
  };
  writeLock(root, lockData);
  logEvent({ agent, event: 'claim', repo: root, task, scope });
  console.log(`claimed lock for ${agent} on ${root} (ttl ${ttl}m)`);
} else if (cmd === 'release') {
  const agent = flags.agent || defaultAgent();
  const note = flags.note || '';
  const commit = flags.commit || '';
  clearLock(root);
  logEvent({ agent, event: 'release', repo: root, note, commit });
  console.log(`released lock on ${root}`);
} else if (cmd === 'guard') {
  const agent = flags.agent || defaultAgent();
  const branch = flags.branch || 'main';
  const lk = readLock(root);

  if (lk && isActive(lk) && lk.agent !== agent && !flags.override) {
    console.error(`GUARD REFUSED: '${lk.agent}' holds an active lock (task: ${JSON.stringify(lk.task)})`);
    logEvent({ agent, event: 'guard-refused', repo: root, held_by: lk.agent });
    process.exit(4);
  }

  if (lk && lk.agent === agent) {
    lk.heartbeat = Date.now() / 1000;
    writeLock(root, lk);
  }

  console.log(`fetching origin/${branch}...`);
  runGit(['fetch', 'origin', branch], root);

  const behind = parseInt(runGit(['rev-list', '--count', `HEAD..origin/${branch}`], root).stdout.trim() || '0', 10);
  if (behind > 0) {
    console.log(`remote moved: ${behind} commit(s) behind origin/${branch} — running pull --rebase ...`);
    const pr = runGit(['pull', '--rebase', '--autostash', 'origin', branch], root);
    if (pr.status !== 0) {
      console.error(`pull --rebase failed: ${pr.stderr}`);
      process.exit(5);
    }
  }

  const ahead = parseInt(runGit(['rev-list', '--count', `origin/${branch}..HEAD`], root).stdout.trim() || '0', 10);
  if (ahead === 0) {
    console.log('GUARD OK: nothing to push (HEAD is in sync with origin).');
    process.exit(0);
  }

  if (!flags.push) {
    console.log(`GUARD OK: ${ahead} commit(s) ready, remote in sync.`);
    process.exit(0);
  }

  console.log(`pushing ${ahead} commit(s) to origin/${branch}...`);
  const pp = runGit(['push', 'origin', `HEAD:${branch}`], root);
  if (pp.status === 0) {
    const head = runGit(['rev-parse', '--short', 'HEAD'], root).stdout.trim();
    logEvent({ agent, event: 'push', repo: root, branch, commit: head, task: lk?.task });
    console.log(`PUSH OK: origin/${branch} is now at ${head}.`);
  } else {
    console.error(`push failed: ${pp.stderr}`);
    process.exit(5);
  }
} else if (cmd === 'log') {
  const logPath = path.join(coordHome(), 'log.jsonl');
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n');
    const tail = lines.slice(-20);
    tail.forEach(l => console.log(l));
  }
} else {
  console.log(`coord.cjs: command ${cmd} handled`);
}
