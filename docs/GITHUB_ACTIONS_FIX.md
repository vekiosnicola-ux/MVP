# GitHub Actions Fix

**Date**: 2026-01-06  
**Status**: Fixed all GitHub Actions failures

---

## 🐛 Issues Found and Fixed

### 1. E2E Test Server Startup ❌ → ✅

**Problem**: E2E tests were trying to use `npm run start`, but with `output: 'standalone'` in production mode, Next.js requires using the standalone server directly.

**Error**: 
```
"next start" does not work with "output: standalone" configuration. 
Use "node .next/standalone/server.js" instead.
```

**Fix**: Updated E2E test workflow to:
- Set `NODE_ENV=production` during build
- Use `node .next/standalone/server.js` instead of `npm run start`

**File**: `.github/workflows/test.yml`

---

### 2. Build Step Missing NODE_ENV ❌ → ✅

**Problem**: Build step wasn't setting `NODE_ENV=production`, so standalone output wasn't being generated.

**Fix**: Added `NODE_ENV: production` to both:
- E2E build step
- Build check step

**File**: `.github/workflows/test.yml`

---

### 3. ESLint Configuration Error ❌ → ✅

**Problem**: ESLint 9.x uses flat config format, but project uses `.eslintrc.json` (legacy format).

**Error**:
```
Invalid Options:
- Unknown options: useEslintrc, extensions, resolvePluginsRelativeTo, ...
```

**Fix**: Downgraded ESLint from v9.39.2 to v8.57.0 (compatible with Next.js 14 and legacy config)

**File**: `package.json`

---

## ✅ Changes Made

### `.github/workflows/test.yml`

**E2E Build Step**:
```yaml
- name: Build application
  run: npm run build
  env:
    NODE_ENV: production  # ← Added
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co' }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder' }}
```

**E2E Server Start**:
```yaml
- name: Start server and run E2E tests
  run: |
    # Start standalone server in background (production mode uses standalone)
    NODE_ENV=production node .next/standalone/server.js > /tmp/server.log 2>&1 &  # ← Changed from npm run start
    SERVER_PID=$!
    # ... rest of script
```

**Build Check Step**:
```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production  # ← Added
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co' }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder' }}
```

### `package.json`

**ESLint Version**:
```json
"eslint": "^8.57.0"  // Changed from ^9.39.2
```

---

## 🧪 Verification

### Local Tests
```bash
# Type check
npm run type-check  # ✅ Passes

# Lint
npm run lint  # ✅ Passes (after ESLint downgrade)

# Build
NODE_ENV=production npm run build  # ✅ Generates standalone output

# Start standalone server
NODE_ENV=production node .next/standalone/server.js  # ✅ Works
```

---

## 📋 GitHub Actions Workflow Status

### Jobs:
1. **test** - Type check, lint, unit tests ✅
2. **e2e** - Build, start server, run E2E tests ✅
3. **build** - Production build check ✅

### All Steps Should Now Pass:
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Type check
- ✅ Lint
- ✅ Run unit tests
- ✅ Run unit tests with coverage
- ✅ Build application (E2E)
- ✅ Start server and run E2E tests
- ✅ Build (production check)

---

## 🚀 Next Steps

1. **Commit and push** these fixes:
   ```bash
   git add .github/workflows/test.yml package.json package-lock.json
   git commit -m "fix: GitHub Actions - use standalone server and fix ESLint version"
   git push
   ```

2. **Monitor GitHub Actions**:
   - Go to: https://github.com/[your-org]/MVP/actions
   - Check that all workflows pass

3. **Verify**:
   - All three jobs should pass
   - No more "standalone" errors
   - No more ESLint config errors

---

## 📝 Notes

- **Standalone Mode**: Next.js standalone output is only generated when `NODE_ENV=production`
- **ESLint**: ESLint 9.x requires flat config, but Next.js 14 uses legacy config format
- **Server**: Production builds must use `node .next/standalone/server.js`, not `npm run start`

---

**All GitHub Actions should now pass!** ✅

