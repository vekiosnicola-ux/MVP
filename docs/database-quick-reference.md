# Database Quick Reference

Quick reference for common database operations in the Aura MVP.

## Setup (First Time)

```bash
# 1. Set environment variables in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 2. Run setup-db.sql in Supabase SQL Editor
# (Copy/paste contents of scripts/setup-db.sql)

# 3. Install dependencies
npm install

# 4. Seed database
npm run db:seed
```

## Re-seeding Database

```bash
# Clear and re-populate with sample data
npm run db:seed
```

## TypeScript Client Usage

### Initialize Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Tasks

#### Get all tasks
```typescript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Get task by ID
```typescript
const { data: task, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('task_id', 'task-001')
  .single()
```

#### Get tasks by status
```typescript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'planning')
```

#### Get tasks awaiting approval
```typescript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'planning')
```

#### Create task
```typescript
const { data: task, error } = await supabase
  .from('tasks')
  .insert({
    task_id: 'task-006',
    version: '1.0.0',
    type: 'feature',
    description: 'New feature description',
    context: {
      repository: 'dieta-positiva',
      branch: 'feature/new-feature',
      files: ['src/app/new-feature/'],
    },
    constraints: {
      maxDuration: 120,
      requiresApproval: true,
      breakingChangesAllowed: false,
      testCoverageMin: 80,
    },
    metadata: {
      createdBy: 'Virgilio',
      priority: 'high',
      labels: ['feature'],
    },
    status: 'pending',
  })
  .select()
  .single()
```

#### Update task status
```typescript
const { data: task, error } = await supabase
  .from('tasks')
  .update({
    status: 'executing',
    updated_at: new Date().toISOString(),
  })
  .eq('task_id', 'task-001')
  .select()
  .single()
```

### Plans

#### Get plans for a task
```typescript
const { data: plans, error } = await supabase
  .from('plans')
  .select('*')
  .eq('task_id', 'task-001')
  .order('created_at', { ascending: false })
```

#### Get proposed plans
```typescript
const { data: plans, error } = await supabase
  .from('plans')
  .select('*')
  .eq('status', 'proposed')
```

#### Create plan
```typescript
const { data: plan, error } = await supabase
  .from('plans')
  .insert({
    plan_id: 'plan-006-a',
    task_id: 'task-006',
    version: '1.0.0',
    approach: 'Approach description',
    reasoning: 'Why this approach',
    steps: [
      {
        id: 'step-1',
        agent: 'developer',
        action: 'Do something',
        inputs: ['Input 1'],
        outputs: ['Output 1'],
        validation: {
          command: 'npm test',
          successCriteria: 'Tests pass',
        },
      },
    ],
    agent: 'architect',
    estimated_duration: 120,
    dependencies: null,
    risks: [
      {
        description: 'Risk description',
        severity: 'low',
        mitigation: 'How to mitigate',
      },
    ],
    status: 'proposed',
  })
  .select()
  .single()
```

#### Approve plan
```typescript
const { data: plan, error } = await supabase
  .from('plans')
  .update({ status: 'approved' })
  .eq('plan_id', 'plan-001-a')
  .select()
  .single()
```

### Decisions

#### Get decisions for a task
```typescript
const { data: decisions, error } = await supabase
  .from('decisions')
  .select('*')
  .eq('task_id', 'task-001')
```

#### Create decision
```typescript
const { data: decision, error } = await supabase
  .from('decisions')
  .insert({
    decision_id: 'decision-003',
    task_id: 'task-001',
    plan_id: 'plan-001-a',
    category: 'architecture',
    proposals: [
      {
        approach: 'Option A',
        reasoning: 'Why A',
        tradeoffs: {
          pros: ['Pro 1'],
          cons: ['Con 1'],
          risks: ['Risk 1'],
        },
      },
      {
        approach: 'Option B',
        reasoning: 'Why B',
        tradeoffs: {
          pros: ['Pro 2'],
          cons: ['Con 2'],
          risks: ['Risk 2'],
        },
      },
    ],
    selected_option: 0,
    rationale: 'Why option 0 was selected',
    overrides: ['principle-1', 'principle-2'],
    decided_by: 'Virgilio',
    decided_at: new Date().toISOString(),
  })
  .select()
  .single()
```

### Results

#### Get results for a task
```typescript
const { data: results, error } = await supabase
  .from('results')
  .select('*')
  .eq('task_id', 'task-003')
```

#### Create result
```typescript
const { data: result, error } = await supabase
  .from('results')
  .insert({
    result_id: 'result-006',
    task_id: 'task-006',
    plan_id: 'plan-006-a',
    version: '1.0.0',
    status: 'success',
    summary: 'Task completed successfully',
    outputs: {
      files_modified: ['file1.ts', 'file2.ts'],
      changes: {
        additions: 100,
        deletions: 20,
      },
    },
    quality_gates: {
      typescript_check: { passed: true, errors: 0 },
      eslint_check: { passed: true, errors: 0 },
    },
    test_results: {
      unit_tests: { total: 10, passed: 10, failed: 0 },
    },
    duration: 45,
    agent: 'developer',
    errors: null,
    completed_at: new Date().toISOString(),
  })
  .select()
  .single()
```

### Human Overrides

#### Get all overrides
```typescript
const { data: overrides, error } = await supabase
  .from('human_overrides')
  .select('*')
  .order('applied_count', { ascending: false })
```

#### Record override
```typescript
const { data: override, error } = await supabase
  .from('human_overrides')
  .insert({
    task_id: 'task-006',
    ai_suggestion: 'What AI suggested',
    human_decision: 'What human decided',
    category: 'architecture',
    rationale: 'Why override',
    project_id: 'dieta-positiva',
    applied_count: 1,
  })
  .select()
  .single()
```

## Complex Queries

### Task with all related data
```typescript
const { data: task, error } = await supabase
  .from('tasks')
  .select(`
    *,
    plans (*),
    decisions (*),
    results (*)
  `)
  .eq('task_id', 'task-001')
  .single()
```

### Tasks with plan count
```typescript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select(`
    *,
    plans (count)
  `)
```

### Tasks needing decisions (have multiple proposed plans)
```typescript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select(`
    *,
    plans!inner (
      id,
      plan_id,
      approach,
      status
    )
  `)
  .eq('status', 'planning')
  .eq('plans.status', 'proposed')
```

## API Route Examples

### GET /api/tasks
```typescript
// app/api/tasks/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase.from('tasks').select('*')

  if (status) {
    query = query.eq('status', status)
  }

  const { data: tasks, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks })
}
```

### POST /api/tasks
```typescript
// app/api/tasks/route.ts
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task }, { status: 201 })
}
```

### GET /api/tasks/[id]
```typescript
// app/api/tasks/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      *,
      plans (*),
      decisions (*),
      results (*)
    `)
    .eq('task_id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ task })
}
```

## Common Patterns

### Error Handling
```typescript
const { data, error } = await supabase.from('tasks').select('*')

if (error) {
  console.error('Database error:', error)
  // Handle error
  return
}

// Use data
console.log(data)
```

### Pagination
```typescript
const PAGE_SIZE = 20
const page = 0

const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
```

### Count Total
```typescript
const { count, error } = await supabase
  .from('tasks')
  .select('*', { count: 'exact', head: true })
```

### Filtering with JSONB
```typescript
// Filter by metadata.priority
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('metadata->>priority', 'high')

// Filter by array contains
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .contains('metadata->labels', ['frontend'])
```

## Troubleshooting

### "Row Level Security" errors
- RLS is enabled but policies might be too restrictive
- Use service role key for admin operations
- Check policies in Supabase dashboard

### "Foreign key violation"
- Ensure referenced record exists before inserting
- Check cascade delete behavior

### "Duplicate key value"
- task_id, plan_id, decision_id, result_id must be unique
- Check if record already exists before inserting

### Type errors
- Generate types: `npx supabase gen types typescript`
- Import and use: `import { Database } from '@/lib/database.types'`

## Resources

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL JSONB Docs](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
