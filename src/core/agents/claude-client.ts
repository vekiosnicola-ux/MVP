/**
 * Claude API Client
 *
 * Wrapper around the Anthropic SDK for structured AI interactions.
 * Handles rate limiting, retries, and error handling.
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// Types
// ============================================================================

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

// ============================================================================
// Client Implementation
// ============================================================================

class ClaudeClient {
  private client: Anthropic | null = null;

  /**
   * Initialize the client lazily to avoid build-time errors
   */
  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey || apiKey === 'sk-ant-your-key-here') {
        throw new Error(
          'ANTHROPIC_API_KEY not configured. Add your API key to .env.local'
        );
      }

      this.client = new Anthropic({ apiKey });
    }

    return this.client;
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    return !!apiKey && apiKey !== 'sk-ant-your-key-here';
  }

  /**
   * Send a message to Claude and get a response
   */
  async chat(
    messages: ClaudeMessage[],
    options: ClaudeOptions = {}
  ): Promise<ClaudeResponse> {
    const client = this.getClient();

    const {
      model = 'claude-sonnet-4-20250514',
      maxTokens = 4096,
      temperature = 0.7,
      system,
    } = options;

    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Extract text content from response
      const textContent = response.content.find((c) => c.type === 'text');
      const content = textContent?.type === 'text' ? textContent.text : '';

      return {
        content,
        model: response.model,
        stopReason: response.stop_reason,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  }

  /**
   * Send a single prompt and get a response
   */
  async prompt(
    userPrompt: string,
    options: ClaudeOptions = {}
  ): Promise<ClaudeResponse> {
    return this.chat([{ role: 'user', content: userPrompt }], options);
  }

  /**
   * Generate plain text response from Claude
   */
  async generateText(
    prompt: string,
    options: ClaudeOptions = {}
  ): Promise<string> {
    const response = await this.prompt(prompt, options);
    return response.content;
  }

  /**
   * Generate structured JSON output from Claude
   */
  async generateJSON<T>(
    prompt: string,
    options: ClaudeOptions = {}
  ): Promise<T> {
    const systemPrompt = `${options.system || ''}

IMPORTANT: You must respond with valid JSON only. No markdown, no code blocks, no explanation.
Just the raw JSON object.`;

    const response = await this.prompt(prompt, {
      ...options,
      system: systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent JSON
    });

    try {
      // Try to parse the response as JSON
      let jsonStr = response.content.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }

      return JSON.parse(jsonStr.trim()) as T;
    } catch {
      throw new Error(
        `Failed to parse Claude response as JSON: ${response.content.slice(0, 200)}...`
      );
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const claudeClient = new ClaudeClient();
