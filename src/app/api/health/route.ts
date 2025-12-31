import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Returns 200 OK if the service is running
 * Validates environment configuration
 */
export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        api: true,
        env: checkEnvironment(),
      },
    };

    return NextResponse.json(health, { status: 200 });
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
  // During initial setup, only NODE_ENV is required
  // Other env vars (ANTHROPIC_API_KEY, SUPABASE_*) are optional
  return !!process.env.NODE_ENV;
}
