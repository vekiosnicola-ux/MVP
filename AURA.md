# Aura MVP - Quick Reference

## What is Aura?

**Aura** is a human-in-the-loop AI orchestration platform that manages autonomous agents building software with human oversight and approval gates.

**Current Status**: Building the MVP
**First Project**: Will build Dieta Positiva (wellness coaching SaaS)

---

## The Core Concept

```
Human creates task
     ↓
AI agent proposes solution
     ↓
Human approves or rejects
     ↓
If approved → Agent executes
     ↓
Task complete → Next task
```

**Key Innovation**: Every significant change requires human approval before execution.

---

## Why This Repo Has Dieta Positiva Info

- **Aura** = The builder (orchestration platform)
- **Dieta Positiva** = What gets built (the SaaS app)
- The DP documentation serves as **context** for Aura's agents

Think of it like:
- Aura is the construction company
- Dieta Positiva is the blueprint for the house we're building

---

## Current Focus

**Priority 1**: Build the Agent Workflow System
- Task management (create, assign, approve)
- Agent integration (connect to Claude agents)
- Human approval interface (UI for review/approval)
- Workflow orchestration (multi-step tasks)

See `docs/aura-agent-workflow.md` for complete architecture.

---

## Key Files

| File | Purpose |
|------|---------|
| `AURA.md` | This file - quick reference |
| `docs/aura-agent-workflow.md` | Complete architecture & design |
| `CLAUDE.md` | How Claude Code should work here |
| `DECISIONS.md` | Architectural decision log |
| `README.md` | General project overview |

---

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (Supabase)
- **AI**: Anthropic Claude (via Claude Code)
- **Hosting**: Vercel

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
- Database schema (5 tables)
- Task management API
- Basic workflow engine

### Phase 2: Agent Integration (Week 2)
- Agent communication protocol
- Execute agents via Claude Code Task tool
- Error handling and retries

### Phase 3: Human-in-Loop UI (Week 3)
- Task dashboard
- Approval interface
- Email notifications

### Phase 4: Workflow Orchestration (Week 4)
- Workflow definitions
- Dependency resolution
- Parallel execution

**Total: ~4 weeks to MVP**

---

## Next Steps

1. **Set up Supabase** - Create project & run migrations
2. **Build Task API** - CRUD operations for tasks
3. **Build Approval UI** - Interface for human review
4. **Connect Agents** - Integrate with Claude Code agents
5. **Test End-to-End** - Create task → Agent proposes → Human approves → Executes

---

## Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

---

## Philosophy

**Boring Tech**: Use proven technologies (Next.js, PostgreSQL, TypeScript)
**Minimal**: Build only what's needed right now
**Pragmatic**: Simple solutions over complex architectures
**Fast Feedback**: Ship quickly, iterate, learn

---

## Questions?

- **Full architecture**: Read `docs/aura-agent-workflow.md`
- **Working with Claude Code**: Read `CLAUDE.md`
- **Technical decisions**: Read `DECISIONS.md`

---

**Last Updated**: 2026-01-04
