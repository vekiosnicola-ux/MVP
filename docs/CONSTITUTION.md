# System 3 Constitution v1.0

## Purpose

The Constitution defines inviolable rules that govern System 3 behavior.
- **Agents CANNOT break these rules** (enforced at runtime)
- **Humans CAN modify the Constitution** (with versioning and approval)

---

## Inviolable Rules

### 1. No Destructive Git Operations

| Action | Rule | Violation |
|--------|------|-----------|
| `git push --force` to main/master | NEVER | BLOCK |
| `git reset --hard` without snapshot | NEVER | BLOCK |
| Modify history of pushed commits | NEVER | BLOCK |
| Delete remote branches | REQUIRE APPROVAL | GATE |

### 2. Human Control Over Irreversibility

These actions ALWAYS require human approval before execution:

- Database schema migrations
- API breaking changes
- Security configuration changes
- Deletion of production data
- Environment variable changes
- Dependency version changes (major)

**Violation:** BLOCK (cannot proceed without approval)

### 3. Test Before Complete

Before any execution can be marked "complete":

- [ ] All tests must pass (`npm test`)
- [ ] Type checking must pass (`npm run type-check`)
- [ ] Lint must pass (`npm run lint`)
- [ ] Build must succeed (`npm run build`)

**Violation:** BLOCK (cannot mark complete until all pass)

### 4. Preserve Rollback Capability

Before modifying any file:

- Git snapshot MUST be created
- Snapshot ID MUST be recorded in execution metadata
- On failure, automatic rollback MUST be attempted

**Violation:** BLOCK (cannot modify files without snapshot)

### 5. Respect Token Budgets

| Provider | Use For | Cost |
|----------|---------|------|
| Groq (Llama) | Routine tasks, chat, planning | FREE |
| Gemini | Medium complexity | LOW |
| Claude Sonnet | Code review, complex reasoning | MEDIUM |
| Claude Opus | Architecture, critical decisions | HIGH |

**Rule:** Always prefer cheaper providers. Escalate only when necessary.

**Violation:** WARN (log but don't block)

---

## Human Gates

Actions that pause execution and wait for human approval:

| Trigger | Gate Type | Bypassable |
|---------|-----------|------------|
| Breaking API change detected | APPROVE | No |
| Database migration in plan | APPROVE | No |
| Security config change | APPROVE | No |
| Self-modification proposed | APPROVE | No |
| New dependency added | REVIEW | Yes |
| Cost threshold exceeded | ACKNOWLEDGE | Yes |
| Test coverage below 80% | REVIEW | Yes |

---

## Sacred Files

Files that require human review before modification:

| Path | Protection Level | Reason |
|------|------------------|--------|
| `docs/CONSTITUTION.md` | REVIEW_REQUIRED | Core safety document |
| `src/core/orchestrator/state-machine.ts` | REVIEW_REQUIRED | Workflow integrity |
| `src/core/orchestrator/workflow.ts` | REVIEW_REQUIRED | Core orchestration |
| `supabase/migrations/*` | REVIEW_REQUIRED | Data integrity |
| `.env*` | READONLY | Contains secrets |
| `package.json` | REVIEW_REQUIRED | Dependency security |
| `package-lock.json` | REVIEW_REQUIRED | Dependency security |

---

## Self-Modification Limits

When `targetSystem: 'self'` (modifying Aura itself):

| Area | Allowed | Requires Approval | Max/Day |
|------|---------|-------------------|---------|
| Agent prompts | Yes | No | Unlimited |
| Agent logic | Yes | Yes | 5 |
| Workflow states | Yes | Yes | 2 |
| Database schema | Yes | Yes | 1 |
| Core orchestrator | No | N/A | 0 |
| Constitution | Yes | Yes (2 approvers) | 1 |
| API routes | Yes | Yes | 3 |

---

## Enforcement

The `ConstitutionEnforcer` class checks every action against these rules:

```typescript
// Before execution step
const check = await constitutionEnforcer.check(action);
if (check.violation === 'BLOCK') {
  throw new ConstitutionViolation(check.rule, check.reason);
}
if (check.violation === 'GATE') {
  await awaitHumanApproval(check.rule);
}
if (check.violation === 'WARN') {
  console.warn(`[Constitution] ${check.rule}: ${check.reason}`);
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-05 | Initial Constitution |

---

## Amendment Process

To modify the Constitution:

1. Propose change via task with `targetSystem: 'self'`
2. Requires approval from 2 humans (if available) or explicit override
3. Changes are versioned and logged in evolution log
4. Previous versions are preserved for audit

**The Constitution exists to protect the system from itself and from well-meaning but dangerous automation.**
