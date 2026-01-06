'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full border-accent-danger">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-danger/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-accent-danger" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Something went wrong!</h2>
              <p className="text-text-secondary mb-4">
                {error.message || 'An unexpected error occurred'}
              </p>
              {error.digest && (
                <p className="text-xs text-text-secondary mb-4">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={reset} variant="primary">
                Try again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="secondary">
                Go home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

