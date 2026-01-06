# Deployment Status

**Last Updated**: 2026-01-06

---

## 🚀 Current Deployments

### 1. **Docker (Local Development)** ✅ RUNNING

**Status**: Active and accessible

**URL**: 
- **Main App**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Database Health**: http://localhost:3001/api/db-health

**Container**: `dp-mvp-dev`

**Port Mapping**: `3001:3000` (host:container)

**Features**:
- ✅ Hot reload enabled
- ✅ All environment variables loaded
- ✅ Database connected (Supabase)
- ✅ Sentry configured
- ✅ Full workflow functional

**Start/Stop**:
```bash
# Start
docker-compose up -d app

# Stop
docker-compose down

# View logs
docker-compose logs -f app

# Restart
docker-compose restart app
```

---

### 2. **Vercel (Production)** ⚠️ CONFIGURED

**Status**: Configured but deployment status unknown

**Configuration**:
- **Region**: `iad1` (US East)
- **Framework**: Next.js
- **Auto-deploy**: Only from `main` branch
- **Build Command**: `npm run build`
- **Install Command**: `npm ci`

**Deployment Settings** (`vercel.json`):
- ✅ Only deploys from `main` branch
- ✅ `develop` branch auto-deploy disabled (to avoid rate limits)
- ✅ Security headers configured
- ✅ Production environment variables required

**To Check Deployment Status**:
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Check deployments
vercel ls

# Get project URL
vercel inspect
```

**To Deploy**:
```bash
# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

**Note**: There were rate limit issues earlier. The configuration has been updated to reduce unnecessary deployments.

---

## 📍 Deployment Locations

### Local Development
- **URL**: http://localhost:3001
- **Type**: Docker container
- **Status**: ✅ Running
- **Purpose**: Development and testing

### Production (Vercel)
- **URL**: Check with `vercel ls` or Vercel Dashboard
- **Type**: Vercel serverless
- **Status**: ⚠️ Check deployment status
- **Purpose**: Production deployment

---

## 🔍 How to Check Deployment Status

### Docker (Local)
```bash
# Check if container is running
docker-compose ps

# Check logs
docker-compose logs app

# Test health
curl http://localhost:3001/api/health
```

### Vercel
```bash
# List all deployments
vercel ls

# Get project info
vercel inspect

# Or check Vercel Dashboard
# https://vercel.com/dashboard
```

---

## 🎯 Quick Access

### Local Development
- **App**: http://localhost:3001
- **Health**: http://localhost:3001/api/health
- **DB Health**: http://localhost:3001/api/db-health

### Production (Vercel)
- **Dashboard**: https://vercel.com/dashboard
- **Project URL**: Check Vercel Dashboard or run `vercel ls`

---

## 📝 Environment Variables Required

### For Local (Docker)
- Loaded from `.env.local`
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`

### For Vercel
- Set in Vercel Dashboard → Settings → Environment Variables
- Same variables as local
- Must be set for production deployment

---

## 🚀 Deploy to Vercel

If you need to deploy to Vercel:

1. **Check rate limits**:
   ```bash
   vercel ls
   ```

2. **Deploy manually**:
   ```bash
   vercel --prod
   ```

3. **Or use Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click "Deploy" or wait for auto-deploy from `main` branch

---

## 📊 Summary

| Location | Status | URL | Purpose |
|----------|--------|-----|---------|
| Docker (Local) | ✅ Running | http://localhost:3001 | Development |
| Vercel (Production) | ⚠️ Check status | Check `vercel ls` | Production |

---

**Your app is currently running locally in Docker at http://localhost:3001** 🐳

To check Vercel deployment status, run `vercel ls` or check the Vercel Dashboard.

