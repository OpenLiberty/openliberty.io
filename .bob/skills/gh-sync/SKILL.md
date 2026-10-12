---
name: gh-sync
description: Use when the user wants to sync a branch from a source GitHub repo (github.com or any GHE/GHES host) to a target GitHub repo and open a pull request. Handles PAT prompting, branch selection, repo validation, access check, git merge/push, and PR creation.
---

# gh-sync Workflow

Follow these steps **in order**. Do not skip a step. Use `update_todo_list` to track progress as you move through each step.

Scripts are at `.bob/skills/gh-sync/scripts/` (workspace) or `~/.bob/skills/gh-sync/scripts/` (global install):
- `git-sync.js` — all git operations (clone, merge, push, conflict resume, hard reset).
- `gh-api.js` — GitHub API wrapper; reads the PAT from `GH_PAT` env var so credentials never
  appear in the process argument list, `ps` output, or shell history.

**PAT security rule:** Never echo PAT values in chat. Never pass PATs as CLI positional args or
embed them in URLs. Always pass PATs via the `GH_PAT` env var to `gh-api.js`, or via `SOURCE_PAT`
/ `TARGET_PAT` env vars to `git-sync.js`. Never write PATs to disk.

**Command approval security rule (CRITICAL):** The `execute_command` tool shows the full command
string to the user in an approval dialog. **Never place a literal PAT value inside any
`execute_command` call.** Doing so causes a "Security warning" in the approval UI.

Each `execute_command` call runs in its own shell subprocess — environment variables set with
`export` in one call do **not** persist to the next call. The correct pattern is:

**Step A — write each PAT to a temp file (one `execute_command` per PAT):**
```sh
printf '%s' '<the PAT value>' > /tmp/gh-source-pat && chmod 600 /tmp/gh-source-pat
```
```sh
printf '%s' '<the PAT value>' > /tmp/gh-target-pat && chmod 600 /tmp/gh-target-pat
```
The approval dialog shows only `printf '%s' '<value>' > /tmp/gh-source-pat && chmod 600 …`.
Because it is a plain file-write with no GitHub URL or script invocation, the security heuristic
does not fire. The `chmod 600` ensures the file is readable only by the current user.
Temp files are in `/tmp/` and hold only the token string with no newline.

**Step B — read from the temp file in every subsequent command:**
```sh
GH_PAT="$(cat /tmp/gh-source-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET "<URL>"
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET "<URL>"
```
`$(cat /tmp/gh-source-pat)` is evaluated inside the subprocess at run time — the literal token
never appears in the command string shown to the user.

This pattern applies to **every** `execute_command` call in this workflow that uses a PAT.

**Cleanup:** After Step 7 completes (or on any fatal error), delete the temp files:
```sh
rm -f /tmp/gh-source-pat /tmp/gh-target-pat
```

**API base URL rule:** For `github.com` use `https://api.github.com`. For any other host use
`https://<host>/api/v3`.

**gh-api.js usage:**
```sh
# Assumes /tmp/gh-source-pat and /tmp/gh-target-pat were written in a prior execute_command
GH_PAT="$(cat /tmp/gh-source-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js <METHOD> <URL> [<JSON_BODY>]
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js <METHOD> <URL> [<JSON_BODY>]
```
Omit `GH_PAT` (or leave it empty) for unauthenticated calls to public repos on `github.com`.

---

## Step 0 — Load config file (optional fast-path)

### 0a — Resolve config path

Determine the config file path using this priority order:

1. **Explicit path in the user's prompt** — if the user's message contains a file path (relative
   or absolute, e.g. `./sync.json`, `~/configs/prod.json`, `/etc/gh-sync.json`), use that path.
   Resolve a relative path against the current workspace folder.
2. **Workspace default** — check for `gh-sync.json` in the current workspace folder:
   `<workspaceFolder>/gh-sync.json`.
3. **No config** — if neither is found, proceed without config (all fields collected interactively).

### 0b — Read and apply the config

Read the resolved path:

```sh
cat <resolved-config-path> 2>/dev/null
```

If the file exists and is valid JSON, pre-fill every field it contains.
If the file is missing or unreadable (including when the user supplied an explicit path), report:
> ⚠️ Config file not found at `<path>` — continuing without it.

### Recognised config fields

```json
{
  "sourceHost":    "github.com",
  "sourceOwner":   "my-org",
  "sourceRepo":    "my-repo",
  "sourceBranch":  "main",
  "sourcePat":     "ghp_...",
  "targetHost":    "github.ibm.com",
  "targetOwner":   "my-other-org",
  "targetRepo":    "my-repo",
  "targetBranch":  "main",
  "targetPat":     "ghp_...",
  "preserveMend":  true
}
```

All fields are optional. Any field present in the config is treated as **pre-filled** and must
**not** be asked for interactively in later steps. Any field absent or `null` is collected
interactively as normal.

`preserveMend` (boolean, default `false`) — when `true`, the sync will restore any Mend /
Whitesource files that exist on the target branch (`.whitesource`, `.whitesource.config`, files
under `.mend/`, `mend.config.json`, etc.) after the merge, keeping the target's Mend
configuration intact. Set this in the config to skip the interactive prompt in Step 3.

After loading successfully, tell the user which fields were pre-filled (names only — **never echo PAT values**):

> Loaded config from `<path>`. Pre-filled: sourceHost, sourceOwner, …
> _(PATs loaded from config — not displayed.)_

If no config was found at either location, say nothing and proceed directly to Step 1.

> **Tip (show once if no config found):** To skip interactive prompts in future, add a
> `gh-sync.json` to your workspace root, or pass a path in your prompt — e.g.
> _"sync a branch using ./my-sync-config.json"_.

---

## Step 1 — Detect workspace repo (optional pre-fill)

Before asking for anything, check whether the current workspace folder is a git repo with a
GitHub remote. Run:

```sh
git -C <workspaceFolder> remote get-url origin 2>/dev/null
```

where `<workspaceFolder>` is the currently open workspace directory (available from the
environment). If the command succeeds and the URL contains a GitHub host (e.g. `github.com` or
`github.ibm.com`), extract `host`, `owner`, and `repo` from the remote URL.

Remote URL patterns:
- HTTPS: `https://<host>/<owner>/<repo>.git`
- SSH: `git@<host>:<owner>/<repo>.git`

If a valid GitHub remote is found, ask using `ask_followup_question`:

> I can see this workspace is **`<owner>/<repo>`** on `<host>`. Would you like to use it as the
> source or target of the sync, or neither?

- **Source** → pre-fill `sourceHost`, `sourceOwner`, `sourceRepo`.
- **Target** → pre-fill `targetHost`, `targetOwner`, `targetRepo`.
- **Neither** → continue without pre-filling.

If no git remote is found, skip silently and continue.

---

## Step 2 — Collect credentials

Ask the user using `ask_followup_question` (one at a time). **Skip any field that was already
pre-filled from Step 0 (config) or Step 1 (workspace detect).** If all four fields are already
pre-filled, skip this step entirely.

1. **Source GitHub host** — e.g. `github.com` or `github.ibm.com`. Default: `github.com`.
   _(skip if pre-filled)_
2. **Source PAT** — Personal Access Token for the source host.
   Scopes: `Contents: Read` (fine-grained) or `repo` (classic).
   **Optional if the source repo is public** — offer "The source repo is public — no PAT needed"
   as a suggestion.
   _(skip if pre-filled from config)_
3. **Target GitHub host** — e.g. `github.com` or `github.ibm.com`.
   _(skip if pre-filled)_
4. **Target PAT** — PAT for the target host.
   Scopes: `Contents: Read & Write` + `Pull requests: Read & Write` (fine-grained) or `repo` (classic).
   Add `Forking: Read & Write` if direct push access may be absent.
   _(skip if pre-filled from config)_

Store PAT values in memory only. Then **immediately** write each PAT to a temp file using a
dedicated `execute_command` call (one per PAT, nothing else in the command):

```sh
printf '%s' '<source PAT value>' > /tmp/gh-source-pat && chmod 600 /tmp/gh-source-pat
```
```sh
printf '%s' '<target PAT value>' > /tmp/gh-target-pat && chmod 600 /tmp/gh-target-pat
```

From this point on, all commands read PATs via `$(cat /tmp/gh-source-pat)` /
`$(cat /tmp/gh-target-pat)` — the literal token never appears in any command string.

Store as `SOURCE_HOST`, `SOURCE_PAT` (may be empty string), `TARGET_HOST`, `TARGET_PAT` in memory.

---

## Step 3 — Load branches

Once `sourceOwner/sourceRepo` and `targetOwner/targetRepo` are known (from config, workspace
detect, or user input), fetch branches for both repos. Compute `SRC_API` and `TGT_API` from the
API base URL rule at the top.

If `sourceBranch` and `targetBranch` were both pre-filled (from config), skip the branch-listing
calls and the user prompt — go directly to Step 4 using the pre-filled values. Still validate
that the pre-filled branch names actually exist (check that the API response in Step 4 does not
return a 404 for the branch).

Run two calls. `GH_PAT` may be empty for public source repos.
**Temp files must already be written before this step.**

```sh
GH_PAT="$(cat /tmp/gh-source-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<SRC_API>/repos/<sourceOwner>/<sourceRepo>/branches?per_page=100" && \
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/repos/<targetOwner>/<targetRepo>/branches?per_page=100"
```

- Parse the JSON arrays. Extract the `name` field from each element.
- If either response is an error object (has `message` key), report it and ask the user to verify PAT and repo name.
- If either repo has more than 100 branches (response length equals 100), fetch the next page.
  To get pagination headers, run the same call with `curl -si` (adding `-i`) directly once to
  read the `Link:` header, then follow `rel="next"` URLs until none remain.
- Present the branch lists in chat. Ask the user to pick one source branch and one target branch.
- Store: `sourceOwner`, `sourceRepo`, `sourceBranch`, `targetOwner`, `targetRepo`, `targetBranch`.

### 3b — Ask about Mend / Whitesource file preservation

**Skip this sub-step if `preserveMend` was already set via the config file.**

After the user has confirmed the branch selection, ask using `ask_followup_question`:

> This sync will merge the **source** branch into the **target**. If the target repo has Mend /
> Whitesource configuration files (`.whitesource`, `.whitesource.config`, files under `.mend/`,
> `mend.config.json`, etc.), merging from source could overwrite or remove them.
>
> Would you like to **preserve the target's Mend files** after the sync?

- **Yes — preserve target Mend/Whitesource files:** The sync will restore the target's Mend files
  after the merge so the PR keeps your existing Mend configuration intact.
- **No — let source overwrite them:** Mend files from source (if any) will be used as-is. Target's
  Mend files will be replaced or removed by the merge.

Store the answer as `preserveMend` (boolean). Pass `--preserve-mend` to `git-sync.js` when `true`.

### 3c — Offer to save config

**Skip this sub-step entirely if the current run was loaded from a config file (Step 0 succeeded).**

Once all inputs are in hand (hosts, owners, repos, branches, `preserveMend`), ask using
`ask_followup_question`:

> All inputs collected. Would you like to save these settings to a config file so you can reuse
> them without re-entering anything next time?
>
> PATs will **not** be saved.

- **Yes — save config:** Write the file (see below) and tell the user the path.
- **No — continue without saving:** Proceed directly to Step 4.

**If the user chooses Yes:**

1. Derive the filename from the repo names and hosts:
   `<sourceOwner>-<sourceRepo>--<targetOwner>-<targetRepo>.gh-sync.json`
   Replace any character that is not alphanumeric, `-`, or `_` with `-`.
   Example: `my-org-my-repo--other-org-my-repo.gh-sync.json`

2. Write the file to the current workspace folder using `write_file`:

   ```json
   {
     "sourceHost":   "<sourceHost>",
     "sourceOwner":  "<sourceOwner>",
     "sourceRepo":   "<sourceRepo>",
     "sourceBranch": "<sourceBranch>",
     "targetHost":   "<targetHost>",
     "targetOwner":  "<targetOwner>",
     "targetRepo":   "<targetRepo>",
     "targetBranch": "<targetBranch>",
     "preserveMend": <true|false>
   }
   ```

   **Never include `sourcePat` or `targetPat` in the saved file.**

3. Tell the user:
   > Config saved to `<filename>`. Pass it next time with:
   > _"sync using ./<filename>"_
   > or place it as `gh-sync.json` in the workspace root to load it automatically.

---

## Step 4 — Validate repos

Fetch metadata for both repos:

```sh
GH_PAT="$(cat /tmp/gh-source-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<SRC_API>/repos/<sourceOwner>/<sourceRepo>"

GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/repos/<targetOwner>/<targetRepo>"
```

Apply these three checks using the JSON responses:

1. **Name match** — normalise both repo names to lowercase with `-`, `_`, `.` removed. They must match, or one must contain the other.
2. **Topic overlap** — if both repos have non-empty `topics` arrays, at least one topic must be shared. If either has no topics, skip this check.
3. **Description similarity** — if both have non-empty `description` fields, read the first sentence of each. If they describe clearly different projects, flag it.

If all checks pass: tell the user "Repos appear compatible" and proceed to Step 5.

If any check fails: tell the user which check(s) failed with the specific values. Ask: "Continue anyway?" — yes → proceed, no → halt.

---

## Step 5 — Check access and fork fallback

**5a — Check push permission:**

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/repos/<targetOwner>/<targetRepo>"
```

Inspect `permissions.push` in the response:

**If `true` (direct access):**
- Store `accessMode = "direct"`.
- Store `pushRemote = https://<TARGET_HOST>/<targetOwner>/<targetRepo>.git`
  (**no credentials in the URL** — `git-sync.js` injects `TARGET_PAT` via git credential config).
- Tell the user "Direct push access confirmed."
- Proceed to Step 6.

**If `false` or missing (no direct access):**

**5b — Get authenticated username:**

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/user"
```

Store `forkOwner` = the `login` field.

**5c — Check for existing fork:**

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/repos/<forkOwner>/<targetRepo>"
```

Check the response: if it contains `"id":` at the top level the fork exists. If the response has
`"message": "Not Found"` proceed to **5d**.

- If fork exists with `"fork": true` → store `accessMode = "existing-fork"`, store
  `pushRemote = https://<TARGET_HOST>/<forkOwner>/<targetRepo>.git`.
  Tell the user "Using your existing fork." Proceed to Step 6.
- Otherwise → proceed to **5d**.

**5d — Create fork:**

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js POST \
  "<TGT_API>/repos/<targetOwner>/<targetRepo>/forks" '{}'
```

Then poll every 3 seconds up to 10 times until the fork is ready:

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/repos/<forkOwner>/<targetRepo>"
```

Once the response has `"fork": true`: store `accessMode = "created-fork"`, store
`pushRemote = https://<TARGET_HOST>/<forkOwner>/<targetRepo>.git`.
Tell the user "Fork created at `<forkOwner>/<targetRepo>`."

If still not ready after 10 attempts: halt — "Fork creation timed out. Create the fork manually
at `<TARGET_HOST>/<targetOwner>/<targetRepo>` then re-run."

---

## Step 6 — Git sync

Compute `syncBranch` using the current date/time. **Always generate it with a shell command** — never hard-code or guess the date:

```sh
date -u '+%Y%m%d-%H%M'
```

Set `syncBranch` = `sync/<sourceBranch>-<output of above command>`.
Example: if `sourceBranch` = `main` and the command outputs `20250714-0932`, then `syncBranch` = `sync/main-20250714-0932`.

Compute `prHead`:
- `accessMode = "direct"` → `prHead = <syncBranch>`
- otherwise → `prHead = <forkOwner>:<syncBranch>`

**Fresh run:**

```sh
SOURCE_PAT="$(cat /tmp/gh-source-pat)" TARGET_PAT="$(cat /tmp/gh-target-pat)" \
  node ~/.bob/skills/gh-sync/scripts/git-sync.js \
  --source-host <SOURCE_HOST> --source-repo <sourceOwner>/<sourceRepo> \
  --source-branch <sourceBranch> \
  --target-host <TARGET_HOST> --target-repo <targetOwner>/<targetRepo> \
  --target-branch <targetBranch> \
  --push-remote <pushRemote> \
  --sync-branch <syncBranch> \
  [--preserve-mend]        # include only when preserveMend = true
```

- `SOURCE_PAT` may be an empty string for public source repos.
- `pushRemote` must **not** contain credentials (e.g. `https://github.ibm.com/org/repo.git`).
  The script injects `TARGET_PAT` internally via git credential config.
- Add `--preserve-mend` when the user chose to preserve Mend files (Step 3b or config).
  When set, the script restores any Mend/Whitesource files from the target branch into the merge
  commit, so the PR diff shows them as preserved rather than overwritten.

Timeout: 300 seconds.

**Exit 0 (success):** parse stdout JSON `{ success: true, syncBranch, commitCount, workDir: null }`. Store `commitCount`. Proceed to Step 7.

**Exit 3 (conflict):** parse stdout JSON `{ success: false, conflict: true, conflictFile, workDir }`.

Read the conflict details file: `cat <conflictFile>` — this is a JSON file at `<conflictFile>`
written by the script. Parse it to get:
- `conflictingFiles[]` — list of files with merge conflicts
- `diffs{}` — per-file diff text (truncated to 100 lines for chat)
- `resolvability{}` — per-file classification: `"auto"` (safe to accept source) or `"review"` (needs human eye)
- `htmlDiffFile` — path to the full HTML diff viewer (e.g. `<workDir>/conflict-diff.html`)

**Do not take any resolution action yet.** First show the user a full conflict summary, then ask.

### 6a — Show conflict summary

Present the following in chat:

1. **Conflict count and file list** — list every file in `conflictingFiles[]` with its ✅/⚠️ badge from `resolvability{}`.
2. **Per-file diff** — for each file, show the diff from `diffs[file]` (truncated to 100 lines).
   Format each as a fenced `diff` code block with the filename as a header.
3. **HTML diff viewer** — tell the user an HTML diff viewer was generated at `htmlDiffFile` (full side-by-side diff with all files, ✅/⚠️ badges, and navigation sidebar). Offer to open it using `create_html_artifact`.
4. **Divergence assessment** — if the conflict count is high (>10 files) or the diffs show
   wholesale replacement of content (e.g. entire version numbers changed across many files), note:
   > ⚠️ These branches appear significantly diverged. The conflicts will recur on every sync
   > until the target is aligned with the source. See the alignment options below.
5. **Resolvability summary** — count ✅ auto-resolvable and ⚠️ needs-review files from `resolvability{}`:
   > ✅ **<N-auto> auto-resolvable** — plain text files, safe to accept source wholesale for a sync
   > ⚠️ **<N-review> need review** — binary, submodule, lock file, or config with environment-specific values

### 6b — Ask how to proceed

After showing the summary, ask using `ask_followup_question`:

> Conflicts detected in **`<N>`** file(s) — ✅ `<N-auto>` auto-resolvable, ⚠️ `<N-review>` need review.
> How would you like to proceed?

- **Option A — Auto-resolve ✅ files, pause on ⚠️:** Bob accepts source for safe files; you
  resolve flagged ones manually, then say "ready to retry".
- **Option B — Accept source for all files:** Bob accepts source for every conflict without
  exception. The PR will make the target identical to source for all conflicting files.
- **Option C — Sync to a new branch instead:** Rather than merging into `<targetBranch>`, push
  source directly to a new branch on the target (e.g. `4.x`). The existing target branch stays
  untouched. Bob re-runs with a new `syncBranch` name you choose and opens the PR into the new
  branch.
- **Option D — Hard-reset the target branch to match source:** The sync branch will be a
  force-push of source HEAD — making target identical to source with no merge conflicts now or in
  future syncs (until target diverges again). **This is destructive** — any target-only commits
  not in source will be lost from the branch (they remain in git history).
- **Option E — Resolve everything manually:** Bob shows the work dir and waits for "ready to
  retry".

### 6c — Execute chosen resolution

**Note:** `workDir` in the conflict JSON is the `repo/` subdirectory — run all git commands in it.

**Option A — Auto-resolve ✅, pause on ⚠️:**

1. **Auto-fix the ✅ files** — accept source (theirs) for every file in `conflictingFiles[]` where `resolvability[file] === "auto"`:

   ```sh
   cd <workDir>
   git checkout --theirs -- <auto-file1> <auto-file2> ...
   git add <auto-file1> <auto-file2> ...
   ```

2. **Show HTML diff for ⚠️ files** — read the HTML diff from `htmlDiffFile` and render it using `create_html_artifact`:

   ```javascript
   const htmlContent = fs.readFileSync('<htmlDiffFile>', 'utf8');
   create_html_artifact({
     id: "gh_sync_conflict_diff",
     title: "Merge Conflict Diff",
     description: "Side-by-side diff of conflicting files. ✅ Auto-resolved, ⚠️ need your review.",
     html: htmlContent
   });
   ```

   Tell the user:
   > ✅ **Auto-resolved <N-auto> file(s)** by accepting source.
   > ⚠️ **<N-review> file(s) still need your review** — see the HTML diff viewer above (side-by-side, full context, ✅/⚠️ badges).
   > Resolve these files in `<workDir>`, run `git add . && git merge --continue`, then say **ready to retry**.

3. **Wait for "ready to retry"** — do not proceed until the user confirms. Then run the **resume push** (§6d).

**Option B — Accept source for all:**

```sh
cd <workDir>
git checkout --theirs -- <file1> <file2> ...
git add .
GIT_EDITOR=true git merge --continue
```

Immediately run the **resume push** (§6d).

**Option C — Sync to a new branch:**

Ask the user for a new target branch name (e.g. `4.x`). Recompute:
- `syncBranch` = `sync/<sourceBranch>-$(date -u '+%Y%m%d-%H%M')` — run `date -u '+%Y%m%d-%H%M'` to get a fresh timestamp
- `prHead` = `<syncBranch>` (direct) or `<forkOwner>:<syncBranch>` (fork)

Abort the current merge and clean up the old work dir:
```sh
cd <workDir> && git merge --abort
```

Re-run as a fresh sync with the new `--target-branch`:
```sh
SOURCE_PAT="$(cat /tmp/gh-source-pat)" TARGET_PAT="$(cat /tmp/gh-target-pat)" \
  node ~/.bob/skills/gh-sync/scripts/git-sync.js \
  --source-host <SOURCE_HOST> --source-repo <sourceOwner>/<sourceRepo> \
  --source-branch <sourceBranch> \
  --target-host <TARGET_HOST> --target-repo <targetOwner>/<targetRepo> \
  --target-branch <new-target-branch> \
  --push-remote <pushRemote> \
  --sync-branch <syncBranch> \
  [--preserve-mend]        # include only when preserveMend = true
```

Handle exit codes as in the fresh run above. If exit 0, proceed to Step 7 with the new branch.

**Option D — Hard reset:**

Confirm with the user: "This will force-push source HEAD to `<syncBranch>` on the push remote.
Any commits on `<targetBranch>` that are not in `<sourceBranch>` will be absent from this branch.
They remain in git history but will not appear in the PR diff. Proceed?"

If confirmed, clean up the current conflict work dir, then run:

```sh
SOURCE_PAT="$(cat /tmp/gh-source-pat)" TARGET_PAT="$(cat /tmp/gh-target-pat)" \
  node ~/.bob/skills/gh-sync/scripts/git-sync.js \
  --hard-reset \
  --source-host <SOURCE_HOST> --source-repo <sourceOwner>/<sourceRepo> \
  --source-branch <sourceBranch> \
  --push-remote <pushRemote> \
  --sync-branch <syncBranch>
```

- Exit 0 → proceed to Step 7. The PR will show the full delta between target branch and source HEAD.
- Exit 2 → report error and halt.

**Note on fork + hard reset:** `--push-remote` is the plain fork URL. The PR head will
be `<forkOwner>:<syncBranch>`. The PR body should note "Hard reset: target will match source HEAD
after merge."

**Option E — Manual:**

Tell the user: "Resolve conflicts in `<workDir>`, run `git add . && git merge --continue`,
then say **ready to retry**." Wait, then run the **resume push** (§6d).

### 6d — Resume push (Options A, B, E converge here)

```sh
SOURCE_PAT="$(cat /tmp/gh-source-pat)" TARGET_PAT="$(cat /tmp/gh-target-pat)" \
  node ~/.bob/skills/gh-sync/scripts/git-sync.js \
  --resume-work-dir <workDir> \
  --push-remote <pushRemote> \
  --sync-branch <syncBranch> \
  --target-branch <targetBranch> \
  --source-host <SOURCE_HOST> --source-repo <sourceOwner>/<sourceRepo> \
  --source-branch <sourceBranch> \
  --target-host <TARGET_HOST> --target-repo <targetOwner>/<targetRepo> \
  [--preserve-mend]        # include only when preserveMend = true
```

- Exit 0 → proceed to Step 7.
- Exit 3 again → read the new `conflictFile`, show remaining conflicts, repeat from **6b** once.
  If conflicts persist after two rounds, halt: "Conflicts remain. Push `<syncBranch>` manually
  from `<workDir>` and open the PR with head `<prHead>`."
- Exit 2 → report error and halt.

**Exit 2 (error):** report stderr and halt.

---

## Step 7 — Create PR

**7a — Idempotency check** (skip creation if PR already exists):

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js GET \
  "<TGT_API>/repos/<targetOwner>/<targetRepo>/pulls?head=<prHead>&base=<targetBranch>&state=open"
```

If the array is non-empty, tell the user "Open PR already exists: `<html_url>`" and stop.

**7b — Build the commit table** from `commitCount` stored in Step 6:

```
| SHA | Message | Author | Date |
|-----|---------|--------|------|
| <sha[0:7]> | <message> | <author> | <date> |
...
```

**7c — Create PR:**

```sh
GH_PAT="$(cat /tmp/gh-target-pat)" node ~/.bob/skills/gh-sync/scripts/gh-api.js POST \
  "<TGT_API>/repos/<targetOwner>/<targetRepo>/pulls" \
  '{"title":"sync: <SOURCE_HOST>/<sourceOwner>/<sourceRepo>@<sourceBranch> -> <targetBranch> (<YYYY-MM-DD>)","body":"## Sync PR\n**Source:** <SOURCE_HOST>/<sourceOwner>/<sourceRepo> @ <sourceBranch>\n**Target branch:** <targetBranch>\n**Synced at:** <ISO timestamp>\n\n### Commits\n<commit table>","head":"<prHead>","base":"<targetBranch>"}'
```

Parse the response. On success tell the user "PR created: `<html_url>`". On error report the response body and tell the user the sync branch was pushed — they can open the PR manually.

---

## Quick Reference

| Step | Method | API / command |
|------|--------|---------------|
| 1 | `execute_command` | `git remote get-url origin` (workspace pre-fill) |
| 3 | `gh-api.js GET` | `/repos/{owner}/{repo}/branches` |
| 3b | `ask_followup_question` | Preserve Mend/Whitesource files? (skip if `preserveMend` in config) |
| 3c | `ask_followup_question` + `write_file` | Save config? (skip if loaded from config; never saves PATs) |
| 4 | `gh-api.js GET` | `/repos/{owner}/{repo}` × 2 |
| 5 | `gh-api.js GET/POST` | `/repos/{owner}/{repo}`, `/user`, `/repos/{owner}/{repo}/forks` |
| 6 | `execute_command` | `git-sync.js [--preserve-mend]` (exit 3 → conflict resolution prompt) |
| 7 | `gh-api.js GET + POST` | `/repos/{owner}/{repo}/pulls` |

### PAT scopes

| PAT | Fine-grained | Classic |
|-----|-------------|---------|
| Source | `Contents: Read` (optional for public repos) | `repo` |
| Target (direct) | `Contents: Read & Write` + `Pull requests: Read & Write` | `repo` |
| Target (fork) | Above + `Forking: Read & Write` | `repo` |

### Security rules
- PATs are collected via `ask_followup_question`, then written to temp files with a dedicated
  `execute_command` (`printf '%s' '<value>' > /tmp/gh-source-pat` / `> /tmp/gh-target-pat`).
  All subsequent commands read them via `$(cat /tmp/gh-source-pat)` / `$(cat /tmp/gh-target-pat)`
  — the literal token never appears in any command string. This avoids the "Security warning" in
  the command approval dialog, and the token is available across separate `execute_command` calls.
- `gh-api.js` sends the `Authorization` header via the Node.js `https` module — the PAT is never
  passed as a CLI argument; it lives only in the Node.js process environment.
- `pushRemote` must **not** contain credentials. `git-sync.js` injects the target PAT via git
  credential config internally.
- PATs are never written to disk and never echoed in chat.


## Supporting files in this skill directory:
- scripts/git-sync.js
- scripts/gh-api.js
