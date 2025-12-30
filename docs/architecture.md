# Architecture Documentation

## Overview

Dieta Positiva is built as **three independent but interconnected systems**, each serving a distinct purpose. This document provides detailed technical architecture for all three systems.

---

## The Three-System Model

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              System 3: Agentic Workflow         │
│         (Claude Code + Development Tools)       │
│                                                 │
│  Builds and maintains ↓                         │
└─────────────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌──────────────────────┐    ┌──────────────────────┐
│   System 1: DP AI    │    │  System 2: DP App    │
│  (Internal Tools)    │    │  (Customer Product)  │
│                      │    │                      │
│  For: Founder        │    │  For: Customers      │
│  Use: Business ops   │    │  Use: Wellness       │
└──────────────────────┘    └──────────────────────┘
```

### System 1: DP AI (Internal Assistant)

**Purpose**: Help Virgilio run the business effectively

**Key Functions**:
- Business strategy and decision support
- Content generation (marketing, docs, emails)
- Data analysis and insights
- Research and competitor analysis
- Planning and roadmapping

**Technology** (TBD):
- May use Claude API directly
- Custom prompts and tools
- Integration with business data
- Possibly a simple web interface

**Status**: Not yet built

---

### System 2: DP App (Customer-Facing Product)

**Purpose**: AI-powered wellness coaching for end users

**Key Functions**:
- Personalized nutrition guidance
- Fitness coaching and tracking
- Wellness check-ins
- Progress tracking
- Habit formation support

**Technology**:
- Next.js frontend (App Router)
- Supabase for database and auth
- Cheshire Cat for conversational AI
- Vercel hosting

**Status**: Not yet built

---

### System 3: Agentic Workflow (Development System)

**Purpose**: Accelerate development of Systems 1 and 2

**Key Functions**:
- Code generation and refactoring
- Documentation maintenance
- Testing and debugging
- Architectural guidance
- Task automation

**Technology**:
- Claude Code (this)
- Git workflow
- Automated testing (when implemented)
- CI/CD pipelines (future)

**Status**: In active use (you're using it now)

---

## System 2 (DP App) — Detailed Architecture

This is the main customer-facing product. Below is the detailed technical architecture.

### Frontend Architecture

#### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React Context + hooks (start simple)
- **Forms**: React Hook Form
- **Data Fetching**: React Server Components + Supabase client

#### Directory Structure
```
system2/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth-protected routes
│   │   ├── dashboard/       # User dashboard
│   │   ├── coaching/        # Coaching interface
│   │   └── profile/         # User profile
│   ├── (public)/            # Public routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── landing/
│   ├── api/                 # API routes
│   │   ├── chat/            # Cheshire Cat integration
│   │   ├── user/            # User operations
│   │   └── webhooks/        # External webhooks
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── ui/                  # Base UI components
│   ├── coaching/            # Coaching-specific
│   └── shared/              # Shared components
├── lib/                     # Utilities
│   ├── supabase/            # Supabase client
│   ├── cheshire/            # Cheshire Cat client
│   └── utils/               # Helper functions
├── types/                   # TypeScript types
├── public/                  # Static assets
└── styles/                  # Global styles
```

### Backend Architecture

#### Database (Supabase/PostgreSQL)

**Core Tables** (initial schema):

```sql
-- Users (extended from Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- User profiles
profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  age INTEGER,
  goals TEXT[],
  dietary_preferences TEXT[],
  activity_level TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Coaching sessions
coaching_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  session_type TEXT, -- 'nutrition', 'fitness', 'wellness'
  created_at TIMESTAMP
)

-- Messages (chat history)
messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES coaching_sessions(id),
  role TEXT, -- 'user' or 'assistant'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP
)

-- User progress tracking
progress_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entry_type TEXT, -- 'weight', 'measurement', 'mood', etc.
  value JSONB,
  recorded_at TIMESTAMP,
  created_at TIMESTAMP
)
```

**Row Level Security (RLS)**:
- Users can only access their own data
- Coaches (future) can access assigned users
- Admin role for System 1 integration

#### AI Integration (Cheshire Cat)

**Architecture**:
```
User ─→ Next.js API Route ─→ Cheshire Cat ─→ LLM Provider
                                    │
                                    ↓
                              Vector Memory
                              (User context)
```

**Key Features**:
- Conversation memory per user
- Plugin system for custom coaching logic
- RAG (Retrieval Augmented Generation) for knowledge base
- Custom prompts for coaching personality

**Configuration**:
- Hosted Cheshire Cat instance (or self-hosted)
- User-specific memory collections
- Custom plugins for wellness domain knowledge
- Integration with Supabase for data persistence

### Authentication & Authorization

**Strategy**: Supabase Auth

**Flow**:
1. User signs up/logs in via Supabase Auth
2. JWT token stored in httpOnly cookie
3. Next.js middleware checks auth on protected routes
4. RLS policies enforce data access in database

**Providers** (initial):
- Email/password
- Magic link (passwordless)
- Google OAuth (future)

### API Design

**Endpoints** (Next.js API routes):

```
POST /api/auth/signup          # Create account
POST /api/auth/login           # Login
POST /api/auth/logout          # Logout

GET  /api/user/profile         # Get user profile
PUT  /api/user/profile         # Update profile

POST /api/coaching/session     # Start coaching session
GET  /api/coaching/session/:id # Get session details
POST /api/coaching/message     # Send message to AI

POST /api/progress             # Log progress entry
GET  /api/progress             # Get progress history
```

**Response Format**:
```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}
```

### Deployment Architecture

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│   Vercel CDN         │ ← Static assets, edge functions
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│   Next.js App        │ ← Server-side rendering
│   (Vercel)           │
└──────┬───────────────┘
       │
       ├─→ Supabase (Database + Auth)
       └─→ Cheshire Cat (AI Chatbot)
```

**Environments**:
- **Development**: Local (localhost:3000)
- **Staging**: Vercel preview deployments
- **Production**: Vercel production (custom domain)

---

## System 1 (DP AI) — Planned Architecture

**Status**: Not yet designed

**Likely Approach**:
- Custom Claude integration (API)
- Simple web interface or CLI
- Access to business data from Supabase
- Separate from customer-facing app
- May share database but different tables/RLS policies

**To be designed when we start building System 1.**

---

## System 3 (Agentic Workflow) — Current Architecture

**Status**: Active (you're using it)

**Components**:
- **Claude Code**: Primary development agent
- **Git**: Version control
- **CLAUDE.md**: Instructions for Claude
- **DECISIONS.md**: Decision tracking
- **TODO lists**: Task management
- **Documentation**: This file and others

**Workflow**:
1. Virgilio requests feature/fix
2. Claude reads context (CLAUDE.md, code)
3. Claude plans and implements
4. Claude commits and pushes
5. Virgilio reviews and provides feedback
6. Repeat

---

## Data Flow Diagrams

### User Onboarding Flow
```
User → Signup → Email Verification → Profile Setup → Dashboard
                                            ↓
                                    (Store in Supabase)
```

### Coaching Session Flow
```
User → Start Session → Chat with AI → AI Response → User Reply → ...
         ↓                   ↓              ↑
    (Create in DB)    (Send to Cheshire) (Return to user)
                           ↓
                    (Store in memory + DB)
```

### Progress Tracking Flow
```
User → Log Progress → Validate → Store in DB → Update Dashboard
                         ↓
                   (Type-safe schema)
```

---

## Security Considerations

### Authentication
- ✅ JWT tokens with short expiry
- ✅ httpOnly cookies (prevent XSS)
- ✅ Supabase Auth (battle-tested)
- 🔄 Rate limiting on auth endpoints (future)

### Data Access
- ✅ Row Level Security (RLS) in Supabase
- ✅ API routes validate user identity
- ✅ No direct database access from client
- 🔄 Input validation and sanitization (implement)

### AI Safety
- ✅ User conversations isolated by user ID
- 🔄 Content filtering for inappropriate requests
- 🔄 Rate limiting on AI endpoints
- 🔄 Monitoring for abuse

### Infrastructure
- ✅ HTTPS everywhere (Vercel default)
- ✅ Environment variables for secrets
- 🔄 Regular dependency updates
- 🔄 Security headers (CSP, etc.)

**Legend**: ✅ = Included by default, 🔄 = Need to implement

---

## Performance Considerations

### Frontend
- Server Components for initial render (faster TTI)
- Code splitting by route (automatic with Next.js)
- Image optimization (next/image)
- Lazy loading for heavy components
- Tailwind purging (smaller CSS bundle)

### Backend
- Database indexing on frequent queries
- Caching where appropriate (React Cache, Redis future)
- Streaming responses for AI (better UX)
- Connection pooling (Supabase handles this)

### Monitoring (Future)
- Vercel Analytics for performance
- Sentry for error tracking (when needed)
- Custom metrics for AI response times

---

## Scalability Strategy

**Start Small, Scale Later**:

1. **Phase 1 (Now)**: Single region, basic setup
   - Vercel + Supabase free/hobby tiers
   - Single Cheshire Cat instance
   - Manual monitoring

2. **Phase 2 (Growing)**: Optimize bottlenecks
   - Identify slow queries → add indexes
   - Add caching layer if needed
   - Scale Cheshire Cat horizontally

3. **Phase 3 (Scale)**: Multi-region if needed
   - CDN already global (Vercel)
   - Supabase multi-region (if user base demands)
   - Consider self-hosted Cheshire Cat for control

**Principle**: Don't optimize prematurely. Measure first, then fix actual bottlenecks.

---

## Development Principles

### 1. Start Simple
- Build minimum viable version first
- Add complexity only when needed
- Three similar things before abstracting

### 2. Type Everything
- TypeScript strict mode
- No `any` types
- Shared types between frontend/backend

### 3. Test What Matters
- Test user flows, not implementation details
- Integration tests > unit tests
- Manual testing is fine initially

### 4. Document Decisions
- Update DECISIONS.md for architectural choices
- Code comments for "why", not "what"
- Keep this architecture doc updated

---

## Future Considerations

### Features (Not Now)
- Multi-language support
- Mobile app (React Native?)
- Wearable device integration
- Social features (community)
- Marketplace for coaches

### Technical (Not Now)
- Microservices (if monolith becomes unwieldy)
- GraphQL (if REST becomes painful)
- Real-time collaborative features
- Advanced analytics and ML models

**Philosophy**: Build these when customers demand them, not because they're cool.

---

## Questions & Decisions Needed

- [ ] Cheshire Cat hosting: Self-hosted or managed?
- [ ] LLM provider for Cheshire Cat: OpenAI, Anthropic, or open-source?
- [ ] Payment processing: Stripe? (when monetizing)
- [ ] Email service: Resend, SendGrid, or Supabase built-in?
- [ ] File storage: Supabase Storage or S3?

These will be decided as we implement features.

---

## Revision History

- **2025-12-30**: Initial architecture document created
- Updates will be logged here as architecture evolves
