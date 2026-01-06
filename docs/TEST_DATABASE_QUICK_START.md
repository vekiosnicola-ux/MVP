# Test Database Quick Start

**For users with existing Supabase database**

---

## Using Your Existing Database

Since you already have a Supabase database with tables, you can use it for testing right away!

### 1. Verify Your Setup

Check that your `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 2. Tests Will Work Automatically

The test setup (`src/__tests__/setup.ts`) will:
- Use your existing Supabase credentials
- Connect to your existing database
- Use the same tables you already have

### 3. Test Data Safety

Tests use `test-` prefix for IDs to avoid conflicts:
- Test tasks: `test-task-xxx`
- Test plans: `test-plan-xxx`
- Test decisions: `test-decision-xxx`

Cleanup functions remove test data automatically.

### 4. Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific suite
npm run test:agents
```

---

## Important Notes

### ✅ Safe Practices
- Tests use `test-` prefix for all test data
- Cleanup functions run after each test
- No risk to your real data if cleanup works

### ⚠️ Best Practices
- Review test cleanup functions
- Monitor test data in Supabase dashboard
- Consider separate test DB for CI/CD

---

## If You Want Separate Test Database Later

You can always create a separate test database later. See `TEST_DATABASE_SETUP.md` for Option 2.

For now, **your existing database works perfectly for testing!** ✅

---

**Ready to test?** Just run `npm run test` and it will use your existing Supabase database!

