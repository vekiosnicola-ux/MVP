import { NextResponse } from 'next/server';

import { createPlan, listPlans } from '@/core/db/plans';
import { validatePlan } from '@/core/validators/plan';
import { PlanStatus } from '@/interfaces/plan';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const plan = validatePlan(body);

    const created = await createPlan(plan);

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
    const status = searchParams.get('status') as PlanStatus | undefined;
    const taskId = searchParams.get('taskId') || undefined;

    const plans = await listPlans({ status, taskId });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
