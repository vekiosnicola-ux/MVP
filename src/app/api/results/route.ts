import { NextResponse } from 'next/server';

import { createResult, listResults } from '@/core/db/results';
import { validateResult } from '@/core/validators/result';
import { ResultStatus } from '@/interfaces/result';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = validateResult(body);

    const created = await createResult(result);

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
    const status = searchParams.get('status') as ResultStatus | undefined;
    const taskId = searchParams.get('taskId') || undefined;

    const results = await listResults({ status, taskId });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
