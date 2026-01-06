# Sentry Setup Guide

**Agent**: Quality  
**Status**: Research Complete  
**Next**: Implementation

---

## Overview

Sentry provides error tracking and performance monitoring for the Aura MVP application.

---

## Setup Steps

### 1. Create Sentry Account

1. Go to https://sentry.io/signup/
2. Create account (free tier available)
3. Create new project
4. Select "Next.js" as platform
5. Copy DSN (Data Source Name)

### 2. Install Dependencies

```bash
npm install --save @sentry/nextjs
```

### 3. Initialize Sentry

Run the Sentry wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.mjs`
- Create `.sentryclirc` (optional)

### 4. Configure Environment Variables

Add to `.env.local`:

```bash
SENTRY_DSN=your-dsn-here
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token  # For releases
```

### 5. Update Next.js Config

The wizard should update `next.config.mjs`, but verify it includes:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // Your existing Next.js config
  },
  {
    // Sentry config
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  }
);
```

### 6. Add Error Boundaries

Create error boundary component:

```typescript
// src/components/error-boundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Sentry on client
    if (typeof window !== 'undefined') {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
      });
    }
  }, []);

  return <>{children}</>;
}
```

### 7. Add Error Tracking to API Routes

```typescript
// src/app/api/example/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    // Your code
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
```

---

## Features to Enable

### Error Tracking
- ✅ Automatic error capture
- ✅ Source maps for debugging
- ✅ User context
- ✅ Breadcrumbs

### Performance Monitoring
- ✅ Transaction tracking
- ✅ API route monitoring
- ✅ Page load monitoring

### Alerts
- ✅ Email notifications for errors
- ✅ Slack integration (optional)
- ✅ Custom alert rules

---

## Testing

### Test Error Capture

```typescript
// In any component or API route
import * as Sentry from '@sentry/nextjs';

// Test error
Sentry.captureMessage('Test error from Aura MVP', 'info');
```

### Verify Setup

1. Trigger a test error
2. Check Sentry dashboard
3. Verify error appears with stack trace
4. Verify source maps work (if configured)

---

## Cost

- **Free Tier**: 5,000 errors/month
- **Developer**: $26/month - 50,000 errors/month
- **Team**: $80/month - 200,000 errors/month

For MVP, free tier should be sufficient.

---

## Next Steps

1. ✅ Research complete
2. ⏳ Install Sentry package
3. ⏳ Run Sentry wizard
4. ⏳ Configure environment variables
5. ⏳ Add error boundaries
6. ⏳ Test error capture
7. ⏳ Set up alerts

---

**Last Updated**: 2025-01-04

