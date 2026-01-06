import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Test endpoint to verify Sentry error tracking
 * GET /api/test-sentry?type=error|message
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'message';

  try {
    if (type === 'error') {
      // Test error capture
      throw new Error('Test error from Aura MVP - Sentry integration test');
    } else {
      // Test message capture
      Sentry.captureMessage('Test message from Aura MVP - Sentry integration test', 'info');
      return NextResponse.json({
        success: true,
        message: 'Test message sent to Sentry. Check your Sentry dashboard.',
        type: 'message',
      });
    }
  } catch (error) {
    // Capture the error
    Sentry.captureException(error);
    
    return NextResponse.json({
      success: true,
      message: 'Test error sent to Sentry. Check your Sentry dashboard.',
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

