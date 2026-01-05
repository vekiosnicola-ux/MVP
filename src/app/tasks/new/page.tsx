'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function CreateTaskPage(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);



    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Task created successfully! (Mock implementation)');
    router.push('/');

    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">Create New Task</h1>
        <p className="text-text-secondary">
          Define a new task for the AI agents to work on
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Task Type *</Label>
              <Select name="type" defaultValue="feature" required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bugfix">Bugfix</SelectItem>
                  <SelectItem value="refactor">Refactor</SelectItem>
                  <SelectItem value="docs">Documentation</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="infra">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what needs to be built..."
                required
                rows={3}
              />
            </div>

            {/* Repository & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repository">Repository *</Label>
                <Input
                  id="repository"
                  name="repository"
                  placeholder="e.g., dieta-positiva"
                  defaultValue="dieta-positiva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Input
                  id="branch"
                  name="branch"
                  placeholder="e.g., feature/new-feature"
                  required
                />
              </div>
            </div>

            {/* Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Context</h3>

              <div className="space-y-2">
                <Label htmlFor="background">Background</Label>
                <Textarea
                  id="background"
                  name="background"
                  placeholder="Provide context about why this task is needed..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="List specific requirements (one per line)..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea
                  id="constraints"
                  name="constraints"
                  placeholder="List any constraints or limitations..."
                  rows={3}
                />
              </div>
            </div>

            {/* Task Constraints */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Task Constraints</h3>

              <div className="space-y-2">
                <Label htmlFor="maxDuration">Max Duration (minutes)</Label>
                <Input
                  id="maxDuration"
                  name="maxDuration"
                  type="number"
                  defaultValue={120}
                  min={15}
                  max={480}
                  required
                />
                <p className="text-xs text-text-tertiary">
                  Maximum time allowed for task completion (15-480 minutes)
                </p>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority *</Label>
              <RadioGroup name="priority" defaultValue="medium" required>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="font-normal cursor-pointer">
                      Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="font-normal cursor-pointer">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="font-normal cursor-pointer">
                      High
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical" className="font-normal cursor-pointer">
                      Critical
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Link href="/">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Task...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
