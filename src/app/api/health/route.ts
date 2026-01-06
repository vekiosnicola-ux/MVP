import { NextResponse } from 'next/server';

import { getSupabaseClient } from '@/core/db/client';

/**
 * Health check endpoint
 * Returns 200 OK if the service is running
 * Validates environment configuration and DB connectivity
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Check DB connection
    const { error: dbError } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
    const isDbConnected = !dbError;

    // Basic health check
    const health = {
      status: isDbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        api: true,
        env: checkEnvironment(),
        database: isDbConnected,
      },
      errors: dbError ? { database: dbError.message } : undefined
    };

    return NextResponse.json(health, { status: isDbConnected ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Check if required environment variables are configured
 * Returns true if at least NODE_ENV is set
 */
function checkEnvironment(): boolean {
  return !!(
    process.env.NODE_ENV &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
