# System 3: Multi-Agent Development Team

## Overview

System 3 is your **AI development team** — a collection of specialized agents that handle different aspects of building Dieta Positiva (Systems 1 and 2).

Instead of a single Claude instance doing everything, you now have specialists:
- **Architect** for system design
- **Developer** for writing code
- **Reviewer** for code quality
- **Tester** for validation
- **DevOps** for deployment
- **Database** for schema work

## The Agent Team

| Agent | Role | When to Use |
|-------|------|-------------|
| **architect** | System design, technical decisions | "Design the user profile feature" |
| **developer** | Code implementation | "Implement the login component" |
| **reviewer** | Code review, quality checks | "Review the authentication code" |
| **tester** | Testing, QA, bug finding | "Test the signup flow" |
| **devops** | Deployment, infrastructure | "Deploy to production" |
| **database** | Schema design, migrations | "Create the users table" |

## How It Works

```
You (Virgilio)
      ↓
Main Claude (Orchestrator)
      ↓
Specialized Agents (Do focused work)
      ↓
Results delivered back
```

**Key points**:
- I (main Claude) coordinate the agents
- Each agent has one focused responsibility
- Agents don't communicate directly with each other
- I hand off work between specialists as needed

## How to Use the Agent Team

### Method 1: Ask Me to Coordinate (Recommended)

Just tell me what you want, and I'll coordinate the right agents:

```
You: "I need to add user profiles to the app"

Me: I'll coordinate this for you:
    1. Architect agent will design the feature
    2. Database agent will create the schema
    3. Developer agent will implement it
    4. Tester agent will validate it
    5. Reviewer agent will check quality
```

**This is the easiest way** — I handle the orchestration.

### Method 2: Invoke Agents Directly

You can also invoke specific agents yourself using the `/agents` command or by asking for a specific agent:

```
You: "Use the architect agent to design the notification system"

Me: [Spawns architect agent with your request]
```

### Method 3: Sequential Agent Work

For complex tasks, I'll coordinate multiple agents in sequence:

```
Task: "Build the coaching chat feature"

1. Architect designs the architecture
2. Database creates the schema and migrations
3. Developer implements frontend + backend
4. Tester validates the flow
5. Reviewer checks the code quality
6. DevOps deploys to staging
```

## Example Workflows

### Building a New Feature

```
You: "Add a dashboard to show user statistics"

Workflow:
1. Architect agent → Designs dashboard architecture
2. Database agent → Creates necessary queries/views
3. Developer agent → Builds React components + API
4. Tester agent → Validates functionality
5. Reviewer agent → Reviews code quality
6. DevOps agent → Deploys to production
```

### Fixing a Bug

```
You: "The login form isn't validating emails correctly"

Workflow:
1. Tester agent → Reproduces the bug
2. Developer agent → Fixes the validation logic
3. Tester agent → Validates the fix
4. Reviewer agent → Reviews the change
5. DevOps agent → Deploys fix
```

### Database Changes

```
You: "Add a field to track user timezone"

Workflow:
1. Database agent → Designs schema change + migration
2. Developer agent → Updates code to use new field
3. Tester agent → Tests data migration
4. DevOps agent → Applies migration to production
```

## Agent Locations

All agents are defined in:

```
.claude/
├── agents/
│   ├── architect.md      # System design specialist
│   ├── developer.md      # Code implementation
│   ├── reviewer.md       # Code review
│   ├── tester.md         # Testing & QA
│   ├── devops.md         # Deployment
│   └── database.md       # Database work
├── skills/
│   └── dieta-positiva-context/
│       └── skill.md      # Shared project knowledge
└── settings.json         # Configuration
```

## Shared Knowledge

All agents have access to the **dieta-positiva-context** skill, which provides:
- Project overview (the three systems)
- Core philosophy
- Tech stack
- Solo founder context
- Important file locations

This ensures consistency across all agents.

## Coordination Philosophy

I (main Claude) act as:
- **Tech lead** — Deciding which agent to use
- **Project manager** — Coordinating handoffs
- **Reviewer** — Ensuring work aligns with project goals

You don't need to think about orchestration — just tell me what you want, and I'll coordinate the specialists.

## When to Use Which Agent

### Use Architect When:
- Designing a new feature
- Making technical decisions (which library, which pattern)
- Planning large changes
- Evaluating tradeoffs

### Use Developer When:
- Implementing features
- Writing React components
- Building API routes
- Integrating services

### Use Reviewer When:
- Checking code quality before merge
- Security review
- Ensuring consistency with codebase
- Catching bugs

### Use Tester When:
- Validating features work
- Finding edge cases
- Regression testing
- Performance testing

### Use DevOps When:
- Deploying to production
- Setting up infrastructure
- Configuring environments
- Managing secrets

### Use Database When:
- Designing schemas
- Writing migrations
- Optimizing queries
- Setting up RLS policies

## Communication with Agents

Each agent:
- ✅ Follows the project philosophy (minimal, boring, fast)
- ✅ Reads CLAUDE.md for guidelines
- ✅ Has access to the codebase
- ✅ Produces focused deliverables

Agents are instructed to:
- Be direct and concise (you're a solo founder with limited time)
- Explain tradeoffs
- Ask clarifying questions when needed
- Respect the "minimal and pragmatic" philosophy

## Benefits of the Multi-Agent System

### 1. Specialized Expertise
Each agent is optimized for its domain. The database agent is excellent at schema design, the reviewer is thorough with security checks, etc.

### 2. Consistent Quality
Agents follow defined standards and checklists, ensuring consistent quality across all work.

### 3. Parallel Work (Future)
While currently sequential, the architecture supports parallel work (e.g., developer and database agents working simultaneously).

### 4. Clear Responsibility
Each agent has one job, making debugging and refinement easier.

### 5. Scalability
As your needs grow, you can add more specialist agents without complexity.

## Limitations

- **Agents don't communicate directly** — I coordinate them
- **No recursive agents** — Agents can't spawn other agents
- **Sequential by default** — Work happens in sequence
- **Context isolation** — Each agent has its own context (doesn't see other agents' work unless I share it)

These are design choices for simplicity and control.

## Future Enhancements

Possible additions as the project grows:

- **Documentation agent** — Keeps docs in sync
- **Security agent** — Dedicated security audits
- **Performance agent** — Optimization specialist
- **Content agent** — For System 1 (content generation)
- **Strategy agent** — For System 1 (business strategy)

We'll add these when needed, not prematurely.

## Summary

**For you (Virgilio):**
- Just tell me what you need
- I'll coordinate the right specialists
- You get high-quality work from focused agents
- Faster development, better quality

**For the agents:**
- Each has one clear responsibility
- All follow the project philosophy
- Consistent standards and quality
- Deliverables match your needs

**For the project:**
- System 3 is now a true AI development team
- Ready to accelerate building Systems 1 and 2
- Scalable as needs grow
- Maintains quality while moving fast

---

The AI army is ready. Let's build.
