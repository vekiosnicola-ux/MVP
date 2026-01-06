import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextManager } from '@/core/utils/context-manager';
import { groqClient } from '@/core/agents/groq-client';

// Mock groq client
vi.mock('@/core/agents/groq-client', () => ({
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
    it('should return false for short text', () => {
      const shortText = 'a'.repeat(1000);
      expect(contextManager.shouldSummarize(shortText)).toBe(false);
    });

    it('should return true for long text', () => {
      const longText = 'a'.repeat(35000); // Exceeds MAX_CONTEXT_CHARS (30000)
      expect(contextManager.shouldSummarize(longText)).toBe(true);
    });

    it('should return false exactly at threshold', () => {
      const thresholdText = 'a'.repeat(30000);
      expect(contextManager.shouldSummarize(thresholdText)).toBe(false);
    });

    it('should return true just above threshold', () => {
      const overThresholdText = 'a'.repeat(30001);
      expect(contextManager.shouldSummarize(overThresholdText)).toBe(true);
    });
  });

  describe('summarize', () => {
    it('should truncate when Groq is not configured', async () => {
      vi.mocked(groqClient.isConfigured).mockReturnValue(false);
      
      const longText = 'a'.repeat(5000);
      const result = await contextManager.summarize(longText);
      
      expect(result).toContain('[Truncated due to missing Groq API Key]');
      expect(result.length).toBeLessThanOrEqual(1000 + 50); // 1000 chars + truncation message
    });

    it('should call Groq when configured', async () => {
      vi.mocked(groqClient.isConfigured).mockReturnValue(true);
      vi.mocked(groqClient.prompt).mockResolvedValue({
        content: 'Summarized text',
      } as any);

      const text = 'a'.repeat(10000);
      const result = await contextManager.summarize(text);

      expect(groqClient.prompt).toHaveBeenCalled();
      expect(result).toBe('Summarized text');
    });

    it('should handle Groq errors gracefully', async () => {
      vi.mocked(groqClient.isConfigured).mockReturnValue(true);
      vi.mocked(groqClient.prompt).mockRejectedValue(new Error('API Error'));

      const text = 'a'.repeat(10000);
      const result = await contextManager.summarize(text);

      // Should fallback to truncation
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(text.length);
    });

    it('should cap input text at 50000 characters', async () => {
      vi.mocked(groqClient.isConfigured).mockReturnValue(true);
      vi.mocked(groqClient.prompt).mockResolvedValue({
        content: 'Summarized',
      } as any);

      const veryLongText = 'a'.repeat(100000);
      await contextManager.summarize(veryLongText);

      const callArgs = vi.mocked(groqClient.prompt).mock.calls[0];
      if (callArgs) {
        const promptText = callArgs[0] as string;
        
        // Should only include first 50000 chars
        expect(promptText.length).toBeLessThan(60000); // Prompt + text
      }
    });
  });
});

