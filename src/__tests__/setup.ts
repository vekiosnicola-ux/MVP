/**
 * Test setup file
 * Runs before all tests
 */

// Set test environment variables if not already set
// Note: NODE_ENV is read-only in some environments, so we check first
if (typeof process.env.NODE_ENV === 'undefined') {
  // Only set if not already defined
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: false,
    configurable: true,
  });
}

// Mock environment variables for tests
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'https://test.supabase.co';
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-key';
}

// Suppress console errors in tests (optional)
// Uncomment if you want cleaner test output
// import { vi } from 'vitest';
// global.console = {
//   ...console,
//   error: vi.fn(),
//   warn: vi.fn(),
// };
