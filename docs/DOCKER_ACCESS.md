# Docker Access Guide

**Your app is running in Docker!**

---

## ✅ Container Status

- **Status**: Running and healthy ✅
- **Port**: `3001` (mapped from container's port 3000)
- **Health**: Passing all checks

---

## 🌐 Access Your App

**Correct URL:**
```
http://localhost:3001
```

**NOT:**
- ❌ `http://localhost:3000` (this is the container's internal port)
- ❌ `http://127.0.0.1:3000`

---

## 🔍 Verify It's Working

### Check Health Endpoint:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","environment":"development","version":"0.1.0","checks":{"api":true,"env":true,"database":true}}
```

### Check Main Page:
```bash
curl http://localhost:3001
```

Should return HTML content.

---

## 🛠️ If You Can't Access

### 1. Check Container Status
```bash
docker-compose ps
```

Should show:
```
STATUS: Up X minutes (healthy)
PORTS: 0.0.0.0:3001->3000/tcp
```

### 2. Check Logs
```bash
docker-compose logs -f app
```

Look for:
- ✅ "Ready in X seconds"
- ✅ No errors
- ✅ "Compiled" messages

### 3. Restart Container
```bash
docker-compose restart app
```

### 4. Rebuild if Needed
```bash
docker-compose down
docker-compose up --build -d app
```

---

## 📝 Quick Commands

```bash
# View logs
docker-compose logs -f app

# Restart
docker-compose restart app

# Stop
docker-compose down

# Start
docker-compose up -d app

# Check status
docker-compose ps
```

---

## 🎯 Your App URLs

- **Main App**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Sentry Test**: http://localhost:3001/api/test-sentry?type=message
- **Database Health**: http://localhost:3001/api/db-health

---

**The container is running! Access it at http://localhost:3001** 🚀

