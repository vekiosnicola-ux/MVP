# Architectural Decision Log

## About This Document

This file tracks important architectural and technical decisions made during the development of Dieta Positiva. Each decision includes context, options considered, and rationale.

**Format:**
```
## [Date] - Decision Title

**Context**: Why did this decision need to be made?
**Options Considered**:
1. Option A - pros and cons
2. Option B - pros and cons

**Decision**: What we chose
**Rationale**: Why we chose it
**Consequences**: What this means going forward
```

---

## 2025-12-30 - Three-System Architecture

**Context**: Building an AI-powered wellness coaching platform requires both internal tools (for the founder) and customer-facing products. We needed a clear architecture to separate concerns.

**Options Considered**:
1. **Single monolithic system** - One app with admin/user modes
   - ✅ Simpler to deploy
   - ❌ Conflates internal and customer needs
   - ❌ Harder to iterate on different audiences

2. **Two separate systems** - Internal AI + Customer App
   - ✅ Clear separation of concerns
   - ❌ Doesn't account for the development workflow

3. **Three-system architecture** - DP AI + DP App + Agentic Workflow
   - ✅ Clear separation: internal, customer, and development
   - ✅ Each system can evolve independently
   - ✅ Makes the meta-system (Claude Code) explicit
   - ❌ More systems to manage

**Decision**: Three-system architecture (DP AI, DP App, Agentic Workflow)

**Rationale**:
- System 1 (DP AI) helps the founder run the business
- System 2 (DP App) serves customers
- System 3 (this) builds the other two
- Making the development workflow (System 3) explicit allows us to optimize it
- Clear boundaries prevent feature creep and scope confusion

**Consequences**:
- All future features must be categorized as System 1 or System 2
- Development process is treated as a first-class system
- We build in sequence: System 3 → System 1 → System 2

---

## 2025-12-30 - Next.js with App Router

**Context**: Need a frontend framework for System 2 (DP App)

**Options Considered**:
1. **Create React App** - Simple React setup
   - ✅ Very simple
   - ❌ Deprecated, no longer maintained
   - ❌ No built-in routing or SSR

2. **Vite + React** - Modern build tool
   - ✅ Fast development
   - ❌ Need to add routing, SSR manually
   - ❌ More configuration needed

3. **Next.js (Pages Router)** - Established Next.js pattern
   - ✅ Proven and stable
   - ❌ Being superseded by App Router

4. **Next.js (App Router)** - Modern Next.js with React Server Components
   - ✅ Modern, actively developed
   - ✅ Built-in routing, SSR, API routes
   - ✅ Great Vercel integration
   - ✅ Server components for better performance
   - ❌ Newer, still some edge cases

**Decision**: Next.js with App Router

**Rationale**:
- Aligns with "boring tech" philosophy (Next.js is industry standard)
- Built-in features (routing, API routes, SSR) reduce boilerplate
- App Router is the future of Next.js, better to start there
- Excellent Vercel deployment story
- Large community and ecosystem

**Consequences**:
- Use App Router patterns (app directory, not pages)
- Can use React Server Components where appropriate
- API routes in app/api directory
- Deploy to Vercel for production

---

## 2025-12-30 - TypeScript Over JavaScript

**Context**: Choose between JavaScript and TypeScript for type safety

**Options Considered**:
1. **JavaScript** - No types
   - ✅ Faster to write initially
   - ❌ Harder to refactor
   - ❌ More runtime errors

2. **TypeScript** - Static typing
   - ✅ Catch errors at compile time
   - ✅ Better IDE support
   - ✅ Easier refactoring
   - ✅ Self-documenting code
   - ❌ Slightly more boilerplate

**Decision**: TypeScript with strict mode

**Rationale**:
- Solo founder benefits from type safety (no team to catch errors)
- Better long-term maintainability
- TypeScript is now the standard for new projects
- Prevents entire classes of bugs before runtime

**Consequences**:
- All new files use .ts or .tsx extensions
- Enable strict mode in tsconfig.json
- Type all function parameters and returns
- No 'any' types unless absolutely necessary

---

## 2025-12-30 - Supabase for Database

**Context**: Need a PostgreSQL database with auth and real-time capabilities

**Options Considered**:
1. **Self-hosted PostgreSQL** - Direct database
   - ✅ Full control
   - ❌ Need to manage infrastructure
   - ❌ Need to build auth separately

2. **Firebase** - Google's BaaS
   - ✅ Easy to use
   - ❌ NoSQL (less structured)
   - ❌ Vendor lock-in concerns

3. **Supabase** - Open source Firebase alternative
   - ✅ PostgreSQL (proper relational DB)
   - ✅ Built-in auth
   - ✅ Real-time subscriptions
   - ✅ Open source (can self-host later)
   - ✅ Great free tier
   - ❌ Smaller than Firebase

**Decision**: Supabase

**Rationale**:
- PostgreSQL is battle-tested and flexible
- Built-in auth saves development time
- Real-time capabilities useful for coaching features
- Can start with hosted version, self-host later if needed
- Aligns with "boring tech" (PostgreSQL) while adding modern conveniences

**Consequences**:
- Use Supabase client library for database access
- Use Supabase Auth for user authentication
- Schema migrations via Supabase CLI or SQL editor
- Can leverage Row Level Security (RLS) for data access

---

## 2025-12-30 - Cheshire Cat for System 2 Chatbot

**Context**: Need AI chatbot functionality for customer-facing wellness coaching (System 2)

**Options Considered**:
1. **Custom LLM integration** - Build from scratch
   - ✅ Full control
   - ❌ Lots of work (conversation memory, context, etc.)
   - ❌ Need to handle prompt engineering

2. **Cheshire Cat** - AI chatbot framework
   - ✅ Purpose-built for conversational AI
   - ✅ Handles memory, context, plugins
   - ✅ Can customize and extend
   - ❌ Another dependency to learn

**Decision**: Cheshire Cat for System 2

**Rationale**:
- Avoid reinventing conversation management
- Focus on coaching logic, not infrastructure
- Can integrate with various LLM providers
- Aligns with "invisible technology" — framework handles complexity

**Consequences**:
- Use Cheshire Cat for customer-facing chatbot (System 2)
- May use different approach for System 1 (internal AI)
- Need to learn Cheshire Cat plugin system
- Chatbot personality and behavior configured in Cheshire Cat

---

## 2025-12-30 - Tailwind CSS for Styling

**Context**: Need a styling solution for UI development

**Options Considered**:
1. **Plain CSS** - Traditional stylesheets
   - ✅ No dependencies
   - ❌ Harder to maintain consistency
   - ❌ No design system built-in

2. **CSS Modules** - Scoped CSS
   - ✅ Scoped styles
   - ❌ Still need to write all CSS manually

3. **Styled Components** - CSS-in-JS
   - ✅ Component-scoped styles
   - ❌ Runtime overhead
   - ❌ More JavaScript in bundle

4. **Tailwind CSS** - Utility-first CSS
   - ✅ Fast to write
   - ✅ Consistent design system
   - ✅ Smaller bundle (purges unused)
   - ✅ No naming conventions needed
   - ❌ Verbose className strings

**Decision**: Tailwind CSS

**Rationale**:
- Speed of development (no context switching between files)
- Built-in design system prevents inconsistent spacing/colors
- Small bundle size with purging
- Industry standard, lots of components/templates available
- Works well with Next.js

**Consequences**:
- Use Tailwind utility classes in components
- Configure design tokens in tailwind.config.js
- May use @apply for repeated patterns (sparingly)
- Install Tailwind Prettier plugin for class sorting

---

## Template for Future Decisions

When making new architectural decisions, copy this template:

```markdown
## [Date] - Decision Title

**Context**: [Why does this decision need to be made?]

**Options Considered**:
1. Option A
   - ✅ Pro
   - ❌ Con
2. Option B
   - ✅ Pro
   - ❌ Con

**Decision**: [What we chose]

**Rationale**: [Why we chose it]

**Consequences**: [What this means going forward]
```

---

## Decision Review

We should review major decisions when:
- Starting a new major feature
- Hitting limitations of current choices
- After significant user feedback
- Every 3-6 months during active development
