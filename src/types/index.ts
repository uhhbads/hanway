// Core Types for Hanway App

export interface VocabularyItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  createdAt: Date;
  // SRS fields
  dueDate: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning";
  lastReview: Date | null;
}

// Sense disambiguation for ambiguous words
export interface WordSense {
  id: string;
  word: string;
  gloss: string; // ≤6 words description
}

export interface TranslationResult {
  chinese: string;
  pinyin: string;
  english: string;
  characters: CharacterBreakdown[];
  // Disambiguation
  senses?: WordSense[];
  selectedSense?: WordSense;
}

export interface CharacterBreakdown {
  character: string;
  pinyin: string;
  englishGloss?: string; // ≤6 words per-character meaning
}

export interface ColloquialSuggestion {
  id: string;
  originalPhrase: string;
  colloquialPhrase: string;
  pinyin: string;
  formality: "casual" | "polite" | "formal";
  context: string;
  explanation: string;
  englishGloss?: string; // English meaning of the colloquial phrase
  verified: boolean;
  upvotes: number;
}

export interface QuizQuestion {
  id: string;
  type: "recognition" | "listening" | "stroke";
  vocabItem: VocabularyItem;
  options?: string[];
  correctAnswer: string;
}

export interface PracticeSession {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  totalCards: number;
  correctCount: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
}

export type Rating = "again" | "hard" | "good" | "easy";

export interface UserStats {
  totalWords: number;
  wordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  totalReviews: number;
  averageRetention: number;
}
