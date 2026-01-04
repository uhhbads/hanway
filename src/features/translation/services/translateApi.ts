import { pinyin } from "pinyin-pro";
import { MOCK_TRANSLATIONS } from "@/constants";
import type { TranslationResult, CharacterBreakdown } from "@/types";

/**
 * Translate English to Traditional Chinese
 * Uses mock data for MVP, can be replaced with DeepL API
 */
export async function translateText(englishText: string): Promise<TranslationResult> {
  const normalizedInput = englishText.toLowerCase().trim();

  // Check mock translations first
  if (MOCK_TRANSLATIONS[normalizedInput]) {
    const { chinese, pinyin: pinyinText } = MOCK_TRANSLATIONS[normalizedInput];
    return {
      chinese,
      pinyin: pinyinText,
      english: englishText,
      characters: getCharacterBreakdown(chinese),
    };
  }

  // For demo: Return a placeholder for unknown phrases
  // In production, call DeepL API here
  const mockChinese = "翻譯中...";
  return {
    chinese: mockChinese,
    pinyin: getPinyin(mockChinese),
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
