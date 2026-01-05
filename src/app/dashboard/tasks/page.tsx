import Link from 'next/link';
import React from 'react';

import { TaskList } from '@/components/dashboard/task-list';

export default function TasksPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor agentic workflows</p>
        </div>
        <Link 
          href="/dashboard" 
          className="text-sm font-medium hover:underline text-primary"
        >
          &larr; Back to Dashboard
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <TaskList />
      </div>
    </div>
  );
}
