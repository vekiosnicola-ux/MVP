---
name: "run-test-suite"
description: "Run the test suite and summarize results"
---

# Run Test Suite Skill

Executes the project test suite and provides a clear summary of results.

## Instructions

1. Run `npm test` from the project root (`/Users/nicolavekios/MVP`).

2. Analyze the output:
   - Count total tests, passed, failed, and skipped
   - Note test duration

3. If **all tests pass**:
   - Respond with: "All tests passed. [X] tests in [duration]."

4. If **any tests fail**:
   - List each failed test name
   - Include the failure message/reason
   - Suggest which file to investigate

## Tools Allowed

- `Bash` (for running npm test)
- `Read` (for examining test files if needed)
- `Write` (only if fixing tests)

## Model Recommendation

This skill should be executed by `Sonnet` or `Haiku` agents, not Opus. It's a straightforward automation task.

## Example Output

```
All tests passed. 44 tests in 12.3s.
```

Or:

```
2 tests failed:

1. WorkflowStateMachine > transition > fails APPROVE without planId
   - Expected: success to be false
   - Actual: success was true
   - File: src/__tests__/state-machine.test.ts:82

2. Utility functions > taskStatusToWorkflowState > maps all statuses
   - Expected: 'task_created'
   - Actual: undefined
   - File: src/__tests__/state-machine.test.ts:196
```
