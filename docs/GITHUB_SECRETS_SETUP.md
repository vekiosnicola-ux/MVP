# GitHub Secrets Setup for CI/CD

**Quick guide to add secrets for GitHub Actions**

---

## Steps

1. **Go to GitHub Repository**
   - Navigate to your repo on GitHub
   - Click **Settings** → **Secrets and variables** → **Actions**

2. **Add New Secrets**

   Click **New repository secret** for each:

   ### Secret 1: NEXT_PUBLIC_SUPABASE_URL
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://fevouizqcuvahrdtwoif.supabase.co`
   - Click **Add secret**

   ### Secret 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: `sb_publishable_eD5SkLCA-MQjCV_UvfdZ7g_uNHxIFTB`
   - Click **Add secret**

   ### Secret 3: SENTRY_DSN (Optional)
   - **Name**: `SENTRY_DSN`
   - **Value**: `https://b31c425c25bf79b4e6ea25366133fe92@o4510661992841216.ingest.de.sentry.io/4510661999657040`
   - Click **Add secret**

3. **Verify Secrets**

   After adding, you should see:
   - ✅ NEXT_PUBLIC_SUPABASE_URL
   - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   - ✅ SENTRY_DSN (optional)

---

## Test CI/CD

1. **Create a Test PR**
   ```bash
   git checkout -b test-ci-cd
   git commit --allow-empty -m "Test CI/CD pipeline"
   git push origin test-ci-cd
   ```

2. **Create PR on GitHub**
   - Go to your repo
   - Click "Compare & pull request"
   - Create PR

3. **Watch GitHub Actions**
   - Go to **Actions** tab
   - See workflow running
   - Verify all checks pass

---

## What CI/CD Does

The workflow (`.github/workflows/test.yml`) will:

1. ✅ **Type Check** - Verify TypeScript compiles
2. ✅ **Lint** - Check code quality
3. ✅ **Unit Tests** - Run all unit tests
4. ✅ **Coverage** - Generate coverage report
5. ✅ **E2E Tests** - Run Playwright tests
6. ✅ **Build** - Verify production build works

---

## Troubleshooting

### Workflow Fails

**Check**:
- Secrets are correctly named (case-sensitive)
- Secrets have correct values
- No extra spaces in values

### Build Fails

**Check**:
- Environment variables are set
- Build works locally: `npm run build`

### Tests Fail

**Check**:
- Tests pass locally: `npm run test:all`
- Database connection works

---

**Once secrets are added, create a PR to test the pipeline!** 🚀

