'use client';

import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import * as React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QualityGate {
  name: string;
  status: 'passed' | 'failed' | 'pending';
}

const mockQualityGates: QualityGate[] = [
  { name: 'TypeScript Compilation', status: 'passed' },
  { name: 'ESLint Rules', status: 'passed' },
  { name: 'Security Scan', status: 'pending' },
  { name: 'Test Coverage (80%)', status: 'failed' },
];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function QualityGates(): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Gates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockQualityGates.map((gate, index) => (
            <motion.div
              key={gate.name}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-md transition-colors',
                {
                  'bg-accent-success/10': gate.status === 'passed',
                  'bg-accent-danger/10': gate.status === 'failed',
                  'bg-bg-tertiary': gate.status === 'pending',
                }
              )}
            >
              <span className="text-sm font-medium text-text-primary">{gate.name}</span>
              <div className="flex items-center gap-2">
                {gate.status === 'passed' && (
                  <div className="flex items-center gap-1 text-accent-success">
                    <Check className="h-4 w-4" />
                    <span className="text-xs font-medium">Passed</span>
                  </div>
                )}
                {gate.status === 'failed' && (
                  <div className="flex items-center gap-1 text-accent-danger">
                    <X className="h-4 w-4" />
                    <span className="text-xs font-medium">Failed</span>
                  </div>
                )}
                {gate.status === 'pending' && (
                  <div className="flex items-center gap-1 text-text-tertiary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
