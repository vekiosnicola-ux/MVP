---
name: "simplify"
description: "Analyze existing code for over-engineering and simplification opportunities"
---

# Simplify Skill

Analyzes existing code for over-engineering, unnecessary complexity, and violations of the project's minimal philosophy.

## When to Use

- Before major refactors (understand current complexity)
- During code reviews when something "feels heavy"
- Periodically to audit codebase health
- When onboarding to understand technical debt

## Instructions

### 1. Scope the Analysis

Ask: "What should I analyze?"
- A specific file/directory
- A feature area
- The entire codebase (use sampling)

### 2. Check Against Philosophy

Reference `CLAUDE.md` and flag code that violates:

**Over-engineering signals**:
- Abstractions with only 1-2 usages
- Generic utilities for specific problems
- "Future-proofing" code paths never taken
- Config objects for hardcoded values
- Factory patterns for single implementations

**Complexity signals**:
- Functions > 50 lines
- Deeply nested conditionals (> 3 levels)
- More than 5 parameters
- Classes when functions suffice
- Inheritance when composition works

**Dead code signals**:
- Exported functions never imported elsewhere
- Commented-out code blocks
- Unreachable branches
- Unused variables/parameters

### 3. Generate Report

Output format:

```
## Simplification Report: [scope]

### Over-Engineering Found
| File | Issue | Suggestion |
|------|-------|------------|
| src/lib/utils.ts:45 | Generic `retry()` used once | Inline the retry logic |
| src/hooks/useForm.ts | 8-param function | Break into smaller hooks |

### Dead Code
| File | Item | Evidence |
|------|------|----------|
| src/utils/format.ts | `formatPhone()` | No imports found |
| src/types/legacy.ts | Entire file | No references |

### Complexity Hotspots
| File | Metric | Value | Threshold |
|------|--------|-------|-----------|
| src/api/handler.ts | Cyclomatic complexity | 15 | 10 |
| src/components/Form.tsx | Lines | 180 | 100 |

### Philosophy Violations
- [x] Found premature abstraction in X
- [ ] No unnecessary dependencies
- [x] Found "just in case" error handling in Y

### Recommendations (Priority Order)
1. **Quick win**: Delete `src/types/legacy.ts` (dead code)
2. **Medium effort**: Inline `retry()` in `src/lib/utils.ts`
3. **Larger refactor**: Split `Form.tsx` into smaller components
```

## Tools Allowed

- `Grep` (for finding usages/imports)
- `Read` (for examining code)
- `Glob` (for file discovery)
- `Bash` (for `tsc --noUnusedLocals` checks)

## Model Recommendation

Use `Sonnet` for implementation analysis. Use `Haiku` for simple grep/count tasks.

## What NOT to Flag

- Working code that's merely "not how I'd write it"
- Reasonable error handling at system boundaries
- Abstractions with 3+ usages
- Type definitions (even if verbose, they add safety)
- Tests (test code can be verbose)

## Philosophy

This skill enforces CLAUDE.md's "minimal and pragmatic" principle. The goal is to identify code that adds complexity without proportional value—not to chase arbitrary metrics.

A 100-line function that's clear is better than 10 "clean" functions that obscure the logic.
