import { listTasks } from '../src/core/db/tasks';
import { workflowEngine } from '../src/core/orchestrator/workflow';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('Fetching planning tasks...');
  const tasks = await listTasks({ status: 'planning' as any });
  console.log(`Found ${tasks.length} tasks in planning state.`);

  for (const task of tasks) {
    console.log(`Processing task: ${task.task_id} - ${task.description}`);
    try {
      await workflowEngine.processTask(task.task_id);
      console.log(`Successfully generated proposals for ${task.task_id}`);
    } catch (error) {
      console.error(`Failed to process task ${task.task_id}:`, error);
    }
  }
}

main();
