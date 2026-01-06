# Test Troubleshooting Guide

**Agent**: Documentation  
**Status**: Complete

---

## Common Issues & Solutions

### Tests Failing with "Supabase configuration missing"

**Error**:
```
Error: Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Solution**:
1. Create `.env.test` file with test credentials:
   ```bash
   TEST_SUPABASE_URL=https://your-test-project.supabase.co
   TEST_SUPABASE_ANON_KEY=your-test-key
   ```

2. Or set environment variables:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
   ```

3. Update `vitest.config.ts` to load test env:
   ```typescript
   test: {
     env: {
       NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL,
       NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY,
     }
   }
   ```

---

### E2E Tests Failing with "Connection Refused"

**Error**:
```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
```

**Solution**:
1. Start dev server before running E2E tests:
   ```bash
   npm run dev
   # In another terminal:
   npm run test:ui
   ```

2. Or configure Playwright to start server automatically (see `playwright.config.ts`)

---

### Coverage Report Not Generating

**Error**: Coverage report not appearing after `npm run test:coverage`

**Solution**:
1. Verify `@vitest/coverage-v8` is installed:
   ```bash
   npm install --save-dev @vitest/coverage-v8
   ```

2. Check `vitest.config.ts` has coverage config:
   ```typescript
   coverage: {
     provider: 'v8',
     reporter: ['text', 'json', 'html'],
   }
   ```

3. Check for coverage directory:
   ```bash
   ls coverage/
   ```

---

### Tests Timing Out

**Error**: Tests fail with timeout errors

**Solution**:
1. Increase timeout in test:
   ```typescript
   test('slow test', async () => {
     // ...
   }, { timeout: 10000 }); // 10 seconds
   ```

2. Check for hanging async operations
3. Verify database connections aren't blocking

---

### Flaky Tests (Sometimes Pass, Sometimes Fail)

**Common Causes**:
1. **Race conditions**: Tests running in parallel interfering
2. **Shared state**: Tests modifying same data
3. **Timing issues**: Not waiting for async operations

**Solutions**:
1. Run tests sequentially:
   ```bash
   npm run test -- --no-threads
   ```

2. Add proper cleanup:
   ```typescript
   beforeEach(async () => {
     await cleanupTestData();
   });
   ```

3. Use proper waits:
   ```typescript
   await page.waitForSelector('.element');
   ```

---

### Type Errors in Tests

**Error**: TypeScript errors in test files

**Solution**:
1. Check `tsconfig.json` includes test files:
   ```json
   {
     "include": ["src/**/*", "src/__tests__/**/*"]
   }
   ```

2. Verify path aliases work:
   ```typescript
   import { something } from '@/core/utils';
   ```

3. Run type check:
   ```bash
   npm run type-check
   ```

---

### Mock Not Working

**Error**: Mock functions not being called

**Solution**:
1. Verify mock is set up before import:
   ```typescript
   vi.mock('@/module', () => ({
     function: vi.fn(),
   }));
   ```

2. Clear mocks between tests:
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

---

### Database Tests Failing

**Error**: Database operations failing in tests

**Solution**:
1. Verify test database is set up (see `TEST_DATABASE_SETUP.md`)
2. Check test data cleanup:
   ```typescript
   afterEach(async () => {
     await cleanupTestData(supabase, 'tasks', 'test-');
   });
   ```

3. Ensure test database has correct schema

---

### CI/CD Tests Failing Locally But Passing

**Common Causes**:
1. Environment variables differ
2. Database not available in CI
3. Different Node.js versions

**Solutions**:
1. Check GitHub Actions logs
2. Verify environment variables in CI
3. Use same Node version locally and in CI

---

## Getting Help

### Debug Mode

Run tests with verbose output:
```bash
npm run test -- --reporter=verbose
```

### Isolate Failing Test

Run single test file:
```bash
npm run test -- src/__tests__/path/to/test.ts
```

### Check Test Output

View detailed test results:
```bash
npm run test:coverage
# Check coverage/index.html
```

---

## Best Practices

1. ✅ **Always cleanup test data** after tests
2. ✅ **Use test prefixes** for test data IDs
3. ✅ **Mock external services** in unit tests
4. ✅ **Use real services** in integration tests
5. ✅ **Keep tests isolated** - no shared state
6. ✅ **Write deterministic tests** - same input = same output

---

**Last Updated**: 2025-01-04

