import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  getAllVocabulary,
  addVocabulary,
  deleteVocabulary,
  searchVocabulary,
  getDueVocabulary,
  initDatabase,
} from "@/lib/database";
import type { VocabularyItem } from "@/types";

// Simple UUID generator for React Native (no crypto dependency)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useVocabulary() {
  const { vocabulary, setVocabulary, addVocabularyItem, removeVocabularyItem } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vocabulary on mount
  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      setIsLoading(true);
      await initDatabase();
      const items = await getAllVocabulary();
      setVocabulary(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vocabulary");
    } finally {
      setIsLoading(false);
    }
  };

  const addWord = useCallback(
    async (chinese: string, pinyin: string, english: string) => {
      const now = new Date();
      const newItem: VocabularyItem = {
        id: generateId(),
        chinese,
        pinyin,
        english,
        createdAt: now,
        dueDate: now,
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: "new",
        lastReview: null,
      };

      try {
        // Ensure database is initialized before saving
        await initDatabase();
        await addVocabulary(newItem);
        addVocabularyItem(newItem);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add word");
        throw err;
      }
    },
    [addVocabularyItem]
  );

  const removeWord = useCallback(
    async (id: string) => {
      try {
        await deleteVocabulary(id);
        removeVocabularyItem(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove word");
        throw err;
      }
    },
    [removeVocabularyItem]
  );

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      const items = await getAllVocabulary();
      setVocabulary(items);
      return;
    }

    try {
      const results = await searchVocabulary(query);
      setVocabulary(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
  }, [setVocabulary]);

  const getDueCards = useCallback(async () => {
    try {
      return await getDueVocabulary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get due cards");
      return [];
    }
  }, []);

  return {
    vocabulary,
    isLoading,
    error,
    addWord,
    removeWord,
    search,
    getDueCards,
    refresh: loadVocabulary,
  };
}
