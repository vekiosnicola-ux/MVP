'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { PlanRow } from '@/interfaces/plan';

interface ProposalCardProps {
  plan: PlanRow;
  isSelected?: boolean;
  onSelect?: () => void;
}

const cardVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.01,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
};

export function ProposalCard({ plan, isSelected = false, onSelect }: ProposalCardProps): React.ReactElement {
  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onClick={onSelect}
    >
      <Card className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-2 border-accent-primary shadow-glow'
          : 'border border-border-primary hover:border-accent-primary/50'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{plan.approach}</CardTitle>
              <p className="text-sm text-text-secondary mt-1">{plan.reasoning}</p>
            </div>
            {isSelected && (
              <Badge variant="info" className="ml-2">Selected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Estimated Duration:</span>
            <span className="font-medium text-text-primary">{plan.estimated_duration} min</span>
          </div>

          {/* Risks */}
          {plan.risks && plan.risks.length > 0 && Array.isArray(plan.risks) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-accent-warning" />
                <span className="text-sm font-medium text-text-primary">Risks</span>
              </div>
              <ul className="space-y-2 ml-6">
                {plan.risks.map((risk, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex items-start gap-2">
                      <Badge variant={risk.severity === 'high' ? 'danger' : risk.severity === 'medium' ? 'warning' : 'default'} className="text-xs">
                        {risk.severity}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-text-secondary">{risk.description}</p>
                        <p className="text-text-tertiary text-xs mt-1">
                          Mitigation: {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps count */}
          <div className="pt-2 border-t border-border-primary">
            <span className="text-xs text-text-tertiary">
              {plan.steps.length} steps • Agent: {plan.agent}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
