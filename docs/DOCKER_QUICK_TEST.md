# Quick Docker Test

**Test your app in Docker right now!**

---

## 🚀 Start Development Server

```bash
# Start Docker development server
npm run docker:dev
```

**Or:**
```bash
docker-compose up
```

**Wait for:**
```
✓ Ready in X seconds
```

**Then visit:**
- App: http://localhost:3001
- Health: http://localhost:3001/api/health

---

## ✅ Test Checklist

Once the server is running:

- [ ] Visit http://localhost:3001
- [ ] Check health endpoint: http://localhost:3001/api/health
- [ ] Test Sentry: http://localhost:3001/api/test-sentry?type=message
- [ ] Test database: http://localhost:3001/api/db-health
- [ ] Navigate through the app
- [ ] Check browser console for errors

---

## 🛑 Stop Server

```bash
# Press Ctrl+C in the terminal
# Or in another terminal:
docker-compose down
```

---

## 🏗️ Test Production Build

```bash
# Build production image
npm run docker:build

# Run production container
docker run -p 3000:3000 --env-file .env.local dp-mvp
```

**Visit:** http://localhost:3000

---

**That's it! Test everything in Docker while waiting for Vercel rate limits to reset.** 🐳

