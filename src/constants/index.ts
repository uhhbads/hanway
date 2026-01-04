// App Constants

export const COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  primary: "#e94560",
  secondary: "#0f3460",
  text: "#eaeaea",
  textMuted: "#a0a0a0",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#ef4444",
  border: "#2a2a4e",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  chinese: 28,
  chineseLarge: 40,
} as const;

export const TTS_CONFIG = {
  language: "zh-TW",
  pitch: 1.0,
  rate: 0.8,
} as const;

export const INPUT_LIMITS = {
  maxTranslationLength: 50,
} as const;

export const DB_CONFIG = {
  initTimeoutMs: 5000,
  maxRetries: 1,
} as const;

export const COLLOQUIAL_PROMPT = `You are a native Mandarin speaker from Taiwan. Given a phrase, provide 3 colloquial alternatives that sound natural in everyday conversation.

For each alternative, respond in this exact JSON format:
{
  "alternatives": [
    {
      "phrase": "colloquial phrase in Traditional Chinese",
      "pinyin": "pinyin with tone marks",
      "formality": "casual" | "polite" | "formal",
      "context": "when to use this",
      "explanation": "why it's more natural"
    }
  ]
}

Important:
- Use Traditional Chinese characters only
- Focus on Taiwan Mandarin expressions
- Include tone marks in pinyin (e.g., nǐ hǎo)
- Be concise in explanations`;

export const MOCK_TRANSLATIONS: Record<string, { chinese: string; pinyin: string }> = {
  hello: { chinese: "你好", pinyin: "nǐ hǎo" },
  "good morning": { chinese: "早安", pinyin: "zǎo ān" },
  "thank you": { chinese: "謝謝", pinyin: "xiè xiè" },
  goodbye: { chinese: "再見", pinyin: "zài jiàn" },
  "how are you": { chinese: "你好嗎", pinyin: "nǐ hǎo ma" },
  "i love you": { chinese: "我愛你", pinyin: "wǒ ài nǐ" },
  water: { chinese: "水", pinyin: "shuǐ" },
  food: { chinese: "食物", pinyin: "shí wù" },
  friend: { chinese: "朋友", pinyin: "péng yǒu" },
  family: { chinese: "家人", pinyin: "jiā rén" },
  "where is the bathroom": { chinese: "請問洗手間在哪裡", pinyin: "qǐng wèn xǐ shǒu jiān zài nǎ lǐ" },
  "how much": { chinese: "多少錢", pinyin: "duō shǎo qián" },
  delicious: { chinese: "好吃", pinyin: "hǎo chī" },
  beautiful: { chinese: "漂亮", pinyin: "piào liàng" },
  "i don't understand": { chinese: "我不懂", pinyin: "wǒ bù dǒng" },
};
