import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextManager } from '../core/utils/context-manager';
import { groqClient } from '../core/agents/groq-client';

// Mock groqClient
vi.mock('../core/agents/groq-client', () => ({
    groqClient: {
        isConfigured: vi.fn(),
        prompt: vi.fn(),
    },
}));

describe('ContextManager', () => {
    let contextManager: ContextManager;

    beforeEach(() => {
        contextManager = new ContextManager();
        vi.clearAllMocks();
    });

    describe('shouldSummarize', () => {
        it('returns false for short text', () => {
            const text = 'Short text';
            expect(contextManager.shouldSummarize(text)).toBe(false);
        });

        it('returns true for verify long text', () => {
            // Create text > 30k chars
            const text = 'a'.repeat(30001);
            expect(contextManager.shouldSummarize(text)).toBe(true);
        });
    });

    describe('summarize', () => {
        it('uses Groq when configured', async () => {
            vi.spyOn(groqClient, 'isConfigured').mockReturnValue(true);
            vi.spyOn(groqClient, 'prompt').mockResolvedValue({
                content: 'Summarized text',
                model: 'llama-3.3-70b',
                finishReason: 'stop',
                usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 }
            });

            const result = await contextManager.summarize('Some long text');
            expect(result).toBe('Summarized text');
            expect(groqClient.prompt).toHaveBeenCalled();
        });

        it('falls back to truncation if Groq is not configured', async () => {
            vi.spyOn(groqClient, 'isConfigured').mockReturnValue(false);

            const longText = 'a'.repeat(2000);
            const result = await contextManager.summarize(longText);

            expect(result).toContain('[Truncated due to missing Groq API Key]');
            expect(result.length).toBeLessThan(longText.length);
            expect(groqClient.prompt).not.toHaveBeenCalled();
        });
    });

    describe('updateRunningSummary', () => {
        it('initializes summary if empty', async () => {
            vi.spyOn(groqClient, 'isConfigured').mockReturnValue(true);
            vi.spyOn(groqClient, 'prompt').mockResolvedValue({
                content: 'Initial summary',
                model: 'model',
                finishReason: 'stop',
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
            });

            const result = await contextManager.updateRunningSummary('', 'First step');
            expect(result).toBe('Initial summary');
        });
    });
});
