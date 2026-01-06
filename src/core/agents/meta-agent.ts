
import { xaiClient } from './xai-client';
import { groqClient } from './groq-client';
import { claudeClient } from './claude-client';
import { Task, TaskType } from '@/interfaces/task';

// Common interface for all LLM clients
interface LLMClient {
    generateJSON<T>(prompt: string, options: { system?: string; temperature?: number }): Promise<T>;
    generateText(prompt: string, options: { system?: string; temperature?: number }): Promise<string>;
}

const CLASSIFIER_PROMPT = `You are Aura's intent classifier. Analyze the user message and determine if it's:
1. "task" - A request to build, create, add, fix, implement, or change something in the codebase
2. "question" - A question about the system, how things work, or general conversation

Respond with JSON only: { "intent": "task" | "question" }`;

const TASK_PROMPT = `You are the "Meta-Prompter" for Aura, an advanced AI development system.
Your goal is to convert the user's request into a structured Development Task.

Extract:
1. Title: A concise summary of the task.
2. Description: A detailed technical description of what needs to be done.
3. Type: The category of work (feature, bugfix, refactor, choreography).
4. Files: Any specific files mentioned or implied (if known).

Output JSON only.`;

const CONVERSATION_PROMPT = `You are Aura, an AI assistant for the Dieta Positiva development workflow system.

About the system:
- This is an AI-powered development workflow that helps create and manage coding tasks
- Users can describe features, bugs, or improvements they want
- The system creates structured tasks that go through planning, approval, and execution stages
- The dashboard shows tasks in different states: Awaiting Approval, Planning, In Progress, Completed

Answer the user's question helpfully and concisely. Keep responses under 3 sentences.
If they seem to want to create a task, suggest they describe what they want to build.`;

interface IntentResponse {
    intent: 'task' | 'question';
}

interface MetaAgentResponse {
    title: string;
    description: string;
    type: TaskType;
    suggestedFiles?: string[];
}

interface ConversationResult {
    type: 'conversation';
    message: string;
}

interface TaskResult {
    type: 'task';
    task: Partial<Task>;
}

export class MetaAgent {
    private getClient(): { client: LLMClient; name: string } {
        if (xaiClient.isConfigured()) return { client: xaiClient, name: 'xAI' };
        if (groqClient.isConfigured()) return { client: groqClient, name: 'Groq' };
        return { client: claudeClient, name: 'Claude' };
    }

    async processRequest(userMessage: string): Promise<ConversationResult | TaskResult> {
        const { client, name } = this.getClient();
        console.log(`[MetaAgent] Using ${name}`);

        try {
            // Step 1: Classify intent
            const intentPrompt = `User message: "${userMessage}"`;
            const intentResponse = await client.generateJSON<IntentResponse>(intentPrompt, {
                system: CLASSIFIER_PROMPT,
                temperature: 0.3
            });

            console.log(`[MetaAgent] Intent: ${intentResponse.intent}`);

            // Step 2: Handle based on intent
            if (intentResponse.intent === 'question') {
                return this.handleConversation(client, userMessage);
            } else {
                return this.handleTaskCreation(client, userMessage);
            }
        } catch (error) {
            console.error('MetaAgent failed to process request:', error);
            throw new Error('Failed to interpret user request.');
        }
    }

    private async handleConversation(client: LLMClient, userMessage: string): Promise<ConversationResult> {
        const response = await client.generateText(userMessage, {
            system: CONVERSATION_PROMPT,
            temperature: 0.7
        });

        return {
            type: 'conversation',
            message: response
        };
    }

    private async handleTaskCreation(client: LLMClient, userMessage: string): Promise<TaskResult> {
        const prompt = `User Request: "${userMessage}"

Extract the task details into JSON format:
{
  "title": "string",
  "description": "string",
  "type": "feature" | "bugfix" | "refactor" | "choreography",
  "suggestedFiles": ["file1", "file2"]
}`;

        const parsedResponse = await client.generateJSON<MetaAgentResponse>(prompt, {
            system: TASK_PROMPT,
            temperature: 0.5
        });

        const fullDescription = parsedResponse.title
            ? `Title: ${parsedResponse.title}\n\n${parsedResponse.description}`
            : parsedResponse.description;

        return {
            type: 'task',
            task: {
                description: fullDescription,
                type: (parsedResponse.type as TaskType) || 'feature',
                context: {
                    repository: 'dieta-positiva/app',
                    branch: 'main',
                    files: parsedResponse.suggestedFiles || [],
                    dependencies: []
                },
                constraints: {
                    maxDuration: 60,
                    requiresApproval: true,
                    breakingChangesAllowed: false,
                    testCoverageMin: 80
                }
            }
        };
    }
}

export const metaAgent = new MetaAgent();
