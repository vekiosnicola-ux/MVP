---
name: "verify-setup"
description: "Verify Claude Code setup is complete and correct"
---

# Verify Claude Code Setup

Checks that all Claude Code configuration is properly set up for this project.

## Instructions

Run the following checks and report status:

### 1. Required Files

Check these files exist:
- `.claude/settings.json`
- `.claude/README.md`
- `.claude/agents/coordinator.md`
- `.claude/skills/dieta-positiva-context/skill.md`
- `.claude/skills/run-test-suite/skill.md`
- `CLAUDE.md`

### 2. Settings Validation

In `.claude/settings.json`, verify:
- `subagents.default_instructions` is defined
- `hooks.SubagentStop` is configured

### 3. Git Status

Check:
- `.claude/settings.local.json` is in `.gitignore`
- `.claude/` directory is NOT in `.gitignore`

### 4. Project Files

Verify these project files exist:
- `package.json`
- `DECISIONS.md`

## Output Format

Report as a checklist:

```
Claude Code Setup Verification
==============================

Required Files:
  [x] .claude/settings.json
  [x] .claude/README.md
  ...

Settings Validation:
  [x] subagents.default_instructions defined
  [x] hooks.SubagentStop configured

Git Configuration:
  [x] settings.local.json in .gitignore
  [x] .claude/ tracked (not ignored)

Project Files:
  [x] package.json
  [x] CLAUDE.md
  [x] DECISIONS.md

Status: All checks passed (or X issues found)
```

## Tools Allowed

- `Read` (for checking files)
- `Glob` (for file existence)
- `Bash` (for git checks)

## Model Recommendation

Use `Haiku` for this skill - it's a simple verification task.

## On Failure

If any check fails:
1. Report which check failed
2. Suggest how to fix it
3. Reference `.claude/README.md` for setup instructions
