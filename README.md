# Dieta Positiva

> AI-powered wellness coaching platform — part of the Aura ecosystem

**Status**: 🚧 In Development (Initial Setup Phase)

## What is Dieta Positiva?

Dieta Positiva is an AI-native wellness coaching platform that provides personalized guidance for nutrition, fitness, and overall wellbeing. Built with invisible technology and pragmatic design, it focuses on outcomes rather than gimmicks.

## Project Architecture

This repository contains **three distinct systems**:

### System 1: DP AI (Internal)
Internal AI assistant for business strategy, content generation, and decision-making. This helps the founder run the business effectively.

**Not customer-facing.**

### System 2: DP App (Customer-Facing)
The actual SaaS product that customers use. AI-powered wellness coaching delivered through a clean, simple interface.

**This is what customers pay for.**

### System 3: Agentic Workflow (Development)
Claude Code-powered development workflow that builds Systems 1 and 2. This is the meta-system that accelerates development.

**This is how we build the other two.**

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js (App Router) | Modern, boring tech with great DX |
| Language | TypeScript | Type safety for solo development |
| Styling | Tailwind CSS | Fast, consistent, utility-first |
| Database | PostgreSQL (Supabase) | Relational DB + auth + real-time |
| AI (System 2) | Cheshire Cat | Conversational AI framework |
| Hosting | Vercel | Seamless Next.js deployment |

## Philosophy

### 1. Invisible Technology
AI is infrastructure, not interface. Users shouldn't think "I'm using AI" — they should just get results.

### 2. Boring Tech Over Novelty
Use proven, stable technologies. Avoid bleeding-edge frameworks. Prefer boring solutions that work.

### 3. Minimal and Pragmatic
No over-engineering. Build only what's needed. Simple solutions over complex architectures.

### 4. Speed with Fast Feedback
Ship quickly and iterate. Get real user feedback ASAP. Fast development cycles.

## Project Structure

```
/
├── CLAUDE.md          # Instructions for Claude Code
├── DECISIONS.md       # Architectural decision log
├── README.md          # This file
├── docs/
│   └── architecture.md # Detailed technical architecture
├── system1/           # DP AI (Internal assistant) - Coming soon
├── system2/           # DP App (Customer product) - Coming soon
└── system3/           # Agentic workflow configs
```

## Development Workflow

1. **System 3** (Agentic Workflow) is set up first — you're reading the results of that now
2. **System 1** (DP AI) will be built next — internal tools for running the business
3. **System 2** (DP App) will be built last — using insights from System 1

## Getting Started

*Coming soon — project is in initial setup phase*

## Security & Configuration

### API Keys
Copy `.env.example` to `.env` and fill in your keys.

- **System Keys** (`SUPABASE_*`): Belong to the project infrastructure. Shared across the team/environment.
- **User Keys** (`ANTHROPIC_API_KEY`, `GROQ_API_KEY`): Belong to YOU. Do not commit these.

### Dangerous Modes
By default, the agent runs in `EXECUTION_MODE="mock"`.
- **Mock Mode**: Safe. Simulates actions.
- **Real Mode**: **DANGER**. The agent can edit files and run shell commands. Ensure you have git committed your work before running in this mode.

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — How Claude Code works on this project
- **[DECISIONS.md](./DECISIONS.md)** — Why we made key technical choices
- **[docs/architecture.md](./docs/architecture.md)** — Detailed system architecture
- **[docs/TESTING_ITERATION_PLAN.md](./docs/TESTING_ITERATION_PLAN.md)** — Comprehensive testing and iteration strategy
- **[docs/TESTING.md](./docs/TESTING.md)** — Testing strategy and guidelines
- **[docs/TESTING_QUICK_REFERENCE.md](./docs/TESTING_QUICK_REFERENCE.md)** — Quick reference for daily testing work

## Building Dieta Positiva

This is a **solo founder project** built by Virgilio as part of Aura, an AI-native incubator.

### What makes this different?

- **AI-first, not AI-added**: Built from the ground up with AI in mind
- **Outcome-focused**: Technology should be invisible to users
- **Pragmatically minimal**: Only build what's actually needed
- **Fast iteration**: Ship, learn, improve

## Project Status

- [x] Initial repository setup
- [x] Core documentation (CLAUDE.md, DECISIONS.md)
- [x] Tech stack decisions
- [ ] System 1: DP AI (Internal assistant)
- [ ] System 2: DP App (Customer product)
- [ ] User testing and feedback
- [ ] Public launch

## License

*To be determined*

## Contact

Built by Virgilio as part of [Aura](https://github.com/yourusername/aura) — an AI-native incubator.

---

**Note**: This project is in active development. Documentation and structure will evolve as we build.
