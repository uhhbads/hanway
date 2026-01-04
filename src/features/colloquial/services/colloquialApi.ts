import { COLLOQUIAL_PROMPT } from "@/constants";
import type { ColloquialSuggestion } from "@/types";
import { getPinyin } from "@/features/translation/services/translateApi";

// Simple UUID generator for React Native (no crypto dependency)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Mock colloquial alternatives for common phrases
const MOCK_COLLOQUIALS: Record<string, Omit<ColloquialSuggestion, "id" | "originalPhrase" | "verified" | "upvotes">[]> = {
  "請問洗手間在哪裡": [
    {
      colloquialPhrase: "廁所在哪？",
      pinyin: "cè suǒ zài nǎ",
      formality: "casual",
      context: "Friends, informal settings",
      explanation: "直接說'廁所'比較口語，省略敬語'請問'",
    },
    {
      colloquialPhrase: "請問一下，廁所在哪裡？",
      pinyin: "qǐng wèn yī xià, cè suǒ zài nǎ lǐ",
      formality: "polite",
      context: "Strangers, shops, restaurants",
      explanation: "加了'一下'讓語氣更自然友善",
    },
    {
      colloquialPhrase: "不好意思，洗手間怎麼走？",
      pinyin: "bù hǎo yì si, xǐ shǒu jiān zěn me zǒu",
      formality: "formal",
      context: "Formal occasions, offices",
      explanation: "用'不好意思'開頭更禮貌，'怎麼走'是問路的自然說法",
    },
  ],
  "謝謝": [
    {
      colloquialPhrase: "謝啦",
      pinyin: "xiè la",
      formality: "casual",
      context: "Close friends, casual thanks",
      explanation: "加'啦'讓語氣更輕鬆隨意",
    },
    {
      colloquialPhrase: "感謝你",
      pinyin: "gǎn xiè nǐ",
      formality: "polite",
      context: "Sincere gratitude",
      explanation: "'感謝'比'謝謝'更正式一點",
    },
    {
      colloquialPhrase: "太感謝了",
      pinyin: "tài gǎn xiè le",
      formality: "formal",
      context: "Very grateful situations",
      explanation: "加'太...了'強調感謝程度",
    },
  ],
  "你好嗎": [
    {
      colloquialPhrase: "最近怎樣？",
      pinyin: "zuì jìn zěn yàng",
      formality: "casual",
      context: "Friends, peers",
      explanation: "台灣人很少說'你好嗎'，'最近怎樣'更自然",
    },
    {
      colloquialPhrase: "吃飽沒？",
      pinyin: "chī bǎo méi",
      formality: "casual",
      context: "Taiwanese greeting, any time",
      explanation: "傳統台灣式問候，表示關心",
    },
    {
      colloquialPhrase: "還好嗎？",
      pinyin: "hái hǎo ma",
      formality: "polite",
      context: "General check-in",
      explanation: "比較溫和的問候方式",
    },
  ],
};

/**
 * Get colloquial alternatives for a phrase
 * Uses mock data for MVP, can be replaced with OpenAI API
 */
export async function getColloquialAlternatives(
  originalPhrase: string
): Promise<ColloquialSuggestion[]> {
  // Check mock data first
  if (MOCK_COLLOQUIALS[originalPhrase]) {
    return MOCK_COLLOQUIALS[originalPhrase].map((item) => ({
      id: generateId(),
      originalPhrase,
      ...item,
      verified: true,
      upvotes: Math.floor(Math.random() * 50) + 10,
    }));
  }

  // Generate basic alternatives for unknown phrases
  // In production, call OpenAI API here
  return [
    {
      id: generateId(),
      originalPhrase,
      colloquialPhrase: originalPhrase,
      pinyin: getPinyin(originalPhrase),
      formality: "polite",
      context: "General usage",
      explanation: "This is the standard way to say it",
      verified: false,
      upvotes: 0,
    },
  ];
}

/**
 * Generate prompt for OpenAI API
 */
export function generateColloquialPrompt(phrase: string): string {
  return `${COLLOQUIAL_PROMPT}\n\nPhrase to analyze: "${phrase}"`;
}
