# Database Scripts

This directory contains database setup and seed scripts for the Aura MVP orchestration engine.

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Set in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Scripts

### 1. Setup Database Schema (`setup-db.sql`)

Creates all tables, indexes, and Row Level Security (RLS) policies.

**Tables created:**
- `tasks` - Task definitions and metadata
- `plans` - Execution plans for tasks
- `decisions` - Decision records for task/plan approvals
- `results` - Execution results for completed tasks
- `human_overrides` - Learning database for AI improvements

**How to run:**

#### Option A: Supabase Dashboard (Recommended for first setup)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste contents of `setup-db.sql`
5. Click **Run**
6. Verify tables were created in **Database > Tables**

#### Option B: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run the setup script
supabase db execute -f scripts/setup-db.sql
```

### 2. Seed Database (`seed-db.sql` or `seed-db.ts`)

Populates the database with realistic sample data matching the mock data from `src/lib/mock-data.ts`.

**Data seeded:**
- 5 tasks (1 pending, 1 planning, 1 executing, 2 completed)
- 3 plans (2 proposed for task-001, 1 approved for task-002)
- 2 decisions (TypeScript fix, Chat interface approach)
- 2 results (for completed tasks: task-003, task-004)
- 2 human overrides (learning data for AI)

#### Option A: SQL Script (Supabase Dashboard)
1. Go to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy and paste contents of `seed-db.sql`
4. Click **Run**
5. Verify data with the verification queries at the end

#### Option B: TypeScript Script (Recommended for development)
```bash
# Install dependencies first
npm install

# Run the seed script
npm run db:seed

# Or directly with tsx
npx tsx scripts/seed-db.ts
```

**Features of TypeScript script:**
- Clears existing data before seeding (safe re-seeding)
- Progress indicators and colored output
- Error handling and verification
- Matches TypeScript interfaces exactly

## Workflow

### Initial Setup
```bash
# 1. Run setup script (creates tables)
#    Use Supabase Dashboard SQL Editor or CLI

# 2. Run seed script (adds sample data)
npm run db:seed
```

### Re-seeding (Development)
```bash
# The TypeScript seed script automatically clears existing data
npm run db:seed
```

### Production
For production, you should:
1. Only run `setup-db.sql` to create tables
2. Do NOT run seed scripts (they contain test data)
3. Use proper migrations for schema changes

## Verification

After running scripts, verify in Supabase dashboard:

1. **Tables exist**: Database > Tables
2. **Data inserted**: Click on each table to view rows
3. **RLS enabled**: Database > Tables > [table] > Policies

Or run verification queries:

```sql
-- Count records in each table
SELECT
  'tasks' as table_name,
  COUNT(*) as record_count
FROM tasks
UNION ALL
SELECT 'plans', COUNT(*) FROM plans
UNION ALL
SELECT 'decisions', COUNT(*) FROM decisions
UNION ALL
SELECT 'results', COUNT(*) FROM results
UNION ALL
SELECT 'human_overrides', COUNT(*) FROM human_overrides;

-- Task status distribution
SELECT status, COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- Tasks with their plans
SELECT
  t.task_id,
  t.description,
  t.status,
  COUNT(p.id) as plan_count
FROM tasks t
LEFT JOIN plans p ON t.task_id = p.task_id
GROUP BY t.task_id, t.description, t.status
ORDER BY t.created_at DESC;
```

## Troubleshooting

### "Missing environment variables"
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Service role key is different from anon key (get it from Supabase Dashboard > Settings > API)

### "Permission denied" errors
- Make sure RLS policies are set correctly
- Use service role key (not anon key) for seeding
- Check that policies allow operations (current MVP policies are permissive)

### "Foreign key constraint violation"
- Ensure you run `setup-db.sql` before seeding
- If re-seeding, the TypeScript script handles cascading deletes automatically
- SQL script truncates tables in correct order

### "Relation does not exist"
- Tables haven't been created yet
- Run `setup-db.sql` first

## Schema Changes

When making schema changes:

1. **Never edit production database directly**
2. Create a new migration file in `supabase/migrations/` (if using Supabase CLI)
3. Update `setup-db.sql` to reflect changes
4. Update seed scripts if data structure changed
5. Update TypeScript interfaces in `src/interfaces/`
6. Regenerate types if using Supabase type generation

## Next Steps

After seeding:
1. Verify data in Supabase dashboard
2. Test API routes that fetch from database
3. Update frontend to use real data instead of mock data
4. Remove or deprecated mock-data.ts once everything works

## Files Reference

- `setup-db.sql` - Schema definition (DDL)
- `seed-db.sql` - SQL seed script (DML)
- `seed-db.ts` - TypeScript seed script (programmatic)
- `README.md` - This file (documentation)
