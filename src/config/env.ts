import { z } from 'zod';

/**
 * Environment variable validation schema using Zod
 * Security-first: Fail fast if required env vars are missing
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Anthropic API
  ANTHROPIC_API_KEY: z
    .string()
    .min(1, 'ANTHROPIC_API_KEY is required')
    .startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with sk-ant-')
    .optional(), // Optional during initial setup

  // Supabase (public keys can be exposed to client)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .optional(),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
    .optional(),

  // Supabase service role (server-side only, NEVER expose to client)
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required for server operations')
    .optional(),

  // Next.js
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
});

/**
 * Validated environment variables
 * Use this instead of process.env directly to ensure type safety
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PORT: process.env.PORT,
});

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Security check: Ensure sensitive keys are not exposed to client
 */
if (typeof window !== 'undefined') {
  const sensitiveKeys: (keyof Env)[] = ['SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY'];

  sensitiveKeys.forEach((key) => {
    if (env[key]) {
      console.error(`🚨 SECURITY WARNING: Sensitive key "${key}" is exposed to client!`);
    }
  });
}
