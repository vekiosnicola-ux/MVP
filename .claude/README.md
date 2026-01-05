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
    └── run-test-suite/          # Test runner with summary
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

- `/dieta-positiva-context` - Load project context
- `/run-test-suite` - Run tests with formatted summary

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
