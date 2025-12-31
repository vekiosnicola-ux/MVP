'use client';

import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { MockTask } from '@/lib/mock-data';
import { cn } from '@/lib/utils';


interface TaskCardProps {
  task: MockTask;
}

const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'executing':
      return 'info';
    case 'planning':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'executing':
      return 'In Progress';
    case 'planning':
      return 'Awaiting Approval';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
}

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'critical':
      return 'text-accent-danger';
    case 'high':
      return 'text-accent-warning';
    case 'medium':
      return 'text-accent-info';
    case 'low':
      return 'text-text-tertiary';
    default:
      return 'text-text-secondary';
  }
}

export function TaskCard({ task }: TaskCardProps): React.ReactElement {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div variants={cardVariants} initial="rest" whileHover="hover">
      <Link href={`/tasks/${task.id}`}>
        <Card className="p-4 hover:border-border-focus transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-xs">
                  {task.type}
                </Badge>
                {task.metadata.priority && (
                  <span className={cn('text-xs font-medium uppercase', getPriorityColor(task.metadata.priority))}>
                    {task.metadata.priority}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-medium text-text-primary mb-1 truncate">
                {task.description}
              </h4>
              <p className="text-xs text-text-tertiary" suppressHydrationWarning>
                {mounted ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true }) : 'Loading...'}
              </p>
            </div>
            <Badge variant={getStatusVariant(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
          {task.metadata.labels && task.metadata.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {task.metadata.labels.slice(0, 3).map((label) => (
                <span
                  key={label}
                  className="text-xs px-2 py-0.5 rounded-sm bg-bg-tertiary text-text-tertiary"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
