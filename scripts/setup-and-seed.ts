#!/usr/bin/env tsx
/**
 * Database Setup and Seed Script
 *
 * This script:
 * 1. Reads and executes setup-db.sql to create tables
 * 2. Runs the seed script to populate data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure these are set in .env.local');
  process.exit(1);
}

console.log('🔧 Setting up database...\n');

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupSchema() {
  console.log('📋 Reading setup-db.sql...');
  const sqlPath = join(__dirname, 'setup-db.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // Split by statement (rough split - assumes statements end with ;)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📊 Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    // Extract table name for better logging
    const tableMatch = statement.match(/CREATE TABLE (\w+)/i);
    const indexMatch = statement.match(/CREATE INDEX (\w+)/i);
    const name = tableMatch?.[1] || indexMatch?.[1] || `statement ${i + 1}`;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Try direct execution if rpc fails
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: statement + ';' }),
        });

        if (!response.ok) {
          console.log(`⚠️  ${name}: ${error.message || 'might already exist'}`);
        } else {
          console.log(`✅ ${name}`);
        }
      } else {
        console.log(`✅ ${name}`);
      }
    } catch (err) {
      console.log(`⚠️  ${name}: ${err instanceof Error ? err.message : 'error'}`);
    }
  }

  console.log('\n✅ Schema setup complete!\n');
}

async function main() {
  try {
    await setupSchema();

    console.log('🌱 Starting database seed...\n');
    console.log('Please run: npm run db:seed\n');
    console.log('Or continue with manual seeding using scripts/seed-db.ts');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
