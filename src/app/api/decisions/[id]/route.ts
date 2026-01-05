import { NextResponse } from 'next/server';

import { getDecision, deleteDecision } from '@/core/db/decisions';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decision = await getDecision(params.id);
    return NextResponse.json({ success: true, data: decision });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Not found' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteDecision(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 400 }
    );
  }
}
