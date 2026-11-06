#!/usr/bin/env node
/**
 * git-sync.js
 * Clones source repo, merges source branch onto target branch, pushes a named sync branch.
 * All GitHub API calls are made by the skill using gh-api.js.
 * This script handles only git operations.
 *
 * Usage (fresh run):
 *   node git-sync.js \
 *     --source-host <host> --source-repo <org/repo> --source-branch <branch> \
 *     --target-host <host> --target-repo <org/repo> --target-branch <branch> \
 *     --push-remote <url-without-credentials> \
 *     --sync-branch <sync/name-YYYYMMDD-HHmm>
 *
 * Usage (conflict resume):
 *   node git-sync.js \
 *     --resume-work-dir <path> \
 *     --push-remote <url-without-credentials> \
 *     --sync-branch <sync/name-YYYYMMDD-HHmm> \
 *     --target-branch <branch> \
 *     --source-host <host> --source-repo <org/repo> --source-branch <branch> \
 *     --target-host <host> --target-repo <org/repo>
 *
 * Usage (hard reset — replaces target branch HEAD with source branch HEAD):
 *   node git-sync.js \
 *     --hard-reset \
 *     --source-host <host> --source-repo <org/repo> --source-branch <branch> \
 *     --push-remote <url-without-credentials> \
 *     --sync-branch <sync/name-YYYYMMDD-HHmm>
 *
 * Env:
 *   SOURCE_PAT  - GitHub PAT for source host. Optional when source repo is public.
 *   TARGET_PAT  - GitHub PAT for target host (for authenticated target fetch + push).
 *
 * Security: PATs are injected via git credential config so they never appear in the
 * process argument list or any spawned child process's argv.
 * The --push-remote URL must NOT contain embedded credentials — TARGET_PAT is injected
 * internally through the git credential helper config.
 *
 * Stdout: single-line JSON envelope — see exit codes below.
 * On conflict, full conflict details are written to <workDir>/conflict.json to avoid
 * stdout buffer issues on large repos with many conflicting files.
 *
 * Exit codes:
 *   0  success    { success: true, syncBranch, commitCount, workDir: null }
 *   3  conflict   { success: false, conflict: true, conflictFile: "<workDir>/conflict.json", workDir }
 *   2  error      (stderr contains reason)
 *
 * conflict.json shape:
 *   {
 *     conflictingFiles: [...],
 *     diffs: { "<file>": "<diff text>" },
 *     resolvability: { "<file>": "auto" | "review" },
 *     htmlDiffFile: "<workDir>/conflict-diff.html"
 *   }
 *
 *   resolvability classification:
 *     "auto"   — plain text file, safe to accept source wholesale for a sync
 *     "review" — binary, submodule, lock file, or env-specific config
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) {
        args[argv[i].slice(2)] = true;
      } else {
        args[argv[i].slice(2)] = argv[i + 1];
        i++;
      }
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Build a git clone/fetch URL.
// If a PAT is provided it is embedded in the user-info component so git can
// authenticate without an interactive prompt. For public repos sourcePat may
// be empty — a plain https:// URL is returned.
// ---------------------------------------------------------------------------
function buildAuthUrl(host, repoPath, pat) {
  if (pat) {
    return `https://x-token:${pat}@${host}/${repoPath}.git`;
  }
  return `https://${host}/${repoPath}.git`;
}

// ---------------------------------------------------------------------------
// Suppress git interactive credential prompts.
// ---------------------------------------------------------------------------
function gitEnv() {
  return {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_ASKPASS: 'echo',
  };
}

// ---------------------------------------------------------------------------
// Shell helpers — stdio fully piped so output never bleeds into our JSON stdout
// ---------------------------------------------------------------------------
function run(cmd, cwd) {
  return execSync(cmd, { cwd, stdio: ['pipe', 'pipe', 'pipe'], env: gitEnv() }).toString().trim();
}

function tryRun(cmd, cwd) {
  try { return { out: run(cmd, cwd), ok: true }; }
  catch (e) {
    return {
      out: e.stdout ? e.stdout.toString().trim() : '',
      stderr: e.stderr ? e.stderr.toString().trim() : '',
      ok: false
    };
  }
}

// ---------------------------------------------------------------------------
// Inject TARGET_PAT into the git credential config for a given remote host.
// This keeps the PAT out of every git child process's argv.
// ---------------------------------------------------------------------------
function injectCredential(repoDir, remoteUrl, pat) {
  const m = remoteUrl.match(/^https?:\/\/([^/]+)/);
  if (m && pat) {
    const host = m[1];
    // Disable any global credential helper (e.g. osxkeychain) so the
    // URL-scoped helper below takes precedence on macOS.
    run(`git config --local credential.helper ""`, repoDir);
    run(
      `git config credential.https://${host}.helper ` +
      `"!f(){ echo password=${pat}; echo username=x-token; }; f"`,
      repoDir
    );
  }
}

// ---------------------------------------------------------------------------
// Commit log parsing
// ---------------------------------------------------------------------------
function parseCommits(logOutput) {
  if (!logOutput) return [];
  return logOutput.split('\n').filter(Boolean).map((line) => {
    const [sha, message, author, date] = line.split('|');
    return { sha: sha || '', message: message || '', author: author || '', date: date || '' };
  });
}

// ---------------------------------------------------------------------------
// Mend / Whitesource file patterns to preserve from the target branch.
// Matches: .whitesource, .whitesource.config, .whitesource.<anything>,
//          .mend (directory marker), mend.config.json, .mend.yml/.yaml,
//          and any file under a .mend/ directory.
// ---------------------------------------------------------------------------
const MEND_PATTERNS = [
  /(?:^|\/)\.whitesource(?:\.|$)/,
  /(?:^|\/)\.mend(?:\/|$)/,
  /(?:^|\/)mend\.config\.(json|ya?ml)$/i,
];

function isMendFile(filePath) {
  return MEND_PATTERNS.some(p => p.test(filePath));
}

/**
 * Restore all Mend/Whitesource files that exist on the target branch into
 * the working tree and stage them.  Files that do not exist on the target
 * branch are left as-is (i.e. we never delete them from the source).
 */
function preserveMendFiles(repoDir, targetBranch) {
  // List every file that exists on the target branch
  const lsResult = tryRun(`git ls-tree -r --name-only "target/${targetBranch}"`, repoDir);
  if (!lsResult.ok || !lsResult.out.trim()) return;

  const mendFiles = lsResult.out.split('\n').filter(f => f && isMendFile(f));
  if (mendFiles.length === 0) return;

  process.stderr.write(
    `Preserving ${mendFiles.length} Mend file(s) from target/${targetBranch}: ${mendFiles.join(', ')}\n`
  );

  for (const f of mendFiles) {
    // checkout the file from target branch into the working tree
    const result = tryRun(`git checkout "target/${targetBranch}" -- "${f}"`, repoDir);
    if (result.ok) {
      // already staged by git checkout — nothing extra needed
    } else {
      process.stderr.write(`Warning: could not restore Mend file "${f}": ${result.stderr}\n`);
    }
  }

  // Stage any restored files (git checkout already stages them, but be explicit)
  tryRun(`git add -- ${mendFiles.map(f => `"${f}"`).join(' ')}`, repoDir);
}

// ---------------------------------------------------------------------------
// Classify a file as "auto" (safe to accept theirs) or "review" (needs human eye).
// ---------------------------------------------------------------------------
const REVIEW_PATTERNS = [
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pom\.xml$/i,
  /build\.gradle(\.kts)?$/i,
  /gradle\.properties$/i,
  /\.env(\.|$)/,
  /config\.(json|ya?ml|toml|properties)$/i,
  /settings\.(json|ya?ml|toml|properties|xml)$/i,
  /Makefile$/,
  /Dockerfile(\..*)?$/,
  /docker-compose(\..*)?\.ya?ml$/i,
  /\.gitmodules$/,
  /\.gitattributes$/,
  /\.(class|jar|war|ear|zip|tar|gz|bin|png|jpg|jpeg|gif|svg|pdf|ico|woff|woff2|ttf|eot)$/i,
];

function classifyFile(filePath) {
  for (const pat of REVIEW_PATTERNS) {
    if (pat.test(filePath)) return 'review';
  }
  return 'auto';
}

// ---------------------------------------------------------------------------
// Build a self-contained HTML side-by-side diff for the given diffs map.
// Only files listed in reviewFiles are included (the ⚠️ ones that need attention).
// All files appear in the "Files changed" navigation sidebar.
// ---------------------------------------------------------------------------
function buildHtmlDiff(conflictingFiles, diffs, resolvability) {
  const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function renderUnifiedDiff(diffText) {
    const lines = diffText.split('\n');
    let html = '<table class="diff-table"><tbody>';
    let srcLine = 0;
    let dstLine = 0;
    lines.forEach(line => {
      if (/^@@/.test(line)) {
        const m = line.match(/-(\d+)(?:,\d+)? \+(\d+)/);
        if (m) { srcLine = parseInt(m[1], 10); dstLine = parseInt(m[2], 10); }
        html += `<tr class="hunk"><td class="ln"></td><td class="ln"></td><td colspan="2" class="hunk-line">${escHtml(line)}</td></tr>`;
        return;
      }
      if (/^---/.test(line) || /^\+\+\+/.test(line) || /^diff/.test(line) || /^index/.test(line)) {
        html += `<tr class="meta"><td class="ln"></td><td class="ln"></td><td colspan="2" class="meta-line">${escHtml(line)}</td></tr>`;
        return;
      }
      if (line.startsWith('-')) {
        html += `<tr class="del"><td class="ln">${srcLine++}</td><td class="ln"></td><td class="code del-bg">${escHtml(line)}</td><td class="code empty-bg"></td></tr>`;
      } else if (line.startsWith('+')) {
        html += `<tr class="add"><td class="ln"></td><td class="ln">${dstLine++}</td><td class="code empty-bg"></td><td class="code add-bg">${escHtml(line)}</td></tr>`;
      } else {
        html += `<tr class="ctx"><td class="ln">${srcLine++}</td><td class="ln">${dstLine++}</td><td class="code ctx-bg">${escHtml(line)}</td><td class="code ctx-bg">${escHtml(line)}</td></tr>`;
      }
    });
    html += '</tbody></table>';
    return html;
  }

  const navItems = conflictingFiles.map(f => {
    const cls = resolvability[f] === 'auto' ? 'nav-auto' : 'nav-review';
    const icon = resolvability[f] === 'auto' ? '✅' : '⚠️';
    const anchor = f.replace(/[^a-z0-9]/gi, '-');
    return `<li class="${cls}"><a href="#file-${anchor}">${icon} ${escHtml(f)}</a></li>`;
  }).join('');

  const fileSections = conflictingFiles.map(f => {
    const anchor = f.replace(/[^a-z0-9]/gi, '-');
    const cls = resolvability[f] === 'auto' ? 'file-auto' : 'file-review';
    const badge = resolvability[f] === 'auto'
      ? '<span class="badge auto">✅ Auto-resolvable</span>'
      : '<span class="badge review">⚠️ Needs review</span>';
    const diffHtml = diffs[f]
      ? renderUnifiedDiff(diffs[f])
      : '<p class="no-diff">No text diff available (binary or empty).</p>';
    return `
      <section class="file-section ${cls}" id="file-${anchor}">
        <div class="file-header">
          <span class="file-name">${escHtml(f)}</span>
          ${badge}
        </div>
        <div class="diff-wrapper">${diffHtml}</div>
      </section>`;
  }).join('\n');

  const autoCount = conflictingFiles.filter(f => resolvability[f] === 'auto').length;
  const reviewCount = conflictingFiles.length - autoCount;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Conflict Diff — gh-sync</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; font-size: 13px; line-height: 1.5; color: #1f2328; background: #fff; display: flex; height: 100vh; overflow: hidden; }
  a { color: #3b82d4; text-decoration: none; }
  a:hover { text-decoration: underline; }
  /* ---- sidebar ---- */
  #sidebar { width: 270px; min-width: 220px; border-right: 1px solid #e5e7eb; overflow-y: auto; padding: 12px 0; background: #f7f8fa; flex-shrink: 0; }
  #sidebar h2 { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #57606a; padding: 0 14px 8px; }
  #sidebar .summary { font-size: 12px; color: #57606a; padding: 0 14px 10px; border-bottom: 1px solid #e5e7eb; margin-bottom: 8px; }
  #sidebar ul { list-style: none; padding: 0 8px; }
  #sidebar li { margin: 1px 0; }
  #sidebar li a { display: block; padding: 4px 8px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #1f2328; }
  #sidebar li a:hover { background: #e5e7eb; text-decoration: none; }
  .nav-review a { color: #7c5cd8; }
  /* ---- main ---- */
  #main { flex: 1; overflow-y: auto; padding: 20px 24px 40px; }
  #main h1 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  #main .subtitle { font-size: 13px; color: #57606a; margin-bottom: 24px; }
  /* ---- file sections ---- */
  .file-section { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 24px; overflow: hidden; }
  .file-header { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f7f8fa; border-bottom: 1px solid #e5e7eb; }
  .file-name { font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; font-weight: 600; flex: 1; word-break: break-all; }
  .badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
  .badge.auto { background: #d1fae5; color: #065f46; }
  .badge.review { background: #ede9fe; color: #4c1d95; }
  /* ---- diff table ---- */
  .diff-wrapper { overflow-x: auto; }
  .diff-table { width: 100%; border-collapse: collapse; font-family: "SFMono-Regular", Consolas, monospace; font-size: 11.5px; }
  .diff-table td { padding: 1px 6px; vertical-align: top; white-space: pre; }
  td.ln { width: 40px; min-width: 32px; text-align: right; color: #57606a; user-select: none; border-right: 1px solid #e5e7eb; background: #f7f8fa; }
  td.code { width: 50%; }
  .del-bg { background: #ffeef0; color: #86181d; }
  .add-bg { background: #e6ffec; color: #145523; }
  .empty-bg { background: #fafafa; }
  .ctx-bg { background: #fff; }
  tr.hunk td.hunk-line { background: #eef6ff; color: #0550ae; padding: 2px 8px; font-size: 11px; }
  tr.meta td.meta-line { background: #f7f8fa; color: #57606a; font-size: 11px; }
  .no-diff { padding: 12px; color: #57606a; font-style: italic; }
  /* ---- footer ---- */
  footer { text-align: center; font-size: 11px; color: #57606a; border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 8px; }
</style>
</head>
<body>
<nav id="sidebar">
  <h2>Files changed</h2>
  <div class="summary">✅ ${autoCount} auto-resolvable &nbsp; ⚠️ ${reviewCount} need review</div>
  <ul>${navItems}</ul>
</nav>
<div id="main">
  <h1>Merge Conflict Diff</h1>
  <p class="subtitle">${conflictingFiles.length} conflicting file(s) — ✅ ${autoCount} auto-resolvable, ⚠️ ${reviewCount} need review</p>
  ${fileSections}
  <footer>Made with IBM Bob</footer>
</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Conflict collection — writes to file, not stdout.
// Captures UU (both-modified), AA (both-added), DD (both-deleted).
// ---------------------------------------------------------------------------
function collectAndWriteConflicts(repoDir, workDir) {
  const diffR = tryRun('git diff --name-only --diff-filter=U', repoDir);
  const statusR = tryRun('git status --porcelain', repoDir);
  const statusConflicts = (statusR.out || '').split('\n')
    .filter(l => /^(UU|AA|DD|AU|UA|DU|UD)/.test(l))
    .map(l => l.slice(3).trim());
  const conflictSet = new Set([
    ...diffR.out.split('\n').filter(Boolean),
    ...statusConflicts,
  ]);
  const conflictingFiles = [...conflictSet];

  const diffs = {};
  const resolvability = {};
  conflictingFiles.forEach((f) => {
    const d = tryRun(`git diff -- "${f}"`, repoDir);
    const lines = d.out.split('\n');
    diffs[f] = lines.slice(0, 100).join('\n') + (lines.length > 100 ? '\n...(truncated)' : '');
    resolvability[f] = classifyFile(f);
  });

  // Write HTML diff viewer
  const htmlDiffFile = path.join(workDir, 'conflict-diff.html');
  fs.writeFileSync(htmlDiffFile, buildHtmlDiff(conflictingFiles, diffs, resolvability));

  const conflictFile = path.join(workDir, 'conflict.json');
  fs.writeFileSync(conflictFile, JSON.stringify({ conflictingFiles, diffs, resolvability, htmlDiffFile }, null, 2));
  return { conflictingFiles, conflictFile, resolvability };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourcePat = process.env.SOURCE_PAT || '';  // optional for public repos
  const targetPat = process.env.TARGET_PAT;
  const pushRemote = args['push-remote'];  // must NOT contain credentials
  const syncBranch = args['sync-branch'];
  const preserveMend = !!args['preserve-mend'];

  if (!pushRemote) { process.stderr.write('Error: --push-remote is required\n'); process.exit(2); }
  if (!syncBranch) { process.stderr.write('Error: --sync-branch is required\n'); process.exit(2); }

  // ---- Hard reset path ----------------------------------------------------
  if (args['hard-reset']) {
    const sourceHost = args['source-host'];
    const sourceRepo = args['source-repo'];
    const sourceBranch = args['source-branch'];

    if (!sourceHost || !sourceRepo || !sourceBranch) {
      process.stderr.write('Error: --source-host, --source-repo, --source-branch required for --hard-reset\n');
      process.exit(2);
    }
    if (!targetPat) { process.stderr.write('Error: TARGET_PAT env var is required\n'); process.exit(2); }

    const workDir = path.join(os.tmpdir(), `gh-sync-reset-${Date.now()}`);
    fs.mkdirSync(workDir, { recursive: true });
    process.stderr.write(`Hard-reset work dir: ${workDir}\n`);

    const srcUrl = buildAuthUrl(sourceHost, sourceRepo, sourcePat);

    try {
      process.stderr.write(`Cloning source ${sourceRepo}@${sourceBranch}...\n`);
      run(`git clone --depth=1 --branch "${sourceBranch}" "${srcUrl}" repo`, workDir);
      const repoDir = path.join(workDir, 'repo');

      run('git config user.email "gh-sync-bot@bob"', repoDir);
      run('git config user.name "Bob gh-sync"', repoDir);

      injectCredential(repoDir, pushRemote, targetPat);

      run(`git checkout -b "${syncBranch}"`, repoDir);

      process.stderr.write(`Force-pushing ${syncBranch} to push remote...\n`);
      run(`git push --force "${pushRemote}" "${syncBranch}"`, repoDir);

      const logOut = tryRun(`git log -1 --format="%H|%s|%an|%ad" --date=short`, repoDir).out;
      const commits = parseCommits(logOut);

      process.stdout.write(JSON.stringify({ success: true, syncBranch, commitCount: commits.length, workDir: null }) + '\n');
      fs.rmSync(workDir, { recursive: true, force: true });
      process.exit(0);
    } catch (err) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(2);
    }
  }

  const targetBranch = args['target-branch'];
  if (!targetBranch) { process.stderr.write('Error: --target-branch is required\n'); process.exit(2); }

  // ---- Resume path --------------------------------------------------------
  const resumeWorkDir = args['resume-work-dir'];
  if (resumeWorkDir) {
    if (!fs.existsSync(resumeWorkDir)) {
      process.stderr.write(`Error: --resume-work-dir "${resumeWorkDir}" does not exist\n`);
      process.exit(2);
    }
    process.stderr.write(`Resuming from: ${resumeWorkDir}\n`);

    const r = tryRun('git diff --name-only --diff-filter=U', resumeWorkDir);
    const remaining = r.out.split('\n').filter(Boolean);
    if (remaining.length > 0) {
      const { conflictingFiles, conflictFile } = collectAndWriteConflicts(resumeWorkDir, resumeWorkDir);
      process.stdout.write(JSON.stringify({ success: false, conflict: true, conflictFile, workDir: resumeWorkDir }) + '\n');
      process.exit(3);
    }

    // Credentials already configured in the work dir's git config
    // Restore Mend files from target branch before pushing (if requested)
    if (preserveMend) {
      preserveMendFiles(resumeWorkDir, targetBranch);
      const anyRestored = tryRun('git diff --cached --name-only', resumeWorkDir);
      if (anyRestored.out.trim()) {
        tryRun('git commit --amend --no-edit', resumeWorkDir);
      }
    }

    const pushResult = tryRun(`git push "${pushRemote}" "${syncBranch}"`, resumeWorkDir);
    if (!pushResult.ok) {
      process.stderr.write(`Push failed: ${pushResult.stderr}\n`);
      process.exit(2);
    }

    const logOut = tryRun(
      `git log "target/${targetBranch}".."${syncBranch}" --format="%H|%s|%an|%ad" --date=short`,
      resumeWorkDir
    ).out;
    const commits = parseCommits(logOut);
    process.stdout.write(JSON.stringify({ success: true, syncBranch, commitCount: commits.length, workDir: null }) + '\n');
    fs.rmSync(resumeWorkDir, { recursive: true, force: true });
    process.exit(0);
  }

  // ---- Fresh run ----------------------------------------------------------
  const sourceHost = args['source-host'];
  const sourceRepo = args['source-repo'];
  const sourceBranch = args['source-branch'];
  const targetHost = args['target-host'];
  const targetRepo = args['target-repo'];

  if (!sourceHost || !sourceRepo || !sourceBranch || !targetHost || !targetRepo) {
    process.stderr.write(
      'Error: --source-host, --source-repo, --source-branch, --target-host, --target-repo are required\n'
    );
    process.exit(2);
  }
  if (!targetPat) { process.stderr.write('Error: TARGET_PAT env var is required\n'); process.exit(2); }

  const workDir = path.join(os.tmpdir(), `gh-sync-${Date.now()}`);
  fs.mkdirSync(workDir, { recursive: true });
  process.stderr.write(`Work dir: ${workDir}\n`);

  const srcUrl = buildAuthUrl(sourceHost, sourceRepo, sourcePat);
  const tgtFetchUrl = buildAuthUrl(targetHost, targetRepo, targetPat);

  try {
    // 1. Clone source (shallow)
    process.stderr.write('Cloning source (depth=50)...\n');
    run(`git clone --depth=50 --no-single-branch "${srcUrl}" repo`, workDir);
    const repoDir = path.join(workDir, 'repo');

    // 2. Set git identity
    run('git config user.email "gh-sync-bot@bob"', repoDir);
    run('git config user.name "Bob gh-sync"', repoDir);

    // 3. Inject TARGET_PAT for push via git credential config (keeps PAT out of argv)
    injectCredential(repoDir, pushRemote, targetPat);

    // 4. Fetch source branch
    run(`git fetch origin "${sourceBranch}" --depth=50`, repoDir);

    // 5. Add target remote and fetch target branch
    run(`git remote add target "${tgtFetchUrl}"`, repoDir);
    process.stderr.write(`Fetching target/${targetBranch} (depth=50)...\n`);
    run(`git fetch target "${targetBranch}" --depth=50`, repoDir);

    // 6. Ensure merge base exists — escalate depth if needed
    if (!tryRun(`git merge-base "origin/${sourceBranch}" "target/${targetBranch}"`, repoDir).ok) {
      process.stderr.write('Merge base not found at depth=50, fetching depth=200...\n');
      run(`git fetch origin "${sourceBranch}" --depth=200`, repoDir);
      run(`git fetch target "${targetBranch}" --depth=200`, repoDir);
    }
    if (!tryRun(`git merge-base "origin/${sourceBranch}" "target/${targetBranch}"`, repoDir).ok) {
      process.stderr.write('Still no merge base, doing full unshallow fetch...\n');
      run(`git fetch origin "${sourceBranch}" --unshallow`, repoDir);
      run(`git fetch target "${targetBranch}" --unshallow`, repoDir);
    }

    // 7. Create sync branch on top of target branch
    run(`git checkout -b "${syncBranch}" "target/${targetBranch}"`, repoDir);

    // 8. Merge
    process.stderr.write(`Merging origin/${sourceBranch} into ${syncBranch}...\n`);
    const mergeResult = tryRun(
      `git merge --no-ff "origin/${sourceBranch}" -m "sync: merge ${sourceBranch} into ${targetBranch}"`,
      repoDir
    );

    if (!mergeResult.ok) {
      const { conflictingFiles, conflictFile } = collectAndWriteConflicts(repoDir, workDir);
      process.stderr.write(`Conflicts in ${conflictingFiles.length} file(s). Details: ${conflictFile}\n`);
      process.stdout.write(
        JSON.stringify({ success: false, conflict: true, conflictFile, workDir: repoDir }) + '\n'
      );
      process.exit(3);
    }

    // 8b. Restore Mend files from target branch after a clean merge (if requested)
    if (preserveMend) {
      preserveMendFiles(repoDir, targetBranch);
      // Amend the merge commit to include the restored files
      const anyRestored = tryRun('git diff --cached --name-only', repoDir);
      if (anyRestored.out.trim()) {
        run('git commit --amend --no-edit', repoDir);
      }
    }

    // 9. Push sync branch to push remote
    process.stderr.write(`Pushing ${syncBranch}...\n`);
    run(`git push "${pushRemote}" "${syncBranch}"`, repoDir);

    // 10. Collect commits
    const logOut = tryRun(
      `git log "target/${targetBranch}".."${syncBranch}" --format="%H|%s|%an|%ad" --date=short`,
      repoDir
    ).out;
    const commits = parseCommits(logOut);

    process.stdout.write(JSON.stringify({ success: true, syncBranch, commitCount: commits.length, workDir: null }) + '\n');
    fs.rmSync(workDir, { recursive: true, force: true });
    process.exit(0);

  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(2);
  }
}

main();
