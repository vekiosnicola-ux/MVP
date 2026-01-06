/**
 * xAI (Grok) API Client
 *
 * Uses OpenAI-compatible API with xAI base URL.
 * Fast and capable model for task interpretation.
 */

import OpenAI from 'openai';

// ============================================================================
// Types
// ============================================================================

export interface XAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface XAIResponse {
  content: string;
  model: string;
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface XAIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

// ============================================================================
// Client Implementation
// ============================================================================

class XAIClient {
  private client: OpenAI | null = null;

  /**
   * Initialize the client lazily
   */
  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.XAI_API_KEY;

      if (!apiKey) {
        throw new Error(
          'XAI_API_KEY not configured. Get a key at https://console.x.ai'
        );
      }

      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
      });
    }

    return this.client;
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!process.env.XAI_API_KEY;
  }

  /**
   * Send a message to xAI and get a response
   */
  async chat(
    messages: XAIMessage[],
    options: XAIOptions = {}
  ): Promise<XAIResponse> {
    const client = this.getClient();

    const {
      model = 'grok-3-latest',
      maxTokens = 4096,
      temperature = 0.7,
      system,
    } = options;

    // Prepend system message if provided
    const allMessages: XAIMessage[] = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const choice = response.choices[0];
      const content = choice?.message?.content || '';

      return {
        content,
        model: response.model,
        finishReason: choice?.finish_reason || null,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`xAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Send a single prompt and get a response
   */
  async prompt(
    userPrompt: string,
    options: XAIOptions = {}
  ): Promise<XAIResponse> {
    return this.chat([{ role: 'user', content: userPrompt }], options);
  }

  /**
   * Generate structured JSON output from xAI
   */
  async generateJSON<T>(
    prompt: string,
    options: XAIOptions = {}
  ): Promise<T> {
    const systemPrompt = `${options.system || ''}

IMPORTANT: You must respond with valid JSON only. No markdown, no code blocks, no explanation.
Just the raw JSON object.`;

    const response = await this.prompt(prompt, {
      ...options,
      system: systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent JSON
    });

    console.log('[XAIClient] Raw response:', response.content.slice(0, 500));

    try {
      // Try to parse the response as JSON
      let jsonStr = response.content.trim();

      // Remove markdown code blocks if present
      const codeBlockMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonStr = codeBlockMatch[1];
      } else {
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.slice(0, -3);
        }
      }

      const parsed = JSON.parse(jsonStr.trim()) as T;
      console.log('[XAIClient] Parsed JSON keys:', Object.keys(parsed as object));
      return parsed;
    } catch (parseError) {
      console.error('[XAIClient] JSON parse error:', parseError);
      console.error('[XAIClient] Raw content was:', response.content.slice(0, 300));
      throw new Error(
        `Failed to parse xAI response as JSON: ${response.content.slice(0, 200)}...`
      );
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const xaiClient = new XAIClient();
