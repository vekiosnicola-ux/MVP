-- Aura MVP Phase 2A Database Setup
-- Run this in Supabase SQL Editor
-- This creates all tables and policies for the orchestration engine

-- =====================================================
-- TABLE: tasks
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  context JSONB NOT NULL,
  constraints JSONB NOT NULL,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- =====================================================
-- TABLE: plans
-- =====================================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT UNIQUE NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  approach TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  steps JSONB NOT NULL,
  agent TEXT NOT NULL,
  estimated_duration INTEGER,
  dependencies TEXT[],
  risks JSONB,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_task_id ON plans(task_id);
CREATE INDEX idx_plans_status ON plans(status);

-- =====================================================
-- TABLE: decisions
-- =====================================================
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT UNIQUE NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES plans(plan_id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  proposals JSONB NOT NULL,
  selected_option INTEGER NOT NULL,
  rationale TEXT NOT NULL,
  overrides TEXT[],
  decided_by TEXT,
  decided_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_task_id ON decisions(task_id);
CREATE INDEX idx_decisions_category ON decisions(category);

-- =====================================================
-- TABLE: results
-- =====================================================
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id TEXT UNIQUE NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(plan_id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  outputs JSONB NOT NULL,
  quality_gates JSONB NOT NULL,
  test_results JSONB,
  duration INTEGER NOT NULL,
  agent TEXT NOT NULL,
  errors JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_results_task_id ON results(task_id);
CREATE INDEX idx_results_status ON results(status);

-- =====================================================
-- TABLE: human_overrides (Learning Database)
-- =====================================================
CREATE TABLE human_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES tasks(task_id) ON DELETE CASCADE,
  ai_suggestion TEXT NOT NULL,
  human_decision TEXT NOT NULL,
  category TEXT NOT NULL,
  rationale TEXT NOT NULL,
  project_id TEXT,
  applied_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_overrides_category ON human_overrides(category);
CREATE INDEX idx_overrides_project ON human_overrides(project_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_overrides ENABLE ROW LEVEL SECURITY;

-- Permissive policies for MVP (single user)
-- Tighten these later for multi-user support

CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON plans FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON decisions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON human_overrides FOR ALL USING (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'plans', 'decisions', 'results', 'human_overrides')
ORDER BY table_name;

-- Verify all indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tasks', 'plans', 'decisions', 'results', 'human_overrides')
ORDER BY tablename, indexname;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tasks', 'plans', 'decisions', 'results', 'human_overrides');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- You can now use the Aura MVP Orchestration Engine!
-- All 5 tables created with indexes and RLS policies.
-- Aura MVP Database Seed Script
-- Run this in Supabase SQL Editor AFTER running setup-db.sql
-- This populates the database with realistic sample data

-- =====================================================
-- CLEAN EXISTING DATA (for re-seeding)
-- =====================================================
TRUNCATE TABLE human_overrides CASCADE;
TRUNCATE TABLE results CASCADE;
TRUNCATE TABLE decisions CASCADE;
TRUNCATE TABLE plans CASCADE;
TRUNCATE TABLE tasks CASCADE;

-- =====================================================
-- SEED TASKS
-- =====================================================

-- Task 1: DP AI chat interface (planning status)
INSERT INTO tasks (
  task_id,
  version,
  type,
  description,
  context,
  constraints,
  metadata,
  status,
  created_at,
  updated_at
) VALUES (
  'task-001',
  '1.0.0',
  'feature',
  'Build DP AI chat interface with real-time messaging',
  '{
    "repository": "dieta-positiva",
    "branch": "feature/dp-ai-chat",
    "files": ["src/app/(auth)/chat/page.tsx", "src/components/chat/"],
    "dependencies": ["@supabase/supabase-js", "framer-motion"]
  }'::jsonb,
  '{
    "maxDuration": 180,
    "requiresApproval": true,
    "breakingChangesAllowed": false,
    "testCoverageMin": 80
  }'::jsonb,
  '{
    "createdAt": "2025-12-31T12:00:00Z",
    "createdBy": "Virgilio",
    "priority": "high",
    "labels": ["dp-ai", "chat", "frontend"]
  }'::jsonb,
  'planning',
  '2025-12-31T12:00:00Z',
  '2025-12-31T14:30:00Z'
);

-- Task 2: RLS policies (executing status)
INSERT INTO tasks (
  task_id,
  version,
  type,
  description,
  context,
  constraints,
  metadata,
  status,
  created_at,
  updated_at
) VALUES (
  'task-002',
  '1.0.0',
  'feature',
  'Add Row-Level Security policies to Supabase database',
  '{
    "repository": "dieta-positiva",
    "branch": "feature/rls-policies",
    "files": ["supabase/migrations/", "src/lib/supabase/"]
  }'::jsonb,
  '{
    "maxDuration": 90,
    "requiresApproval": true,
    "breakingChangesAllowed": false,
    "testCoverageMin": 90
  }'::jsonb,
  '{
    "createdAt": "2025-12-31T10:00:00Z",
    "createdBy": "Virgilio",
    "priority": "critical",
    "labels": ["security", "database", "supabase"]
  }'::jsonb,
  'executing',
  '2025-12-31T10:00:00Z',
  '2025-12-31T15:00:00Z'
);

-- Task 3: TypeScript bugfix (completed status)
INSERT INTO tasks (
  task_id,
  version,
  type,
  description,
  context,
  constraints,
  metadata,
  status,
  created_at,
  updated_at
) VALUES (
  'task-003',
  '1.0.0',
  'bugfix',
  'Fix TypeScript compilation errors in workflow engine',
  '{
    "repository": "dieta-positiva",
    "branch": "bugfix/typescript-errors",
    "files": ["src/core/workflow/", "src/agents/"]
  }'::jsonb,
  '{
    "maxDuration": 60,
    "requiresApproval": false,
    "breakingChangesAllowed": false,
    "testCoverageMin": 85
  }'::jsonb,
  '{
    "createdAt": "2025-12-31T09:00:00Z",
    "createdBy": "Virgilio",
    "priority": "medium",
    "labels": ["bugfix", "typescript", "backend"]
  }'::jsonb,
  'completed',
  '2025-12-31T09:00:00Z',
  '2025-12-31T10:30:00Z'
);

-- Task 4: Documentation (completed status)
INSERT INTO tasks (
  task_id,
  version,
  type,
  description,
  context,
  constraints,
  metadata,
  status,
  created_at,
  updated_at
) VALUES (
  'task-004',
  '1.0.0',
  'docs',
  'Document Aura workflow orchestration architecture',
  '{
    "repository": "dieta-positiva",
    "branch": "docs/architecture",
    "files": ["docs/architecture.md", "DECISIONS.md"]
  }'::jsonb,
  '{
    "maxDuration": 45,
    "requiresApproval": false,
    "breakingChangesAllowed": false,
    "testCoverageMin": 0
  }'::jsonb,
  '{
    "createdAt": "2025-12-31T08:00:00Z",
    "createdBy": "Virgilio",
    "priority": "low",
    "labels": ["documentation", "architecture"]
  }'::jsonb,
  'completed',
  '2025-12-31T08:00:00Z',
  '2025-12-31T09:00:00Z'
);

-- Task 5: Cheshire Cat integration (pending status)
INSERT INTO tasks (
  task_id,
  version,
  type,
  description,
  context,
  constraints,
  metadata,
  status,
  created_at,
  updated_at
) VALUES (
  'task-005',
  '1.0.0',
  'feature',
  'Implement Cheshire Cat integration for System 2',
  '{
    "repository": "dieta-positiva",
    "branch": "feature/cheshire-cat",
    "files": ["src/lib/cheshire-cat/", "src/app/api/chat/"]
  }'::jsonb,
  '{
    "maxDuration": 240,
    "requiresApproval": true,
    "breakingChangesAllowed": true,
    "testCoverageMin": 75
  }'::jsonb,
  '{
    "createdAt": "2025-12-30T16:00:00Z",
    "createdBy": "Virgilio",
    "priority": "high",
    "labels": ["dp-app", "ai", "integration"]
  }'::jsonb,
  'pending',
  '2025-12-30T16:00:00Z',
  '2025-12-30T16:00:00Z'
);

-- =====================================================
-- SEED PLANS
-- =====================================================

-- Plan 1a: Next.js + Supabase Realtime (for task-001)
INSERT INTO plans (
  plan_id,
  task_id,
  version,
  approach,
  reasoning,
  steps,
  agent,
  estimated_duration,
  dependencies,
  risks,
  status,
  created_at
) VALUES (
  'plan-001-a',
  'task-001',
  '1.0.0',
  'Next.js + Supabase Realtime',
  'Leverage existing tech stack for faster development. Supabase provides built-in real-time subscriptions.',
  '[
    {
      "id": "step-1",
      "agent": "developer",
      "action": "Create chat UI components",
      "inputs": ["Next.js App Router", "Tailwind CSS"],
      "outputs": ["src/app/(auth)/chat/page.tsx", "src/components/chat/"],
      "validation": {
        "command": "npm run type-check && npm run lint",
        "successCriteria": "No TypeScript or ESLint errors"
      }
    },
    {
      "id": "step-2",
      "agent": "database",
      "action": "Create messages table with RLS",
      "inputs": ["Supabase CLI", "PostgreSQL"],
      "outputs": ["supabase/migrations/create_messages_table.sql"],
      "validation": {
        "command": "supabase db reset --local",
        "successCriteria": "Migration runs successfully"
      },
      "dependencies": ["step-1"]
    },
    {
      "id": "step-3",
      "agent": "developer",
      "action": "Integrate Supabase realtime subscriptions",
      "inputs": ["@supabase/supabase-js", "React hooks"],
      "outputs": ["src/hooks/useMessages.ts"],
      "validation": {
        "command": "npm run test",
        "successCriteria": "All tests pass"
      },
      "dependencies": ["step-2"]
    }
  ]'::jsonb,
  'architect',
  180,
  NULL,
  '[
    {
      "description": "Supabase vendor lock-in",
      "severity": "medium",
      "mitigation": "Can migrate to self-hosted Postgres + custom WebSocket later"
    },
    {
      "description": "Real-time scaling limits on free tier",
      "severity": "low",
      "mitigation": "Upgrade to Pro tier if needed ($25/month)"
    }
  ]'::jsonb,
  'proposed',
  '2025-12-31T13:00:00Z'
);

-- Plan 1b: Custom WebSocket Server (alternative for task-001)
INSERT INTO plans (
  plan_id,
  task_id,
  version,
  approach,
  reasoning,
  steps,
  agent,
  estimated_duration,
  dependencies,
  risks,
  status,
  created_at
) VALUES (
  'plan-001-b',
  'task-001',
  '1.0.0',
  'Custom WebSocket Server + PostgreSQL',
  'Full control over real-time infrastructure. No vendor lock-in. Can optimize for performance.',
  '[
    {
      "id": "step-1",
      "agent": "developer",
      "action": "Set up Socket.io server",
      "inputs": ["Socket.io", "Express"],
      "outputs": ["src/server/websocket.ts"],
      "validation": {
        "command": "npm run test:integration",
        "successCriteria": "WebSocket server starts successfully"
      }
    },
    {
      "id": "step-2",
      "agent": "database",
      "action": "Create messages table",
      "inputs": ["PostgreSQL", "Prisma"],
      "outputs": ["prisma/schema.prisma", "prisma/migrations/"],
      "validation": {
        "command": "prisma migrate dev",
        "successCriteria": "Migration succeeds"
      }
    },
    {
      "id": "step-3",
      "agent": "devops",
      "action": "Deploy WebSocket server to Render",
      "inputs": ["Docker", "Render.com"],
      "outputs": [".docker/Dockerfile.websocket", "render.yaml"],
      "validation": {
        "command": "docker build -f .docker/Dockerfile.websocket .",
        "successCriteria": "Docker image builds successfully"
      },
      "dependencies": ["step-1", "step-2"]
    }
  ]'::jsonb,
  'architect',
  240,
  NULL,
  '[
    {
      "description": "Additional infrastructure complexity",
      "severity": "medium",
      "mitigation": "Use managed services (Render, Railway) instead of self-hosting"
    },
    {
      "description": "WebSocket scaling challenges",
      "severity": "high",
      "mitigation": "Use Redis adapter for multi-instance WebSocket scaling"
    },
    {
      "description": "Increased operational overhead",
      "severity": "medium",
      "mitigation": "Start simple, add monitoring later (Sentry, Datadog)"
    }
  ]'::jsonb,
  'proposed',
  '2025-12-31T13:15:00Z'
);

-- Plan 2: RLS policies implementation (for task-002)
INSERT INTO plans (
  plan_id,
  task_id,
  version,
  approach,
  reasoning,
  steps,
  agent,
  estimated_duration,
  dependencies,
  risks,
  status,
  created_at
) VALUES (
  'plan-002',
  'task-002',
  '1.0.0',
  'Comprehensive RLS policies for all tables',
  'Implement security at database level. Follow principle of least privilege.',
  '[
    {
      "id": "step-1",
      "agent": "database",
      "action": "Enable RLS on all tables",
      "inputs": ["Supabase SQL Editor"],
      "outputs": ["supabase/migrations/enable_rls.sql"],
      "validation": {
        "command": "SELECT tablename FROM pg_tables WHERE rowsecurity = true",
        "successCriteria": "All tables have RLS enabled"
      }
    },
    {
      "id": "step-2",
      "agent": "database",
      "action": "Create RLS policies for tasks table",
      "inputs": ["PostgreSQL policies"],
      "outputs": ["supabase/migrations/rls_tasks.sql"],
      "validation": {
        "command": "SELECT * FROM tasks WHERE auth.uid() != metadata->''createdBy''",
        "successCriteria": "Returns empty set"
      },
      "dependencies": ["step-1"]
    },
    {
      "id": "step-3",
      "agent": "tester",
      "action": "Test RLS policies with different users",
      "inputs": ["Supabase test users"],
      "outputs": ["tests/security/rls.test.ts"],
      "validation": {
        "command": "npm run test:security",
        "successCriteria": "All security tests pass"
      },
      "dependencies": ["step-2"]
    }
  ]'::jsonb,
  'database',
  90,
  NULL,
  '[
    {
      "description": "Policy misconfiguration could expose data",
      "severity": "critical",
      "mitigation": "Test with multiple user roles before production deployment"
    },
    {
      "description": "Performance impact of complex policies",
      "severity": "low",
      "mitigation": "Monitor query performance, add indexes if needed"
    }
  ]'::jsonb,
  'approved',
  '2025-12-31T14:00:00Z'
);

-- =====================================================
-- SEED DECISIONS
-- =====================================================

-- Decision 1: TypeScript fix approach (for task-003)
INSERT INTO decisions (
  decision_id,
  task_id,
  plan_id,
  category,
  proposals,
  selected_option,
  rationale,
  overrides,
  decided_by,
  decided_at
) VALUES (
  'decision-001',
  'task-003',
  NULL,
  'architecture',
  '[
    {
      "approach": "Add explicit type annotations",
      "reasoning": "Quick fix that addresses immediate issue",
      "tradeoffs": {
        "pros": ["Fast to implement", "No refactoring needed"],
        "cons": ["Does not improve code quality"],
        "risks": ["May hide deeper architectural issues"]
      }
    },
    {
      "approach": "Refactor to stricter type system",
      "reasoning": "Long-term solution that improves code quality",
      "tradeoffs": {
        "pros": ["Better type safety", "Prevents future errors"],
        "cons": ["Takes longer", "May require breaking changes"],
        "risks": ["Could introduce new bugs"]
      }
    }
  ]'::jsonb,
  0,
  'Quick fix is appropriate here. We are in early development and need to move fast. Can refactor later when we have more test coverage.',
  NULL,
  'Virgilio',
  '2025-12-31T09:30:00Z'
);

-- Decision 2: Chat interface approach (for task-001)
INSERT INTO decisions (
  decision_id,
  task_id,
  plan_id,
  category,
  proposals,
  selected_option,
  rationale,
  overrides,
  decided_by,
  decided_at
) VALUES (
  'decision-002',
  'task-001',
  'plan-001-a',
  'architecture',
  '[
    {
      "approach": "Next.js + Supabase Realtime",
      "reasoning": "Leverage existing stack, faster development",
      "tradeoffs": {
        "pros": ["Fast development", "Built-in features", "Automatic scaling"],
        "cons": ["Vendor lock-in", "Less control"],
        "risks": ["Free tier limitations"]
      }
    },
    {
      "approach": "Custom WebSocket Server",
      "reasoning": "Full control and flexibility",
      "tradeoffs": {
        "pros": ["No vendor lock-in", "Full control", "Cost-effective at scale"],
        "cons": ["Longer development", "More infrastructure", "Higher complexity"],
        "risks": ["Scaling challenges", "Operational overhead"]
      }
    }
  ]'::jsonb,
  0,
  'Following boring tech principle. Use proven stack. Supabase is already in our stack and provides real-time out of the box. Can migrate later if needed.',
  '["prefer-simple-over-flexible", "mvp-speed"]',
  'Virgilio',
  '2025-12-31T14:30:00Z'
);

-- =====================================================
-- SEED RESULTS (for completed tasks)
-- =====================================================

-- Result for task-003 (TypeScript bugfix)
INSERT INTO results (
  result_id,
  task_id,
  plan_id,
  version,
  status,
  summary,
  outputs,
  quality_gates,
  test_results,
  duration,
  agent,
  errors,
  completed_at
) VALUES (
  'result-003',
  'task-003',
  'plan-003',
  '1.0.0',
  'success',
  'Fixed 12 TypeScript compilation errors across workflow engine and agent modules. Added explicit type annotations and fixed import paths.',
  '{
    "files_modified": [
      "src/core/workflow/orchestrator.ts",
      "src/core/workflow/state.ts",
      "src/agents/architect.ts",
      "src/agents/developer.ts"
    ],
    "changes": {
      "type_annotations_added": 24,
      "import_paths_fixed": 8,
      "interfaces_updated": 5
    }
  }'::jsonb,
  '{
    "typescript_check": {
      "passed": true,
      "errors": 0,
      "warnings": 2
    },
    "eslint_check": {
      "passed": true,
      "errors": 0,
      "warnings": 3
    },
    "test_coverage": {
      "passed": true,
      "coverage": 87.5,
      "threshold": 85
    }
  }'::jsonb,
  '{
    "unit_tests": {
      "total": 45,
      "passed": 45,
      "failed": 0,
      "skipped": 0
    },
    "integration_tests": {
      "total": 12,
      "passed": 12,
      "failed": 0,
      "skipped": 0
    }
  }'::jsonb,
  45,
  'developer',
  NULL,
  '2025-12-31T10:30:00Z'
);

-- Result for task-004 (Documentation)
INSERT INTO results (
  result_id,
  task_id,
  plan_id,
  version,
  status,
  summary,
  outputs,
  quality_gates,
  test_results,
  duration,
  agent,
  errors,
  completed_at
) VALUES (
  'result-004',
  'task-004',
  'plan-004',
  '1.0.0',
  'success',
  'Created comprehensive architecture documentation covering workflow orchestration, agent system, and decision-making process.',
  '{
    "files_created": [
      "docs/architecture.md",
      "docs/diagrams/workflow.mmd",
      "docs/diagrams/agent-system.mmd"
    ],
    "sections": [
      "System Overview",
      "Orchestration Engine",
      "Agent Architecture",
      "Decision Framework",
      "Database Schema",
      "API Contracts"
    ],
    "word_count": 3500
  }'::jsonb,
  '{
    "markdown_lint": {
      "passed": true,
      "errors": 0,
      "warnings": 1
    },
    "link_check": {
      "passed": true,
      "total_links": 18,
      "broken_links": 0
    },
    "readability": {
      "grade_level": 12,
      "reading_time_minutes": 14
    }
  }'::jsonb,
  NULL,
  30,
  'documenter',
  NULL,
  '2025-12-31T09:00:00Z'
);

-- =====================================================
-- SEED HUMAN OVERRIDES (Learning Database)
-- =====================================================

-- Override 1: Prefer simplicity over flexibility
INSERT INTO human_overrides (
  task_id,
  ai_suggestion,
  human_decision,
  category,
  rationale,
  project_id,
  applied_count,
  created_at
) VALUES (
  'task-001',
  'Build custom WebSocket infrastructure for maximum flexibility',
  'Use Supabase Realtime (existing stack)',
  'architecture',
  'For MVP phase, boring tech and speed are more important than flexibility. Can refactor later if needed.',
  'dieta-positiva',
  1,
  '2025-12-31T14:30:00Z'
);

-- Override 2: MVP over perfect solution
INSERT INTO human_overrides (
  task_id,
  ai_suggestion,
  human_decision,
  category,
  rationale,
  project_id,
  applied_count,
  created_at
) VALUES (
  'task-003',
  'Refactor entire type system for maximum type safety',
  'Add quick type annotations to fix immediate errors',
  'architecture',
  'Early development phase. Speed matters more than perfection. Can improve type system later with better test coverage.',
  'dieta-positiva',
  1,
  '2025-12-31T09:30:00Z'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count inserted records
SELECT
  'tasks' as table_name,
  COUNT(*) as record_count
FROM tasks
UNION ALL
SELECT
  'plans' as table_name,
  COUNT(*) as record_count
FROM plans
UNION ALL
SELECT
  'decisions' as table_name,
  COUNT(*) as record_count
FROM decisions
UNION ALL
SELECT
  'results' as table_name,
  COUNT(*) as record_count
FROM results
UNION ALL
SELECT
  'human_overrides' as table_name,
  COUNT(*) as record_count
FROM human_overrides
ORDER BY table_name;

-- Show task status distribution
SELECT status, COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- Show tasks with their plans
SELECT
  t.task_id,
  t.description,
  t.status,
  COUNT(p.id) as plan_count
FROM tasks t
LEFT JOIN plans p ON t.task_id = p.task_id
GROUP BY t.task_id, t.description, t.status
ORDER BY t.created_at DESC;

-- =====================================================
-- SEED COMPLETE
-- =====================================================
-- Database seeded with:
-- - 5 tasks (1 pending, 1 planning, 1 executing, 2 completed)
-- - 3 plans (2 proposed, 1 approved)
-- - 2 decisions (both made)
-- - 2 results (for completed tasks)
-- - 2 human overrides (learning data)
