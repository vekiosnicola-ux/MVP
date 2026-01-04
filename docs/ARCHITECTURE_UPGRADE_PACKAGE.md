# Architecture Upgrade Package

**Project**: Aura MVP - Dieta Positiva
**Date**: 2026-01-04
**Orchestrator Mode**: Phase 0-2 Complete
**Status**: Ready for Implementation

---

## Executive Summary

### Current State
Aura MVP is **70% complete, 0% functional**. Phase 2A (backend orchestration) and Phase 2B (UI dashboard) are built but not integrated. UI consumes mock data. Backend calls a database that doesn't exist. No AI agent integration.

### Target State
Fully functional human-in-the-loop orchestration system where:
1. Tasks are created via UI
2. AI agents propose plans (stubbed initially)
3. Humans approve/reject at decision gates
4. Plans execute with quality gate validation
5. Results persist to database
6. System learns from human overrides

### Path Forward
**3 Phases, 8-12 hours, 4 critical fixes**
1. Phase 1 (3h): Database + Integration → Makes system work
2. Phase 2 (3h): Schema cleanup + AI stubs → Makes system right
3. Phase 3 (2h): Documentation + Deployment → Makes system ship

### Boris Philosophy Alignment
✅ Minimal: Only fixes what's broken
✅ Verifiable: Each phase has pass/fail criteria
✅ Token-efficient: Defers complexity reduction

---

## Phase 0: Orchestrator Analysis Complete

### Truth Pack (System Reality)

**What it is**: Human-in-the-loop AI orchestration dashboard for development workflows

**Repository Structure**:
```
src/
├── app/                 # 5 Next.js pages (Dashboard, Approval, Tasks, Create, History)
├── components/          # 25 React components (Framer Motion animations)
├── core/
│   ├── contracts/       # 4 JSON schemas (Task, Plan, Result, Decision)
│   ├── validators/      # 4 Zod schemas (parallel to JSON)
│   ├── db/              # 5 CRUD modules (Supabase operations)
│   └── orchestrator/    # Workflow engine + quality gates
├── lib/                 # Mock data + utilities
└── agents/              # Empty (just .gitkeep)
```

**Boundaries**:
- **UI Layer**: `src/app/` + `src/components/` → Mock data consumers
- **Core Logic**: `src/core/orchestrator/` → Workflow state machine
- **Data Layer**: `src/core/db/` → Supabase CRUD (not connected)
- **Contracts**: JSON + Zod (dual maintenance burden)
- **AI Layer**: Placeholder only (no implementation)

**MVP-Critical Flows**:
1. Create Task → Save to DB → Transition to planning
2. AI generates Plan → Human reviews → Record Decision
3. Execute Plan → Quality gates validate → Record Result
4. Human overrides AI → Learn for future tasks
5. Dashboard shows all tasks by status
6. History timeline displays events

**Known Risks**:
1. Database doesn't exist (Supabase project not created)
2. Zero integration between UI and backend
3. Mock data violates its own Zod validators
4. Dual schema maintenance (JSON + Zod drift)
5. State machine incomplete (6 of 8 states)
6. No AI integration (just database operations)

---

## Mismatch Report (Claim vs Reality)

| # | **Claim** | **Reality** | **Risk** | **Fix** |
|---|-----------|-------------|----------|---------|
| 1 | 8-state workflow | 6 states mapped in workflow.ts | Missing human decision gates | Add 2 TaskStatus enum values |
| 2 | Backend integration-ready | Supabase project doesn't exist | All API calls fail | Create DB, configure env vars |
| 3 | UI displays real-time data | Hardcoded to mock-data.ts | Won't sync with backend | Replace imports with API calls |
| 4 | Contract validation enforced | JSON + Zod schemas drift | Runtime validation errors | Delete JSON, keep Zod only |
| 5 | AI agents coordinate workflow | Zero AI implementation | Can't generate plans | Add agent stubs |
| 6 | Quality gates block bad results | Gates stub/incomplete | No actual validation | Defer to post-MVP |

---

## Subagent Findings (8 Specialized Analyses)

### A. Architect → Integration Strategy

**Boundary Violations Found**:
1. UI pages import `getTasksAwaitingApproval()` from mock-data instead of `/api/tasks?status=planning`
2. Decision panel `handleApprove()` logs to console instead of POSTing to `/api/workflow/approve-plan`
3. No error handling for network failures in components
4. Type mismatch: `MockTask` interface ≠ `TaskRow` from database

**Integration Path** (150 tokens):
```
Create /src/lib/api.ts → typed fetch functions
Update 4 pages → useState + useEffect + API calls
Add loading/error states to all components
Wire decision submission to backend API

Files: page.tsx, approval/page.tsx, tasks/[id]/page.tsx, decision-panel.tsx
Effort: 2 hours
```

**Critical Risks**:
- Supabase not configured → API fails
- Type mismatches → Build breaks
- Race conditions on updates → Stale UI
- Missing tables → Query errors

**Simplest Fix**: Replace mock imports with fetch calls. Backend already works.

---

### B. Contracts/Governance → Schema Validation

**Sync Status**: 🔴 3 critical mismatches
- `version`: JSON enum `"1.0.0"` vs Zod regex `\d+\.\d+\.\d+`
- `id` patterns: JSON loose vs Zod strict UUID
- No validation tests catch drift

**Governance Problem**: Two sources of truth = maintenance burden + runtime bugs

**Solutions**:
1. **Zod-only** (recommended): Delete JSON schemas, export via zod-to-openapi
2. JSON-only: Codegen Zod from schemas (build complexity)
3. Keep both: Add sync tests (ongoing burden)

**Recommendation**: Zod-only fits minimal philosophy. Single source of truth, type-safe.

**Effort**: 1 hour (delete 4 files, update validators)

---

### C. Data/Auth → Database Setup

**Schema Quality**: ✅ Good
- 5 well-designed tables (tasks, plans, decisions, results, human_overrides)
- Proper indexes on status/type/created_at
- Foreign keys with CASCADE deletes

**Critical Gaps**:
- Missing `updated_at` triggers on 3 tables
- TEXT status fields lack CHECK constraints
- RLS policies permissive (acceptable for MVP)

**Setup Checklist**:
1. Create Supabase project at supabase.com
2. Configure `.env.local` with URL + keys
3. Run `scripts/setup-db.sql` in SQL Editor
4. Verify 5 tables exist
5. Test via `/api/db-health` endpoint

**Quick Win**: Add `/api/db-health` endpoint to verify connectivity

**Effort**: 30 minutes

---

### D. Workflow/Orchestrator → State Machine Audit

**State Machine Gaps**:
- Declared: 8 WorkflowState types in `types.ts`
- Implemented: 6 TaskStatus values in `workflow.ts`
- Missing: `awaiting_human_decision`, `awaiting_verification`
- Impact: Skips human oversight gates

**AI Integration Status**: ❌ Zero implementation
- `/src/agents/` empty (just .gitkeep)
- No Anthropic SDK imports found
- Workflow methods are pure DB operations
- No plan generation, no execution logic

**Quality Gates Reality**:
- 3 gates implemented (steps completed, test coverage, no errors)
- Gates only verify orchestration state, not functionality
- Run at end only (no decision-time validation)

**Minimal Fix** (20 lines):
1. Add 2 missing states to TaskStatus enum
2. Create 3 agent stub files (planning, execution, decision)
3. Wire stubs into workflow methods
4. Test state progression

**Effort**: 2 hours

---

### E. DevOps/Observability → Deployment Readiness

**Build Status**: ✅ Passes (ready to ship)
- Next.js build: 147-176 KB
- TypeScript strict mode active
- ESLint warnings only (non-blocking)
- Zero deployment blockers

**Observability Gaps**:
- No error tracking (Sentry/Rollbar)
- No structured logging (console.log only)
- No performance monitoring
- No request tracing

**Deployment Blockers**: None

**Action Required**:
1. Set Vercel env vars (Supabase URL + keys)
2. Run `vercel --prod`
3. Test production health endpoint

**Recommendation**: Ship now, add observability post-feedback

**Effort**: 15 minutes (deployment only)

---

### F. QA/Verification → Quality Gates

**Test Coverage**: 0% (zero test files)
- No jest/vitest installed
- `"test"` script: `echo "Tests coming soon"`
- 12 API endpoints untested

**Quality Gate Status**:
- 3 gates implemented but shallow
- Verify orchestration state only, not functionality
- Gates pass even if features broken

**Testing Strategy**:
- **Phase 1 (NOW)**: Manual + lint/type-check
- **Phase 2 (WHEN NEEDED)**: Integration tests for regressions only

**Minimal Viable Testing**:
```bash
npm install --save-dev jest supertest
# Add 2 smoke tests: /api/health, /api/tasks
# Target: Basic failure detection
```

**Effort**: 0 hours (defer until needed)

---

### G. Simplifier → Complexity Reduction

**Over-Engineering Found**:

1. **Database Layer** (520 lines)
   - 5 files, identical CRUD boilerplate
   - Each: get client → validate → query → cast
   - Better: Direct Supabase calls in API routes

2. **QualityGateExecutor** (73 lines)
   - Strategy pattern for 1 implementation
   - Just 3 simple checks
   - Better: Plain function

3. **WorkflowEngine** (83 lines)
   - Class wrapper with no orchestration logic
   - Each method: call DB + update status
   - Better: Utility functions

4. **Mock Data Getters** (23 lines)
   - 6 filter functions for trivial array operations
   - Better: Inline `mockTasks.filter()`

5. **Schema Mismatch**
   - Mock data violates Zod validators
   - `task-001` doesn't match UUID pattern

**Simplification Opportunities**:
- Collapse DB layer: ~420 lines saved
- Replace QualityGateExecutor: ~43 lines saved
- Remove WorkflowEngine class: ~53 lines saved
- Delete mock getters: ~23 lines saved
- **Total: ~540 lines eliminated**

**Verification**: Run test suite, API contract tests, UI still renders

**Effort**: 4 hours (defer to Phase 4)

---

### H. Knowledge Curator → Documentation Audit

**Undocumented Decisions** (5 found):
1. Radix UI component library choice
2. Zustand for state management (vs Context)
3. Tanstack React Query for server state
4. `src/` directory structure
5. Core module organization (contracts/db/orchestrator)

**Decision Quality**: Good format, but missing cross-references

**Updates Needed**:
- Add 5 missing decisions to `DECISIONS.md`
- Update architecture docs with reality
- Document integration decisions from Phase 0

**Effort**: 1 hour

---

## Upgrade Implementation Plan

### Phase 1: Make It Work (3 hours) 🔴 CRITICAL

**Goal**: Functional end-to-end workflow

**Tasks**:
1. **Database Setup** (30 min)
   - Create Supabase project
   - Configure environment variables
   - Execute SQL schema
   - Verify connectivity

2. **State Machine Fix** (30 min)
   - Add 2 missing TaskStatus values
   - Update workflow statusMap
   - Test TypeScript compilation

3. **UI↔Backend Integration** (2 hours)
   - Create `/src/lib/api.ts` with fetch functions
   - Update 4 files: page.tsx, approval/page.tsx, tasks/[id]/page.tsx, decision-panel.tsx
   - Replace mock imports with API calls
   - Add loading/error states
   - Wire decision submission

**Success Criteria**:
✅ Database accessible
✅ Health endpoint returns 200
✅ Dashboard loads tasks from API
✅ Can create and approve tasks
✅ Decisions persist to database

**Files Modified**: 6
**Files Created**: 2
**Effort**: 3 hours

---

### Phase 2: Make It Right (3 hours) 🟡 HIGH

**Goal**: Eliminate technical debt, enable future AI integration

**Tasks**:
1. **Schema Governance** (1 hour)
   - Delete 4 JSON schema files
   - Update Zod validators (fix version to literal, UUID patterns)
   - Remove JSON schema references from docs
   - Test validation

2. **AI Agent Stubs** (2 hours)
   - Create `src/agents/planning-agent.ts` (generates Plan from Task)
   - Create `src/agents/execution-agent.ts` (executes Plan steps)
   - Create `src/agents/decision-agent.ts` (validates plan feasibility)
   - Wire into workflow methods
   - Add logging, TODO comments for future
   - Test agent calls in workflow

**Success Criteria**:
✅ No JSON schema files in codebase
✅ Zod is single source of truth
✅ Agent stubs called at correct points
✅ Workflow progresses through all 8 states

**Files Deleted**: 4
**Files Created**: 3
**Files Modified**: 5
**Effort**: 3 hours

---

### Phase 3: Make It Ship (2 hours) 🟢 MEDIUM

**Goal**: Deploy to production, document everything

**Tasks**:
1. **Documentation Updates** (1 hour)
   - Add 5 missing decisions to `DECISIONS.md`
   - Create `docs/DEPLOYMENT.md` (Supabase + Vercel setup)
   - Update `README.md` (status, getting started)
   - Document environment variables

2. **Vercel Deployment** (1 hour)
   - Test production build locally
   - Configure Vercel project
   - Set environment variables
   - Deploy to production
   - Test in production
   - Share deployment URL

**Success Criteria**:
✅ App live on Vercel
✅ Production health check passes
✅ Full workflow functional in production
✅ All decisions documented
✅ Deployment guide exists

**Files Created**: 2
**Files Modified**: 2
**Effort**: 2 hours

---

### Phase 4: Make It Better (4 hours) ⚪ DEFERRED

**Goal**: Reduce complexity, improve observability

**Tasks**:
1. **Simplification** (3 hours)
   - Collapse DB layer boilerplate (~420 lines saved)
   - Replace QualityGateExecutor with function (~43 lines)
   - Remove WorkflowEngine class wrapper (~53 lines)
   - Delete mock data getters (~23 lines)
   - Clean up unused code

2. **Observability** (1 hour)
   - Add Sentry error tracking
   - Implement structured logging
   - Enable Vercel Analytics
   - Set up alerts

**Success Criteria**:
✅ Codebase reduced by ~540 lines
✅ Error tracking active
✅ Structured logging in place
✅ Performance monitoring enabled

**Effort**: 4 hours (defer until post-MVP)

---

## Technical Specifications

### Environment Variables Required

```bash
# Critical (Phase 1)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Recommended (Phase 1)
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Future (Phase 2)
ANTHROPIC_API_KEY=[your-api-key]

# Optional
NODE_ENV=production
PORT=3000
```

### Database Schema (5 Tables)

```sql
1. tasks          → Main workflow entities (6 statuses, 6 types)
2. plans          → AI-generated execution plans (steps, risks, dependencies)
3. decisions      → Human approval records (proposals, rationale, overrides)
4. results        → Execution outcomes (quality gates, test results, artifacts)
5. human_overrides → Learning database (AI suggestion vs human choice)
```

### API Endpoints (12 Routes)

```
GET  /api/health              → System health check
GET  /api/tasks               → List all tasks (filter by status/type)
POST /api/tasks               → Create new task
GET  /api/tasks/:id           → Get task by ID
GET  /api/plans               → List plans for task
POST /api/plans               → Create plan
GET  /api/decisions           → List decisions
POST /api/decisions           → Record decision
GET  /api/results             → List results
POST /api/results             → Record result
POST /api/workflow/create-task       → Workflow: Create task
POST /api/workflow/approve-plan      → Workflow: Approve plan
POST /api/workflow/verify-result     → Workflow: Verify result
```

### Workflow State Machine (8 States)

```
task_created
  ↓
awaiting_proposals (AI generates plans)
  ↓
awaiting_human_decision (Human reviews)
  ↓
plan_approved (Decision recorded)
  ↓
executing (AI executes plan)
  ↓
awaiting_verification (Quality gates run)
  ↓
completed / failed (Final states)
```

---

## Risk Assessment & Mitigation

### Critical Risks (Phase 1)

| **Risk** | **Probability** | **Impact** | **Mitigation** |
|----------|----------------|------------|----------------|
| Supabase setup fails | Low | Critical | Follow official docs, use Vercel integration |
| Type mismatches break build | Medium | High | Test TypeScript after each change |
| API calls fail in production | Medium | High | Test locally with prod build first |
| Missing env vars crash app | High | Critical | Validate at runtime with Zod |

### Acceptable Risks (MVP)

- Zero test coverage → Manual testing sufficient for MVP
- Permissive RLS policies → Single-user only
- No observability → Add when issues occur
- Over-engineered code → Works as-is, optimize later

### Rollback Strategy

```bash
# If Phase 1 breaks:
git reset --hard HEAD~1
git push --force-with-lease origin claude/setup-dieta-positiva-KKzpa
npm install
npm run dev

# Debug: Check browser console, server logs, Supabase logs
```

---

## Success Metrics

### Functional Metrics (Phase 1)
- ✅ Can create task via UI
- ✅ Task persists to Supabase
- ✅ Dashboard displays tasks from API
- ✅ Can approve/reject plans
- ✅ Decision saves to database
- ✅ Task status updates correctly

### Technical Metrics (Phase 2)
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ Production build succeeds
- ✅ Single source of truth for schemas
- ✅ All 8 workflow states reachable

### Deployment Metrics (Phase 3)
- ✅ App live on Vercel
- ✅ Health endpoint returns 200
- ✅ Database connectivity verified
- ✅ Full workflow works in production
- ✅ Mobile responsive

### Quality Metrics (Phase 4)
- ✅ Codebase reduced by ~540 lines
- ✅ Error tracking captures issues
- ✅ Structured logs aid debugging
- ✅ Performance monitored

---

## File Manifest

### Files to Create (7)

```
/src/lib/api.ts                      → API client with typed fetch functions
/src/agents/planning-agent.ts        → AI planning stub
/src/agents/execution-agent.ts       → AI execution stub
/src/agents/decision-agent.ts        → AI decision validation stub
/docs/DEPLOYMENT.md                  → Deployment guide
/docs/ARCHITECTURE_UPGRADE_REQUIREMENTS.md → This document
/docs/PROJECT_CHECKLIST.md          → Step-by-step checklist
```

### Files to Modify (11)

```
/src/app/page.tsx                    → Replace mock data with API calls
/src/app/approval/page.tsx           → Replace mock, wire decision submission
/src/app/tasks/[id]/page.tsx         → Replace mock data
/src/components/proposals/decision-panel.tsx → Wire API call
/src/interfaces/task.ts              → Add 2 missing TaskStatus values
/src/core/orchestrator/workflow.ts   → Update statusMap, wire agents
/src/core/validators/task.ts         → Fix version, UUID patterns
/src/core/validators/plan.ts         → Fix version, UUID patterns
/src/core/validators/result.ts       → Fix version, UUID patterns
/src/core/validators/decision.ts     → Fix UUID patterns
/DECISIONS.md                        → Add 5 missing decisions
/README.md                           → Update status, add getting started
```

### Files to Delete (4)

```
/src/core/contracts/task.schema.json
/src/core/contracts/plan.schema.json
/src/core/contracts/result.schema.json
/src/core/contracts/decision.schema.json
```

### Files to Defer (Phase 4)

```
/src/core/db/*.ts                    → Simplify CRUD boilerplate
/src/core/orchestrator/quality-gates.ts → Replace class with function
/src/lib/mock-data.ts                → Clean up unused utilities
```

---

## Verification Gates

### Phase 1 Gate
```bash
npm run build                        # Must pass
npm run type-check                   # Must pass
curl http://localhost:3000/api/health # Must return 200
# Manual: Create task → Approve plan → Verify result
```

### Phase 2 Gate
```bash
find src -name "*.schema.json"       # Must return empty
npm run type-check                   # Must pass
# Manual: Check server logs for agent stub calls
```

### Phase 3 Gate
```bash
curl https://[deployment-url]/api/health # Must return 200
# Manual: Complete workflow in production
grep "State Management: Zustand" DECISIONS.md # Must find
```

### Phase 4 Gate
```bash
wc -l src/**/*.ts                    # Compare before/after
# Manual: All features still work after simplification
```

---

## Next Actions (Immediate)

### Option A: Execute Phase 1 (Recommended)
**Action**: Start with database setup
**Command**: Follow `docs/PROJECT_CHECKLIST.md` Phase 1.1
**Time**: 30 minutes to first milestone
**Outcome**: Functional database + API connectivity

### Option B: Review & Adjust Plan
**Action**: Request modifications to upgrade plan
**Questions to consider**:
- Different phase priorities?
- Additional requirements?
- Resource constraints?

### Option C: Deploy Specialized Implementation Agents
**Action**: Use Plan agents with Opus 4.5 for Phase 1 execution
**Agents to deploy**:
1. Database specialist (Supabase setup)
2. Integration specialist (UI↔Backend wiring)
3. State machine specialist (Workflow fixes)

---

## Appendix A: Agent Deployment Strategy

Based on your note: "need to always be on plan mode opus 4.5 thinking"

For implementation phases, recommend deploying specialized Plan agents with Opus model:

```typescript
// Example: Deploy Database Setup Agent
Task({
  subagent_type: "Plan",
  model: "opus",
  description: "Database setup implementation plan",
  prompt: `Create detailed plan for Supabase database setup...`
})

// Deploy Integration Agent
Task({
  subagent_type: "Plan",
  model: "opus",
  description: "UI-Backend integration plan",
  prompt: `Create detailed plan for replacing mock data...`
})
```

This ensures:
- Deep architectural thinking for each phase
- Detailed step-by-step plans before coding
- High-quality implementation strategy
- Consideration of edge cases

---

## Appendix B: Boris Philosophy Checklist

Every deliverable must satisfy:

✅ **Minimal**:
- Phase 1 only fixes critical blockers
- Phase 4 deferred until proven necessary
- No features added beyond requirements

✅ **Verifiable**:
- Each phase has pass/fail criteria
- Manual testing validates functionality
- Build/lint gates prevent regressions

✅ **Token-Efficient**:
- Compressed documentation (this file)
- Focused agent prompts with token limits
- Single source of truth (Zod-only)

✅ **Proven Correct**:
- TypeScript strict mode catches errors
- Manual workflow testing verifies functionality
- Production deployment validates integration

---

## Conclusion

Aura MVP is **architecturally complete but functionally disconnected**. The 8-agent analysis reveals a clear path: wire existing components together rather than rebuild. With 8 hours of focused execution across 3 phases, the system transitions from showcase to functional orchestrator.

**Critical Path**: Database Setup → UI Integration → Agent Stubs → Deploy

**Deferred Optimizations**: Complexity reduction, observability, testing infrastructure

**Ready State**: Phase 1 can begin immediately with existing codebase.

---

**Recommendation**: Begin Phase 1 (Database Setup) or deploy specialized Plan agents with Opus 4.5 for implementation planning.

**Orchestrator Mode Status**: ✅ Complete (Phase 0-2 delivered)
