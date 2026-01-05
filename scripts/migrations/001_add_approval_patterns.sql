-- Migration: Add approval_patterns table
-- Run this if your database was set up before this table existed
-- This is idempotent (safe to run multiple times)

-- =====================================================
-- TABLE: approval_patterns (Learning Loop)
-- Tracks which proposal approaches get approved/rejected
-- =====================================================

CREATE TABLE IF NOT EXISTS approval_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,           -- Task type (feature, bugfix, refactor, etc.)
  approach_type TEXT NOT NULL,      -- e.g., "Standard Implementation", "Fast-Track"
  approved_count INTEGER DEFAULT 0,
  rejected_count INTEGER DEFAULT 0,
  avg_time_to_decision INTEGER DEFAULT 0, -- Average minutes from proposal to decision
  common_rejection_reasons TEXT[] DEFAULT '{}',
  project_id TEXT,                  -- Optional project-specific pattern
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category, approach_type, project_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_patterns_category ON approval_patterns(category);
CREATE INDEX IF NOT EXISTS idx_patterns_approach ON approval_patterns(approach_type);
CREATE INDEX IF NOT EXISTS idx_patterns_project ON approval_patterns(project_id);

-- Enable RLS
ALTER TABLE approval_patterns ENABLE ROW LEVEL SECURITY;

-- Create policy if not exists (PostgreSQL doesn't have CREATE POLICY IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'approval_patterns'
    AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON approval_patterns FOR ALL USING (true);
  END IF;
END $$;

-- Verification
SELECT 'approval_patterns table created successfully' AS status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'approval_patterns'
);
