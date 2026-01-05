'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, FileText, Plus, Play, AlertCircle } from 'lucide-react';
import * as React from 'react';

import { Card } from '@/components/ui/card';
import type { HistoryEvent } from '@/interfaces/history';


interface EventCardProps {
  event: HistoryEvent;
}

function getEventIcon(type: string): React.ReactElement {
  switch (type) {
    case 'task_approved':
      return <CheckCircle className="h-5 w-5 text-accent-success" />;
    case 'task_rejected':
      return <XCircle className="h-5 w-5 text-accent-danger" />;
    case 'task_completed':
      return <CheckCircle className="h-5 w-5 text-accent-info" />;
    case 'task_failed':
      return <AlertCircle className="h-5 w-5 text-accent-danger" />;
    case 'task_created':
      return <Plus className="h-5 w-5 text-accent-primary" />;
    case 'decision_made':
      return <FileText className="h-5 w-5 text-accent-secondary" />;
    case 'execution_started':
      return <Play className="h-5 w-5 text-accent-warning" />;
    case 'execution_completed':
      return <CheckCircle className="h-5 w-5 text-accent-success" />;
    default:
      return <FileText className="h-5 w-5 text-text-secondary" />;
  }
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function EventCard({ event }: EventCardProps): React.ReactElement {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="p-4 hover:border-border-focus transition-all">
        <div className="flex items-start gap-4">
          <div className="mt-0.5">{getEventIcon(event.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-text-primary">{event.title}</h4>
              <time className="text-xs text-text-tertiary whitespace-nowrap">
                {format(new Date(event.timestamp), 'HH:mm')}
              </time>
            </div>
            {event.description && (
              <p className="text-sm text-text-secondary mb-2">{event.description}</p>
            )}
            {event.taskId && (
              <p className="text-xs text-text-tertiary">Task: {event.taskId}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
