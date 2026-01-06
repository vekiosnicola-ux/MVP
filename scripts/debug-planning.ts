import { WorkflowEngine } from '../src/core/orchestrator/workflow';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const taskId = 'task-d74f3463-adf0-4fc3-a705-82920c3e0163';
  const engine = new WorkflowEngine();

  console.log(`Manually triggering planning for task: ${taskId}`);

  try {
    const result = await engine.processTask(taskId);
    console.log('Transition Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during processTask:', error);
  }
}

main();
