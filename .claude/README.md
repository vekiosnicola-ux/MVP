# Claude Code Configuration

This directory contains the Claude Code multi-agent setup for the Dieta Positiva project.

## Directory Structure

```
.claude/
├── README.md              # This file
├── settings.json          # Shared settings (git-tracked)
├── settings.local.json    # Machine-specific permissions (git-ignored)
├── agents/                # Agent role definitions
│   ├── coordinator.md     # Opus 4.5 coordinator (model selection)
│   ├── architect.md       # System design specialist
│   ├── developer.md       # Code implementation
│   ├── database.md        # Database specialist
│   ├── devops.md          # Deployment specialist
│   ├── reviewer.md        # Code review
│   └── tester.md          # Testing specialist
└── skills/                # Reusable skills
    ├── dieta-positiva-context/  # Project context for all agents
    ├── run-test-suite/          # Test runner with summary
    ├── verify-setup/            # Setup verification checklist
    ├── simplify/                # Over-engineering detector
    ├── pr-preflight/            # PR readiness checks
    └── dead-code/               # Unused code detector
```

## Setup for New Environments

1. **Clone the repository** - The `.claude/` directory is tracked in git
2. **Run verification** - `npm run claude:verify` to check setup
3. **Configure local permissions** - Accept permission prompts as needed

The `settings.local.json` file is machine-specific and git-ignored. It stores permission approvals for your local environment.

## Configuration Files

### settings.json (Shared)

Contains:
- **Permissions**: Pre-approved tool allowances
- **Hooks**: SubagentStop hook for completion verification
- **Subagent instructions**: Default instructions all agents receive

### settings.local.json (Local)

Contains machine-specific permission approvals. This file is:
- Generated automatically by Claude Code
- Git-ignored to avoid conflicts
- Safe to delete (will be regenerated)

## Agent Model Selection

The coordinator (`agents/coordinator.md`) defines when to use each model:

| Model | Use Case | Cost |
|-------|----------|------|
| **Opus 4.5** | Architecture, coordination, complex reasoning | High |
| **Sonnet** | Implementation, testing, refactoring | Medium |
| **Haiku** | Scripts, configs, simple edits | Low |

## Skills

Skills are invoked with `/skill-name` in the CLI:

### Core Skills
- `/dieta-positiva-context` - Load project context
- `/run-test-suite` - Run tests with formatted summary
- `/verify-setup` - Check Claude Code configuration

### Quality Skills
- `/simplify` - Analyze code for over-engineering and complexity
- `/pr-preflight` - Run checks before creating a PR (git hygiene, types, lint, tests)
- `/dead-code` - Detect unused exports, orphaned files, commented code

## MCP Servers

MCP (Model Context Protocol) servers extend Claude Code with external capabilities.

### Configured Servers

| Server | Transport | Purpose |
|--------|-----------|---------|
| **context7** | stdio | Up-to-date library documentation (Next.js, React, Supabase) |
| **github** | stdio | GitHub API access (issues, PRs, code search) |
| **puppeteer** | stdio | Browser automation and visual testing |
| **memory** | stdio | Persistent memory across sessions |
| **supabase** | http | Direct database access, schema inspection |

### Setup for New Environments

MCP servers are stored in `~/.claude.json` (user-level), not in the repo. To configure on a new machine:

```bash
# Context7 (no auth)
claude mcp add context7 --transport stdio -- npx -y @upstash/context7-mcp@latest

# GitHub (uses GITHUB_TOKEN env var if set)
claude mcp add github --transport stdio -- npx -y @modelcontextprotocol/server-github

# Puppeteer (no auth)
claude mcp add puppeteer --transport stdio -- npx -y @modelcontextprotocol/server-puppeteer

# Memory (no auth)
claude mcp add memory --transport stdio -- npx -y @modelcontextprotocol/server-memory

# Supabase (uses OAuth browser flow)
# Will prompt for Supabase login on first use
claude mcp add supabase "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF" --transport http
```

### Verifying MCP Servers

```bash
claude mcp list
```

### Removing an MCP Server

```bash
claude mcp remove <server-name>
```

## Hooks

### SubagentStop

Triggers when any subagent completes:
1. **Prompt hook**: Verifies task completion before allowing stop
2. **Command hook**: Logs timestamp of completion

## Philosophy Enforcement

All agents inherit these instructions via `subagents.default_instructions`:
- Reference CLAUDE.md for project philosophy
- Follow: Invisible Tech, Boring Tech, Minimal, Fast Feedback
- Use todo lists for multi-step tasks
- Complete tasks fully before reporting done

## Extending This Setup

### Adding a New Skill

1. Create directory: `.claude/skills/<skill-name>/`
2. Add `skill.md` with frontmatter:
   ```markdown
   ---
   name: "skill-name"
   description: "What it does"
   ---

   # Skill Name

   Instructions here...
   ```

### Adding a New Agent

1. Create file: `.claude/agents/<role>.md`
2. Define role, responsibilities, and constraints
3. Reference from coordinator.md if needed

### Adding Hooks

Edit `settings.json` under the `hooks` key. Supported events:
- `SubagentStop`: After subagent completes
- `PreToolUse`: Before tool execution
- `PostToolUse`: After tool execution

## Troubleshooting

### Permissions Not Working

Delete `settings.local.json` and restart Claude Code. Permission prompts will reappear.

### Skills Not Found

Ensure skill has:
- Correct directory structure: `.claude/skills/<name>/skill.md`
- Valid frontmatter with `name` and `description`

### Agents Not Following Instructions

Check that `settings.json` has the correct `subagents.default_instructions` value and references CLAUDE.md.

## Version Control

| File | Tracked | Why |
|------|---------|-----|
| `settings.json` | Yes | Shared configuration |
| `settings.local.json` | No | Machine-specific permissions |
| `agents/*.md` | Yes | Role definitions |
| `skills/*/skill.md` | Yes | Skill definitions |
| `README.md` | Yes | Documentation |
