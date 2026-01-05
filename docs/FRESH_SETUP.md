# Fresh Instance Setup Guide

Complete setup instructions for deploying Aura MVP on a new machine, server, or container.

---

## Quick Setup (Automated)

**One command to set up everything:**

```bash
git clone https://github.com/vekiosnicola-ux/MVP.git
cd MVP
bash scripts/setup-fresh-instance.sh
```

Then start the dev server:
```bash
npm run dev
```

---

## Manual Setup (Step-by-Step)

If you prefer to run commands individually:

### 1. Clone Repository
```bash
git clone https://github.com/vekiosnicola-ux/MVP.git
cd MVP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cat > .env.local << 'EOF'
NODE_ENV=development

NEXT_PUBLIC_SUPABASE_URL=https://fevouizqcuvahrdtwoif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_eD5SkLCA-MQjCV_UvfdZ7g_uNHxIFTB
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldm91aXpxY3V2YWhyZHR3b2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzUzNTU4MSwiZXhwIjoyMDgzMTExNTgxfQ.Zpoe5FVhWrPlbxlOL9aHcMJQ5ILYrBbig63u37Vqmrc

PORT=3000
EOF
```

### 4. Verify Setup
```bash
# Type check
npm run type-check

# Test build
npm run build

# Verify database (optional)
npx tsx scripts/verify-db.ts
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Application
- Local: http://localhost:3000
- Production: https://dieta-positiva-mvp.vercel.app

---

## Docker Setup (Alternative)

If you prefer Docker:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Create .env.local
RUN echo "NODE_ENV=production" > .env.local && \
    echo "NEXT_PUBLIC_SUPABASE_URL=https://fevouizqcuvahrdtwoif.supabase.co" >> .env.local && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_eD5SkLCA-MQjCV_UvfdZ7g_uNHxIFTB" >> .env.local

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t aura-mvp .
docker run -p 3000:3000 aura-mvp
```

---

## Vercel Deployment

### Via Dashboard
1. Go to https://vercel.com/new
2. Import repository: `vekiosnicola-ux/MVP`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## Troubleshooting

### Port Already in Use
```bash
bash scripts/cleanup-ports.sh
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
npm run type-check
npm run build
```

### Database Connection Issues
```bash
# Verify Supabase is accessible
curl https://fevouizqcuvahrdtwoif.supabase.co/rest/v1/

# Run verification script
npx tsx scripts/verify-db.ts
```

### Internal Server Error
1. Check terminal for error stack trace
2. Verify `.env.local` exists and has correct values
3. Check browser console (F12) for errors
4. Restart dev server

---

## Verification Checklist

After setup, verify these endpoints:

- [ ] Main app loads: http://localhost:3000
- [ ] Health check: http://localhost:3000/api/health
- [ ] Tasks API: http://localhost:3000/api/tasks (returns `[]`)
- [ ] No console errors in browser (F12)
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Build succeeds: `npm run build`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development` or `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | For admin operations |
| `ANTHROPIC_API_KEY` | Future | For AI agent features |
| `PORT` | No | Dev server port (default: 3000) |

---

## Next Steps After Setup

1. **Create your first task** via UI
2. **Explore the dashboard** features
3. **Review architecture** in `docs/architecture.md`
4. **Read development guide** in `CLAUDE.md`
5. **Check decisions log** in `DECISIONS.md`

---

## Support

- Issues: https://github.com/vekiosnicola-ux/MVP/issues
- Documentation: See `docs/` directory
- Architecture: `docs/SETUP_COMPLETE.md`
