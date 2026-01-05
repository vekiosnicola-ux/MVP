# Database Setup Instructions

Since I can't directly access Supabase from my environment, please follow these steps to set up your database:

## Step 1: Create Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/fevouizqcuvahrdtwoif

2. Click on **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `scripts/setup-db.sql` and paste it into the editor

5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

6. You should see success messages. Verify tables were created:
   - Go to **Database > Tables**
   - You should see: tasks, plans, decisions, results, human_overrides

## Step 2: Seed Database with Sample Data

### Option A: Using SQL (Recommended)

1. Still in the **SQL Editor**, create a new query

2. Copy the entire contents of `scripts/seed-db.sql` and paste it

3. Click **Run**

4. Verify data was inserted by running:
   ```sql
   SELECT COUNT(*) FROM tasks;
   SELECT COUNT(*) FROM plans;
   SELECT COUNT(*) FROM decisions;
   ```

### Option B: Using TypeScript Script (if you have local setup)

```bash
npm run db:seed
```

## Step 3: Verify Setup

Run these queries in the SQL Editor to verify everything worked:

```sql
-- Should return 5 tasks
SELECT task_id, description, status FROM tasks ORDER BY created_at DESC;

-- Should return 3 plans
SELECT plan_id, task_id, approach, status FROM plans;

-- Should return 2 decisions
SELECT decision_id, task_id, category FROM decisions;

-- Should return 2 results
SELECT result_id, task_id, status FROM results;

-- Should return 2 human overrides
SELECT id, category, ai_suggestion FROM human_overrides;
```

## Step 4: Test the Application

1. Visit https://dieta-positiva-mvp.vercel.app

2. You should now see:
   - **Dashboard**: 5 tasks with proper counts
   - **Approval Queue**: 1 task awaiting approval (task-001)
   - **History**: Activity timeline with all events
   - **Task pages**: Click on any task to see details

## Expected Data

After seeding, you should have:

- ✅ **5 tasks**:
  - task-001: Chat interface (planning - needs approval)
  - task-002: RLS policies (executing)
  - task-003: TypeScript bugfix (completed)
  - task-004: Documentation (completed)
  - task-005: Cheshire Cat integration (pending)

- ✅ **3 plans**:
  - 2 proposed plans for task-001 (Supabase vs Custom WebSocket)
  - 1 approved plan for task-002 (RLS implementation)

- ✅ **2 decisions**:
  - TypeScript fix approach
  - Chat interface technology choice

- ✅ **2 execution results**:
  - task-003 (TypeScript bugfix - success)
  - task-004 (Documentation - success)

## Troubleshooting

### Tables already exist error
If you get "relation already exists" errors, it means tables are already created. Skip to Step 2.

### Permission denied errors
Make sure you're using the Service Role Key, not the anon key.

### Data insertion errors
Check that foreign key constraints are satisfied. The seed script inserts in the correct order (tasks → plans → decisions → results).

### Application still shows empty
- Check Vercel environment variables are set correctly
- Redeploy Vercel after setting environment variables
- Check browser console for API errors

## Next Steps

Once the database is seeded:

1. **Test the deployment**: https://dieta-positiva-mvp.vercel.app
2. **Make sure Vercel has environment variables**:
   - Go to https://vercel.com/vekiosnicola-ux/dieta-positiva-mvp/settings/environment-variables
   - Add all variables from `.env.local`
   - Redeploy if needed

3. **Create a PR** to merge changes to main (if needed)

## Support Files

- `scripts/setup-db.sql` - Database schema (tables, indexes, RLS)
- `scripts/seed-db.sql` - Sample data (SQL version)
- `scripts/seed-db.ts` - Sample data (TypeScript version, use with `npm run db:seed`)
- `DATABASE-SEEDING-SUMMARY.md` - Complete documentation
- `docs/database-erd.md` - Schema diagrams and relationships
- `docs/database-quick-reference.md` - Common queries and examples
