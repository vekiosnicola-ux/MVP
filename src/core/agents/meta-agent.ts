
import { xaiClient } from './xai-client';
import { groqClient } from './groq-client';
import { claudeClient } from './claude-client';
import { Task, TaskType } from '@/interfaces/task';

const SYSTEM_PROMPT = `You are the "Meta-Prompter" for Aura, an advanced AI development system.
Your goal is to listen to the user's natural language request and convert it into a structured Development Task that other agents can execute.

Analyze the user's message and extract:
1. Title: A concise summary of the task.
2. Description: A detailed technical description of what needs to be done.
3. Type: The category of work (feature, bugfix, refactor, choreography).
4. Files: Any specific files mentioned or implied (if known).

If the user's request is vague, infer sensible defaults based on modern web development practices (Next.js, TypeScript).

Output JSON only.`;

interface MetaAgentResponse {
    title: string;
    description: string;
    type: TaskType;
    suggestedFiles?: string[];
}

export class MetaAgent {
    async processRequest(userMessage: string): Promise<Partial<Task>> {
        // Priority: xAI (Grok) -> Groq -> Claude
        const useXAI = xaiClient.isConfigured();
        const useGroq = groqClient.isConfigured();

        // Construct prompt
        const prompt = `User Request: "${userMessage}"

    Extract the task details into JSON format:
    {
      "title": "string",
      "description": "string",
      "type": "feature" | "bugfix" | "refactor" | "choreography",
      "suggestedFiles": ["file1", "file2"]
    }`;

        let parsedResponse: MetaAgentResponse;

        try {
            if (useXAI) {
                console.log('[MetaAgent] Using xAI (Grok)');
                parsedResponse = await xaiClient.generateJSON<MetaAgentResponse>(prompt, {
                    system: SYSTEM_PROMPT,
                    temperature: 0.5
                });
            } else if (useGroq) {
                console.log('[MetaAgent] Using Groq');
                parsedResponse = await groqClient.generateJSON<MetaAgentResponse>(prompt, {
                    system: SYSTEM_PROMPT,
                    temperature: 0.5
                });
            } else {
                console.log('[MetaAgent] Using Claude');
                parsedResponse = await claudeClient.generateJSON<MetaAgentResponse>(prompt, {
                    system: SYSTEM_PROMPT,
                    temperature: 0.5
                });
            }

            // Convert to partial Task object
            // Prepend title to description since Task interface has no title field
            const fullDescription = parsedResponse.title
                ? `Title: ${parsedResponse.title}\n\n${parsedResponse.description}`
                : parsedResponse.description;

            return {
                description: fullDescription,
                type: (parsedResponse.type as TaskType) || 'feature',
                context: {
                    // We will fill basics here, but PlanningAgent refines this
                    repository: 'dieta-positiva/app',
                    branch: 'main',
                    files: parsedResponse.suggestedFiles || [],
                    dependencies: []
                },
                constraints: {
                    // Default constraints
                    maxDuration: 60,
                    requiresApproval: true,
                    breakingChangesAllowed: false,
                    testCoverageMin: 80
                }
            };

        } catch (error) {
            console.error('MetaAgent failed to process request:', error);
            throw new Error('Failed to interpret user request.');
        }
    }
}

export const metaAgent = new MetaAgent();
