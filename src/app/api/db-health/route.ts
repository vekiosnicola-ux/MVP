import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/core/db/client';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Simple query to test connection
    const { error, count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'connected',
      database: 'supabase',
      tables: {
        tasks: count ?? 0
      }
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      status: 'error',
      message: err.message,
      stack: err.stack,
      cause: (err as any).cause
    }, { status: 500 });
  }
}
