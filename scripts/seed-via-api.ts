#!/usr/bin/env tsx
/**
 * Database Seed Script via REST API
 * Uses direct HTTP requests instead of Supabase client
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('🌱 Starting database seed via REST API...\n');

const headers = {
  'Content-Type': 'application/json',
  'apikey': supabaseServiceKey!,
  'Authorization': `Bearer ${supabaseServiceKey}`,
  'Prefer': 'return=representation'
};

async function insertData(table: string, data: any[]) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Inserted ${data.length} records into ${table}`);
    return result;
  } catch (error) {
    console.error(`❌ Error inserting into ${table}:`, error);
    throw error;
  }
}

async function clearTable(table: string) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok && response.status !== 404) {
      console.log(`⚠️  Could not clear ${table}: ${response.statusText}`);
    } else {
      console.log(`🗑️  Cleared ${table}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not clear ${table}`);
  }
}

const tasks = [
  {
    task_id: 'task-001',
    version: '1.0.0',
    type: 'feature',
    description: 'Build DP AI chat interface with real-time messaging',
    context: {
      repository: 'dieta-positiva/mvp',
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
  },
  {
    task_id: 'task-002',
    version: '1.0.0',
    type: 'feature',
    description: 'Add Row-Level Security policies to Supabase database',
    context: {
      repository: 'dieta-positiva/mvp',
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
  },
  {
    task_id: 'task-003',
    version: '1.0.0',
    type: 'bugfix',
    description: 'Fix TypeScript compilation errors in workflow engine',
    context: {
      repository: 'dieta-positiva/mvp',
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
  },
  {
    task_id: 'task-004',
    version: '1.0.0',
    type: 'docs',
    description: 'Document Aura workflow orchestration architecture',
    context: {
      repository: 'dieta-positiva/mvp',
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
  },
  {
    task_id: 'task-005',
    version: '1.0.0',
    type: 'feature',
    description: 'Implement Cheshire Cat integration for System 2',
    context: {
      repository: 'dieta-positiva/mvp',
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
  },
];

async function main() {
  try {
    console.log('🗑️  Clearing existing data...\n');
    await clearTable('human_overrides');
    await clearTable('results');
    await clearTable('decisions');
    await clearTable('plans');
    await clearTable('tasks');

    console.log('\n📝 Inserting tasks...\n');
    await insertData('tasks', tasks);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nNext: Visit https://dieta-positiva-mvp.vercel.app to see the data');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
