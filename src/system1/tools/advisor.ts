import { claudeClient } from '../../core/agents/claude-client';
import { STRATEGY_SYSTEM_PROMPT } from '../prompts/strategy';

export interface StrategyRequest {
  topic: string;
  context: string;
  options?: string[];
}

export interface StrategyResponse {
  recommendation: string;
  rationale: string;
  tradeoffs: string[];
  nextSteps: string[];
}

export async function getStrategyAdvice(request: StrategyRequest): Promise<StrategyResponse> {
  const prompt = `
Task: Analyze the following business/technical topic and provide strategic advice.

Topic: ${request.topic}
Context: ${request.context}
${request.options ? `Options to consider: ${request.options.join(', ')}` : ''}

Respond with a JSON object following this structure:
{
  "recommendation": "string",
  "rationale": "string",
  "tradeoffs": ["string"],
  "nextSteps": ["string"]
}
  `;

  return claudeClient.generateJSON<StrategyResponse>(prompt, {
    system: STRATEGY_SYSTEM_PROMPT,
    temperature: 0.4
  });
}
