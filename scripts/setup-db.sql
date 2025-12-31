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
