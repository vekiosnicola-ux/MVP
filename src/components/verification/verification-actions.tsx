'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export interface VerificationActionsProps {
  /** Whether quality gates passed - affects feedback label */
  qualityGatesPassed?: boolean;
  /** Callback when approve button is clicked */
  onApprove: (feedback: string) => Promise<void>;
  /** Callback when reject button is clicked */
  onReject: (feedback: string) => Promise<void>;
  /** Whether a submission is in progress */
  submitting?: boolean;
}

/**
 * Verification actions panel - approve/reject buttons with feedback textarea
 */
export function VerificationActions({
  qualityGatesPassed = true,
  onApprove,
  onReject,
  submitting = false,
}: VerificationActionsProps): React.ReactElement {
  const [feedback, setFeedback] = React.useState('');

  const handleApprove = async (): Promise<void> => {
    await onApprove(feedback || 'Approved');
  };

  const handleReject = async (): Promise<void> => {
    if (!feedback.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    await onReject(feedback);
  };

  return (
    <Card className="border-accent-primary">
      <CardHeader>
        <CardTitle>Verification Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Feedback {qualityGatesPassed ? '(optional)' : '(required for rejection)'}
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add notes about your decision..."
            className="min-h-[100px]"
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Reject'}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Approve'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
