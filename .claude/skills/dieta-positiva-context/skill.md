---
name: "dieta-positiva-context"
description: "Core context about Dieta Positiva project for all agents"
---

# Dieta Positiva Context Skill

This skill provides core project context that all agents should understand.

## Project Overview

**Dieta Positiva** is an AI-powered wellness coaching platform built by Virgilio, a solo tech founder, as part of the Aura AI-native incubator.

## The Three Systems

### System 1: DP AI (Internal Assistant)
- **Purpose**: Internal AI assistant for strategy, content, and business operations
- **User**: Virgilio (the founder)
- **Not customer-facing**
- **Function**: Helps run the business, make decisions, create content

### System 2: DP App (Customer Product)
- **Purpose**: Customer-facing wellness coaching SaaS
- **User**: End customers seeking wellness coaching
- **This is what customers pay for**
- **Function**: AI-powered coaching experience

### System 3: Agentic Workflow (Development System)
- **Purpose**: Multi-agent AI development team
- **User**: Supports building Systems 1 and 2
- **This is the system you're part of**
- **Function**: Specialized agents (architect, developer, tester, etc.)

## Core Philosophy

### 1. Invisible Technology
- AI is infrastructure, not interface
- Users shouldn't think "I'm using AI"
- Technology should feel natural and disappear

### 2. Boring Tech Over Novelty
- Use proven, stable technologies
- Avoid bleeding-edge frameworks
- Prefer boring solutions that work

### 3. Minimal and Pragmatic
- **No over-engineering**
- Build only what's needed right now
- Don't add features "just in case"
- Simple solutions > complex architectures

### 4. Speed with Fast Feedback
- Ship quickly and iterate
- Get real user feedback ASAP
- Fast development cycles
- Don't get stuck in planning paralysis

## Tech Stack Reference

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14+ (App Router) | Modern, proven, great DX |
| Language | TypeScript (strict) | Type safety for solo dev |
| Styling | Tailwind CSS | Fast, consistent, utility-first |
| Database | PostgreSQL (Supabase) | Relational + auth + real-time |
| Backend | Next.js API routes | Integrated with frontend |
| AI (System 2) | Cheshire Cat | Conversational AI framework |
| Hosting | Vercel | Seamless Next.js deployment |

## Solo Founder Context

Virgilio is:
- Working solo (no team)
- Building his first major project
- Making both technical and business decisions
- Needs speed, simplicity, and reliability

**Implications for agents**:
- Prefer simple solutions
- Prioritize shipping over perfection
- Provide clear explanations (not just code)
- Respect limited time (be concise)

## Important Files

- **`/home/user/MVP/CLAUDE.md`**: How to work on this project (MUST READ)
- **`/home/user/MVP/DECISIONS.md`**: Architectural decision log
- **`/home/user/MVP/docs/architecture.md`**: Detailed technical architecture
- **`/home/user/MVP/README.md`**: Project overview

## Build Sequence

1. **System 3** (Agentic Workflow) ← We're here now
2. **System 1** (DP AI) ← Next
3. **System 2** (DP App) ← Then this

## Key Reminders

- ✅ Read CLAUDE.md before working
- ✅ Check DECISIONS.md for past choices
- ✅ Follow the philosophy (minimal, boring, fast)
- ✅ Type everything (TypeScript strict mode)
- ❌ Don't over-engineer
- ❌ Don't add features not requested
- ❌ Don't use novel tech when boring works

## When in Doubt

Ask yourself:
1. Is this the simplest solution?
2. Does this align with project philosophy?
3. Am I building for now or hypothetical future?
4. Would I want to maintain this in 6 months?

If unsure, choose simplicity.
