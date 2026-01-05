import { NextResponse } from 'next/server';

import { getStrategyAdvice } from '@/system1/tools/advisor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, context, options } = body;

    if (!topic || !context) {
      return NextResponse.json(
        { success: false, error: 'Topic and context are required' },
        { status: 400 }
      );
    }

    const advice = await getStrategyAdvice({ topic, context, options });

    return NextResponse.json({ success: true, data: advice });
  } catch (error) {
    console.error('Strategy API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
