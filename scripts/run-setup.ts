/**
 * Run database setup SQL script
 * Executes scripts/setup-db.sql using Supabase service role
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simple .env parser
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && match[1] && match[2]) {
      env[match[1].trim()] = match[2].trim();
    }
  });

  return env;
}

async function runSetup() {
  console.log('🚀 Starting database setup...\n');

  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  // Note: We can't execute raw SQL via Supabase REST API
  // This script provides guidance only

  console.log('📝 Executing SQL setup script...\n');

  try {
    // Execute the SQL (Supabase REST API doesn't support raw SQL execution)
    // We need to use the Postgres connection or Management API
    // For now, let's use rpc or direct table creation

    // Since we can't execute raw SQL via REST API, we'll use a different approach
    // We'll execute it via SQL Editor guidance
    console.log('⚠️  Direct SQL execution not available via REST API');
    console.log('\n📋 Please run the SQL manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/fevouizqcuvahrdtwoif/sql/new');
    console.log('   2. Copy/paste: scripts/setup-db.sql');
    console.log('   3. Click "Run"');
    console.log('\n   Or use Supabase CLI:');
    console.log('   $ npx supabase db push\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

runSetup();
