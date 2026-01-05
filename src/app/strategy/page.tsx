'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function StrategyPage() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [advice, setAdvice] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAdvice(null);

    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });

      const data = await response.json();
      if (data.success) {
        setAdvice(data.data);
      } else {
        setError(data.error || 'Failed to get advice');
      }
    } catch {
      setError('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System 1: Strategic Advisor</h1>
          <p className="text-muted-foreground mt-2">Internal AI Assistant for Business Strategy</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium hover:underline text-primary">
          Dashboard
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-card border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-background"
                placeholder="e.g., Marketing Strategy for Q1"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Context & Details</label>
              <textarea
                className="w-full p-2 border rounded-md bg-background h-32"
                placeholder="Describe the situation, constraints, and what you're trying to achieve..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Consulting Advisor...' : 'Get Strategic Advice'}
            </button>
          </form>
        </section>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {error}
          </div>
        )}

        {advice && (
          <section className="bg-card border rounded-lg p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Recommendation</h2>
              <p className="text-foreground whitespace-pre-wrap">{advice.recommendation}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Rationale</h2>
              <p className="text-muted-foreground">{advice.rationale}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Trade-offs</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {advice.tradeoffs.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {advice.nextSteps.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
