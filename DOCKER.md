# Docker Deployment Guide

This document explains how to run Dieta Positiva MVP using Docker for local development and production deployment.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development without Docker)

## Quick Start (Development)

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

2. **Start development server**:
   ```bash
   npm run docker:dev
   # or
   docker-compose up
   ```

3. **Access the application**:
   - App: http://localhost:3000
   - Health check: http://localhost:3000/api/health

4. **Stop the server**:
   ```bash
   docker-compose down
   ```

## Development Mode

The development Docker setup includes:
- ✅ Hot reload (code changes reflect immediately)
- ✅ Volume mounting (no rebuild needed)
- ✅ Port 3000 exposed
- ✅ Health checks every 30s

### Volume Mounts

```yaml
volumes:
  - .:/app              # Sync source code
  - /app/node_modules   # Preserve container's node_modules
  - /app/.next          # Preserve build cache
```

This allows you to edit code on your host machine and see changes immediately in the container.

## Production Build

### Build production image:
```bash
npm run docker:build
# or
docker build -f .docker/Dockerfile.prod -t dp-mvp:latest .
```

### Run production container:
```bash
docker run -p 3000:3000 --env-file .env.local dp-mvp:latest
```

### Multi-stage build optimization:
- **Stage 1 (deps)**: Install production dependencies only
- **Stage 2 (builder)**: Build Next.js application
- **Stage 3 (runner)**: Minimal runtime image (~150MB)

## Vercel Deployment

While Docker is great for local development, **Vercel is recommended for production** due to:
- Automatic CDN and edge caching
- Serverless function optimization
- Zero-config deployment
- Better Next.js integration

### Deploy to Vercel:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link project:
   ```bash
   vercel link
   ```

3. Add environment variables via Vercel dashboard or CLI:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

## Docker vs Vercel Comparison

| Feature | Docker (Local) | Vercel (Production) |
|---------|---------------|---------------------|
| Hot reload | ✅ Yes | ✅ Yes (dev mode) |
| CDN | ❌ No | ✅ Global CDN |
| Serverless | ❌ No | ✅ Auto-scaling |
| Cost | Free | Free tier available |
| Setup | Manual | One command |
| Best for | Development | Production |

## Troubleshooting

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000
# or
netstat -tuln | grep 3000

# Kill the process or use different port
PORT=3001 docker-compose up
```

### Volume permissions issues
```bash
# Reset permissions
docker-compose down -v
docker-compose up --build
```

### Hot reload not working
```bash
# Enable polling in .env.local
WATCHPACK_POLLING=true
```

### Build failures
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

## Health Checks

Both dev and prod containers include health checks:
- **Endpoint**: `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

Check container health:
```bash
docker ps
# Look for "healthy" status
```

## Security Notes

1. **Never commit `.env.local`** - it contains sensitive API keys
2. **Production image runs as non-root user** (nextjs:1001)
3. **Security headers** configured in `next.config.mjs`
4. **Multi-stage build** prevents dev dependencies in production
5. **Health check endpoint** validates environment without exposing secrets

## Next Steps

- [ ] Set up CI/CD pipeline
- [ ] Add Supabase local development to docker-compose
- [ ] Configure staging environment
- [ ] Set up monitoring and logging
