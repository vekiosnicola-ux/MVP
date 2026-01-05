'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  task_id: string;
  description: string;
  status: string;
  updated_at: string;
  type: string;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        if (data.success) {
          setTasks(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'executing': return <Badge className="bg-blue-500 animate-pulse">Executing</Badge>;
      case 'awaiting_human_decision': return <Badge className="bg-amber-500">Review Needed</Badge>;
      case 'planning': return <Badge variant="secondary">Planning</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No tasks found.
          </CardContent>
        </Card>
      ) : (
        tasks.map((task) => (
          <Link href={`/dashboard/tasks/${task.task_id}`} key={task.task_id}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer mb-3">
              <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium font-mono">
                    {task.task_id}
                    <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {task.type}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                </div>
                <div>
                  {getStatusBadge(task.status)}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
