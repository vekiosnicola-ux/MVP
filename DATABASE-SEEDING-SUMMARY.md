# Database Schema and Seeding Summary

## Overview

This document summarizes the database schema for the Aura MVP orchestration engine and the seed scripts created to populate it with realistic sample data.

## Database Schema Found

The schema is defined in `/home/user/MVP/scripts/setup-db.sql` and consists of 5 main tables:

### 1. tasks
Stores task definitions and their current state.

**Columns:**
- `id` (UUID, PK) - Auto-generated unique identifier
- `task_id` (TEXT, UNIQUE) - Human-readable task identifier (e.g., "task-001")
- `version` (TEXT) - Semantic version of the task
- `type` (TEXT) - Task type: feature, bugfix, refactor, docs, test, infra
- `description` (TEXT) - Task description
- `context` (JSONB) - Task context (repository, branch, files, dependencies)
- `constraints` (JSONB) - Task constraints (maxDuration, requiresApproval, breakingChangesAllowed, testCoverageMin)
- `metadata` (JSONB) - Additional metadata (createdAt, createdBy, priority, labels)
- `status` (TEXT) - Current status: pending, planning, approved, executing, completed, failed
- `created_at` (TIMESTAMPTZ) - Timestamp when task was created
- `updated_at` (TIMESTAMPTZ) - Timestamp when task was last updated

**Indexes:**
- `idx_tasks_status` - On status column
- `idx_tasks_type` - On type column
- `idx_tasks_created_at` - On created_at column (descending)

### 2. plans
Stores execution plans proposed for tasks.

**Columns:**
- `id` (UUID, PK) - Auto-generated unique identifier
- `plan_id` (TEXT, UNIQUE) - Human-readable plan identifier (e.g., "plan-001-a")
- `task_id` (TEXT, FK) - References tasks(task_id) ON DELETE CASCADE
- `version` (TEXT) - Semantic version of the plan
- `approach` (TEXT) - Short description of the approach
- `reasoning` (TEXT) - Why this approach was chosen
- `steps` (JSONB) - Array of execution steps
- `agent` (TEXT) - Agent that created the plan (architect, developer, etc.)
- `estimated_duration` (INTEGER) - Estimated duration in minutes
- `dependencies` (TEXT[]) - Array of dependency identifiers
- `risks` (JSONB) - Array of risk objects
- `status` (TEXT) - Status: proposed, approved, rejected, executing
- `created_at` (TIMESTAMPTZ) - Timestamp when plan was created

**Indexes:**
- `idx_plans_task_id` - On task_id column
- `idx_plans_status` - On status column

### 3. decisions
Stores decisions made about tasks and plans.

**Columns:**
- `id` (UUID, PK) - Auto-generated unique identifier
- `decision_id` (TEXT, UNIQUE) - Human-readable decision identifier
- `task_id` (TEXT, FK) - References tasks(task_id) ON DELETE CASCADE
- `plan_id` (TEXT, FK) - References plans(plan_id) ON DELETE SET NULL
- `category` (TEXT) - Decision category: architecture, ux, performance, security, integration
- `proposals` (JSONB) - Array of proposal objects
- `selected_option` (INTEGER) - Index of selected proposal
- `rationale` (TEXT) - Explanation of the decision
- `overrides` (TEXT[]) - Array of override principles applied
- `decided_by` (TEXT) - Who made the decision
- `decided_at` (TIMESTAMPTZ) - Timestamp when decision was made

**Indexes:**
- `idx_decisions_task_id` - On task_id column
- `idx_decisions_category` - On category column

### 4. results
Stores execution results for completed tasks.

**Columns:**
- `id` (UUID, PK) - Auto-generated unique identifier
- `result_id` (TEXT, UNIQUE) - Human-readable result identifier
- `task_id` (TEXT, FK) - References tasks(task_id) ON DELETE CASCADE
- `plan_id` (TEXT, FK) - References plans(plan_id) ON DELETE CASCADE
- `version` (TEXT) - Semantic version
- `status` (TEXT) - Result status: success, failed, partial
- `summary` (TEXT) - Summary of what was done
- `outputs` (JSONB) - Output artifacts and changes
- `quality_gates` (JSONB) - Quality gate results
- `test_results` (JSONB) - Test execution results
- `duration` (INTEGER) - Actual duration in minutes
- `agent` (TEXT) - Agent that executed the task
- `errors` (JSONB) - Error information if failed
- `completed_at` (TIMESTAMPTZ) - Timestamp when completed

**Indexes:**
- `idx_results_task_id` - On task_id column
- `idx_results_status` - On status column

### 5. human_overrides
Learning database that tracks when humans override AI suggestions.

**Columns:**
- `id` (UUID, PK) - Auto-generated unique identifier
- `task_id` (TEXT, FK) - References tasks(task_id) ON DELETE CASCADE
- `ai_suggestion` (TEXT) - What the AI suggested
- `human_decision` (TEXT) - What the human decided instead
- `category` (TEXT) - Category of the override
- `rationale` (TEXT) - Why the human overrode the AI
- `project_id` (TEXT) - Project identifier
- `applied_count` (INTEGER) - How many times this override has been applied
- `created_at` (TIMESTAMPTZ) - Timestamp when override was recorded

**Indexes:**
- `idx_overrides_category` - On category column
- `idx_overrides_project` - On project_id column

## Row Level Security (RLS)

All tables have RLS enabled with permissive policies for MVP (single user):
- Current policy: "Allow all operations" using `USING (true)`
- This should be tightened for multi-user support in production

## Seed Scripts Created

### 1. SQL Seed Script (`scripts/seed-db.sql`)

A comprehensive SQL script that:
- Truncates all tables (for re-seeding)
- Inserts 5 tasks with different statuses
- Inserts 3 plans (2 proposed, 1 approved)
- Inserts 2 decisions
- Inserts 2 results for completed tasks
- Inserts 2 human overrides
- Includes verification queries

**Sample data:**
- **Tasks:**
  - task-001: DP AI chat interface (planning)
  - task-002: RLS policies (executing)
  - task-003: TypeScript bugfix (completed)
  - task-004: Documentation (completed)
  - task-005: Cheshire Cat integration (pending)

- **Plans:**
  - plan-001-a: Next.js + Supabase Realtime (proposed)
  - plan-001-b: Custom WebSocket Server (proposed)
  - plan-002: RLS policies implementation (approved)

- **Decisions:**
  - decision-001: TypeScript fix approach (quick fix chosen)
  - decision-002: Chat interface approach (Supabase chosen)

- **Results:**
  - result-003: TypeScript bugfix result (success)
  - result-004: Documentation result (success)

- **Human Overrides:**
  - Prefer simplicity over flexibility (task-001)
  - MVP over perfect solution (task-003)

### 2. TypeScript Seed Script (`scripts/seed-db.ts`)

A programmatic seed script using `@supabase/supabase-js` that:
- Uses service role key for admin access
- Clears existing data before seeding
- Provides progress indicators and colored output
- Handles errors gracefully
- Verifies seeding with statistics
- Matches TypeScript interfaces exactly

**Features:**
- Safe re-seeding (clears data first)
- Detailed logging
- Error handling
- Data verification
- TypeScript type safety

### 3. Documentation (`scripts/README.md`)

Comprehensive documentation covering:
- Prerequisites and setup
- How to run each script
- Multiple execution options (SQL Editor, CLI, npm)
- Verification queries
- Troubleshooting guide
- Schema change workflow

### 4. Package.json Updates

Added:
- `db:seed` script to run TypeScript seed easily
- `dotenv` dependency for environment variable loading
- `tsx` dependency for running TypeScript scripts

## How to Run

### First Time Setup

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Set environment variables** in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Run schema setup** (in Supabase SQL Editor):
   - Copy contents of `scripts/setup-db.sql`
   - Paste into SQL Editor
   - Run

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run seed script**:
   ```bash
   npm run db:seed
   ```

### Re-seeding (Development)

```bash
# TypeScript script automatically clears and re-seeds
npm run db:seed
```

## Data Relationships

```
tasks (parent)
  ├── plans (many-to-one)
  │   └── referenced by decisions
  ├── decisions (many-to-one)
  ├── results (many-to-one)
  └── human_overrides (many-to-one)
```

**Foreign Key Constraints:**
- `plans.task_id` → `tasks.task_id` (CASCADE on delete)
- `decisions.task_id` → `tasks.task_id` (CASCADE on delete)
- `decisions.plan_id` → `plans.plan_id` (SET NULL on delete)
- `results.task_id` → `tasks.task_id` (CASCADE on delete)
- `results.plan_id` → `plans.plan_id` (CASCADE on delete)
- `human_overrides.task_id` → `tasks.task_id` (CASCADE on delete)

## Schema Alignment with Mock Data

The seed data matches `/home/user/MVP/src/lib/mock-data.ts`:
- All 5 mock tasks replicated
- Both mock plans for task-001 replicated
- Mock plan for task-002 replicated
- Both mock decisions replicated
- Additional results and human overrides added

## Missing/Issues

### None Found

The schema is complete and well-designed:
- ✅ All tables have proper primary keys
- ✅ Foreign key relationships are correct
- ✅ Indexes on frequently queried columns
- ✅ RLS enabled on all tables
- ✅ Proper data types (JSONB for flexible data)
- ✅ Timestamps with timezone
- ✅ Cascading deletes configured correctly

### Recommendations

1. **Type Generation**: Consider generating TypeScript types from schema
   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
   ```

2. **RLS Policies**: Update RLS policies for multi-user support when needed

3. **Migrations**: Consider using Supabase migrations for schema changes
   ```bash
   supabase migration new migration_name
   ```

4. **Mock Data Transition**: Once database is seeded and working:
   - Update API routes to fetch from database
   - Test thoroughly
   - Remove or deprecate `mock-data.ts`

## Next Steps

1. Run `setup-db.sql` in Supabase SQL Editor
2. Install new dependencies: `npm install`
3. Run seed script: `npm run db:seed`
4. Verify data in Supabase dashboard
5. Update API routes to use real database
6. Test frontend with real data

## Files Created/Modified

### Created:
- `/home/user/MVP/scripts/seed-db.sql` - SQL seed script
- `/home/user/MVP/scripts/seed-db.ts` - TypeScript seed script
- `/home/user/MVP/scripts/README.md` - Documentation
- `/home/user/MVP/DATABASE-SEEDING-SUMMARY.md` - This file

### Modified:
- `/home/user/MVP/package.json` - Added db:seed script and dependencies

## Contact

For questions or issues:
- Check `scripts/README.md` for troubleshooting
- Review Supabase dashboard for errors
- Verify environment variables are set correctly
