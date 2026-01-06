# Aura Test Suite

Quick reference for running and understanding Aura's test suite.

## Quick Start

```bash
# Run all agent/unit tests
npm run test

# Run UI tests (requires dev server)
npm run test:ui

# Run all tests
npm run test:all

# Watch mode (development)
npm run test:watch
```

## Test Categories

### 1. UI Tests (`ui/`)
**Tool**: Playwright  
**Purpose**: Test human-facing flows

- 5-second cognitive load test
- Kill switch (abort) test
- Decision provenance trace
- Task creation flow
- Plan comparison
- Approval workflow

### 2. Agent Tests (`agents/`)
**Tool**: Vitest  
**Purpose**: Test agent behavior and structure

- Planning agent determinism
- Execution agent safety
- Schema validation
- Constraint adherence

### 3. Contract Tests (`contracts/`)
**Tool**: Vitest  
**Purpose**: Test inter-agent boundaries

- Planner → Executor contracts
- Executor → Git safety
- Reviewer → Human communication

### 4. Simulation Tests (`simulation/`)
**Tool**: Vitest  
**Purpose**: End-to-end intelligence testing

- Missing context scenarios
- Conflicting instructions
- Dangerous operations
- Full workflow simulation

### 5. HIL Tests (`hil/`)
**Tool**: Vitest  
**Purpose**: Human-in-the-loop integrity

- Human visibility
- Human control
- Agent behavior
- System recording

### 6. Drift Tests (`drift/`)
**Tool**: Vitest  
**Purpose**: Detect agent drift over time

- Baseline metrics
- Plan length consistency
- Safety check maintenance
- Constraint adherence

## Test Fixtures

Use `src/__tests__/utils/test-fixtures.ts` for common test data:

```typescript
import { 
  createTestTask, 
  createTestPlan, 
  createTestDecision,
  createImpossibleTask,
  createDangerousTask 
} from '@/__tests__/utils/test-fixtures';
```

## Writing New Tests

### Agent Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { PlanningAgent } from '@/core/agents/planning-agent';

describe('MyAgent', () => {
  it('should produce valid structure', async () => {
    const agent = new PlanningAgent();
    const result = await agent.generatePlans(task);
    expect(result).toMatchSchema(PlanSchema);
  });
});
```

### UI Test Example

```typescript
import { test, expect } from '@playwright/test';

test('human can do X', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('button:has-text("Create")');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

## Test Philosophy

✅ **DO test**:
- Structure and constraints
- Contracts and boundaries
- Safety mechanisms
- Human control

❌ **DON'T test**:
- Token-perfect outputs
- "Creativity" quality
- Model-specific phrasing
- Minor UI spacing

## See Also

- [Full Testing Guide](../../docs/TESTING.md)
- [Aura Architecture](../../docs/architecture.md)

