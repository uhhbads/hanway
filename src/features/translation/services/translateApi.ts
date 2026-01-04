import { pinyin } from "pinyin-pro";
import { MOCK_TRANSLATIONS } from "@/constants";
import {
  chatCompletion,
  isOpenAIConfigured,
  TRANSLATION_SYSTEM_PROMPT,
  OpenAIError,
} from "@/lib/openai";
import type { TranslationResult, CharacterBreakdown } from "@/types";

interface TranslationResponse {
  chinese: string;
  pinyin: string;
}

/**
 * Translate English to Traditional Chinese
 * Uses OpenAI GPT-4o-mini with fallback to mock data
 */
export async function translateText(englishText: string): Promise<TranslationResult> {
  const normalizedInput = englishText.toLowerCase().trim();

  // Check mock translations first (for common phrases)
  if (MOCK_TRANSLATIONS[normalizedInput]) {
    const { chinese, pinyin: pinyinText } = MOCK_TRANSLATIONS[normalizedInput];
    return {
      chinese,
      pinyin: pinyinText,
      english: englishText,
      characters: getCharacterBreakdown(chinese),
    };
  }

  // Try OpenAI translation if configured
  if (isOpenAIConfigured()) {
    try {
      const response = await chatCompletion(
        [
          { role: "system", content: TRANSLATION_SYSTEM_PROMPT },
          { role: "user", content: `Translate to Traditional Chinese: "${englishText}"` },
        ],
        { temperature: 0.3, maxTokens: 200, responseFormat: "json_object" }
      );

      const parsed: TranslationResponse = JSON.parse(response);

      if (parsed.chinese && parsed.pinyin) {
        return {
          chinese: parsed.chinese,
          pinyin: parsed.pinyin,
          english: englishText,
          characters: getCharacterBreakdown(parsed.chinese),
        };
      }
    } catch (err) {
      // Log error but fall through to fallback
      console.warn("OpenAI translation failed:", err instanceof OpenAIError ? err.message : err);
    }
  }

  // Fallback for unknown phrases when OpenAI is not available
  const mockChinese = "（尚無翻譯）";
  return {
    chinese: mockChinese,
    pinyin: "shàng wú fān yì",
    english: englishText,
    characters: getCharacterBreakdown(mockChinese),
  };
}

/**
 * Get pinyin for Chinese text with tone marks
 */
export function getPinyin(chineseText: string): string {
  return pinyin(chineseText, { toneType: "symbol", type: "string" });
}

/**
 * Get character-by-character breakdown
 */
export function getCharacterBreakdown(chineseText: string): CharacterBreakdown[] {
  const characters = chineseText.split("");
  return characters.map((char) => ({
    character: char,
    pinyin: pinyin(char, { toneType: "symbol", type: "string" }),
  }));
}

/**
 * Check if text contains Chinese characters
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}
