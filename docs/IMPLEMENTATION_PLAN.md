# Human-in-the-Loop Orchestration - Implementation Plan

**Project**: Aura MVP - Dieta Positiva
**Date**: 2026-01-05
**Status**: Planning Phase
**Goal**: Perfect human-in-the-loop orchestration across multiple AI coding tools

---

## Executive Summary

Build a universal human-in-the-loop orchestration system that works seamlessly with:
- **Claude Code** (AI agent via SDK)
- **Cursor** (AI code editor)
- **Antigravity** (assuming AI development tool)
- **Jaunie** (assuming AI assistant)
- **Direct API** (programmatic access)

### Current State
- ✅ UI Dashboard complete (Next.js)
- ✅ Database ready (Supabase - 5 tables)
- ✅ API routes implemented (14 endpoints)
- ✅ Type system complete (TypeScript + Zod)
- ❌ AI agents stubbed (not implemented)
- ❌ No tool integrations
- ❌ No actual orchestration logic

### Target State
A working system where:
1. Any AI tool can create tasks via API or SDK
2. Planning agent generates multiple approaches
3. Human reviews and approves via dashboard
4. Execution happens in user's environment (local or remote)
5. Results are verified with quality gates
6. System learns from human decisions
7. Fully observable via dashboard

---

## Architecture Overview

### Multi-Tool Integration Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Coding Tools                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Claude Code  │   Cursor     │ Antigravity  │    Jaunie      │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                            ▼
              ┌─────────────────────────┐
              │   Orchestration API     │
              │   (Next.js API Routes)  │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │   Workflow Engine       │
              │   (State Machine)       │
              └────────────┬────────────┘
                           ▼
       ┌───────────────────┴───────────────────┐
       ▼                   ▼                   ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  Database   │   │  Dashboard   │   │  AI Agents   │
│  (Supabase) │   │  (Next.js)   │   │  (Anthropic) │
└─────────────┘   └──────────────┘   └──────────────┘
```

### Integration Methods

**1. API-Based (Universal)**
- RESTful endpoints for all operations
- Works with any tool that can make HTTP requests
- Most flexible, but requires tool support

**2. SDK-Based (Claude Code)**
- Native integration via Claude Agent SDK
- Direct function calls, no HTTP overhead
- Best developer experience

**3. File-Based (Fallback)**
- Write tasks to `.aura/tasks/` directory
- File watcher picks up changes
- Works with any tool that can write files
- Simple but less real-time

---

## Phase 1: Core Orchestration Engine (Week 1)

### Goal
Implement the state machine and workflow logic that works via API.

### Tasks

#### 1.1 Workflow State Machine (2 hours)
**File**: `src/core/orchestrator/workflow.ts`

Current issues:
- State transitions hardcoded
- No validation
- No hooks for events

Implementation:
```typescript
class WorkflowStateMachine {
  async transition(
    taskId: string,
    from: TaskStatus,
    to: TaskStatus,
    context: TransitionContext
  ): Promise<TransitionResult> {
    // 1. Validate transition is allowed
    // 2. Run pre-transition hooks
    // 3. Update database
    // 4. Trigger downstream actions
    // 5. Run post-transition hooks
    // 6. Return result with next steps
  }
}
```

States to implement:
- `pending` → `planning` (auto, when task created)
- `planning` → `awaiting_human_decision` (when proposals ready)
- `awaiting_human_decision` → `approved` (human approves)
- `awaiting_human_decision` → `pending` (human rejects, restart)
- `approved` → `executing` (auto, start execution)
- `executing` → `awaiting_verification` (execution done)
- `awaiting_verification` → `completed` (human verifies)
- `awaiting_verification` → `executing` (human requests retry)
- Any → `failed` (error occurs)

**Acceptance Criteria**:
- [ ] All 8 states implemented
- [ ] Invalid transitions rejected
- [ ] State changes persist to DB
- [ ] Events emitted for observability
- [ ] Unit tests pass

#### 1.2 Planning Agent (3 hours)
**File**: `src/agents/planning-agent.ts`

Currently: Empty directory

Implementation:
```typescript
export class PlanningAgent {
  async generateProposals(
    task: Task
  ): Promise<Plan[]> {
    // Use Anthropic API to generate multiple approaches
    // Return 2-3 different implementation strategies

    const prompt = buildPlanningPrompt(task);
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4",
      messages: [{ role: "user", content: prompt }],
      // ... structured output for plans
    });

    return parsePlansFromResponse(response);
  }
}
```

Prompt structure:
```
Given this task:
[task.description]

Context:
- Repository: [task.context.repository]
- Branch: [task.context.branch]
- Files: [task.context.files]
- Constraints: [task.constraints]

Generate 2-3 different implementation approaches.
For each approach, provide:
1. High-level strategy
2. Step-by-step plan
3. Estimated duration
4. Risks and tradeoffs
5. Required dependencies
```

**Acceptance Criteria**:
- [ ] Generates 2-3 distinct approaches
- [ ] Uses Claude API with structured output
- [ ] Plans follow schema validation
- [ ] Handles API errors gracefully
- [ ] Stores plans in database

#### 1.3 Execution Agent Stub (1 hour)
**File**: `src/agents/execution-agent.ts`

For now, just simulate execution:
```typescript
export class ExecutionAgent {
  async execute(plan: Plan): Promise<Result> {
    // Phase 1: Just simulate
    // Phase 2: Actually execute via tool integrations

    await delay(plan.estimated_duration);

    return {
      status: 'success',
      summary: `Simulated execution of plan: ${plan.approach}`,
      outputs: { message: 'Mock execution complete' },
      quality_gates: { all_passed: true },
      duration: plan.estimated_duration
    };
  }
}
```

**Acceptance Criteria**:
- [ ] Simulates execution time
- [ ] Returns mock results
- [ ] Persists to database
- [ ] Ready for Phase 2 real implementation

#### 1.4 API Endpoint Integration (1 hour)
**Files**: `src/app/api/workflow/*.ts`

Wire up the agents:
```typescript
// POST /api/workflow/create-task
export async function POST(req: Request) {
  const task = await req.json();

  // 1. Validate and store task
  const storedTask = await db.tasks.create(task);

  // 2. Transition to planning
  await workflow.transition(task.id, 'pending', 'planning');

  // 3. Trigger planning agent (async)
  planningAgent.generateProposals(task)
    .then(plans => {
      // Store plans
      // Transition to awaiting_human_decision
    });

  return Response.json({ taskId: task.id });
}
```

**Acceptance Criteria**:
- [ ] Create task triggers planning
- [ ] Proposals stored correctly
- [ ] Human decision gate works
- [ ] Approval starts execution
- [ ] End-to-end flow works

---

## Phase 2: Tool Integrations (Week 2)

### Goal
Enable Claude Code, Cursor, and other tools to use the orchestration system.

### 2.1 Claude Code Integration (3 hours)

**Method 1: Direct SDK Integration**

Create custom tool for Claude Code:
```typescript
// .claude/tools/aura-task.ts
import { defineTool } from '@anthropic/agent-sdk';

export const createAuraTask = defineTool({
  name: 'create_aura_task',
  description: 'Create a task in the Aura orchestration system',
  parameters: {
    type: 'object',
    properties: {
      description: { type: 'string' },
      type: { enum: ['feature', 'bugfix', 'refactor'] },
      files: { type: 'array', items: { type: 'string' } }
    }
  },
  handler: async (params) => {
    const response = await fetch('http://localhost:3000/api/workflow/create-task', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return response.json();
  }
});
```

**Method 2: Slash Command**

```markdown
<!-- .claude/commands/task.md -->
# Create Aura Task

Create a new task in the Aura orchestration system.

## Usage
/task [description]

## Workflow
1. You will create a task via the API
2. Wait for AI to generate proposals
3. Navigate user to approval dashboard
4. After approval, execute the plan
```

**Acceptance Criteria**:
- [ ] Claude Code can create tasks
- [ ] Claude Code can execute approved plans
- [ ] Results sync back to dashboard
- [ ] Error handling works

### 2.2 Cursor Integration (2 hours)

**Method: API Client**

```typescript
// .cursor/aura-client.ts
export class AuraClient {
  async createTask(params: TaskParams) {
    // Call API
  }

  async getPendingApprovals(): Promise<Task[]> {
    // Fetch tasks awaiting approval
  }

  async executePlan(planId: string) {
    // Execute approved plan in Cursor
  }
}
```

Cursor can use this via:
- Custom commands
- Keyboard shortcuts
- AI context

**Acceptance Criteria**:
- [ ] Cursor can create tasks
- [ ] Can fetch and display approvals
- [ ] Can execute plans locally

### 2.3 File-Based Integration (1 hour)

For tools without API support:

```typescript
// src/services/file-watcher.ts
export class FileWatcher {
  watch() {
    chokidar.watch('.aura/tasks/*.json')
      .on('add', async (path) => {
        const task = await fs.readFile(path, 'utf-8');
        const created = await api.createTask(JSON.parse(task));

        // Write result back
        await fs.writeFile(
          `.aura/results/${created.id}.json`,
          JSON.stringify(created)
        );
      });
  }
}
```

**Acceptance Criteria**:
- [ ] Watches `.aura/tasks/` directory
- [ ] Creates tasks from JSON files
- [ ] Writes results back
- [ ] Works with any tool

---

## Phase 3: Real Execution (Week 3)

### Goal
Actually execute plans instead of simulating.

### 3.1 Execution Strategies

**Strategy 1: Local Execution (Claude Code)**
```typescript
async execute(plan: Plan): Promise<Result> {
  // Claude Code executes in user's environment
  // Use bash, file operations, etc.

  for (const step of plan.steps) {
    await this.executeStep(step);
  }
}
```

**Strategy 2: Remote Execution (API)**
```typescript
async execute(plan: Plan): Promise<Result> {
  // Trigger CI/CD pipeline
  // Or use GitHub Actions
  // Or Vercel deployment
}
```

**Strategy 3: Hybrid**
- Use local for development
- Use remote for deployment

**Acceptance Criteria**:
- [ ] Can execute simple plans locally
- [ ] Can trigger remote execution
- [ ] Results captured correctly
- [ ] Errors handled gracefully

### 3.2 Quality Gates (2 hours)

```typescript
interface QualityGate {
  name: string;
  check: (result: Result) => Promise<boolean>;
  blocking: boolean;
}

const qualityGates: QualityGate[] = [
  {
    name: 'type-check',
    check: async () => {
      const result = await exec('npm run type-check');
      return result.exitCode === 0;
    },
    blocking: true
  },
  {
    name: 'tests',
    check: async () => {
      const result = await exec('npm test');
      return result.exitCode === 0;
    },
    blocking: true
  },
  {
    name: 'lint',
    check: async () => {
      const result = await exec('npm run lint');
      return result.exitCode === 0;
    },
    blocking: false
  }
];
```

**Acceptance Criteria**:
- [ ] Type checking runs
- [ ] Tests run
- [ ] Lint runs
- [ ] Blocking gates prevent completion
- [ ] Non-blocking gates log warnings

---

## Phase 4: Learning System (Week 4)

### Goal
Learn from human decisions to improve future proposals.

### 4.1 Decision Tracking (1 hour)

```typescript
// When human approves/rejects
async recordDecision(decision: Decision) {
  await db.decisions.create(decision);

  // If human rejected all proposals, record why
  if (decision.selectedOption === -1) {
    await db.humanOverrides.create({
      taskId: decision.taskId,
      aiSuggestions: decision.proposals,
      humanDecision: decision.rationale,
      category: decision.category
    });
  }
}
```

### 4.2 Learning Prompts (2 hours)

Enhance planning prompt with historical data:
```typescript
const similarTasks = await db.tasks.findSimilar(task);
const pastDecisions = await db.decisions.findByCategory(task.type);

const prompt = `
Given this task:
${task.description}

Historical context:
${similarTasks.map(t => `- ${t.description}: ${t.result.summary}`)}

Past human preferences:
${pastDecisions.map(d => `- Preferred ${d.selectedOption} because: ${d.rationale}`)}

Generate proposals that align with these preferences.
`;
```

**Acceptance Criteria**:
- [ ] Retrieves similar past tasks
- [ ] Includes human preferences in prompts
- [ ] Proposals improve over time
- [ ] Measurable via acceptance rate

---

## Implementation Priority

### Must Have (Phase 1 - Week 1)
1. ✅ State machine working
2. ✅ Planning agent generates proposals
3. ✅ Human approval via dashboard
4. ✅ Mock execution
5. ✅ End-to-end API flow

### Should Have (Phase 2 - Week 2)
1. Claude Code integration
2. File-based integration
3. Cursor client library

### Nice to Have (Phase 3-4 - Week 3-4)
1. Real execution
2. Quality gates
3. Learning system
4. Analytics dashboard

---

## Testing Strategy

### Unit Tests
- State machine transitions
- Agent logic
- API endpoints
- Database operations

### Integration Tests
```typescript
describe('End-to-end workflow', () => {
  it('completes full human-in-the-loop cycle', async () => {
    // 1. Create task
    const task = await api.createTask({...});

    // 2. Wait for proposals
    await waitFor(() => task.status === 'awaiting_human_decision');

    // 3. Approve plan
    await api.approvePlan(task.id, 0, 'Looks good');

    // 4. Wait for execution
    await waitFor(() => task.status === 'completed');

    // 5. Verify results
    expect(task.result).toBeDefined();
  });
});
```

### Manual Tests
- [ ] Create task via dashboard
- [ ] Create task via Claude Code
- [ ] Create task via file drop
- [ ] Approve/reject proposals
- [ ] View execution results
- [ ] Check learning works

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Anthropic API rate limits | High | Cache proposals, use cheaper model for simple tasks |
| Long execution times | Medium | Stream progress updates, allow cancellation |
| Tool integration breakage | Medium | File-based fallback always available |
| Quality gate failures | Low | Make gates configurable, non-blocking by default |
| Learning not effective | Low | Start simple, iterate based on data |

---

## Success Metrics

### Phase 1
- [ ] Can create task via API
- [ ] Proposals generated in < 10s
- [ ] Human can approve/reject
- [ ] Full cycle completes successfully

### Phase 2
- [ ] Claude Code integration works
- [ ] At least 2 tools integrated
- [ ] File-based fallback works

### Phase 3
- [ ] Real execution works locally
- [ ] Quality gates pass
- [ ] Error handling robust

### Phase 4
- [ ] Human approval rate > 70%
- [ ] Proposal quality improves over time
- [ ] System learns preferences

---

## Next Steps

**Immediate (Today)**
1. Review and approve this plan
2. Create GitHub issues for Phase 1 tasks
3. Set up development branch

**This Week**
1. Implement Phase 1.1 (State Machine)
2. Implement Phase 1.2 (Planning Agent)
3. Test end-to-end flow

**Questions for Virgilio**
1. What is Antigravity? (so I can plan integration)
2. What is Jaunie? (so I can plan integration)
3. Priority order for tool integrations?
4. Do you want to implement yourself or have me (Claude Code) implement?
5. Any specific quality gates beyond type-check, test, lint?

---

## Appendix: File Structure

```
src/
├── agents/
│   ├── planning-agent.ts       # Phase 1.2
│   ├── execution-agent.ts      # Phase 1.3 → Phase 3
│   └── decision-agent.ts       # Phase 4
├── core/
│   ├── orchestrator/
│   │   ├── workflow.ts         # Phase 1.1 (enhance existing)
│   │   └── state-machine.ts    # Phase 1.1 (new)
│   └── integrations/
│       ├── claude-code.ts      # Phase 2.1
│       ├── cursor.ts           # Phase 2.2
│       └── file-watcher.ts     # Phase 2.3
├── services/
│   ├── quality-gates.ts        # Phase 3.2
│   └── learning.ts             # Phase 4
└── app/api/workflow/
    └── *.ts                    # Phase 1.4 (enhance existing)

.claude/
├── tools/
│   └── aura-task.ts           # Phase 2.1
└── commands/
    └── task.md                # Phase 2.1

.aura/
├── tasks/                     # Phase 2.3
├── results/                   # Phase 2.3
└── config.json                # Phase 2.3
```

---

**Ready to start?** Let me know if you want to:
1. Refine this plan
2. Start implementing Phase 1
3. Create GitHub issues for tracking
4. Something else
