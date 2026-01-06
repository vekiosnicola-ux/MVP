# Aura Testing Strategy

This document describes the comprehensive testing strategy for Aura, treating it as **two systems running in parallel**:

1. **Human-facing UI** (clarity, trust, flow, speed)
2. **Agent-facing engine** (determinism, safety, learning, execution)

---

## Test Structure

```
src/__tests__/
├── ui/              # UI flow tests (Playwright)
├── agents/          # Agent unit tests
├── contracts/       # Inter-agent contract tests
├── simulation/      # Mock-world end-to-end tests
├── hil/             # Human-in-the-loop integrity tests
├── drift/           # Agent drift detection tests
└── utils/           # Test fixtures and utilities
```

---

## 1. UI Tests (Human Loop)

**Tool**: Playwright  
**Focus**: Flows, not pixels

### Critical Test Axes

| Axis             | Question                                                       |
| ---------------- | -------------------------------------------------------------- |
| Cognitive Load   | Can a human understand what's happening in <5 seconds?         |
| Trust            | Is it always clear *who decided what*?                         |
| Reversibility    | Can I undo or stop *anything*?                                 |
| Latency Feedback | Do I always know whether Aura is thinking, waiting, or acting? |
| Compare-ability  | Can I easily compare plans or outcomes?                        |

### Running UI Tests

```bash
# Run all UI tests
npm run test:ui

# Run in headed mode (see browser)
npm run test:ui:headed

# Run specific test file
npx playwright test src/__tests__/ui/flows.test.ts
```

### Tests Included

- **5-Second Test**: Human can understand what Aura is doing
- **Kill Switch Test**: Human can stop execution instantly
- **Decision Provenance Test**: Can trace prompt → plan → approval → execution → result
- **Task Creation**: Human can create tasks
- **Plan Comparison**: Human can compare multiple plans
- **Approval Flow**: Human can approve/block execution
- **History View**: Human can view execution history

---

## 2. Agent Tests (Machine Loop)

**Tool**: Vitest  
**Focus**: Behavior, structure, constraints

### Planning Agent Tests

Tests determinism, structure, and constraints:

```bash
npm run test:agents
```

**What we test**:
- ✅ Plan structure matches schema
- ✅ Steps have valid agent types
- ✅ Validation commands are present
- ✅ Risks have valid severity levels
- ✅ Constraints are respected

**What we DON'T test**:
- ❌ "Creativity" or output quality
- ❌ Token-perfect phrasing
- ❌ Model-specific responses

### Execution Agent Tests

Tests execution behavior and safety:

```bash
npm run test:agents
```

**What we test**:
- ✅ Circuit breaker stops after max failures
- ✅ Progress callbacks work
- ✅ Step dependencies are handled
- ✅ Quality gates are generated
- ✅ Execution metadata is recorded

---

## 3. Contract Tests

**Tool**: Vitest  
**Focus**: Inter-agent boundaries and contracts

```bash
npm run test:contracts
```

### Contracts Tested

| Contract           | Example                                      |
| ------------------ | -------------------------------------------- |
| Planner → Executor | "No execution instructions without approval" |
| Executor → Git     | "Never commit to main"                       |
| Reviewer → Human   | "Explain rejection in <300 tokens"           |

If one agent violates a contract → **fail fast**.

---

## 4. Mock-World Simulation

**Tool**: Vitest  
**Focus**: End-to-end intelligence testing

```bash
npm run test:simulation
```

### Scenarios Tested

1. **Missing Context**: Add feature with missing context
   - Does Aura ask clarifying questions?
   - Does it downgrade confidence?

2. **Conflicting Instructions**: Impossible constraints
   - Does Aura detect conflicts?
   - Does it refuse execution?

3. **Dangerous Operations**: Delete all tests
   - Does Aura flag dangerous operations?
   - Does it require explicit approval?

4. **End-to-End**: Simple feature addition
   - Does the full workflow complete?
   - Are all steps executed correctly?

---

## 5. Human-in-the-Loop Integrity

**Tool**: Vitest  
**Focus**: HIL system integrity

```bash
npm run test
```

### HIL Integrity Checklist

For any task:

- ✅ **Human can**:
  - See intent
  - See alternatives
  - Stop execution
  - Override learning

- ✅ **Agents**:
  - Wait for approval
  - Explain reasoning
  - Respect constraints

- ✅ **System**:
  - Records decisions
  - Reuses past successes
  - Never hides actions

If one box fails → **ship nothing**.

---

## 6. Agent Drift Tests

**Tool**: Vitest  
**Focus**: Detecting silent drift over time

```bash
npm run test:drift
```

### What We Test

Run the same task:
- Today
- After 10 tasks
- After 50 tasks

Compare:
- Plan length
- Safety checks
- Assumptions
- Constraint adherence

If agents silently drift → **learning system is broken**.

---

## Running All Tests

```bash
# Run all tests (agents + UI)
npm run test:all

# Run only agent/unit tests
npm run test

# Run only UI tests
npm run test:ui

# Watch mode (for development)
npm run test:watch
```

---

## Test Execution Strategy

### Local (Fast Loop)

- ✅ UI smoke tests
- ✅ Agent unit tests
- ✅ Schema validation

### CI (Every PR)

- ✅ Agent contract tests
- ✅ Mock-world simulations
- ✅ No UI snapshot noise

### Weekly (Manual)

- ✅ Founder test session
- ✅ Replay 5 old tasks
- ✅ Kill switch drills

---

## What We DON'T Test

- ❌ Token-perfect outputs
- ❌ "Creativity quality"
- ❌ Minor layout spacing
- ❌ Model-specific phrasing
- ❌ Rare edge hallucinations

Aura is a **system of constraints**, not a chatbot.

---

## Aura's Maturity Signal

You know Aura is ready when:

- ✅ You trust it with a real repo
- ✅ You can walk away during execution
- ✅ You review **decisions**, not diffs
- ✅ It refuses bad ideas before you do

That's when Aura stops being software and becomes **infrastructure**.

---

## Test Fixtures

Common test data is available in `src/__tests__/utils/test-fixtures.ts`:

```typescript
import { createTestTask, createTestPlan, createTestDecision } from '@/__tests__/utils/test-fixtures';

const task = createTestTask({ description: 'Custom task' });
const plan = createTestPlan(task.id);
const decision = createTestDecision(task.id, plan.id);
```

---

## Next Steps

To harden Aura further, consider:

1. **Agent Test Harness**: Automated agent fitness metrics
2. **Self-Grading Agent Loop**: Agents that evaluate their own performance
3. **Failure Museum UI**: Visualize and learn from failures
4. **Visual Regression**: Snapshot tests for critical UI components

---

## Questions?

See the main [AURA.md](../AURA.md) document for architecture details.

