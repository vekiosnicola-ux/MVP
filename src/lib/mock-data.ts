import type { DecisionRow } from '@/interfaces/decision';
import type { PlanRow, PlanStatus } from '@/interfaces/plan';
import type { TaskRow, TaskType, TaskStatus } from '@/interfaces/task';

export interface MockTask extends Omit<TaskRow, 'context' | 'constraints' | 'metadata'> {
  context: {
    repository: string;
    branch: string;
    files: string[];
    dependencies?: string[];
  };
  constraints: {
    maxDuration: number;
    requiresApproval: boolean;
    breakingChangesAllowed: boolean;
    testCoverageMin: number;
  };
  metadata: {
    createdAt?: string;
    createdBy?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    labels?: string[];
  };
}

export interface MockPlan extends PlanRow {
  pros?: string[];
  cons?: string[];
}

export interface HistoryEvent {
  id: string;
  timestamp: string;
  type: 'task_created' | 'task_approved' | 'task_rejected' | 'task_completed' | 'decision_made';
  title: string;
  description?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

export const mockTasks: MockTask[] = [
  {
    id: '1',
    task_id: 'task-001',
    version: '1.0.0',
    type: 'feature' as TaskType,
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
    status: 'planning' as TaskStatus,
    created_at: '2025-12-31T12:00:00Z',
    updated_at: '2025-12-31T14:30:00Z',
  },
  {
    id: '2',
    task_id: 'task-002',
    version: '1.0.0',
    type: 'feature' as TaskType,
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
    status: 'executing' as TaskStatus,
    created_at: '2025-12-31T10:00:00Z',
    updated_at: '2025-12-31T15:00:00Z',
  },
  {
    id: '3',
    task_id: 'task-003',
    version: '1.0.0',
    type: 'bugfix' as TaskType,
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
    status: 'completed' as TaskStatus,
    created_at: '2025-12-31T09:00:00Z',
    updated_at: '2025-12-31T10:30:00Z',
  },
  {
    id: '4',
    task_id: 'task-004',
    version: '1.0.0',
    type: 'docs' as TaskType,
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
    status: 'completed' as TaskStatus,
    created_at: '2025-12-31T08:00:00Z',
    updated_at: '2025-12-31T09:00:00Z',
  },
  {
    id: '5',
    task_id: 'task-005',
    version: '1.0.0',
    type: 'feature' as TaskType,
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
    status: 'pending' as TaskStatus,
    created_at: '2025-12-30T16:00:00Z',
    updated_at: '2025-12-30T16:00:00Z',
  },
];

export const mockPlans: MockPlan[] = [
  {
    id: '1',
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
    status: 'proposed' as PlanStatus,
    created_at: '2025-12-31T13:00:00Z',
    pros: [
      'Fast development (uses existing stack)',
      'Built-in real-time subscriptions',
      'Automatic scaling',
      'Row-level security',
    ],
    cons: [
      'Vendor lock-in to Supabase',
      'Free tier has connection limits',
      'Less control over WebSocket layer',
    ],
  },
  {
    id: '2',
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
    status: 'proposed' as PlanStatus,
    created_at: '2025-12-31T13:15:00Z',
    pros: [
      'Full control over WebSocket layer',
      'No vendor lock-in',
      'Can optimize for specific use cases',
      'More cost-effective at scale',
    ],
    cons: [
      'Longer development time',
      'More infrastructure to manage',
      'Requires WebSocket expertise',
      'Higher initial complexity',
    ],
  },
];

export const mockDecisions: DecisionRow[] = [
  {
    id: '1',
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
          cons: ['Doesn\'t improve code quality'],
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
    rationale: 'Quick fix is appropriate here. We\'re in early development and need to move fast. Can refactor later when we have more test coverage.',
    overrides: null,
    decided_by: 'Virgilio',
    decided_at: '2025-12-31T09:30:00Z',
  },
];

export const mockHistory: HistoryEvent[] = [
  {
    id: '1',
    timestamp: '2025-12-31T15:00:00Z',
    type: 'task_approved',
    title: 'Approved task execution',
    description: 'Add Row-Level Security policies to Supabase database',
    taskId: 'task-002',
    metadata: {
      planId: 'plan-002',
      rationale: 'Security is critical. RLS policies are essential before launch.',
    },
  },
  {
    id: '2',
    timestamp: '2025-12-31T14:30:00Z',
    type: 'decision_made',
    title: 'Selected approach for chat interface',
    description: 'Chose Next.js + Supabase Realtime over custom WebSocket server',
    taskId: 'task-001',
    metadata: {
      selectedOption: 0,
      rationale: 'Boring tech principle. Use proven stack.',
    },
  },
  {
    id: '3',
    timestamp: '2025-12-31T10:30:00Z',
    type: 'task_completed',
    title: 'Completed TypeScript bugfix',
    description: 'Fix TypeScript compilation errors in workflow engine',
    taskId: 'task-003',
  },
  {
    id: '4',
    timestamp: '2025-12-31T09:00:00Z',
    type: 'task_created',
    title: 'Created new documentation task',
    description: 'Document Aura workflow orchestration architecture',
    taskId: 'task-004',
  },
  {
    id: '5',
    timestamp: '2025-12-30T16:00:00Z',
    type: 'task_created',
    title: 'Created Cheshire Cat integration task',
    description: 'Implement Cheshire Cat integration for System 2',
    taskId: 'task-005',
  },
];

export function getTaskById(id: string): MockTask | undefined {
  return mockTasks.find((task) => task.id === id || task.task_id === id);
}

export function getPlansByTaskId(taskId: string): MockPlan[] {
  return mockPlans.filter((plan) => plan.task_id === taskId);
}

export function getDecisionByTaskId(taskId: string): DecisionRow | undefined {
  return mockDecisions.find((decision) => decision.task_id === taskId);
}

export function getTasksAwaitingApproval(): MockTask[] {
  return mockTasks.filter((task) => task.status === 'planning');
}

export function getTasksInProgress(): MockTask[] {
  return mockTasks.filter((task) => task.status === 'executing');
}

export function getCompletedTasks(): MockTask[] {
  return mockTasks.filter((task) => task.status === 'completed');
}
