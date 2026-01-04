# Aura MVP - Project Execution Checklist

**Project**: Dieta Positiva - Aura MVP Integration
**Date**: 2026-01-04
**Owner**: Virgilio
**Status**: Pre-Integration → Production

---

## Quick Reference

**Current State**: Phase 2A + 2B complete, not integrated
**Next Step**: Phase 1 - Database Setup + UI Integration
**Estimated Time**: 8-12 hours total
**Target**: Functional MVP deployed to Vercel

---

## Phase 1: Make It Work (CRITICAL - 3 hours)

### 1.1 Database Setup (30 minutes)

- [ ] **Create Supabase Project**
  - [ ] Go to https://supabase.com/dashboard
  - [ ] Click "New Project"
  - [ ] Choose name: `aura-mvp-dieta-positiva`
  - [ ] Choose region (closest to deployment location)
  - [ ] Wait for project provisioning (~2 minutes)

- [ ] **Configure Environment Variables**
  - [ ] Copy project URL from Supabase dashboard
  - [ ] Copy anon key from Supabase dashboard → Settings → API
  - [ ] Copy service role key (optional but recommended)
  - [ ] Create `/home/user/MVP/.env.local` file:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
    SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
    ```

- [ ] **Execute Database Schema**
  - [ ] Open Supabase SQL Editor
  - [ ] Click "New Query"
  - [ ] Copy entire contents of `/home/user/MVP/scripts/setup-db.sql`
  - [ ] Paste and click "Run"
  - [ ] Verify output shows 5 tables created

- [ ] **Verify Database Setup**
  - [ ] Go to Supabase → Database → Tables
  - [ ] Confirm tables exist: `tasks`, `plans`, `decisions`, `results`, `human_overrides`
  - [ ] Verify indexes created (check verification query output)
  - [ ] Verify RLS enabled on all tables

- [ ] **Test Local Connectivity**
  - [ ] Run `npm run dev` locally
  - [ ] Visit `http://localhost:3000/api/health`
  - [ ] Verify response: `{"status": "ok"}`
  - [ ] Check terminal for Supabase connection logs

**Success Criteria**: ✅ Health endpoint returns 200, no Supabase errors in logs

---

### 1.2 State Machine Fix (30 minutes)

- [ ] **Update TaskStatus Enum**
  - [ ] Open `/home/user/MVP/src/interfaces/task.ts`
  - [ ] Add missing states to `TaskStatus` type:
    - `'awaiting_human_decision'`
    - `'awaiting_verification'`
  - [ ] Save file

- [ ] **Update Workflow Status Mapping**
  - [ ] Open `/home/user/MVP/src/core/orchestrator/workflow.ts`
  - [ ] Update `statusMap` object (line ~69-76) to include:
    ```typescript
    'awaiting_decision': 'awaiting_human_decision',
    'verifying': 'awaiting_verification',
    ```
  - [ ] Save file

- [ ] **Test TypeScript Compilation**
  - [ ] Run `npm run type-check`
  - [ ] Fix any type errors
  - [ ] Verify build succeeds: `npm run build`

**Success Criteria**: ✅ TypeScript compiles with no errors, all 8 states mapped

---

### 1.3 UI↔Backend Integration (2 hours)

- [ ] **Create API Client Library**
  - [ ] Create file `/home/user/MVP/src/lib/api.ts`
  - [ ] Add typed fetch functions for:
    - `fetchTasks(status?: TaskStatus): Promise<TaskRow[]>`
    - `fetchTaskById(id: string): Promise<TaskRow>`
    - `fetchProposals(taskId: string): Promise<PlanRow[]>`
    - `submitDecision(data: DecisionInput): Promise<void>`
  - [ ] Add error handling and response validation

- [ ] **Update Dashboard Page** (`src/app/page.tsx`)
  - [ ] Remove mock data import: `import { mockTasks } from '@/lib/mock-data'`
  - [ ] Add `useState` + `useEffect` for data fetching
  - [ ] Replace `mockTasks` with API call to `fetchTasks()`
  - [ ] Add loading state: `{loading ? <Spinner /> : <TaskList />}`
  - [ ] Add error state: `{error && <ErrorMessage />}`
  - [ ] Test in browser: tasks load from database

- [ ] **Update Approval Page** (`src/app/approval/page.tsx`)
  - [ ] Remove mock data import
  - [ ] Add data fetching: `fetchTasks('awaiting_human_decision')`
  - [ ] Add loading/error states
  - [ ] Update `handleApprove()` to call `submitDecision()`
  - [ ] Test: approval persists to database

- [ ] **Update Task Detail Page** (`src/app/tasks/[id]/page.tsx`)
  - [ ] Remove mock data import
  - [ ] Add data fetching: `fetchTaskById(params.id)`
  - [ ] Add loading/error states
  - [ ] Test: task detail loads from database

- [ ] **Wire Decision Panel** (`src/components/proposals/decision-panel.tsx`)
  - [ ] Update `handleApprove()` to POST to `/api/decisions`
  - [ ] Add loading state during submission
  - [ ] Add success/error toast notifications
  - [ ] Test: decision submission works end-to-end

**Success Criteria**: ✅ All pages load data from API, decisions persist to DB

---

### 1.4 Manual Testing (30 minutes)

- [ ] **Test Task Creation Flow**
  - [ ] Navigate to Create Task page
  - [ ] Fill form with valid data
  - [ ] Submit
  - [ ] Verify task appears in dashboard
  - [ ] Verify task saved to Supabase (check Supabase → Database → tasks table)

- [ ] **Test Approval Flow**
  - [ ] Navigate to Approval Queue
  - [ ] Select a task awaiting decision
  - [ ] Review proposals
  - [ ] Select option and provide rationale
  - [ ] Click "Approve"
  - [ ] Verify decision saved to Supabase
  - [ ] Verify task status updated

- [ ] **Test History View**
  - [ ] Navigate to History page
  - [ ] Verify timeline shows recent events
  - [ ] Test filtering by date/type

- [ ] **Test Error Handling**
  - [ ] Disconnect internet
  - [ ] Try loading dashboard
  - [ ] Verify error message displays
  - [ ] Reconnect internet
  - [ ] Verify data loads

**Success Criteria**: ✅ Full Task→Plan→Decision→Result workflow works

---

## Phase 2: Make It Right (HIGH - 3 hours)

### 2.1 Schema Governance (1 hour)

- [ ] **Delete JSON Schemas**
  - [ ] Delete `/home/user/MVP/src/core/contracts/task.schema.json`
  - [ ] Delete `/home/user/MVP/src/core/contracts/plan.schema.json`
  - [ ] Delete `/home/user/MVP/src/core/contracts/result.schema.json`
  - [ ] Delete `/home/user/MVP/src/core/contracts/decision.schema.json`
  - [ ] Delete empty `/home/user/MVP/src/core/contracts/` directory

- [ ] **Update Zod Validators**
  - [ ] Open each validator file in `/home/user/MVP/src/core/validators/`
  - [ ] Fix `version` field: change from regex to enum `z.literal("1.0.0")`
  - [ ] Fix UUID patterns to be consistent
  - [ ] Remove references to JSON schemas in comments

- [ ] **Update Documentation**
  - [ ] Search codebase for references to `.schema.json` files
  - [ ] Update `DECISIONS.md` to document Zod-only decision
  - [ ] Update architecture docs if needed

- [ ] **Test Validation**
  - [ ] Run `npm run type-check`
  - [ ] Test API endpoints with valid/invalid data
  - [ ] Verify Zod validation catches errors

**Success Criteria**: ✅ No JSON schema files remain, single source of truth

---

### 2.2 AI Agent Stubs (2 hours)

- [ ] **Create Planning Agent Stub** (`src/agents/planning-agent.ts`)
  - [ ] Export function: `generatePlan(task: Task): Promise<Plan>`
  - [ ] Return mock Plan object for now
  - [ ] Add logging: "Planning agent called for task {taskId}"
  - [ ] Add TODO comment for future Anthropic SDK integration

- [ ] **Create Execution Agent Stub** (`src/agents/execution-agent.ts`)
  - [ ] Export function: `executePlan(plan: Plan): Promise<Result>`
  - [ ] Return mock Result object
  - [ ] Add logging: "Execution agent called for plan {planId}"
  - [ ] Add TODO comment

- [ ] **Create Decision Agent Stub** (`src/agents/decision-agent.ts`)
  - [ ] Export function: `validatePlan(plan: Plan): Promise<boolean>`
  - [ ] Return `true` for now
  - [ ] Add logging: "Decision agent called for plan {planId}"
  - [ ] Add TODO comment

- [ ] **Wire Agents into Workflow**
  - [ ] Update `/home/user/MVP/src/core/orchestrator/workflow.ts`
  - [ ] Import agent stubs
  - [ ] Call `generatePlan()` in `createTaskWorkflow()`
  - [ ] Call `validatePlan()` in `submitProposal()`
  - [ ] Call `executePlan()` in `executeApprovedPlan()`

- [ ] **Test Agent Integration**
  - [ ] Create task via UI
  - [ ] Check server logs for agent stub calls
  - [ ] Verify workflow progresses through all states

**Success Criteria**: ✅ Agents called at correct points, logs confirm execution

---

## Phase 3: Make It Ship (MEDIUM - 2 hours)

### 3.1 Documentation Updates (1 hour)

- [ ] **Update DECISIONS.md**
  - [ ] Add decision: "State Management: Zustand"
  - [ ] Add decision: "UI Components: Radix UI"
  - [ ] Add decision: "Server State: Tanstack React Query"
  - [ ] Add decision: "Project Structure: src/ Directory"
  - [ ] Add decision: "Schema Governance: Zod-Only"

- [ ] **Create Deployment Guide** (`docs/DEPLOYMENT.md`)
  - [ ] Document Supabase setup steps
  - [ ] Document Vercel deployment steps
  - [ ] List all required environment variables
  - [ ] Add troubleshooting section

- [ ] **Update README.md**
  - [ ] Update status: "Phase 2C Complete - Integrated"
  - [ ] Add "Getting Started" section
  - [ ] Add link to deployment guide
  - [ ] Update architecture diagram if needed

**Success Criteria**: ✅ All decisions documented, deployment guide complete

---

### 3.2 Vercel Deployment (1 hour)

- [ ] **Prepare for Deployment**
  - [ ] Test production build locally: `npm run build`
  - [ ] Test production server: `npm run start`
  - [ ] Verify no console errors
  - [ ] Fix any build warnings

- [ ] **Configure Vercel Project**
  - [ ] Go to https://vercel.com/dashboard
  - [ ] Click "New Project"
  - [ ] Import GitHub repository
  - [ ] Configure project settings:
    - Framework: Next.js
    - Build command: `npm run build`
    - Output directory: `.next`

- [ ] **Set Environment Variables in Vercel**
  - [ ] Go to Project Settings → Environment Variables
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL` (Production)
  - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production)
  - [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (Production)
  - [ ] Add `ANTHROPIC_API_KEY` (optional for Phase 2)

- [ ] **Deploy to Production**
  - [ ] Click "Deploy"
  - [ ] Wait for build to complete (~2-3 minutes)
  - [ ] Visit deployment URL
  - [ ] Test health endpoint: `[deployment-url]/api/health`

- [ ] **Test in Production**
  - [ ] Complete full workflow in production
  - [ ] Create task
  - [ ] Approve plan
  - [ ] Verify decision saved
  - [ ] Check Supabase for data

- [ ] **Share Deployment**
  - [ ] Copy production URL
  - [ ] Test on mobile device
  - [ ] Share with team/stakeholders

**Success Criteria**: ✅ App live on Vercel, full workflow functional

---

## Phase 4: Make It Better (DEFERRED - 4 hours)

### 4.1 Complexity Reduction (3 hours)

- [ ] **Simplify Database Layer**
  - [ ] Identify repeated patterns in `/home/user/MVP/src/core/db/`
  - [ ] Create generic CRUD utility
  - [ ] Refactor 5 files to use utility
  - [ ] Test all API endpoints still work

- [ ] **Remove Unnecessary Abstractions**
  - [ ] Replace `QualityGateExecutor` class with simple function
  - [ ] Convert `WorkflowEngine` class to utility functions
  - [ ] Test workflow still functions

- [ ] **Clean Up Mock Data**
  - [ ] Delete unused mock data utilities
  - [ ] Keep only what's needed for storybook/testing
  - [ ] Update imports

**Success Criteria**: ✅ ~500 lines of code removed, functionality preserved

---

### 4.2 Observability Setup (1 hour)

- [ ] **Add Error Tracking**
  - [ ] Sign up for Sentry (free tier)
  - [ ] Install `@sentry/nextjs`
  - [ ] Configure Sentry in `next.config.mjs`
  - [ ] Add DSN to environment variables
  - [ ] Test error capture

- [ ] **Add Structured Logging**
  - [ ] Install logging library (pino or winston)
  - [ ] Replace console.log with structured logs
  - [ ] Add request IDs
  - [ ] Log API calls and responses

- [ ] **Add Performance Monitoring**
  - [ ] Enable Vercel Analytics
  - [ ] Add custom metrics for critical flows
  - [ ] Set up alerts for errors

**Success Criteria**: ✅ Errors tracked, logs structured, performance visible

---

## Risk Mitigation Checklist

### Before Starting

- [ ] Backup current working state (git commit + push)
- [ ] Verify all dependencies installed (`npm install`)
- [ ] Verify local development works (`npm run dev`)
- [ ] Read all agent reports and upgrade requirements

### During Development

- [ ] Commit frequently (after each subtask)
- [ ] Test after each change
- [ ] Keep browser DevTools open (watch for errors)
- [ ] Check Supabase logs if API calls fail

### Before Deployment

- [ ] Test production build locally
- [ ] Verify all environment variables set
- [ ] Test database connectivity
- [ ] Complete full workflow test locally

---

## Verification Gates

### Phase 1 Complete
- ✅ Database tables exist in Supabase
- ✅ `/api/health` returns 200
- ✅ Dashboard loads tasks from API
- ✅ Can create and approve tasks
- ✅ No TypeScript errors
- ✅ No console errors in browser

### Phase 2 Complete
- ✅ No JSON schema files in codebase
- ✅ Zod validators are single source of truth
- ✅ Agent stubs called at correct workflow points
- ✅ All 8 states reachable in workflow

### Phase 3 Complete
- ✅ App deployed to Vercel
- ✅ Production health check passes
- ✅ Full workflow works in production
- ✅ All decisions documented in DECISIONS.md
- ✅ Deployment guide exists

### Phase 4 Complete
- ✅ Codebase reduced by ~500 lines
- ✅ Error tracking active (Sentry)
- ✅ Structured logging in place
- ✅ Performance monitoring enabled

---

## Emergency Rollback Plan

If something breaks during integration:

1. **Revert Changes**
   ```bash
   git reset --hard HEAD~1  # Undo last commit
   git push --force-with-lease origin claude/setup-dieta-positiva-KKzpa
   ```

2. **Restore Working State**
   ```bash
   npm install  # Reinstall dependencies
   npm run dev  # Test locally
   ```

3. **Debug Issues**
   - Check browser console for errors
   - Check terminal for server errors
   - Check Supabase logs
   - Check Vercel deployment logs

4. **Document What Broke**
   - Add note to `DECISIONS.md`
   - Update this checklist with lesson learned

---

## Success Metrics

### Functional Success
- Can create task end-to-end
- Can approve/reject plans
- Can view task history
- Decisions persist to database
- UI updates reflect backend state

### Technical Success
- Zero TypeScript errors
- Zero ESLint errors
- Production build succeeds
- All API endpoints functional
- Database queries performant (<100ms)

### Business Success
- MVP deployed and accessible
- Full workflow demonstrated
- Ready for user feedback
- Architecture documented
- Team can maintain/extend

---

## Next Steps After Completion

1. **Gather User Feedback**
   - Share MVP with target users
   - Observe workflow usage
   - Identify pain points

2. **Prioritize Improvements**
   - Based on actual usage patterns
   - Based on user feedback
   - Based on technical debt

3. **Plan Next Phase**
   - Real AI agent integration (Anthropic SDK)
   - Advanced features
   - Multi-user support
   - Production hardening

---

**Ready to Start?** Begin with Phase 1.1 (Database Setup) 🚀
