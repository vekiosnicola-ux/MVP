# CI/CD Testing Guide

**Now that secrets are added, let's test the pipeline!**

---

## Quick Test

### Option 1: Create Test PR (Recommended)

1. **Create a test branch:**
   ```bash
   git checkout -b test-ci-cd-pipeline
   git commit --allow-empty -m "Test CI/CD pipeline"
   git push origin test-ci-cd-pipeline
   ```

2. **Create PR on GitHub:**
   - Go to your repo
   - Click "Compare & pull request"
   - Create the PR

3. **Watch GitHub Actions:**
   - Go to **Actions** tab
   - You should see "Test & Build" workflow running
   - Wait for it to complete (2-5 minutes)
   - All checks should pass ✅

### Option 2: Push to Main/Develop

If you push directly to `main` or `develop`, the workflow will also run:

```bash
git push origin main
# Check Actions tab
```

---

## What the Pipeline Does

The workflow (`.github/workflows/test.yml`) runs:

1. **Type Check** - Verifies TypeScript compiles
2. **Lint** - Checks code quality
3. **Unit Tests** - Runs all unit tests
4. **Coverage** - Generates coverage report
5. **E2E Tests** - Runs Playwright tests (may be skipped if no server)
6. **Build** - Verifies production build works

---

## Expected Results

### ✅ Success
- All jobs show green checkmarks
- Tests pass
- Build succeeds
- No errors in logs

### ⚠️ Expected Warnings (OK)
- E2E tests may be skipped (need running server)
- Coverage upload may fail (optional)
- Some tests may have warnings (non-blocking)

---

## Troubleshooting

### Workflow Not Running

**Check:**
- Secrets are added correctly
- Branch name matches workflow triggers (`main`, `develop`, or PR)
- Workflow file is in `.github/workflows/`

### Build Fails

**Check:**
- Secrets are correctly named (case-sensitive)
- Build works locally: `npm run build`
- Environment variables are set

### Tests Fail

**Check:**
- Tests pass locally: `npm run test:all`
- Database connection works
- No environment-specific issues

---

## Verify Secrets Are Set

The workflow uses these secrets:
- `NEXT_PUBLIC_SUPABASE_URL` - For build and tests
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For build and tests
- `SENTRY_DSN` - Optional, for error tracking in CI

If secrets are missing, the workflow will use placeholder values (which may cause failures).

---

## Next Steps After CI/CD Works

1. ✅ **Monitor** - Watch for failing tests
2. ✅ **Improve** - Increase test coverage
3. ✅ **Optimize** - Speed up test runs
4. ✅ **Expand** - Add more checks as needed

---

**Ready to test?** Create a PR and watch it run! 🚀

