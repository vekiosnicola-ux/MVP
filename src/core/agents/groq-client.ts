/**
 * Groq API Client
 *
 * Free LLM API using Llama 3.3 70B.
 * Drop-in replacement for Claude when cost is a concern.
 */

import Groq from 'groq-sdk';

// ============================================================================
// Types
// ============================================================================

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqResponse {
  content: string;
  model: string;
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GroqOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

// ============================================================================
// Client Implementation
// ============================================================================

class GroqClient {
  private client: Groq | null = null;

  /**
   * Initialize the client lazily
   */
  private getClient(): Groq {
    if (!this.client) {
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        throw new Error(
          'GROQ_API_KEY not configured. Get a free key at https://console.groq.com'
        );
      }

      this.client = new Groq({ apiKey });
    }

    return this.client;
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
  }

  /**
   * Send a message to Groq and get a response
   */
  async chat(
    messages: GroqMessage[],
    options: GroqOptions = {}
  ): Promise<GroqResponse> {
    const client = this.getClient();

    const {
      model = 'llama-3.3-70b-versatile', // Free, fast, capable
      maxTokens = 4096,
      temperature = 0.7,
      system,
    } = options;

    // Prepend system message if provided
    const allMessages: GroqMessage[] = system
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
        throw new Error(`Groq API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Send a single prompt and get a response
   */
  async prompt(
    userPrompt: string,
    options: GroqOptions = {}
  ): Promise<GroqResponse> {
    return this.chat([{ role: 'user', content: userPrompt }], options);
  }

  /**
   * Generate plain text response from Groq
   */
  async generateText(
    prompt: string,
    options: GroqOptions = {}
  ): Promise<string> {
    const response = await this.prompt(prompt, options);
    return response.content;
  }

  /**
   * Generate structured JSON output from Groq
   */
  async generateJSON<T>(
    prompt: string,
    options: GroqOptions = {}
  ): Promise<T> {
    const systemPrompt = `${options.system || ''}

IMPORTANT: You must respond with valid JSON only. No markdown, no code blocks, no explanation.
Just the raw JSON object.`;

    const response = await this.prompt(prompt, {
      ...options,
      system: systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent JSON
    });

    // eslint-disable-next-line no-console
    console.log('[GroqClient] Raw response:', response.content.slice(0, 500));

    try {
      // Try to parse the response as JSON
      let jsonStr = response.content.trim();

      // Remove markdown code blocks if present (handle various formats)
      // Match ```json or ``` at start, and ``` at end
      const codeBlockMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonStr = codeBlockMatch[1];
      } else {
        // Fallback: simple strip
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
      // eslint-disable-next-line no-console
      console.log('[GroqClient] Parsed JSON keys:', Object.keys(parsed as object));
      return parsed;
    } catch (parseError) {
      console.error('[GroqClient] JSON parse error:', parseError);
      console.error('[GroqClient] Raw content was:', response.content.slice(0, 300));
      throw new Error(
        `Failed to parse Groq response as JSON: ${response.content.slice(0, 200)}...`
      );
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const groqClient = new GroqClient();
