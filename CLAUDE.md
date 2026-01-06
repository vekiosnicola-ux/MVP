# CLAUDE.md

## Project Context

You are working on **Dieta Positiva**, an AI-powered wellness coaching platform being built by Virgilio, a solo tech founder. This is part of a larger system called Aura (an AI-native incubator).

## The Three Systems

This project involves three distinct systems:

### System 1: DP AI (Internal AI Assistant)
- **Purpose**: Internal AI assistant for strategy, content generation, and reasoning
- **User**: Virgilio (the founder)
- **Function**: Helps run the business, make decisions, create content
- **Not customer-facing**

### System 2: DP App (User-Facing SaaS)
- **Purpose**: Customer-facing wellness coaching application
- **User**: End customers seeking wellness coaching
- **Function**: AI-powered coaching experience
- **This is the product customers pay for**

### System 3: Agentic Workflow (This)
- **Purpose**: Claude Code helping build Systems 1 and 2
- **Function**: Development assistant, codebase maintainer
- **This is the meta-system that builds the others**

## Build Sequence

1. **First**: Set up System 3 (this workflow)
2. **Second**: Build System 1 (DP AI)
3. **Third**: Build System 2 (DP App) using insights from System 1

## Tech Stack

### Frontend
- **Next.js** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vercel** for hosting

### Backend & Database
- **PostgreSQL** via Supabase
- Next.js API routes

### AI Infrastructure
- **Cheshire Cat** for chatbot functionality (System 2)
- Other AI tooling as needed for System 1

## Project Philosophy

### 1. Invisible Technology
- AI is infrastructure, not interface
- Users shouldn't think "I'm using AI" — they should just get results
- Technology should feel natural and disappear into the experience

### 2. Boring Tech Over Novelty
- Use proven, stable technologies
- Avoid bleeding-edge frameworks and tools
- Prefer boring solutions that work over exciting ones that might break

### 3. Minimal and Pragmatic
- **No over-engineering**
- Build only what's needed right now
- Don't add features "just in case"
- Simple solutions > complex architectures
- Keep the codebase small and understandable

### 4. Speed with Fast Feedback
- Ship quickly and iterate
- Get real user feedback as soon as possible
- Fast development cycles
- Don't get stuck in planning paralysis

## How to Work on This Project

### Before Writing Code
1. **Read existing code first** — Never propose changes without understanding current implementation
2. **Check DECISIONS.md** — See what architectural choices have already been made
3. **Follow the philosophy** — Minimal, boring, pragmatic

### When Building Features
1. **Start simple** — Minimum viable implementation first
2. **Avoid abstraction** — Don't create abstractions until you have 3+ similar use cases
3. **No premature optimization** — Make it work, then make it fast if needed
4. **Document decisions** — Add to DECISIONS.md when making architectural choices

### Code Style
1. **TypeScript strict mode** — Type everything properly
2. **Functional components** — Use React hooks, avoid class components
3. **Colocate related code** — Keep components, styles, and tests together
4. **Self-documenting code** — Prefer clear names over comments
5. **Comments only for "why"** — Code shows "what", comments explain "why"

### What NOT to Do
- ❌ Don't add features that weren't requested
- ❌ Don't refactor working code unless asked
- ❌ Don't add error handling for impossible scenarios
- ❌ Don't create utilities for one-time operations
- ❌ Don't design for hypothetical future requirements
- ❌ Don't add dependencies without strong justification
- ❌ Don't use complex patterns when simple ones work

### Git Workflow
- Work on feature branches (usually starting with `claude/`)
- Clear, descriptive commit messages
- Push to the designated branch when complete
- Create PRs for review when requested

## Solo Founder Context

Remember that Virgilio is:
- Working solo (no team to delegate to)
- Building his first major project
- Making technical and business decisions simultaneously
- Needs clear explanations, not just code

### Communication Style
- **Be direct and concise** — Respect limited time
- **Explain tradeoffs** — Help with decision-making
- **Ask clarifying questions** — When requirements are unclear
- **Show progress** — Use todo lists to track work
- **No fluff** — Skip unnecessary pleasantries

## Current Status

This project is in **initial setup phase**. We're creating foundational documentation and structure before building the actual applications.

## Important Files

- **CLAUDE.md** (this file) — How to work on this project
- **DECISIONS.md** — Architectural decision log
- **README.md** — Project overview for external readers
- **docs/architecture.md** — Detailed technical architecture
- **docs/agent-workflows.md** — Meta-prompts for agentic workflows

## Questions to Ask

When unclear about requirements, consider asking:
- "Is this for System 1 (internal) or System 2 (customer-facing)?"
- "Should this be minimal now, or are you planning to extend it soon?"
- "What's the simplest version that would work?"
- "Do you have a preference between [Option A] and [Option B]?"

## Remember

You are System 3 — the agentic workflow helping Virgilio build Systems 1 and 2. Your job is to accelerate development while maintaining quality and simplicity. When in doubt, choose the simpler option and ask for clarification.
