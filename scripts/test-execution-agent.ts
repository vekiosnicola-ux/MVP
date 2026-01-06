
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { executionAgent } from '../src/core/agents/execution-agent';
import { Plan, PlanStep } from '../src/interfaces/plan';
import * as fs from 'fs';
// import * as path from 'path';

async function testExecutionAgent() {
    console.log('🧪 Starting ExecutionAgent Test');

    // Define a test file path
    const testFile = 'test-agent-output.txt';
    const expectedContent = 'Hello from Autonomous Agent';

    // Clean up previous run
    if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
    }

    // Create a mock plan
    const plan: Plan = {
        id: 'test-plan-001',
        taskId: 'test-task-123',
        version: '1.0.0',
        approach: 'Test',
        reasoning: 'Verification',
        estimatedDuration: 1,
        risks: [],
        metadata: {},
        steps: [
            {
                id: 'step-001',
                agent: 'developer',
                action: `Create a file named "${testFile}" with content "${expectedContent}"`,
                inputs: [],
                outputs: [testFile],
                validation: {
                    command: `cat ${testFile}`,
                    successCriteria: 'File content matches'
                }
            } as PlanStep
        ]
    };

    console.log('📋 Plan defined. Executing in REAL mode (snapshot disabled)...');

    // Set mode to REAL to trigger LLM action, disable snapshot
    executionAgent.setMode('real', process.cwd());
    // Manually disable snapshot for this test instance (trick: re-instantiate or modify options if possible,
    // but setMode re-inits snapshot manager. We can modify options directly? No, private.
    // We can pass options to constructor. Since we are using singleton, let's create a new instance for testing.

    const { ExecutionAgent } = await import('../src/core/agents/execution-agent');
    const testAgent = new ExecutionAgent({
        mode: 'real',
        workingDir: process.cwd(),
        enableSnapshot: false // Disable snapshot to prevent rollback/deletion of this script
    });

    try {
        const result = await testAgent.execute(plan, 'test-task-123');

        console.log('✅ Execution completed');
        console.log('Result Status:', result.status);

        // Verify file creation
        if (fs.existsSync(testFile)) {
            const content = fs.readFileSync(testFile, 'utf8');
            console.log('📂 File content:', content);

            if (content.includes(expectedContent)) {
                console.log('🎉 SUCCESS: File created with correct content!');
            } else {
                console.error('❌ FAILURE: Content mismatch');
            }

            // Cleanup
            fs.unlinkSync(testFile);
        } else {
            console.error('❌ FAILURE: File was not created');
        }

    } catch (error) {
        console.error('❌ Error executing plan:', error);
    }
}

testExecutionAgent();
