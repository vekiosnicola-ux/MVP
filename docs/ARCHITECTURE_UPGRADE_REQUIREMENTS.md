# Architecture Upgrade Requirements Document

**Project**: Aura MVP - Dieta Positiva
**Date**: 2026-01-04
**Status**: Pre-Integration Phase
**Philosophy**: Boris-style - Minimal, Verifiable, Token-Efficient

---

## Executive Summary

**Current State**: Phase 2A (backend) and Phase 2B (UI) complete but **not integrated**. UI consumes mock data. Backend calls Supabase database that doesn't exist. System is 70% complete but 0% functional end-to-end.

**Goal**: Make Aura MVP functional for Task→Plan→Decision→Result workflow with human-in-the-loop approval gates.

**Critical Path**:
1. Database setup (Supabase configuration)
2. UI↔Backend integration (replace mock data with API calls)
3. State machine completion (add missing states)
4. AI agent stubs (placeholder for future integration)
5. Schema governance (eliminate dual maintenance)

**Estimated Effort**: 8-12 hours of focused development

---

## Phase 0 Findings: Truth Pack + Mismatch Report

### What the System Is
Aura MVP is a human-in-the-loop orchestration dashboard for AI development workflows, where AI agents propose plans (Task→Plan→Decision→Result) and humans approve critical junctions before execution.

### Repository Reality
- **Structure**: Next.js 14 App Router, TypeScript strict mode
- **UI**: 5 pages, 25 components, Framer Motion animations, dark theme
- **Backend**: REST API routes, Supabase CRUD operations, workflow engine
- **Status**: Built separately, not wired together

### Core Boundaries
1. **UI Layer**: `src/app/` pages + `src/components/` (consumes mock data)
2. **Core Logic**: `src/core/orchestrator/` (workflow engine, quality gates)
3. **Data Layer**: `src/core/db/` (Supabase client, CRUD ops for 5 tables)
4. **Shared Contracts**: `src/core/contracts/` (JSON schemas) + `src/core/validators/` (Zod schemas)
5. **AI Integration**: Placeholder only (no actual agent calls)

### Critical Mismatches Found

| **Claim** | **Reality** | **Risk** | **Fix Priority** |
|-----------|-------------|----------|------------------|
| 8-state workflow | Only 6 states implemented | Missing human decision gates | HIGH |
| Backend ready | Supabase project doesn't exist | All API calls fail | CRITICAL |
| UI shows real data | Hardcoded to mock-data.ts | Won't update with backend | HIGH |
| Dual schema validation | JSON + Zod schemas drift | Runtime validation errors | MEDIUM |
| AI agents propose plans | Zero AI integration | Can't generate proposals | MEDIUM |
| Quality gates enforced | Gates stub/incomplete | No actual validation | LOW |

---

## Subagent Findings Summary

### A. Architecture (Integration Strategy)

**Boundary Violations**:
1. UI imports mock data directly instead of calling `/api/tasks`
2. Decision panel callbacks log to console instead of POSTing to API
3. No error handling for network failures
4. Type mismatch: `MockTask` ≠ `TaskRow`

**Integration Strategy**:
- Create `/src/lib/api.ts` with typed fetch functions
- Convert pages to `useState + useEffect + fetch` (no React Query needed yet)
- Add loading/error states to components
- Wire decision submission to `/api/workflow/approve-plan`

**Effort**: 2 hours

### B. Contracts/Governance (Schema Validation)

**Critical Mismatches**:
1. `version` field: JSON allows `"1.0.0"` only, Zod allows any semver
2. `id` patterns: JSON schema too loose, Zod enforces proper UUIDs
3. No sync validation between schemas

**Recommendation**: **Zod-only** (delete JSON schemas)
- Fits minimal philosophy: single source of truth
- Zod already validates at runtime
- Export as JSON schema via `zod-to-openapi` if needed for docs

**Effort**: 1 hour

### C. Data/Auth (Database Setup)

**Schema Quality**: Good (5 tables, proper indexes, foreign keys)

**Critical Gaps**:
1. Missing `updated_at` triggers on `plans`, `decisions`, `results` tables
2. TEXT status fields lack CHECK constraints (can insert invalid values)
3. RLS policies are permissive (acceptable for MVP, document limitation)

**Setup Checklist**:
1. Create Supabase project at https://supabase.com/dashboard
2. Configure `.env.local` with project URL and anon key
3. Run `scripts/setup-db.sql` in Supabase SQL Editor
4. Verify tables exist in Supabase Dashboard
5. Test connectivity via `/api/db-health` endpoint

**Effort**: 30 minutes

### D. Workflow/Orchestrator (State Machine)

**State Machine Gaps**:
- Declared: 8 states (including `awaiting_human_decision`, `awaiting_verification`)
- Implemented: 6 states only
- Missing states break human-in-the-loop workflow

**AI Integration Status**:
- Zero agent implementation (no Anthropic SDK calls)
- `/src/agents/` directory empty
- Workflow methods are pure DB operations

**Minimal Fix**:
1. Extend `TaskStatus` enum with 2 missing states
2. Create placeholder agent stubs (`planning-agent.ts`, `execution-agent.ts`)
3. Wire agents into workflow methods
4. Test end-to-end state progression

**Effort**: 2 hours

### E. DevOps/Observability (Deployment)

**Build Status**: ✅ Passes (ready to deploy)

**Deployment Blockers**: None (can deploy to Vercel today)

**Observability Gaps**:
- No error tracking (Sentry/Rollbar)
- No structured logging
- No performance monitoring

**Recommendation**: Deploy MVP now, add observability after user feedback

**Effort**: 15 minutes (deployment only)

### F. QA/Verification (Quality Gates)

**Test Coverage**: 0% (zero test files exist)

**Quality Gate Status**:
- 3 gates implemented but shallow (validate orchestration state, not functionality)
- Gates pass even if core features broken

**Testing Strategy**:
- **Phase 1 (NOW)**: Manual testing + lint/type-check
- **Phase 2 (WHEN NEEDED)**: Integration tests for critical flows only

**Effort**: 0 hours (defer testing until needed)

### G. Simplifier (Complexity Reduction)

**Over-Engineering Found**:
1. **Database layer**: 520 lines of identical CRUD boilerplate across 5 files
2. **QualityGateExecutor**: Strategy pattern for 1 implementation
3. **WorkflowEngine**: Class wrapper with no orchestration logic
4. **Mock data utilities**: 6 filter functions for trivial array operations
5. **Schema mismatch**: Mock data violates its own Zod validators

**Simplification Opportunities**:
- Collapse DB layer into direct Supabase calls (saves 420 lines)
- Replace QualityGateExecutor with simple function (saves 43 lines)
- Remove WorkflowEngine class, use utility functions (saves 53 lines)
- Delete mock data getters, inline filters (saves 23 lines)

**Total Savings**: ~540 lines of cruft

**Effort**: 4 hours (defer to post-MVP)

### H. Knowledge Curator (Documentation)

**Undocumented Decisions**:
1. Radix UI component library choice
2. Zustand for state management (vs Context)
3. Tanstack React Query for server state
4. `src/` directory structure
5. Core module organization (contracts/db/orchestrator)

**Decision Quality**: Good template format, but missing cross-references

**Updates Needed**: Backfill 5 decisions to `DECISIONS.md`

**Effort**: 1 hour

---

## Priority Matrix

| **Priority** | **Item** | **Impact** | **Effort** | **Status** |
|--------------|----------|------------|------------|------------|
| 🔴 CRITICAL | Database setup | Blocks all API calls | 30 min | Not started |
| 🔴 CRITICAL | UI↔Backend integration | Makes system functional | 2 hours | Not started |
| 🟡 HIGH | State machine completion | Enables human-in-the-loop | 2 hours | Not started |
| 🟡 HIGH | Schema governance (Zod-only) | Prevents drift | 1 hour | Not started |
| 🟢 MEDIUM | AI agent stubs | Placeholder for future | 2 hours | Not started |
| 🟢 MEDIUM | Documentation updates | Knowledge preservation | 1 hour | Not started |
| ⚪ LOW | Quality gate implementation | Validation depth | Deferred | - |
| ⚪ LOW | Complexity reduction | Code health | Deferred | - |
| ⚪ LOW | Observability setup | Production monitoring | Deferred | - |

---

## Upgrade Execution Plan

### Phase 1: Make It Work (CRITICAL - 3 hours)

**Goal**: Functional Task→Plan→Decision→Result workflow end-to-end

1. **Database Setup** (30 min)
   - Create Supabase project
   - Configure environment variables
   - Execute `scripts/setup-db.sql`
   - Verify with `/api/db-health`

2. **UI↔Backend Integration** (2 hours)
   - Create `/src/lib/api.ts` with typed fetch functions
   - Replace mock data imports with API calls in 4 files:
     - `src/app/page.tsx`
     - `src/app/approval/page.tsx`
     - `src/app/tasks/[id]/page.tsx`
     - `src/components/proposals/decision-panel.tsx`
   - Add loading/error states
   - Test manually in browser

3. **State Machine Fix** (30 min)
   - Add missing states to `TaskStatus` enum
   - Update `workflow.ts` statusMap
   - Test state transitions

**Success Criteria**: Can create task, view in dashboard, approve plan, see result

---

### Phase 2: Make It Right (HIGH - 3 hours)

**Goal**: Eliminate technical debt, prevent future issues

1. **Schema Governance** (1 hour)
   - Delete `/src/core/contracts/*.json` files
   - Update Zod validators to match deleted schemas
   - Remove JSON schema references from docs

2. **AI Agent Stubs** (2 hours)
   - Create placeholder agents in `/src/agents/`:
     - `planning-agent.ts` (generates Plan from Task)
     - `execution-agent.ts` (executes Plan steps)
     - `decision-agent.ts` (validates plan feasibility)
   - Wire into workflow methods
   - Log placeholder messages (no real AI calls yet)

**Success Criteria**: Workflow calls agent stubs at correct points

---

### Phase 3: Make It Ship (MEDIUM - 2 hours)

**Goal**: Deploy to production, document decisions

1. **Documentation Updates** (1 hour)
   - Add 5 missing decisions to `DECISIONS.md`
   - Update architecture docs with reality
   - Create deployment guide

2. **Vercel Deployment** (1 hour)
   - Configure environment variables in Vercel
   - Deploy to production
   - Test production build
   - Share URL

**Success Criteria**: Aura MVP live and accessible

---

### Phase 4: Make It Better (DEFERRED - 4 hours)

**Goal**: Reduce complexity, improve observability

1. **Simplification** (3 hours)
   - Collapse DB layer boilerplate
   - Remove unnecessary abstractions
   - Clean up mock data

2. **Observability** (1 hour)
   - Add structured logging
   - Set up error tracking (Sentry)
   - Add performance monitoring

**Success Criteria**: Smaller codebase, better visibility

---

## Risk Assessment

### Critical Risks

| **Risk** | **Probability** | **Impact** | **Mitigation** |
|----------|----------------|------------|----------------|
| Supabase setup fails | Low | Critical | Follow official docs, use Vercel integration |
| Type mismatches break build | Medium | High | Test TypeScript compilation after each change |
| API calls fail in production | Medium | High | Test locally with production build first |
| Missing env vars in Vercel | High | Critical | Document all required vars, validate at runtime |

### Deferred Risks (Acceptable for MVP)

- No test coverage (acceptable - manual testing sufficient)
- Permissive RLS policies (acceptable - single user)
- No observability (acceptable - add when issues occur)
- Over-engineered code (acceptable - works as-is)

---

## Success Metrics

### Functional Metrics (Phase 1)
- ✅ Can create new task via UI
- ✅ Task appears in dashboard
- ✅ Can view task detail page
- ✅ Can approve/reject plan
- ✅ Decision persists to database
- ✅ Task status updates correctly

### Quality Metrics (Phase 2)
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ Production build succeeds
- ✅ All API endpoints return valid responses
- ✅ Single source of truth for schemas

### Deployment Metrics (Phase 3)
- ✅ App deployed to Vercel
- ✅ Health endpoint returns 200
- ✅ Database connectivity verified
- ✅ UI loads in production
- ✅ Can complete full workflow in production

---

## Dependencies

### External Services
1. **Supabase** (database hosting)
   - Account required: https://supabase.com
   - Free tier sufficient for MVP

2. **Vercel** (app hosting)
   - Account required: https://vercel.com
   - Free tier sufficient for MVP

3. **Anthropic** (AI - future)
   - API key required for Phase 2 agent implementation
   - Not needed for Phase 1 (stubs only)

### Environment Variables Required

```bash
# Required for Phase 1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Optional for Phase 1
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Required for Phase 2 (AI integration)
ANTHROPIC_API_KEY=[your-api-key]

# Optional
NODE_ENV=production
PORT=3000
```

---

## Verification Checklist

### Pre-Integration Verification
- [ ] Repository builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All environment variables validated

### Post-Phase 1 Verification
- [ ] Supabase project created and accessible
- [ ] All 5 tables exist in database
- [ ] `/api/db-health` returns 200 OK
- [ ] Dashboard loads without errors
- [ ] Can create task via UI
- [ ] Task persists to database
- [ ] Approval flow completes

### Post-Phase 2 Verification
- [ ] No JSON schema files remain
- [ ] Zod validators pass for all contracts
- [ ] Agent stubs called at correct points
- [ ] Workflow progresses through all 8 states

### Post-Phase 3 Verification
- [ ] Production deployment successful
- [ ] All environment variables configured
- [ ] Health check passes in production
- [ ] Full workflow works in production
- [ ] Documentation updated

---

## Appendix: File Manifest

### Files to Create
- `/src/lib/api.ts` (API client functions)
- `/src/agents/planning-agent.ts` (stub)
- `/src/agents/execution-agent.ts` (stub)
- `/src/agents/decision-agent.ts` (stub)
- `/docs/DEPLOYMENT.md` (deployment guide)

### Files to Modify
- `/src/app/page.tsx` (replace mock data)
- `/src/app/approval/page.tsx` (replace mock data, wire submission)
- `/src/app/tasks/[id]/page.tsx` (replace mock data)
- `/src/components/proposals/decision-panel.tsx` (wire API call)
- `/src/interfaces/task.ts` (add missing TaskStatus values)
- `/src/core/orchestrator/workflow.ts` (update statusMap, wire agents)
- `/src/core/validators/*.ts` (update to match deleted JSON schemas)
- `/DECISIONS.md` (add 5 missing decisions)

### Files to Delete
- `/src/core/contracts/task.schema.json`
- `/src/core/contracts/plan.schema.json`
- `/src/core/contracts/result.schema.json`
- `/src/core/contracts/decision.schema.json`

### Files to Defer (Phase 4)
- DB layer simplification (5 files in `/src/core/db/`)
- Quality gate refactor (`/src/core/orchestrator/quality-gates.ts`)
- Mock data cleanup (`/src/lib/mock-data.ts`)

---

## Conclusion

Aura MVP is **architecturally sound but functionally incomplete**. The primary gap is integration between independently-built frontend and backend. With 8-12 hours of focused work across 3 phases, the system will be production-ready.

**Recommended Starting Point**: Phase 1 (Database Setup + UI↔Backend Integration). This delivers immediate functional value and unblocks all other work.

**Philosophy Alignment**: This upgrade plan follows Boris principles:
- ✅ Minimal: Only changes what's broken
- ✅ Verifiable: Each phase has clear success criteria
- ✅ Token-efficient: Defers complexity reduction to Phase 4

---

**Next Step**: Execute Phase 1 or request modification to this plan.
