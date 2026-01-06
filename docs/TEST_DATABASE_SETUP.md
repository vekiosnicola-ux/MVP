# Test Database Setup Guide

**Agent**: Architect  
**Status**: Documentation Complete  
**Next**: Implementation

---

## Overview

This guide explains how to set up a separate test database environment for running tests without affecting development or production data.

---

## Strategy

### Option 1: Use Existing Database (Quick Start)

**If you already have a Supabase database with tables set up**, you can use it for testing:

1. **Use Existing Environment Variables**
   
   Your existing `.env.local` should already have:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

2. **Tests Will Use Same Database**
   
   Tests will use the same database. **Important**: 
   - Use test data prefixes (`test-` prefix for IDs)
   - Clean up test data after tests
   - Be careful not to interfere with real data

3. **Configure Test Cleanup**
   
   Ensure tests clean up after themselves:
   ```typescript
   afterEach(async () => {
     await cleanupTestData(supabase, 'tasks', 'test-');
     await cleanupTestData(supabase, 'plans', 'test-');
   });
   ```

**Pros**: Quick setup, no additional database needed  
**Cons**: Risk of data conflicts, need careful cleanup

---

### Option 2: Separate Supabase Project (Recommended for Production)

Create a dedicated Supabase project for testing:

1. **Create Test Project**
   - Go to https://supabase.com/dashboard
   - Create new project: `aura-mvp-test`
   - Use same region as main project
   - Copy project URL and anon key

2. **Set Up Test Environment Variables**
   
   Create `.env.test`:
   ```bash
   TEST_SUPABASE_URL=https://[test-project-ref].supabase.co
   TEST_SUPABASE_ANON_KEY=[test-anon-key]
   TEST_SUPABASE_SERVICE_ROLE_KEY=[test-service-role-key]
   ```

3. **Run Schema Migration**
   - Copy `scripts/setup-db.sql`
   - Run in test project SQL editor
   - Verify all tables created

4. **Configure Tests**
   
   Update `vitest.config.ts`:
   ```typescript
   test: {
     env: {
       NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
       NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
     }
   }
   ```

**Pros**: Isolated test data, no risk to production  
**Cons**: Additional setup, separate database to maintain

### Option 2: Local PostgreSQL (Alternative)

For faster tests, use local PostgreSQL:

1. **Install PostgreSQL**
   ```bash
   brew install postgresql  # macOS
   # or use Docker
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=test postgres
   ```

2. **Set Up Test Database**
   ```bash
   createdb aura_test
   psql aura_test < scripts/setup-db.sql
   ```

3. **Configure Connection**
   ```bash
   TEST_DATABASE_URL=postgresql://localhost:5432/aura_test
   ```

---

## Test Data Management

### Cleanup Strategy

**Before Each Test**:
- Clean up test data with `test-` prefix
- Reset sequences if needed
- Ensure clean state

**After Each Test**:
- Remove test data
- Clean up any created records

### Test Data Helpers

Use `src/__tests__/utils/test-fixtures.ts`:

```typescript
import { cleanupTestData, getTestSupabaseClient } from '@/__tests__/utils/test-fixtures';

beforeEach(async () => {
  const supabase = getTestSupabaseClient();
  await cleanupTestData(supabase, 'tasks', 'test-');
  await cleanupTestData(supabase, 'plans', 'test-');
  await cleanupTestData(supabase, 'decisions', 'test-');
});
```

---

## Environment Variables

### Test Environment

```bash
# .env.test
NODE_ENV=test
TEST_SUPABASE_URL=https://xxx.supabase.co
TEST_SUPABASE_ANON_KEY=xxx
TEST_SUPABASE_SERVICE_ROLE_KEY=xxx
```

### CI/CD Environment

Set in GitHub Actions secrets:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_ROLE_KEY`

---

## Test Isolation

### Database Transactions (Ideal)

Use transactions for test isolation:

```typescript
test('creates task', async () => {
  await supabase.rpc('begin_transaction');
  try {
    // Test code
  } finally {
    await supabase.rpc('rollback_transaction');
  }
});
```

**Note**: Supabase doesn't support transactions via client. Use cleanup instead.

### Cleanup Pattern

```typescript
test('creates task', async () => {
  const testId = 'test-task-123';
  
  try {
    // Test code that creates data
    const task = await createTask({ id: testId, ... });
    expect(task).toBeDefined();
  } finally {
    // Always cleanup
    await cleanupTestData(supabase, 'tasks', testId);
  }
});
```

---

## Migration Strategy

### Keep Test DB in Sync

1. **Manual Sync** (Simple)
   - Run migrations on test DB when schema changes
   - Document in migration files

2. **Automated Sync** (Advanced)
   - CI/CD runs migrations before tests
   - Use Supabase CLI for migrations

---

## Best Practices

1. ✅ **Always use test prefix** for test data IDs
2. ✅ **Clean up after each test** to prevent interference
3. ✅ **Use separate project** to avoid data conflicts
4. ✅ **Reset sequences** if using auto-increment IDs
5. ✅ **Document test data requirements** in test files

---

## Troubleshooting

### Tests Failing Due to Data Conflicts

**Solution**: Ensure cleanup runs before each test

### Test DB Out of Sync

**Solution**: Re-run schema migration on test project

### Slow Tests

**Solution**: 
- Use local PostgreSQL for faster tests
- Optimize cleanup queries
- Use test data factories

---

## Recommendation

**For Development/Quick Start**: Use Option 1 (existing database)  
**For CI/CD/Production**: Use Option 2 (separate test database)

## Next Steps

### If Using Existing Database (Option 1)
1. ✅ Verify `.env.local` has Supabase credentials
2. ✅ Ensure test cleanup functions work
3. ✅ Run tests: `npm run test`
4. ✅ Verify test data is cleaned up

### If Creating Separate Test DB (Option 2)
1. ⏳ Create test Supabase project
2. ⏳ Run schema migration
3. ⏳ Set up `.env.test` with test credentials
4. ⏳ Update test setup files
5. ⏳ Test database connectivity

---

**Last Updated**: 2025-01-04

