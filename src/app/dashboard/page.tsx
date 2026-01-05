import Link from 'next/link';
import React from 'react';

export default function DashboardPage() {
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
              <span className="font-mono font-bold text-primary">--</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Awaiting Decision</span>
              <span className="font-mono font-bold text-amber-500">--</span>
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
              <span className="text-green-500 font-medium">Ready</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Execution Agent</span>
              <span className="text-blue-500 font-medium font-mono text-xs">MOCK_MODE</span>
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
              <span className="font-mono">--</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Patterns Learned</span>
              <span className="font-mono">--</span>
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
              <tr className="hover:bg-accent/50 transition-colors cursor-pointer">
                <td className="px-6 py-4 col-span-4 text-center text-muted-foreground py-12">
                  No recent activity found. Start a new task to see it here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
