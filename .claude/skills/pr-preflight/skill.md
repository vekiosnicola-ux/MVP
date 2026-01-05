---
name: "pr-preflight"
description: "Deterministic checks before creating a pull request"
---

# PR Preflight Skill

Runs automated checks to ensure a branch is ready for pull request. Deterministic, fast, no judgment calls.

## When to Use

- Before running `gh pr create`
- After finishing a feature branch
- When CI is failing and you need to debug locally

## Instructions

Run these checks in order. Stop on first failure unless `--all` is specified.

### 1. Git State Check

```bash
# Ensure clean working directory
git status --porcelain
# Should be empty or only untracked files

# Ensure branch is up to date with remote
git fetch origin main
git log origin/main..HEAD --oneline
# Verify commits exist and are intentional
```

**Pass criteria**:
- No uncommitted changes to tracked files
- Branch has commits ahead of main

### 2. Branch Naming

```bash
git branch --show-current
```

**Pass criteria**:
- Matches pattern: `claude/*`, `feat/*`, `fix/*`, `chore/*`, or `refactor/*`
- No spaces or special characters
- Descriptive (not `test`, `temp`, `wip` alone)

### 3. Commit Quality

```bash
git log origin/main..HEAD --format="%s"
```

**Pass criteria**:
- Each commit message starts with verb (Add, Fix, Update, Remove, Refactor)
- No "WIP" or "temp" commits
- Messages are descriptive (> 10 characters)

### 4. No Secrets in Diff

```bash
git diff origin/main...HEAD
```

**Fail if diff contains**:
- `SUPABASE_` followed by key-like string
- `sk_live_`, `pk_live_`, `sk_test_`
- `-----BEGIN.*KEY-----`
- `.env` file additions
- `password = "`, `secret = "`, `apiKey = "`

### 5. Type Check

```bash
npm run type-check
```

**Pass criteria**: Exit code 0

### 6. Lint

```bash
npm run lint
```

**Pass criteria**: Exit code 0, no errors (warnings OK)

### 7. Tests

```bash
npm test
```

**Pass criteria**: All tests pass

### 8. Build (Optional)

```bash
npm run build
```

**Pass criteria**: Exit code 0 (run if `--with-build` flag)

## Output Format

```
PR Preflight Check
==================

Branch: claude/add-user-auth
Commits: 3 ahead of main

[x] Git state clean
[x] Branch naming valid
[x] Commit messages OK
[x] No secrets in diff
[x] Type check passed
[x] Lint passed
[x] Tests passed (24 tests, 1.2s)
[ ] Build (skipped, use --with-build)

Status: READY FOR PR

Next: gh pr create --title "Add user authentication"
```

Or on failure:

```
PR Preflight Check
==================

Branch: temp
Commits: 1 ahead of main

[x] Git state clean
[ ] Branch naming: FAIL
    - "temp" is not a valid branch prefix
    - Use: claude/*, feat/*, fix/*, chore/*, refactor/*

Status: NOT READY

Fix the above issues before creating PR.
```

## Tools Allowed

- `Bash` (for git commands, npm scripts)
- `Grep` (for secret scanning)
- `Read` (for examining specific files if needed)

## Model Recommendation

Use `Haiku` - this is deterministic automation, no reasoning required.

## Flags

- `--all`: Run all checks even after failure
- `--with-build`: Include build step
- `--fix`: Auto-fix what's possible (run lint:fix, stage changes)

## Why This Exists

Manual PR checklist is error-prone. This skill ensures every PR meets baseline quality before human review begins. Catches:

- Embarrassing "oops forgot to commit" moments
- Secrets accidentally committed
- Broken builds that waste CI minutes
- Poorly named branches that clutter git history
