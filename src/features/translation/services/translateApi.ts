import { pinyin } from "pinyin-pro";
import { MOCK_TRANSLATIONS } from "@/constants";
import {
  chatCompletion,
  isOpenAIConfigured,
  TRANSLATION_SYSTEM_PROMPT,
  SENSE_DETECTION_PROMPT,
  OpenAIError,
} from "@/lib/openai";
import type { TranslationResult, CharacterBreakdown, WordSense } from "@/types";

interface TranslationResponse {
  chinese: string;
  pinyin: string;
  characters?: { character: string; pinyin: string; englishGloss?: string }[];
}

interface SenseDetectionResponse {
  ambiguous: boolean;
  senses: { id: string; word: string; gloss: string }[];
}

/**
 * Detect if English text has ambiguous words that need disambiguation
 * Returns array of senses if ambiguous, empty array if not
 */
export async function detectSenses(englishText: string): Promise<WordSense[]> {
  if (!isOpenAIConfigured()) {
    return [];
  }

  try {
    const response = await chatCompletion(
      [
        { role: "system", content: SENSE_DETECTION_PROMPT },
        { role: "user", content: englishText },
      ],
      { temperature: 0.2, maxTokens: 300, responseFormat: "json_object" }
    );

    const parsed: SenseDetectionResponse = JSON.parse(response);

    if (parsed.ambiguous && parsed.senses?.length > 0) {
      return parsed.senses.map((s) => ({
        id: s.id,
        word: s.word,
        gloss: s.gloss.split(" ").slice(0, 6).join(" "), // Enforce ≤6 words
      }));
    }
  } catch (err) {
    console.warn("Sense detection failed:", err instanceof OpenAIError ? err.message : err);
  }

  return [];
}

/**
 * Translate English to Traditional Chinese
 * Uses OpenAI GPT-4o-mini with fallback to mock data
 * @param selectedSense - Optional sense for disambiguation
 */
export async function translateText(
  englishText: string,
  selectedSense?: WordSense
): Promise<TranslationResult> {
  const normalizedInput = englishText.toLowerCase().trim();

  // Check mock translations first (for common phrases)
  if (MOCK_TRANSLATIONS[normalizedInput] && !selectedSense) {
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
      // Build prompt with sense context if provided
      let userMessage = `Translate to Traditional Chinese: "${englishText}"`;
      if (selectedSense) {
        userMessage += `\n\nContext: "${selectedSense.word}" means "${selectedSense.gloss}"`;
      }

      const response = await chatCompletion(
        [
          { role: "system", content: TRANSLATION_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        { temperature: 0.3, maxTokens: 500, responseFormat: "json_object" }
      );

      const parsed: TranslationResponse = JSON.parse(response);

      if (parsed.chinese && parsed.pinyin) {
        // Use AI-provided character breakdown if available, else generate locally
        const characters: CharacterBreakdown[] = parsed.characters?.length
          ? parsed.characters.map((c) => ({
              character: c.character,
              pinyin: c.pinyin,
              englishGloss: c.englishGloss?.split(" ").slice(0, 6).join(" "), // Enforce ≤6 words
            }))
          : getCharacterBreakdown(parsed.chinese);

        return {
          chinese: parsed.chinese,
          pinyin: parsed.pinyin,
          english: englishText,
          characters,
          senses: selectedSense ? undefined : [],
          selectedSense,
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
