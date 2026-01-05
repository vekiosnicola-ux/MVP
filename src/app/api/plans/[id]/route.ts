import { NextResponse } from 'next/server';

import { getPlan, updatePlanStatus, deletePlan } from '@/core/db/plans';
import { PlanStatus } from '@/interfaces/plan';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await getPlan(params.id);
    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = await updatePlanStatus(params.id, status as PlanStatus);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Update failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deletePlan(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 400 }
    );
  }
}
