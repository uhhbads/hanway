/**
 * OpenAI API Client for Hanway
 * Uses GPT-4o-mini for translation and colloquial alternatives
 */

// API key should be set via environment variable
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  id: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

/**
 * Check if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return OPENAI_API_KEY.length > 0;
}

/**
 * Call OpenAI Chat Completions API
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
  } = {}
): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new OpenAIError("OpenAI API key not configured");
  }

  const { temperature = 0.7, maxTokens = 1000, responseFormat = "text" } = options;

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || `API error: ${response.status}`;
    throw new OpenAIError(errorMessage, response.status);
  }

  const data: OpenAIResponse = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new OpenAIError("No response content from OpenAI");
  }

  return data.choices[0].message.content;
}

/**
 * Translation-specific prompt
 */
export const TRANSLATION_SYSTEM_PROMPT = `You are a professional translator specializing in English to Traditional Chinese (Taiwan Mandarin) translation.

Respond ONLY with a JSON object in this exact format:
{
  "chinese": "Traditional Chinese translation",
  "pinyin": "pinyin with tone marks (e.g., nǐ hǎo)"
}

Rules:
- Use Traditional Chinese characters only (Taiwan style)
- Use Taiwan Mandarin vocabulary and expressions
- Include tone marks in pinyin (ā á ǎ à, ē é ě è, etc.)
- Be natural and conversational
- Do not add explanations, just the JSON`;

/**
 * Colloquial alternatives prompt
 */
export const COLLOQUIAL_SYSTEM_PROMPT = `You are a native Mandarin speaker from Taiwan. Given a Chinese phrase, provide 3 colloquial alternatives that sound natural in everyday conversation.

Respond ONLY with a JSON object in this exact format:
{
  "alternatives": [
    {
      "phrase": "colloquial phrase in Traditional Chinese",
      "pinyin": "pinyin with tone marks",
      "formality": "casual",
      "context": "when to use this (brief)",
      "explanation": "why it's more natural (in Chinese)"
    }
  ]
}

Rules:
- Use Traditional Chinese characters only
- Focus on Taiwan Mandarin expressions
- Include exactly 3 alternatives with different formality levels (casual, polite, formal)
- Include tone marks in pinyin (ā á ǎ à)
- Keep explanations concise and in Chinese`;
