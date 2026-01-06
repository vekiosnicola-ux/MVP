import Link from 'next/link';
import React from 'react';

import { listOverrides } from '@/core/db/overrides';
import { getAllPatterns } from '@/core/db/patterns';
import { listTasks } from '@/core/db/tasks';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [tasks, patterns, overrides] = await Promise.all([
    listTasks({ limit: 50 }),
    getAllPatterns(),
    listOverrides(),
  ]);

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'failed');
  const awaitingTasks = tasks.filter(t => t.status === 'awaiting_human_decision');
  const recentTasks = tasks.slice(0, 5); // Already ordered by created_at desc in db logic

  const isGroqEnabled = !!process.env.GROQ_API_KEY;
  const isClaudeEnabled = !!process.env.ANTHROPIC_API_KEY;
  const isRealExecution = process.env.EXECUTION_MODE === 'real';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System 3 Dashboard</h1>
        <p className="text-muted-foreground mt-2">Agentic Workflow Orchestration (Aura MVP)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Overview Card */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📋</span> Tasks
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Active Tasks</span>
              <span className="font-mono font-bold text-primary">{activeTasks.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Awaiting Decision</span>
              <span className="font-mono font-bold text-amber-500">{awaitingTasks.length}</span>
            </div>
            <Link
              href="/dashboard/tasks"
              className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View All Tasks
            </Link>
            <Link
              href="/dashboard/tasks/new"
              className="block w-full text-center py-2 px-4 border border-primary text-primary rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              + Create New Task
            </Link>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">⚡</span> System Health
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>DB Status</span>
              <span className="text-green-500 font-medium">Connected</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>AI Engine</span>
              <span className={isGroqEnabled || isClaudeEnabled ? "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                {isClaudeEnabled ? 'Claude Connected' : (isGroqEnabled ? 'Groq Connected' : 'No Keys Set')}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Execution Agent</span>
              <span className={`font-medium font-mono text-xs ${isRealExecution ? "text-green-500" : "text-blue-500"}`}>
                {isRealExecution ? 'REAL_MODE' : 'MOCK_MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* Learning Loop Card */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🧠</span> Learning Loop
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Human Overrides</span>
              <span className="font-mono">{overrides.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Patterns Learned</span>
              <span className="font-mono">{patterns.length}</span>
            </div>
            <button className="w-full text-center py-2 px-4 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
              Analyze Patterns
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Task ID</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                      <Link href={`/dashboard/tasks/${task.task_id}`} className="hover:underline">
                        {task.task_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 max-w-[300px] truncate">
                      {task.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${task.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          task.status === 'failed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                            task.status === 'planning' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                              task.status === 'awaiting_human_decision' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                                'bg-blue-50 text-blue-700 ring-blue-600/20'
                        }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(task.updated_at).toLocaleDateString()} {new Date(task.updated_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground py-12">
                    No recent activity found. Start a new task to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
