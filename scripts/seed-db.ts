#!/usr/bin/env tsx
/**
 * Database Seed Script
 *
 * Populates the Supabase database with realistic sample data
 * matching the mock data from src/lib/mock-data.ts
 *
 * Usage:
 *   npx tsx scripts/seed-db.ts
 *
 * Environment:
 *   Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure these are set in .env.local');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// SEED DATA
// =====================================================

const tasks = [
  {
    task_id: 'task-001',
    version: '1.0.0',
    type: 'feature',
    description: 'Build DP AI chat interface with real-time messaging',
    context: {
      repository: 'dieta-positiva',
      branch: 'feature/dp-ai-chat',
      files: ['src/app/(auth)/chat/page.tsx', 'src/components/chat/'],
      dependencies: ['@supabase/supabase-js', 'framer-motion'],
    },
    constraints: {
      maxDuration: 180,
      requiresApproval: true,
      breakingChangesAllowed: false,
      testCoverageMin: 80,
    },
    metadata: {
      createdAt: '2025-12-31T12:00:00Z',
      createdBy: 'Virgilio',
      priority: 'high',
      labels: ['dp-ai', 'chat', 'frontend'],
    },
    status: 'planning',
    created_at: '2025-12-31T12:00:00Z',
    updated_at: '2025-12-31T14:30:00Z',
  },
  {
    task_id: 'task-002',
    version: '1.0.0',
    type: 'feature',
    description: 'Add Row-Level Security policies to Supabase database',
    context: {
      repository: 'dieta-positiva',
      branch: 'feature/rls-policies',
      files: ['supabase/migrations/', 'src/lib/supabase/'],
    },
    constraints: {
      maxDuration: 90,
      requiresApproval: true,
      breakingChangesAllowed: false,
      testCoverageMin: 90,
    },
    metadata: {
      createdAt: '2025-12-31T10:00:00Z',
      createdBy: 'Virgilio',
      priority: 'critical',
      labels: ['security', 'database', 'supabase'],
    },
    status: 'executing',
    created_at: '2025-12-31T10:00:00Z',
    updated_at: '2025-12-31T15:00:00Z',
  },
  {
    task_id: 'task-003',
    version: '1.0.0',
    type: 'bugfix',
    description: 'Fix TypeScript compilation errors in workflow engine',
    context: {
      repository: 'dieta-positiva',
      branch: 'bugfix/typescript-errors',
      files: ['src/core/workflow/', 'src/agents/'],
    },
    constraints: {
      maxDuration: 60,
      requiresApproval: false,
      breakingChangesAllowed: false,
      testCoverageMin: 85,
    },
    metadata: {
      createdAt: '2025-12-31T09:00:00Z',
      createdBy: 'Virgilio',
      priority: 'medium',
      labels: ['bugfix', 'typescript', 'backend'],
    },
    status: 'completed',
    created_at: '2025-12-31T09:00:00Z',
    updated_at: '2025-12-31T10:30:00Z',
  },
  {
    task_id: 'task-004',
    version: '1.0.0',
    type: 'docs',
    description: 'Document Aura workflow orchestration architecture',
    context: {
      repository: 'dieta-positiva',
      branch: 'docs/architecture',
      files: ['docs/architecture.md', 'DECISIONS.md'],
    },
    constraints: {
      maxDuration: 45,
      requiresApproval: false,
      breakingChangesAllowed: false,
      testCoverageMin: 0,
    },
    metadata: {
      createdAt: '2025-12-31T08:00:00Z',
      createdBy: 'Virgilio',
      priority: 'low',
      labels: ['documentation', 'architecture'],
    },
    status: 'completed',
    created_at: '2025-12-31T08:00:00Z',
    updated_at: '2025-12-31T09:00:00Z',
  },
  {
    task_id: 'task-005',
    version: '1.0.0',
    type: 'feature',
    description: 'Implement Cheshire Cat integration for System 2',
    context: {
      repository: 'dieta-positiva',
      branch: 'feature/cheshire-cat',
      files: ['src/lib/cheshire-cat/', 'src/app/api/chat/'],
    },
    constraints: {
      maxDuration: 240,
      requiresApproval: true,
      breakingChangesAllowed: true,
      testCoverageMin: 75,
    },
    metadata: {
      createdAt: '2025-12-30T16:00:00Z',
      createdBy: 'Virgilio',
      priority: 'high',
      labels: ['dp-app', 'ai', 'integration'],
    },
    status: 'pending',
    created_at: '2025-12-30T16:00:00Z',
    updated_at: '2025-12-30T16:00:00Z',
  },
];

const plans = [
  {
    plan_id: 'plan-001-a',
    task_id: 'task-001',
    version: '1.0.0',
    approach: 'Next.js + Supabase Realtime',
    reasoning: 'Leverage existing tech stack for faster development. Supabase provides built-in real-time subscriptions.',
    steps: [
      {
        id: 'step-1',
        agent: 'developer',
        action: 'Create chat UI components',
        inputs: ['Next.js App Router', 'Tailwind CSS'],
        outputs: ['src/app/(auth)/chat/page.tsx', 'src/components/chat/'],
        validation: {
          command: 'npm run type-check && npm run lint',
          successCriteria: 'No TypeScript or ESLint errors',
        },
      },
      {
        id: 'step-2',
        agent: 'database',
        action: 'Create messages table with RLS',
        inputs: ['Supabase CLI', 'PostgreSQL'],
        outputs: ['supabase/migrations/create_messages_table.sql'],
        validation: {
          command: 'supabase db reset --local',
          successCriteria: 'Migration runs successfully',
        },
        dependencies: ['step-1'],
      },
      {
        id: 'step-3',
        agent: 'developer',
        action: 'Integrate Supabase realtime subscriptions',
        inputs: ['@supabase/supabase-js', 'React hooks'],
        outputs: ['src/hooks/useMessages.ts'],
        validation: {
          command: 'npm run test',
          successCriteria: 'All tests pass',
        },
        dependencies: ['step-2'],
      },
    ],
    agent: 'architect',
    estimated_duration: 180,
    dependencies: null,
    risks: [
      {
        description: 'Supabase vendor lock-in',
        severity: 'medium',
        mitigation: 'Can migrate to self-hosted Postgres + custom WebSocket later',
      },
      {
        description: 'Real-time scaling limits on free tier',
        severity: 'low',
        mitigation: 'Upgrade to Pro tier if needed ($25/month)',
      },
    ],
    status: 'proposed',
    created_at: '2025-12-31T13:00:00Z',
  },
  {
    plan_id: 'plan-001-b',
    task_id: 'task-001',
    version: '1.0.0',
    approach: 'Custom WebSocket Server + PostgreSQL',
    reasoning: 'Full control over real-time infrastructure. No vendor lock-in. Can optimize for performance.',
    steps: [
      {
        id: 'step-1',
        agent: 'developer',
        action: 'Set up Socket.io server',
        inputs: ['Socket.io', 'Express'],
        outputs: ['src/server/websocket.ts'],
        validation: {
          command: 'npm run test:integration',
          successCriteria: 'WebSocket server starts successfully',
        },
      },
      {
        id: 'step-2',
        agent: 'database',
        action: 'Create messages table',
        inputs: ['PostgreSQL', 'Prisma'],
        outputs: ['prisma/schema.prisma', 'prisma/migrations/'],
        validation: {
          command: 'prisma migrate dev',
          successCriteria: 'Migration succeeds',
        },
      },
      {
        id: 'step-3',
        agent: 'devops',
        action: 'Deploy WebSocket server to Render',
        inputs: ['Docker', 'Render.com'],
        outputs: ['.docker/Dockerfile.websocket', 'render.yaml'],
        validation: {
          command: 'docker build -f .docker/Dockerfile.websocket .',
          successCriteria: 'Docker image builds successfully',
        },
        dependencies: ['step-1', 'step-2'],
      },
    ],
    agent: 'architect',
    estimated_duration: 240,
    dependencies: null,
    risks: [
      {
        description: 'Additional infrastructure complexity',
        severity: 'medium',
        mitigation: 'Use managed services (Render, Railway) instead of self-hosting',
      },
      {
        description: 'WebSocket scaling challenges',
        severity: 'high',
        mitigation: 'Use Redis adapter for multi-instance WebSocket scaling',
      },
      {
        description: 'Increased operational overhead',
        severity: 'medium',
        mitigation: 'Start simple, add monitoring later (Sentry, Datadog)',
      },
    ],
    status: 'proposed',
    created_at: '2025-12-31T13:15:00Z',
  },
  {
    plan_id: 'plan-002',
    task_id: 'task-002',
    version: '1.0.0',
    approach: 'Comprehensive RLS policies for all tables',
    reasoning: 'Implement security at database level. Follow principle of least privilege.',
    steps: [
      {
        id: 'step-1',
        agent: 'database',
        action: 'Enable RLS on all tables',
        inputs: ['Supabase SQL Editor'],
        outputs: ['supabase/migrations/enable_rls.sql'],
        validation: {
          command: "SELECT tablename FROM pg_tables WHERE rowsecurity = true",
          successCriteria: 'All tables have RLS enabled',
        },
      },
      {
        id: 'step-2',
        agent: 'database',
        action: 'Create RLS policies for tasks table',
        inputs: ['PostgreSQL policies'],
        outputs: ['supabase/migrations/rls_tasks.sql'],
        validation: {
          command: "SELECT * FROM tasks WHERE auth.uid() != metadata->>'createdBy'",
          successCriteria: 'Returns empty set',
        },
        dependencies: ['step-1'],
      },
      {
        id: 'step-3',
        agent: 'tester',
        action: 'Test RLS policies with different users',
        inputs: ['Supabase test users'],
        outputs: ['tests/security/rls.test.ts'],
        validation: {
          command: 'npm run test:security',
          successCriteria: 'All security tests pass',
        },
        dependencies: ['step-2'],
      },
    ],
    agent: 'database',
    estimated_duration: 90,
    dependencies: null,
    risks: [
      {
        description: 'Policy misconfiguration could expose data',
        severity: 'critical',
        mitigation: 'Test with multiple user roles before production deployment',
      },
      {
        description: 'Performance impact of complex policies',
        severity: 'low',
        mitigation: 'Monitor query performance, add indexes if needed',
      },
    ],
    status: 'approved',
    created_at: '2025-12-31T14:00:00Z',
  },
];

const decisions = [
  {
    decision_id: 'decision-001',
    task_id: 'task-003',
    plan_id: null,
    category: 'architecture',
    proposals: [
      {
        approach: 'Add explicit type annotations',
        reasoning: 'Quick fix that addresses immediate issue',
        tradeoffs: {
          pros: ['Fast to implement', 'No refactoring needed'],
          cons: ['Does not improve code quality'],
          risks: ['May hide deeper architectural issues'],
        },
      },
      {
        approach: 'Refactor to stricter type system',
        reasoning: 'Long-term solution that improves code quality',
        tradeoffs: {
          pros: ['Better type safety', 'Prevents future errors'],
          cons: ['Takes longer', 'May require breaking changes'],
          risks: ['Could introduce new bugs'],
        },
      },
    ],
    selected_option: 0,
    rationale: 'Quick fix is appropriate here. We are in early development and need to move fast. Can refactor later when we have more test coverage.',
    overrides: null,
    decided_by: 'Virgilio',
    decided_at: '2025-12-31T09:30:00Z',
  },
  {
    decision_id: 'decision-002',
    task_id: 'task-001',
    plan_id: 'plan-001-a',
    category: 'architecture',
    proposals: [
      {
        approach: 'Next.js + Supabase Realtime',
        reasoning: 'Leverage existing stack, faster development',
        tradeoffs: {
          pros: ['Fast development', 'Built-in features', 'Automatic scaling'],
          cons: ['Vendor lock-in', 'Less control'],
          risks: ['Free tier limitations'],
        },
      },
      {
        approach: 'Custom WebSocket Server',
        reasoning: 'Full control and flexibility',
        tradeoffs: {
          pros: ['No vendor lock-in', 'Full control', 'Cost-effective at scale'],
          cons: ['Longer development', 'More infrastructure', 'Higher complexity'],
          risks: ['Scaling challenges', 'Operational overhead'],
        },
      },
    ],
    selected_option: 0,
    rationale: 'Following boring tech principle. Use proven stack. Supabase is already in our stack and provides real-time out of the box. Can migrate later if needed.',
    overrides: ['prefer-simple-over-flexible', 'mvp-speed'],
    decided_by: 'Virgilio',
    decided_at: '2025-12-31T14:30:00Z',
  },
];

const results = [
  {
    result_id: 'result-003',
    task_id: 'task-003',
    plan_id: 'plan-003',
    version: '1.0.0',
    status: 'success',
    summary: 'Fixed 12 TypeScript compilation errors across workflow engine and agent modules. Added explicit type annotations and fixed import paths.',
    outputs: {
      files_modified: [
        'src/core/workflow/orchestrator.ts',
        'src/core/workflow/state.ts',
        'src/agents/architect.ts',
        'src/agents/developer.ts',
      ],
      changes: {
        type_annotations_added: 24,
        import_paths_fixed: 8,
        interfaces_updated: 5,
      },
    },
    quality_gates: {
      typescript_check: {
        passed: true,
        errors: 0,
        warnings: 2,
      },
      eslint_check: {
        passed: true,
        errors: 0,
        warnings: 3,
      },
      test_coverage: {
        passed: true,
        coverage: 87.5,
        threshold: 85,
      },
    },
    test_results: {
      unit_tests: {
        total: 45,
        passed: 45,
        failed: 0,
        skipped: 0,
      },
      integration_tests: {
        total: 12,
        passed: 12,
        failed: 0,
        skipped: 0,
      },
    },
    duration: 45,
    agent: 'developer',
    errors: null,
    completed_at: '2025-12-31T10:30:00Z',
  },
  {
    result_id: 'result-004',
    task_id: 'task-004',
    plan_id: 'plan-004',
    version: '1.0.0',
    status: 'success',
    summary: 'Created comprehensive architecture documentation covering workflow orchestration, agent system, and decision-making process.',
    outputs: {
      files_created: [
        'docs/architecture.md',
        'docs/diagrams/workflow.mmd',
        'docs/diagrams/agent-system.mmd',
      ],
      sections: [
        'System Overview',
        'Orchestration Engine',
        'Agent Architecture',
        'Decision Framework',
        'Database Schema',
        'API Contracts',
      ],
      word_count: 3500,
    },
    quality_gates: {
      markdown_lint: {
        passed: true,
        errors: 0,
        warnings: 1,
      },
      link_check: {
        passed: true,
        total_links: 18,
        broken_links: 0,
      },
      readability: {
        grade_level: 12,
        reading_time_minutes: 14,
      },
    },
    test_results: null,
    duration: 30,
    agent: 'documenter',
    errors: null,
    completed_at: '2025-12-31T09:00:00Z',
  },
];

const humanOverrides = [
  {
    task_id: 'task-001',
    ai_suggestion: 'Build custom WebSocket infrastructure for maximum flexibility',
    human_decision: 'Use Supabase Realtime (existing stack)',
    category: 'architecture',
    rationale: 'For MVP phase, boring tech and speed are more important than flexibility. Can refactor later if needed.',
    project_id: 'dieta-positiva',
    applied_count: 1,
    created_at: '2025-12-31T14:30:00Z',
  },
  {
    task_id: 'task-003',
    ai_suggestion: 'Refactor entire type system for maximum type safety',
    human_decision: 'Add quick type annotations to fix immediate errors',
    category: 'architecture',
    rationale: 'Early development phase. Speed matters more than perfection. Can improve type system later with better test coverage.',
    project_id: 'dieta-positiva',
    applied_count: 1,
    created_at: '2025-12-31T09:30:00Z',
  },
];

// =====================================================
// SEED FUNCTIONS
// =====================================================

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  const tables = ['human_overrides', 'results', 'decisions', 'plans', 'tasks'];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`   ❌ Error clearing ${table}:`, error.message);
    } else {
      console.log(`   ✅ Cleared ${table}`);
    }
  }
}

async function seedTasks() {
  console.log('\n📝 Seeding tasks...');

  const { data, error } = await supabase.from('tasks').insert(tasks).select();

  if (error) {
    console.error('   ❌ Error seeding tasks:', error.message);
    throw error;
  }

  console.log(`   ✅ Inserted ${data.length} tasks`);
  return data;
}

async function seedPlans() {
  console.log('\n📋 Seeding plans...');

  const { data, error } = await supabase.from('plans').insert(plans).select();

  if (error) {
    console.error('   ❌ Error seeding plans:', error.message);
    throw error;
  }

  console.log(`   ✅ Inserted ${data.length} plans`);
  return data;
}

async function seedDecisions() {
  console.log('\n🎯 Seeding decisions...');

  const { data, error } = await supabase.from('decisions').insert(decisions).select();

  if (error) {
    console.error('   ❌ Error seeding decisions:', error.message);
    throw error;
  }

  console.log(`   ✅ Inserted ${data.length} decisions`);
  return data;
}

async function seedResults() {
  console.log('\n✅ Seeding results...');

  const { data, error } = await supabase.from('results').insert(results).select();

  if (error) {
    console.error('   ❌ Error seeding results:', error.message);
    throw error;
  }

  console.log(`   ✅ Inserted ${data.length} results`);
  return data;
}

async function seedHumanOverrides() {
  console.log('\n🧠 Seeding human overrides...');

  const { data, error } = await supabase.from('human_overrides').insert(humanOverrides).select();

  if (error) {
    console.error('   ❌ Error seeding human overrides:', error.message);
    throw error;
  }

  console.log(`   ✅ Inserted ${data.length} human overrides`);
  return data;
}

async function verifySeeding() {
  console.log('\n🔍 Verifying seeded data...');

  const tables = ['tasks', 'plans', 'decisions', 'results', 'human_overrides'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`   ❌ Error counting ${table}:`, error.message);
    } else {
      console.log(`   ${table.padEnd(20)} ${count} records`);
    }
  }

  // Show task status distribution
  const { data: taskStats } = await supabase
    .from('tasks')
    .select('status')
    .order('status');

  if (taskStats) {
    const statusCounts = taskStats.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n   Task Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status.padEnd(15)} ${count}`);
    });
  }
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Using service role key\n`);

  try {
    await clearDatabase();
    await seedTasks();
    await seedPlans();
    await seedDecisions();
    await seedResults();
    await seedHumanOverrides();
    await verifySeeding();

    console.log('\n✨ Seeding completed successfully!\n');
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  }
}

main();
