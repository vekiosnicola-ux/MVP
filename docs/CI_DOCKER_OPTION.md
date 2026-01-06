# Using Docker in CI/CD (Optional)

**Status**: Docker is available but not required for CI/CD

---

## Current Approach (Recommended)

The current CI/CD workflow runs tests **directly on the GitHub Actions runner**, which is:
- ✅ **Faster** - No Docker build time
- ✅ **Simpler** - Direct npm commands
- ✅ **Sufficient** - Tests run in consistent environment

---

## Docker Option (For Consistency)

If you want to match your **local development environment exactly**, you can use Docker in CI.

### Benefits
- ✅ **Exact match** with local dev environment
- ✅ **Isolated** - No conflicts with runner environment
- ✅ **Reproducible** - Same Node version, dependencies, etc.

### Trade-offs
- ⏱️ **Slower** - Docker build adds ~2-3 minutes
- 🔧 **More complex** - Requires Docker setup in workflow

---

## How to Use Docker in CI

### Option 1: Use Docker Compose Test Service

Update `.github/workflows/test.yml`:

```yaml
test:
  name: Run Tests
  runs-on: ubuntu-latest
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Run tests in Docker
      run: |
        docker-compose run --rm test
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Option 2: Use Docker for E2E Tests

For E2E tests, Docker can ensure server consistency:

```yaml
e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Start app in Docker
      run: |
        docker-compose up -d app
        # Wait for health check
        timeout 60 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 2; done'

    - name: Run E2E tests
      run: npm run test:ui
      env:
        TEST_API_URL: http://localhost:3001

    - name: Stop containers
      if: always()
      run: docker-compose down
```

---

## Recommendation

**Keep current approach** (no Docker in CI) because:
1. ✅ Tests are already passing
2. ✅ Faster CI runs
3. ✅ Simpler maintenance
4. ✅ GitHub Actions runners are consistent enough

**Use Docker in CI if**:
- You encounter "works locally but fails in CI" issues
- You need exact Node version matching
- You want to test Docker build process itself

---

## Local Testing with Docker

You can still use Docker locally:

```bash
# Run validation (lint + type check)
docker-compose run --rm test

# Run dev server
docker-compose up

# Run tests locally
npm run test  # Direct (faster)
# or
docker-compose run --rm app npm run test  # In container (consistent)
```

---

**Current Status**: CI uses direct npm commands (no Docker)  
**Docker Status**: Available for local dev and optional CI use

