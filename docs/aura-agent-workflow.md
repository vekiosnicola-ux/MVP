# Aura MVP - Agent Workflow Architecture

## Overview

**Aura** is a human-in-the-loop AI orchestration platform that manages autonomous agents building software with human oversight and approval gates.

**First Use Case**: Build Dieta Positiva (wellness coaching SaaS)
**Future**: Can build any software project with AI agents + human guidance

---

## Project Clarification

### What We're Building

- **This Repository**: Aura MVP (the orchestration platform)
- **Dieta Positiva**: Context/reference for what Aura will eventually build
- **Relationship**: Aura is the builder, Dieta Positiva is what gets built

### Why Dieta Positiva Info Exists Here

Aura needs context about what it's building. The Dieta Positiva documentation (CLAUDE.md, architecture.md, etc.) serves as the specification and context for Aura's first real-world project.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  AURA MVP                                               │
│  Human-in-the-Loop AI Orchestration Platform            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend    │  │  Backend     │  │  Agent       │  │
│  │  Dashboard   │  │  Workflow    │  │  Workflow    │  │
│  │  Task Views  │  │  Engine      │  │  System      │  │
│  │  Approval UI │  │  Task Queue  │  │  Execution   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓ builds
┌─────────────────────────────────────────────────────────┐
│  DIETA POSITIVA                                         │
│  Customer-facing wellness coaching SaaS                  │
│  (Built by Aura agents + human oversight)               │
└─────────────────────────────────────────────────────────┘
```

---

## Agent Workflow - Core Concept

The **Agent Workflow** is the heart of Aura MVP. It manages the lifecycle of tasks from creation to completion with human approval gates.

### Workflow Lifecycle

```
Human Request
     ↓
Task Created (stored in DB)
     ↓
AI Agent picks up task
     ↓
Agent analyzes & proposes solution
     ↓
Human reviews & approves/rejects
     ↓
If approved → Agent executes
     ↓
Result stored & next task created
     ↓
Repeat until complete
```

### State Machine

```
[PENDING]
   ↓ (agent picks up)
[IN_PROGRESS]
   ↓ (agent proposes solution)
[AWAITING_APPROVAL] ←─────┐
   ↓                       │
[Human Decision]           │
   ↓                       │
┌──┴──┐                   │
│     │                   │
↓     ↓                   │
[APPROVED]  [REJECTED]    │
   ↓           ↓          │
[Execute] [Needs Changes]─┘
   ↓
[COMPLETED]
```

---

## Data Models

### Task

```typescript
interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'awaiting_approval' | 'approved' | 'rejected' | 'completed'
  assignedAgent: string | null
  createdBy: 'human' | 'agent'
  parentTaskId: string | null  // For subtasks
  priority: 'low' | 'medium' | 'high'
  metadata: {
    context: any
    proposedSolution: string | null
    approvalNotes: string | null
  }
  timestamps: {
    created: Date
    started: Date | null
    submitted: Date | null
    approved: Date | null
    completed: Date | null
  }
}
```

### Agent

```typescript
interface Agent {
  id: string
  name: string
  type: 'architect' | 'developer' | 'database' | 'tester' | 'reviewer' | 'devops'
  status: 'idle' | 'working' | 'waiting_for_approval'
  capabilities: string[]
  currentTaskId: string | null
}
```

### Workflow

```typescript
interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  steps: WorkflowStep[]
  currentStepIndex: number
  context: Record<string, any>
}

interface WorkflowStep {
  id: string
  type: 'agent_task' | 'human_approval' | 'conditional' | 'parallel'
  agentType?: string
  requiresApproval: boolean
  dependencies: string[]  // IDs of previous steps
  config: any
}
```

### Approval

```typescript
interface Approval {
  id: string
  taskId: string
  requestedAt: Date
  respondedAt: Date | null
  decision: 'approved' | 'rejected' | 'needs_changes' | null
  feedback: string | null
  reviewedBy: string
}
```

---

## Database Schema

### Core Tables

```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'awaiting_approval', 'approved', 'rejected', 'completed')),
  assigned_agent TEXT,
  created_by TEXT NOT NULL CHECK (created_by IN ('human', 'agent')),
  parent_task_id UUID REFERENCES tasks(id),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('architect', 'developer', 'database', 'tester', 'reviewer', 'devops')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'waiting_for_approval')),
  capabilities TEXT[] DEFAULT '{}',
  current_task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Approvals table
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  proposed_solution TEXT NOT NULL,
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  decision TEXT CHECK (decision IN ('approved', 'rejected', 'needs_changes')),
  feedback TEXT,
  reviewed_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_step_index INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Execution logs
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  agent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  result JSONB,
  success BOOLEAN NOT NULL,
  error TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_type ON agents(type);

CREATE INDEX idx_approvals_task ON approvals(task_id);
CREATE INDEX idx_approvals_decision ON approvals(decision);

CREATE INDEX idx_workflows_status ON workflows(status);

CREATE INDEX idx_execution_logs_task ON execution_logs(task_id);
CREATE INDEX idx_execution_logs_executed_at ON execution_logs(executed_at DESC);
```

---

## Workflow Engine - Core Functions

### Task Management

#### `createTask(input: CreateTaskInput): Task`
Create new task from human or agent request.

```typescript
interface CreateTaskInput {
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high'
  parentTaskId?: string
  context?: any
}
```

**Logic:**
1. Validate input
2. Determine which agent should handle it (based on task type)
3. Store in database with status 'pending'
4. Return task object

---

#### `assignTask(taskId: string, agentType: AgentType): void`
Assign task to specific agent.

```typescript
type AgentType = 'architect' | 'developer' | 'database' | 'tester' | 'reviewer' | 'devops'
```

**Logic:**
1. Find idle agent of specified type
2. Update task.assignedAgent
3. Update task.status to 'in_progress'
4. Update agent.status to 'working'
5. Update agent.currentTaskId
6. Trigger agent execution

---

#### `submitForApproval(taskId: string, proposal: string): Approval`
Agent submits proposed solution for human review.

```typescript
interface ProposalInput {
  taskId: string
  proposedSolution: string
  confidence?: number
  requiresApproval: boolean
}
```

**Logic:**
1. Update task.status to 'awaiting_approval'
2. Store proposal in task.metadata.proposedSolution
3. Create approval record
4. Notify human reviewer (email, UI, etc.)
5. Pause agent execution

---

#### `approveTask(taskId: string, feedback?: string): void`
Human approves the proposal.

**Logic:**
1. Update approval.decision to 'approved'
2. Update approval.respondedAt
3. Store feedback if provided
4. Update task.status to 'approved'
5. Trigger task execution

---

#### `rejectTask(taskId: string, feedback: string): void`
Human rejects the proposal.

**Logic:**
1. Update approval.decision to 'rejected'
2. Update approval.respondedAt
3. Store feedback (required)
4. Update task.status to 'in_progress'
5. Send feedback to agent
6. Agent revises and resubmits

---

#### `executeTask(taskId: string): void`
Execute approved task.

**Logic:**
1. Retrieve task and approved proposal
2. Execute the solution (run code, make changes, etc.)
3. Log execution results
4. Handle errors and retries
5. Update task.status to 'completed'
6. Free up agent
7. Trigger next task in workflow if exists

---

#### `decomposeTask(taskId: string): Task[]`
Break complex task into subtasks.

**Logic:**
1. Agent analyzes task complexity
2. Proposes decomposition (list of subtasks)
3. Human approves decomposition
4. Create subtask records with parent_task_id
5. Queue subtasks for agents

---

### Agent Integration

#### `executeAgent(agentType: AgentType, task: Task): AgentResult`
Execute an agent with a task.

```typescript
interface AgentResult {
  success: boolean
  proposal?: string
  error?: string
  requiresApproval: boolean
  confidence: number
}
```

**Implementation Options:**

**Option A: In-Process Function Call**
```typescript
async function executeAgent(agentType: AgentType, task: Task) {
  const agent = agents[agentType]
  return await agent.execute(task)
}
```

**Option B: Claude Code Task Tool**
```typescript
async function executeAgent(agentType: AgentType, task: Task) {
  const result = await claudeCode.task({
    subagent_type: agentType,
    prompt: `${task.description}\n\nContext: ${JSON.stringify(task.metadata.context)}`
  })
  return parseAgentResult(result)
}
```

**Recommended: Start with Option B (leverage existing Claude agents)**

---

### Workflow Orchestration

#### `startWorkflow(workflowDef: WorkflowDefinition): Workflow`
Initialize and start a workflow.

```typescript
interface WorkflowDefinition {
  name: string
  description: string
  steps: WorkflowStepDefinition[]
  context?: any
}

interface WorkflowStepDefinition {
  type: 'agent_task' | 'human_approval' | 'conditional' | 'parallel'
  agentType?: AgentType
  taskTemplate: string
  requiresApproval: boolean
  dependencies?: string[]
}
```

**Logic:**
1. Create workflow record
2. Resolve step dependencies
3. Queue first task(s)
4. Return workflow object

---

#### `advanceWorkflow(workflowId: string): void`
Move workflow to next step after current step completes.

**Logic:**
1. Get current step
2. Check if dependencies are met
3. Create task for next step
4. Assign to appropriate agent
5. Update workflow.currentStepIndex

---

#### `pauseWorkflow(workflowId: string): void`
Pause workflow execution (e.g., waiting for human input).

---

#### `resumeWorkflow(workflowId: string): void`
Resume paused workflow.

---

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

**Day 1-2: Database Setup**
- [ ] Create Supabase project
- [ ] Run schema migration (5 tables)
- [ ] Set up RLS policies
- [ ] Create indexes
- [ ] Test database access

**Day 3-4: Task Management API**
- [ ] Implement createTask()
- [ ] Implement assignTask()
- [ ] Implement task state transitions
- [ ] Add validation with Zod
- [ ] Write API routes: POST /api/tasks, GET /api/tasks/:id, PATCH /api/tasks/:id

**Day 5-7: Basic Workflow Engine**
- [ ] Implement submitForApproval()
- [ ] Implement approveTask() / rejectTask()
- [ ] Implement executeTask()
- [ ] Add error handling and logging
- [ ] Test end-to-end flow manually

---

### Phase 2: Agent Integration (Week 2)

**Day 1-2: Agent Interface**
- [ ] Define agent communication protocol
- [ ] Create agent wrapper for Claude Code agents
- [ ] Implement executeAgent() using Task tool
- [ ] Parse agent results into structured format

**Day 3-4: Agent Coordination**
- [ ] Task assignment logic (which agent for which task)
- [ ] Agent status tracking
- [ ] Handle agent errors and retries
- [ ] Agent pool management

**Day 5-7: Task Execution**
- [ ] Connect approval → execution pipeline
- [ ] Execution logging
- [ ] Result capture and storage
- [ ] Subtask creation from agent output

---

### Phase 3: Human-in-Loop UI (Week 3)

**Day 1-3: Task Dashboard**
- [ ] Task list view (all tasks with status)
- [ ] Filters (by status, agent, priority)
- [ ] Real-time updates (polling or WebSocket)
- [ ] Task detail page

**Day 4-5: Approval Interface**
- [ ] Show proposed solution
- [ ] Approve/Reject/Request Changes buttons
- [ ] Feedback text area
- [ ] Diff viewer (show what will change)

**Day 6-7: Notifications**
- [ ] Email notifications for approval requests
- [ ] In-app notification system
- [ ] Approval link (click to review)

---

### Phase 4: Workflow Orchestration (Week 4)

**Day 1-3: Workflow Definition**
- [ ] Workflow definition DSL/format
- [ ] Workflow parser
- [ ] Dependency resolution
- [ ] Store workflows in DB

**Day 4-5: Workflow Execution**
- [ ] Start workflow
- [ ] Advance to next step
- [ ] Handle parallel execution
- [ ] Conditional branching

**Day 6-7: Workflow Management**
- [ ] Pause/resume workflows
- [ ] Workflow status dashboard
- [ ] Workflow history and logs
- [ ] Error recovery

---

## Design Decisions

### Agent Communication: Direct Function Calls → API Later

**Decision**: Start with direct TypeScript function calls, migrate to REST API when needed.

**Rationale**:
- Simpler for MVP
- Less overhead
- Can add API layer later for external agents
- Focus on core logic first

---

### Agent Execution: Use Existing Claude Code Agents

**Decision**: Use Claude Code's Task tool to execute existing agents (architect, developer, etc.)

**Rationale**:
- Leverage existing agent definitions in `.claude/agents/`
- Don't reinvent agent intelligence
- Focus on orchestration, not agent implementation
- Faster to MVP

---

### Approval Mechanism: Email + Web Link

**Decision**: Send email with link to approval page (not real-time WebSocket initially)

**Rationale**:
- Simpler implementation
- Works asynchronously (human doesn't need to be watching)
- Can add real-time later
- Standard pattern for async approvals

---

### Workflow Definition: Code First, DB Later

**Decision**: Define workflows in TypeScript code initially, migrate to DB-stored configs later.

**Rationale**:
- Faster to prototype
- Type-safe definitions
- Can iterate quickly
- DB storage adds complexity we don't need yet

---

### Task Decomposition: Agent-Driven

**Decision**: Let agents propose task decomposition, human approves.

**Rationale**:
- Agents understand complexity better
- Human oversight prevents over-decomposition
- Flexible approach
- Aligns with human-in-loop philosophy

---

## API Endpoints

### Task Management

```
POST   /api/tasks              Create new task
GET    /api/tasks              List all tasks (with filters)
GET    /api/tasks/:id          Get task details
PATCH  /api/tasks/:id          Update task (status, metadata)
DELETE /api/tasks/:id          Delete task

POST   /api/tasks/:id/assign   Assign task to agent
POST   /api/tasks/:id/submit   Submit proposal for approval
```

### Approvals

```
GET    /api/approvals              List pending approvals
GET    /api/approvals/:id          Get approval details
POST   /api/approvals/:id/approve  Approve proposal
POST   /api/approvals/:id/reject   Reject proposal
```

### Agents

```
GET    /api/agents                 List all agents
GET    /api/agents/:id             Get agent status
PATCH  /api/agents/:id             Update agent status
```

### Workflows

```
POST   /api/workflows              Create workflow
GET    /api/workflows              List workflows
GET    /api/workflows/:id          Get workflow details
POST   /api/workflows/:id/start    Start workflow
POST   /api/workflows/:id/pause    Pause workflow
POST   /api/workflows/:id/resume   Resume workflow
```

### Execution Logs

```
GET    /api/logs                   List execution logs (with filters)
GET    /api/logs/task/:taskId      Get logs for specific task
```

---

## Frontend Pages

### Dashboard (`/dashboard`)
Overview of system status:
- Active workflows count
- Pending approvals count
- Agent status (idle/working)
- Recent activity feed

### Tasks (`/tasks`)
- Table view of all tasks
- Filters: status, agent, priority, date
- Sort by any column
- Click to view details

### Task Detail (`/tasks/:id`)
- Task information (title, description, status)
- Assigned agent
- Timeline (created → assigned → submitted → approved → completed)
- Proposed solution (if awaiting approval)
- Approve/Reject buttons
- Execution logs

### Approvals (`/approvals`)
- List of pending approvals (inbox-style)
- Quick approve/reject actions
- Badge showing count

### Workflows (`/workflows`)
- List of workflows
- Status indicators
- Progress bars (steps completed / total steps)
- Start new workflow button

### Workflow Detail (`/workflows/:id`)
- Workflow steps visualization
- Current step highlighted
- Task details for each step
- Pause/resume controls

---

## Error Handling

### Agent Failures

**Scenario**: Agent execution fails or produces invalid output.

**Handling**:
1. Log error to execution_logs
2. Retry up to 3 times with exponential backoff
3. If still failing, mark task as 'failed'
4. Notify human for manual intervention
5. Allow reassignment to different agent

### Approval Timeouts

**Scenario**: Human doesn't respond to approval request within reasonable time.

**Handling**:
1. Send reminder after 24 hours
2. Escalate after 48 hours (if needed)
3. Allow workflow to continue without approval (configurable)
4. Log timeout event

### Database Connection Issues

**Scenario**: Supabase connection fails.

**Handling**:
1. Retry with exponential backoff
2. Queue operations in memory temporarily
3. Sync when connection restored
4. Alert if prolonged outage

### Concurrent Modifications

**Scenario**: Two agents try to modify same file/resource.

**Handling**:
1. Use optimistic locking (version field)
2. Detect conflicts
3. Pause conflicting task
4. Request human resolution

---

## Security Considerations

### Authentication
- Use Supabase Auth for human users
- API key authentication for agents (if using API)
- Row Level Security (RLS) in database

### Authorization
- Humans can only approve tasks they created or are assigned
- Agents can only update tasks assigned to them
- Read-only access for observers (future)

### Input Validation
- Validate all task inputs with Zod schemas
- Sanitize user-provided descriptions
- Prevent SQL injection (use parameterized queries)
- Prevent code injection in agent proposals

### Audit Trail
- Log all state changes
- Record who approved/rejected
- Timestamp all actions
- Immutable execution logs

---

## Monitoring & Observability

### Metrics to Track
- Tasks created per day
- Average time to approval
- Agent utilization (% of time working)
- Approval acceptance rate
- Task completion rate
- Error rate by agent type

### Logging
- All task state transitions
- Agent execution start/end
- Approval decisions
- Errors and retries
- Performance metrics (execution time)

### Alerts
- Agent stuck for > 30 minutes
- Approval pending for > 24 hours
- Error rate > 10%
- Database connection issues

---

## Future Enhancements

### Beyond MVP

**Parallel Execution**
- Multiple agents working simultaneously
- Dependency graph resolution
- Resource locking to prevent conflicts

**Workflow Templates**
- Predefined workflows for common tasks
- "Build feature", "Fix bug", "Refactor code"
- Reusable and customizable

**Agent Learning**
- Track which proposals get approved
- Learn from rejections
- Improve confidence scoring

**Advanced Approval Rules**
- Auto-approve high-confidence proposals
- Multi-level approval for critical changes
- Approval delegation

**Real-time Collaboration**
- WebSocket for live updates
- Multiple humans can review simultaneously
- Chat between human and agent

**External Integrations**
- GitHub Actions trigger workflows
- Slack notifications
- JIRA ticket sync

---

## Getting Started

### Prerequisites
1. Node.js 20+
2. Supabase account
3. Anthropic API key (for Claude agents)

### Setup Steps

1. **Clone and install**
   ```bash
   git clone <repo>
   cd MVP
   npm install
   ```

2. **Set up Supabase**
   - Create project at supabase.com
   - Run schema migration (copy from above)
   - Get API keys

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Fill in:
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY
   # - SUPABASE_SERVICE_ROLE_KEY
   # - ANTHROPIC_API_KEY
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Create first task**
   - Navigate to /tasks
   - Click "Create Task"
   - Fill in details
   - Assign to agent
   - Watch it work!

---

## Questions & Answers

### Q: How does Aura know about Dieta Positiva?

A: The Dieta Positiva documentation in this repo provides context. When creating tasks for Aura, reference the DP architecture, tech stack, and requirements documented in CLAUDE.md and docs/.

### Q: Can Aura build things other than Dieta Positiva?

A: Yes! The workflow system is generic. Just provide different context/documentation for a new project.

### Q: Why human approval on everything?

A: For MVP, we want maximum safety and learning. As agents prove reliable, we can add auto-approval rules for low-risk tasks.

### Q: How do agents access the codebase?

A: Agents use Claude Code's file tools (Read, Write, Edit, Bash, etc.) which are available through the Task tool.

### Q: What if an agent makes a mistake?

A: Humans review before execution. If a mistake passes review, we can:
1. Revert the change (git)
2. Create a fix task
3. Learn from it (update agent instructions)

### Q: Is this like GitHub Actions?

A: Similar concept but different execution model:
- GitHub Actions: Event-driven, automated
- Aura: Task-driven, human-supervised
- Aura can trigger GH Actions, but focuses on complex multi-step development tasks

---

## Glossary

**Task**: A unit of work with a single clear objective
**Agent**: An AI worker specialized in a domain (architect, developer, etc.)
**Workflow**: A sequence of tasks with dependencies
**Approval**: Human review and decision on an agent's proposal
**Execution**: Running the approved solution to complete a task
**Decomposition**: Breaking a complex task into simpler subtasks

---

## References

- **Dieta Positiva Context**: See CLAUDE.md, docs/architecture.md
- **Agent Definitions**: See .claude/agents/
- **Tech Stack**: Next.js, TypeScript, Supabase, Anthropic Claude
- **Development Philosophy**: Minimal, boring, pragmatic, fast

---

Last Updated: 2026-01-04
