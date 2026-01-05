import { NextResponse } from 'next/server';

import { createDecision, listDecisions } from '@/core/db/decisions';
import { validateDecision } from '@/core/validators/decision';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const decision = validateDecision(body);
    const decidedBy = body.decidedBy || 'system';

    const created = await createDecision(decision, decidedBy);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const taskId = searchParams.get('taskId') || undefined;

    const decisions = await listDecisions({ category, taskId });

    return NextResponse.json({ success: true, data: decisions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
