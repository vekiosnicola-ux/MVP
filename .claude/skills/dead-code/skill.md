---
name: "dead-code"
description: "Detect unused exports, unreachable code, and orphaned files"
---

# Dead Code Detection Skill

Finds code that exists but is never used. Uses TypeScript tooling and static analysis.

## When to Use

- Before major releases (clean up cruft)
- After removing a feature (find orphaned code)
- During quarterly codebase audits
- When bundle size seems too large

## Instructions

### 1. Unused Exports

For each `.ts`/`.tsx` file, check if exported items are imported elsewhere.

```bash
# Find all exports in a file
grep -E "^export (const|function|class|type|interface|enum)" src/lib/utils.ts

# For each export, check if it's imported anywhere
grep -r "import.*formatDate" --include="*.ts" --include="*.tsx" src/
```

**Detection logic**:
- Export exists in file A
- No `import { X } from 'A'` found in any other file
- Exception: Entry points (`page.tsx`, `route.ts`, `layout.tsx`) don't need imports

### 2. Orphaned Files

Files that exist but are never imported.

```bash
# List all source files
find src -name "*.ts" -o -name "*.tsx" | grep -v test | grep -v ".d.ts"

# For each file, check if it's imported anywhere
grep -r "from './utils'" --include="*.ts" --include="*.tsx" src/
```

**Exception list** (files that don't need imports):
- `src/app/**/page.tsx`
- `src/app/**/layout.tsx`
- `src/app/**/route.ts`
- `src/app/**/loading.tsx`
- `src/app/**/error.tsx`
- `tailwind.config.js`
- `next.config.js`
- Config files at root

### 3. TypeScript Compiler Checks

```bash
# Check for unused locals (requires tsconfig setting)
npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | head -50
```

### 4. Commented Code Blocks

```bash
# Find multi-line comments that look like code
grep -n "^\s*//.*function\|^\s*//.*const\|^\s*//.*return" src/**/*.ts
```

### 5. Unreachable Code Patterns

Look for:
- Code after `return`, `throw`, `break`, `continue`
- Conditions that are always true/false
- Catch blocks that just rethrow

## Output Format

```
Dead Code Report
================

## Unused Exports (High Confidence)

| File | Export | Last Modified |
|------|--------|---------------|
| src/lib/format.ts | formatPhone | 2024-01-15 |
| src/lib/format.ts | formatSSN | 2024-01-15 |
| src/utils/legacy.ts | convertOldFormat | 2023-11-20 |

## Orphaned Files

| File | Size | Last Modified |
|------|------|---------------|
| src/components/OldHeader.tsx | 2.4kb | 2023-10-01 |
| src/hooks/useDeprecatedAuth.ts | 1.1kb | 2023-09-15 |

## Commented Code Blocks

| File | Lines | Preview |
|------|-------|---------|
| src/api/handler.ts | 45-52 | // function oldHandler()... |

## TypeScript Warnings

```
src/lib/utils.ts(12,7): 'tempVar' is declared but never used
src/hooks/useForm.ts(34,15): 'debugMode' is declared but never used
```

## Summary

- Unused exports: 3
- Orphaned files: 2
- Commented code blocks: 1
- TypeScript warnings: 2

Estimated removable code: ~150 lines
```

## Tools Allowed

- `Grep` (primary tool for import analysis)
- `Glob` (file discovery)
- `Bash` (for tsc, find commands)
- `Read` (for examining flagged files)

## Model Recommendation

Use `Haiku` for grep/glob operations. Use `Sonnet` only if analysis requires understanding code semantics.

## False Positive Handling

Some exports are legitimately unused in application code:
- Types exported for external consumers
- Test utilities
- Public API surface (even if not used internally)

Mark these with `// @public` comment to exclude from dead code detection.

## Safety

This skill only **reports**. It never deletes code. Deletion is a human decision or a separate, explicit action.

## Integration

Can be run as part of CI:

```yaml
# In GitHub Actions
- name: Dead Code Check
  run: claude skill dead-code --ci --fail-on-orphans
```
