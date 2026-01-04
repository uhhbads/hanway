import { create } from "zustand";
import type { VocabularyItem, PracticeSession, UserStats } from "@/types";

interface AppState {
  // Vocabulary
  vocabulary: VocabularyItem[];
  setVocabulary: (items: VocabularyItem[]) => void;
  addVocabularyItem: (item: VocabularyItem) => void;
  updateVocabularyItem: (id: string, updates: Partial<VocabularyItem>) => void;
  removeVocabularyItem: (id: string) => void;

  // Practice
  currentSession: PracticeSession | null;
  dueCards: VocabularyItem[];
  currentCardIndex: number;
  setCurrentSession: (session: PracticeSession | null) => void;
  setDueCards: (cards: VocabularyItem[]) => void;
  setCurrentCardIndex: (index: number) => void;
  nextCard: () => void;

  // Stats
  stats: UserStats;
  updateStats: (stats: Partial<UserStats>) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Vocabulary
  vocabulary: [],
  setVocabulary: (items) => set({ vocabulary: items }),
  addVocabularyItem: (item) =>
    set((state) => ({ vocabulary: [item, ...state.vocabulary] })),
  updateVocabularyItem: (id, updates) =>
    set((state) => ({
      vocabulary: state.vocabulary.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeVocabularyItem: (id) =>
    set((state) => ({
      vocabulary: state.vocabulary.filter((item) => item.id !== id),
    })),

  // Practice
  currentSession: null,
  dueCards: [],
  currentCardIndex: 0,
  setCurrentSession: (session) => set({ currentSession: session }),
  setDueCards: (cards) => set({ dueCards: cards }),
  setCurrentCardIndex: (index) => set({ currentCardIndex: index }),
  nextCard: () => {
    const { currentCardIndex, dueCards } = get();
    if (currentCardIndex < dueCards.length - 1) {
      set({ currentCardIndex: currentCardIndex + 1 });
    }
  },

  // Stats
  stats: {
    totalWords: 0,
    wordsLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalReviews: 0,
    averageRetention: 0,
  },
  updateStats: (updates) =>
    set((state) => ({ stats: { ...state.stats, ...updates } })),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
