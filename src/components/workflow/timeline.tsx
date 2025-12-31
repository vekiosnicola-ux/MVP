'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface WorkflowTimelineProps {
  currentStatus: string;
}

export function WorkflowTimeline({ currentStatus }: WorkflowTimelineProps): React.ReactElement {
  const steps: TimelineStep[] = [
    { label: 'Created', status: 'completed' },
    { label: 'Planning', status: currentStatus === 'planning' ? 'current' : currentStatus === 'pending' ? 'upcoming' : 'completed' },
    { label: 'Approval', status: currentStatus === 'planning' ? 'current' : currentStatus === 'approved' ? 'completed' : 'upcoming' },
    { label: 'Executing', status: currentStatus === 'executing' ? 'current' : currentStatus === 'completed' || currentStatus === 'failed' ? 'completed' : 'upcoming' },
    { label: 'Verification', status: currentStatus === 'completed' ? 'completed' : currentStatus === 'failed' ? 'current' : 'upcoming' },
    { label: 'Complete', status: currentStatus === 'completed' ? 'completed' : 'upcoming' },
  ];

  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border-primary" />

      {/* Active progress bar */}
      <motion.div
        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-info"
        initial={{ width: 0 }}
        animate={{
          width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                {
                  'bg-accent-success border-accent-success text-white': step.status === 'completed',
                  'bg-accent-primary border-accent-primary text-white animate-pulse': step.status === 'current',
                  'bg-bg-secondary border-border-primary text-text-tertiary': step.status === 'upcoming',
                }
              )}
            >
              {step.status === 'completed' ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                'mt-2 text-xs font-medium text-center',
                {
                  'text-text-primary': step.status === 'completed' || step.status === 'current',
                  'text-text-tertiary': step.status === 'upcoming',
                }
              )}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
