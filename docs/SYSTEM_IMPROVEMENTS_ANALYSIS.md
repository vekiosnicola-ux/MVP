# System Improvements Analysis

**Date**: 2026-01-05
**Context**: Analysis of Aura MVP against production agent workflow best practices

## Executive Summary

Current system implements core workflow patterns well (multi-proposal planning, human approval gates, state machine, audit trail). Key gaps are in **execution safety**, **feedback loop integration**, and **resilience patterns**.

---

## Current System Strengths

### ✅ Already Implemented Well

1. **Multi-Proposal Planning** ✓
   - Generates 2 proposals per task (Standard + Fast-Track)
   - src/core/agents/planning-agent.ts
   - Uses Claude API with structured prompts

2. **Human Approval Gate** ✓
   - Plan-Validate-Execute pattern implemented
   - `awaiting_human_decision` state requires approval
   - Decision recording in src/core/db/decisions.ts

3. **Explicit State Machine** ✓
   - 8-state workflow with deterministic transitions
   - src/core/orchestrator/state-machine.ts
   - Guards, validation, event emission

4. **Decision Logging & Audit Trail** ✓
   - All decisions recorded (decisions table)
   - State transition history tracked
   - Full workflow history API

5. **Quality Gates** ✓
   - src/core/orchestrator/quality-gates.ts
   - Automated checks on execution results

6. **Human Overrides Database** ✓
   - src/core/db/overrides.ts
   - Captures AI suggestion → Human correction
   - Tracks application frequency

---

## Critical Gaps (High Priority)

### 🔴 Gap 1: Execution Safety & Sandboxing

**Research Pattern**: Execution in isolated environments (Docker containers), circuit breakers, compensation logic

**Current State**:
- Mock execution agent only (src/core/agents/execution-agent.ts)
- No sandboxing or isolation
- No rollback/undo mechanisms
- No circuit breakers for failures

**Impact**: HIGH - Cannot safely execute real changes

**Recommendation**:
```typescript
// Need to implement:
1. Real execution agent using Claude Code API or local git operations
2. Execution sandbox (Docker container or isolated workspace)
3. Pre-execution snapshot for rollback
4. Compensation logic to undo partial changes
5. Circuit breaker pattern for repeated failures
```

**Files to Create**:
- `src/core/agents/real-execution-agent.ts`
- `src/core/safety/sandbox.ts`
- `src/core/safety/rollback.ts`
- `src/core/safety/circuit-breaker.ts`

---

### 🔴 Gap 2: Feedback Loop Not Wired to Planning

**Research Pattern**: ALHF - human corrections fed back to improve future plans

**Current State**:
- Human overrides captured (src/core/db/overrides.ts)
- Planning agent doesn't use overrides
- No learning from past approvals/rejections

**Impact**: HIGH - System doesn't improve over time

**Recommendation**:
```typescript
// In planning-agent.ts, inject relevant overrides:
async generatePlans(task: Task): Promise<Plan[]> {
  // 1. Fetch relevant overrides by category/context
  const relevantOverrides = await getRelevantOverrides(task);

  // 2. Inject into prompt as "learned patterns"
  const prompt = createPlanningPromptWithLearning(task, relevantOverrides);

  // 3. Generate plans with context
  return claudeClient.generateJSON(prompt);
}
```

**Files to Modify**:
- `src/core/agents/planning-agent.ts` (add override injection)
- `src/core/db/overrides.ts` (add similarity/relevance search)

---

### 🟡 Gap 3: No Verifier/Refiner Agents

**Research Pattern**: Dedicated verifier checks plan logic/safety; refiner adjusts based on feedback

**Current State**:
- Human manually reviews plans
- No automated pre-approval verification
- Can't refine a plan - only approve/reject

**Impact**: MEDIUM - Human does all verification work

**Recommendation**:
```typescript
// New verifier agent:
class PlanVerifier {
  async verify(plan: Plan, task: Task): Promise<VerificationResult> {
    // Check:
    // 1. Steps are logical and ordered correctly
    // 2. No dangerous operations without safeguards
    // 3. Validation commands are appropriate
    // 4. Estimated duration is realistic
    return {
      passed: boolean,
      issues: Issue[],
      suggestions: string[]
    };
  }
}

// New refiner agent:
class PlanRefiner {
  async refine(plan: Plan, issues: Issue[]): Promise<Plan> {
    // Generate improved plan addressing issues
  }
}
```

**Files to Create**:
- `src/core/agents/verifier-agent.ts`
- `src/core/agents/refiner-agent.ts`

**New Workflow**:
```
Planning → Verification → (if issues) → Refinement → Human Approval
```

---

### 🟡 Gap 4: Single-Pass Planning (No Critique)

**Research Pattern**: Multi-persona critique and refinement ("Solo Performance Prompting")

**Current State**:
- Planning agent generates 2 plans in one pass
- No critique or deliberation step

**Impact**: MEDIUM - Plans may lack depth

**Recommendation**:
```typescript
// Enhance planning with critique phase:
async generatePlans(task: Task): Promise<Plan[]> {
  // 1. Initial generation (2 drafts)
  const drafts = await this.generateDrafts(task);

  // 2. Critique phase (architect persona reviews)
  const critiques = await this.critiqueProposals(drafts, task);

  // 3. Refinement (incorporate critiques)
  const refined = await this.refineWithCritiques(drafts, critiques);

  return refined;
}
```

**Files to Modify**:
- `src/core/agents/planning-agent.ts` (add critique phase)

---

### 🟡 Gap 5: No Execution Monitoring/Progress Tracking

**Research Pattern**: Evaluator checks outputs after each step; real-time progress updates

**Current State**:
- Execution happens as black box
- No step-by-step progress
- No intermediate validation

**Impact**: MEDIUM - Can't detect failures early

**Recommendation**:
```typescript
// Execution with monitoring:
async execute(plan: Plan): Promise<Result> {
  const progress: StepResult[] = [];

  for (const step of plan.steps) {
    // Execute step
    const result = await this.executeStep(step);

    // Validate immediately
    const validation = await this.validateStep(result, step.validation);

    if (!validation.passed) {
      // Stop and report failure
      return { success: false, failedAt: step.id, progress };
    }

    progress.push(result);

    // Emit progress event for UI
    this.emitProgress({ stepId: step.id, status: 'completed' });
  }

  return { success: true, progress };
}
```

**Files to Modify**:
- `src/core/agents/execution-agent.ts` (add step monitoring)
- `src/core/orchestrator/workflow.ts` (handle progress events)

---

## Secondary Gaps (Lower Priority)

### 🟢 Gap 6: Schema Validation Not Comprehensive

**Research Pattern**: Strict JSON schemas for all agent I/O

**Current State**:
- Zod validators exist (src/core/validators/)
- Not enforced at every boundary

**Impact**: LOW - Type safety exists, just not exhaustive

**Recommendation**: Enforce validation at all DB and API boundaries

---

### 🟢 Gap 7: No Hierarchical Decomposition

**Research Pattern**: Master planner → Sub-planners for complex tasks

**Current State**:
- Single planning agent
- No task decomposition

**Impact**: LOW - May limit complexity of tasks handled

**Recommendation**: Add hierarchical planning for tasks with >10 steps

---

### 🟢 Gap 8: Limited Approval UI Features

**Current State**: Basic approval page (src/app/approval/page.tsx)

**Research Pattern**: Rich comparison, inline editing, suggestion visualization

**Recommendation**: Enhance UI in Phase 2B (after backend solidified)

---

## Recommended Implementation Priority

### Phase 1: Core Safety (Week 1-2)
**Goal**: Make execution safe and reversible

1. ✅ Implement real execution agent (not mock)
2. ✅ Add pre-execution snapshot/checkpoint
3. ✅ Implement rollback mechanism
4. ✅ Add circuit breaker for failures

**Outcome**: Can safely execute approved plans

### Phase 2: Learning Loop (Week 3)
**Goal**: System learns from human decisions

1. ✅ Wire human overrides into planning agent
2. ✅ Add relevance/similarity matching for overrides
3. ✅ Track plan approval patterns

**Outcome**: Plans improve over time based on feedback

### Phase 3: Enhanced Validation (Week 4)
**Goal**: Reduce human verification burden

1. ✅ Implement verifier agent
2. ✅ Add plan refinement capability
3. ✅ Integrate verification into workflow

**Outcome**: Only high-quality plans reach human approval

### Phase 4: Advanced Planning (Week 5)
**Goal**: Better plan quality

1. ✅ Add multi-persona critique phase
2. ✅ Implement step-by-step execution monitoring
3. ✅ Add hierarchical planning (if needed)

**Outcome**: Plans are more thoughtful and robust

---

## Quick Wins (Can Implement Today)

1. **Add override injection to planning prompt** (2 hours)
   - Fetch top 10 relevant overrides
   - Include in planning prompt as "learned patterns"
   - File: `src/core/agents/planning-agent.ts`

2. **Add circuit breaker to execution** (2 hours)
   - Track consecutive failures
   - Stop execution after 3 failures
   - File: `src/core/agents/execution-agent.ts`

3. **Add pre-execution validation** (2 hours)
   - Verify all files exist before execution
   - Check git status is clean
   - File: `src/core/agents/execution-agent.ts`

---

## Architecture Diagram (Improved)

```
┌─────────────┐
│   Task      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│  Planning Agent                 │
│  - Fetch relevant overrides     │◄── Human Overrides DB
│  - Generate 2 proposals         │
│  - Critique & refine            │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Verifier Agent (NEW)           │
│  - Logic checks                 │
│  - Safety checks                │
│  - Risk assessment              │
└──────┬──────────────────────────┘
       │
       ↓ (if issues)
┌─────────────────────────────────┐
│  Refiner Agent (NEW)            │
│  - Address verification issues  │
│  - Generate improved plan       │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Human Approval                 │
│  - Compare proposals            │
│  - Approve/Reject/Override      │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Execution Agent (ENHANCED)     │
│  - Sandbox/Docker               │◄── Checkpoint/Snapshot
│  - Step-by-step monitoring      │
│  - Circuit breaker              │
│  - Rollback on failure          │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Quality Gates                  │
│  - Automated tests              │
│  - Validation checks            │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Human Verification             │
│  - Review execution result      │
│  - Verify/Reject                │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Learning System                │
│  - Record overrides             │
│  - Update patterns              │
│  - Feed back to planning        │
└─────────────────────────────────┘
```

---

## Decision Required

**Which phase should we start with?**

Option A: **Phase 1 (Core Safety)** - Make execution real and safe
- Highest risk reduction
- Blocks real usage today
- Most valuable immediately

Option B: **Quick Wins** - Wire feedback loop today
- Fast value (2-6 hours)
- Improves planning quality immediately
- Low risk

Option C: **Phase 3 (Enhanced Validation)** - Add verifier/refiner
- Reduces human burden
- Good quality improvement
- Medium complexity

**Recommendation**: Do **Quick Wins** first (today), then **Phase 1** (this week), then **Phase 2** (next week).

---

## Files That Need Changes

### High Priority
- [ ] `src/core/agents/planning-agent.ts` - Add override injection
- [ ] `src/core/agents/execution-agent.ts` - Replace mock with real execution
- [ ] `src/core/safety/sandbox.ts` - NEW: Execution isolation
- [ ] `src/core/safety/rollback.ts` - NEW: Undo mechanism
- [ ] `src/core/safety/circuit-breaker.ts` - NEW: Failure handling
- [ ] `src/core/db/overrides.ts` - Add relevance search

### Medium Priority
- [ ] `src/core/agents/verifier-agent.ts` - NEW: Plan verification
- [ ] `src/core/agents/refiner-agent.ts` - NEW: Plan refinement
- [ ] `src/core/orchestrator/workflow.ts` - Wire verifier into flow
- [ ] `src/app/approval/page.tsx` - Show verification results

### Low Priority
- [ ] Enhanced UI features
- [ ] Hierarchical planning
- [ ] Advanced metrics/analytics

---

## Next Steps

1. **Decision**: Which phase to start with?
2. **Implementation**: Begin with selected phase
3. **Testing**: Validate improvements work
4. **Documentation**: Update DECISIONS.md with choices made

