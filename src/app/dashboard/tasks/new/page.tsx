'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function NewTaskPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [type, setType] = useState('feature');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/workflow/create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `task-${crypto.randomUUID()}`,
          version: '1.0.0',
          type,
          description,
          context: {
            repository: 'dieta-positiva',
            branch: 'main',
            files: []
          },
          constraints: {
            maxDuration: 60,
            requiresApproval: true,
            breakingChangesAllowed: false,
            testCoverageMin: 80
          },
          autoGenerateProposals: true
        }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/dashboard/tasks/${data.taskId}`);
      } else {
        alert(data.error || 'Failed to create task');
      }
    } catch {
      alert('An error occurred while creating the task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
          <p className="text-muted-foreground mt-2">Initiate a new agentic development workflow</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium hover:underline text-primary">
          Cancel
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 rounded-md border bg-background"
              >
                <option value="feature">Feature</option>
                <option value="bugfix">Bugfix</option>
                <option value="refactor">Refactor</option>
                <option value="docs">Documentation</option>
                <option value="test">Testing</option>
                <option value="infra">Infrastructure</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what needs to be built or fixed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating Workflow...' : 'Create Task & Generate Proposals'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
