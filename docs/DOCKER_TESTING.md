# Docker Testing Guide

**Test your application in Docker - perfect for avoiding Vercel rate limits!**

---

## Quick Start

### 1. Development Mode (Hot Reload)

```bash
# Start the development server in Docker
npm run docker:dev

# Or using docker-compose directly
docker-compose up
```

**Access:**
- App: http://localhost:3001
- Health check: http://localhost:3001/api/health

**Features:**
- ✅ Hot reload (code changes reflect immediately)
- ✅ Volume mounting (no rebuild needed)
- ✅ Uses your `.env.local` file

**Stop:**
```bash
docker-compose down
```

---

### 2. Production Build Test

Test the production build locally:

```bash
# Build production image
npm run docker:build

# Run production container
docker run -p 3000:3000 --env-file .env.local dp-mvp
```

**Access:**
- App: http://localhost:3000

**This tests:**
- ✅ Production build works
- ✅ All dependencies are correct
- ✅ Environment variables load properly
- ✅ App runs in production mode

---

### 3. Run Tests in Docker

```bash
# Run validation (type-check + lint)
docker-compose run --rm test

# This ensures tests pass in the same environment as deployment
```

---

## Full Testing Workflow

### Step 1: Start Development Server

```bash
npm run docker:dev
```

Wait for:
```
✓ Ready in X seconds
```

### Step 2: Test the Application

**Health Check:**
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}
```

**Database Health:**
```bash
curl http://localhost:3001/api/db-health
# Should return database status
```

**Test Sentry Endpoint:**
```bash
curl http://localhost:3001/api/test-sentry?type=message
# Should return success message
```

**Open in Browser:**
- Visit: http://localhost:3001
- Test all features
- Check console for errors

### Step 3: Test Production Build

```bash
# Build production image
npm run docker:build

# Run production container
docker run -p 3000:3000 --env-file .env.local dp-mvp
```

**Test production:**
- Visit: http://localhost:3000
- Verify everything works
- Check performance

---

## Docker Commands Reference

### Development

```bash
# Start dev server
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Rebuild (if Dockerfile changed)
docker-compose up --build
```

### Production

```bash
# Build production image
docker build -f .docker/Dockerfile.prod -t dp-mvp .

# Run production container
docker run -p 3000:3000 --env-file .env.local dp-mvp

# Run in background
docker run -d -p 3000:3000 --env-file .env.local --name dp-mvp-prod dp-mvp

# View logs
docker logs -f dp-mvp-prod

# Stop
docker stop dp-mvp-prod
docker rm dp-mvp-prod
```

### Testing

```bash
# Run validation tests
docker-compose run --rm test

# Run specific test suite
docker-compose run --rm test npm run test:agents
```

---

## Troubleshooting

### Port Already in Use

If port 3001 is taken:
```bash
# Change port in docker-compose.yml
ports:
  - "3002:3000"  # Use 3002 instead
```

### Environment Variables Not Loading

Make sure `.env.local` exists:
```bash
# Check if file exists
ls -la .env.local

# Docker will load it automatically via env_file
```

### Container Won't Start

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Missing `.env.local` file
- Port conflict
- Build errors

### Rebuild Everything

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Start again
docker-compose up
```

---

## What Gets Tested

### Development Mode
- ✅ Hot reload works
- ✅ Environment variables load
- ✅ Database connection
- ✅ API endpoints
- ✅ UI components
- ✅ Real-time updates

### Production Mode
- ✅ Production build succeeds
- ✅ All optimizations work
- ✅ Static assets load
- ✅ Server-side rendering
- ✅ API routes work
- ✅ Error handling

---

## Advantages Over Vercel

1. **No Rate Limits** - Deploy as much as you want
2. **Full Control** - Test exact production environment
3. **Fast Iteration** - No waiting for Vercel builds
4. **Local Testing** - Test before deploying
5. **Cost Free** - No deployment costs

---

## Next Steps

After testing in Docker:

1. ✅ Verify everything works
2. ✅ Fix any issues found
3. ✅ Wait for Vercel rate limit to reset
4. ✅ Deploy to Vercel when ready

---

**Docker is perfect for testing while waiting for Vercel rate limits to reset!** 🐳

