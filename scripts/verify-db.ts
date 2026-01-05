/**
 * Quick database verification script
 * Run with: npx tsx scripts/verify-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simple .env parser (avoiding dotenv dependency)
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

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase connection...\n');

  const tables = ['tasks', 'plans', 'decisions', 'results', 'human_overrides'];
  const results = {
    connected: false,
    tablesExist: {} as Record<string, boolean>,
  };

  try {
    // Test connection with a simple query
    const { error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Database connected but tables not created yet');
        console.log('   Run scripts/setup-db.sql in Supabase SQL Editor\n');
        return;
      }
      throw error;
    }

    results.connected = true;
    console.log('✅ Connected to Supabase\n');

    // Check each table
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        results.tablesExist[table] = !error;
        console.log(`${!error ? '✅' : '❌'} Table: ${table}`);
      } catch (err) {
        results.tablesExist[table] = false;
        console.log(`❌ Table: ${table}`);
      }
    }

    const allTablesExist = Object.values(results.tablesExist).every(exists => exists);

    if (allTablesExist) {
      console.log('\n🎉 Database setup complete! All tables exist.');
    } else {
      console.log('\n⚠️  Some tables are missing. Run scripts/setup-db.sql');
    }

  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n📝 Check your .env.local file has correct Supabase credentials');
  }
}

verifyDatabase();
