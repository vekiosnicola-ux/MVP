'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface DecisionPanelProps {
  taskId: string;
  proposalCount: number;
  onApprove: (selectedOption: number, rationale: string) => void;
  onCancel: () => void;
}

const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

export function DecisionPanel({ taskId, proposalCount, onApprove, onCancel }: DecisionPanelProps): React.ReactElement {
  const [selectedOption, setSelectedOption] = React.useState<string>('0');
  const [rationale, setRationale] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleApprove = async (): Promise<void> => {
    if (!rationale.trim()) {
      alert('Please provide a rationale for your decision');
      return;
    }

    setIsSubmitting(true);

    await onApprove(parseInt(selectedOption, 10), rationale);

    setIsSubmitting(false);
  };

  const decisionOptions = [
    ...Array.from({ length: proposalCount }, (_, i) => ({
      value: i.toString(),
      label: `Approve Proposal ${i + 1}`,
    })),
    { value: 'changes', label: 'Request Changes' },
    { value: 'reject', label: 'Reject All' },
  ];

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-2 border-accent-primary">
        <CardHeader>
          <CardTitle>Your Decision</CardTitle>
          <p className="text-sm text-text-secondary">
            Review the proposals and make your decision for task {taskId}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Options */}
          <div>
            <Label className="text-base mb-3 block">Select an option:</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="space-y-3">
                {decisionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Rationale */}
          <div>
            <Label htmlFor="rationale" className="text-base mb-2 block">
              Rationale *
            </Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why you made this decision..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-text-tertiary mt-2">
              Your rationale will be logged for future reference and learning
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Approve Decision'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
