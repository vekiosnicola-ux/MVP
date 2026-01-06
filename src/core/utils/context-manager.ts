/**
 * Context Manager
 *
 * Handles context window management by identifying when conversation history
 * is too long and summarizing it using a fast LLM (Groq).
 */

import { groqClient } from '../agents/groq-client';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export class ContextManager {
    // Conservative character limit (approx 4 chars per token)
    // 30k chars ~= 7.5k tokens
    private static readonly MAX_CONTEXT_CHARS = 30000;

    /**
     * Check if history needs summarization
     */
    shouldSummarize(history: string): boolean {
        return history.length > ContextManager.MAX_CONTEXT_CHARS;
    }

    /**
     * Summarize text using Groq to save space
     */
    async summarize(text: string, maxWords = 200): Promise<string> {
        if (!groqClient.isConfigured()) {
            // Fallback if no AI available: just truncate
            return text.slice(0, 1000) + '... [Truncated due to missing Groq API Key]';
        }

        try {
            const prompt = `Summarize the following technical execution log into a concise paragraph (max ${maxWords} words). 
Focus on what actions were taken, which files were modified, and the results. 
Ignore verbose command outputs unless they contain critical errors.

TEXT TO SUMMARIZE:
${text.slice(0, 50000)} // Safety cap
`;

            const response = await groqClient.prompt(prompt, {
                temperature: 0.3,
                maxTokens: 500,
            });

            return response.content;
        } catch (error) {
            console.warn('[ContextManager] Summarization failed:', error);
            return text.slice(0, 500) + '... [Summarization Failed]';
        }
    }

    /**
     * Create a running summary of execution steps
     */
    async updateRunningSummary(currentSummary: string, newStepLog: string): Promise<string> {
        if (!currentSummary) {
            return this.summarize(newStepLog);
        }

        const combined = `PREVIOUS SUMMARY:
${currentSummary}

NEW STEP ACTIVITY:
${newStepLog}`;

        return this.summarize(combined, 300);
    }
}

export const contextManager = new ContextManager();
