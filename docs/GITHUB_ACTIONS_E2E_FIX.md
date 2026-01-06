# GitHub Actions E2E Fix - Install Dependencies

**Date**: 2026-01-06  
**Issue**: E2E job failing on "Install dependencies" step

---

## 🐛 Problem

The E2E job was failing with:
```
npm error Missing: terser@5.44.1 from lock file
npm error Missing: merge-stream@2.0.0 from lock file
...
```

**Root Cause**: `package-lock.json` was incomplete or out of sync with `package.json`

---

## ✅ Fix Applied

### 1. Regenerated package-lock.json
```bash
rm package-lock.json
npm install --legacy-peer-deps
```

### 2. Updated CI to use --legacy-peer-deps
```yaml
- name: Install dependencies
  run: npm ci --legacy-peer-deps
```

**Applied to all three jobs**:
- test job
- e2e job  
- build job

---

## 🔍 Why This Works

1. **--legacy-peer-deps**: Resolves peer dependency conflicts that can cause `npm ci` to fail
2. **Complete lock file**: Ensures all transitive dependencies are included
3. **Consistent installs**: `npm ci` with complete lock file ensures reproducible builds

---

## ✅ Expected Result

All three jobs should now:
- ✅ Pass "Install dependencies" step
- ✅ Have all required packages installed
- ✅ Proceed to next steps

---

**The E2E job should now pass the dependency installation step!** ✅

