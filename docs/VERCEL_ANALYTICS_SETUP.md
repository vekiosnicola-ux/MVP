# Vercel Analytics Setup Guide

**Agent**: Quality  
**Status**: Documentation Complete  
**Next**: Implementation

---

## Overview

Vercel Analytics provides performance monitoring and web vitals tracking for the Aura MVP application.

---

## Setup Steps

### 1. Install Package

```bash
npm install @vercel/analytics
```

### 2. Add to App

Update `src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Enable in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings → Analytics
3. Enable Web Analytics
4. (Optional) Enable Speed Insights

### 4. Verify Setup

1. Deploy to Vercel
2. Visit your site
3. Check Vercel dashboard → Analytics
4. Verify data is being collected

---

## Features

### Web Vitals

Tracks:
- **LCP** (Largest Contentful Paint) - < 2.5s target
- **FID** (First Input Delay) - < 100ms target
- **CLS** (Cumulative Layout Shift) - < 0.1 target
- **FCP** (First Contentful Paint) - < 1.8s target
- **TTFB** (Time to First Byte) - < 600ms target

### Custom Events

Track custom events:

```typescript
import { track } from '@vercel/analytics';

// Track task creation
track('task_created', {
  taskType: 'feature',
  source: 'chat'
});

// Track approval
track('plan_approved', {
  taskId: 'task-123',
  planId: 'plan-456'
});
```

---

## Performance Monitoring

### API Route Monitoring

Vercel automatically tracks:
- API route response times
- Error rates
- Request counts

View in: Vercel Dashboard → Analytics → Functions

### Custom Metrics

Add custom performance tracking:

```typescript
// src/app/api/tasks/route.ts
import { track } from '@vercel/analytics';

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // Your code
    const result = await createTask(data);
    
    // Track success
    track('api_task_create', {
      duration: Date.now() - startTime,
      status: 'success'
    });
    
    return NextResponse.json(result);
  } catch (error) {
    // Track error
    track('api_task_create', {
      duration: Date.now() - startTime,
      status: 'error',
      error: error.message
    });
    
    throw error;
  }
}
```

---

## Speed Insights (Optional)

For more detailed performance data:

```bash
npm install @vercel/speed-insights
```

Add to layout:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Cost

- **Free Tier**: Basic analytics included
- **Pro Plan**: Advanced analytics and insights
- **Enterprise**: Custom analytics and SLAs

For MVP, free tier is sufficient.

---

## Best Practices

1. ✅ **Enable on production only** (not needed in dev)
2. ✅ **Track key user actions** (task creation, approvals)
3. ✅ **Monitor API performance** (response times)
4. ✅ **Set up alerts** for performance degradation
5. ✅ **Review weekly** to identify bottlenecks

---

## Next Steps

1. ✅ Documentation complete
2. ⏳ Install @vercel/analytics package
3. ⏳ Add Analytics component to layout
4. ⏳ Enable in Vercel dashboard
5. ⏳ Add custom event tracking
6. ⏳ Verify data collection

---

**Last Updated**: 2025-01-04

