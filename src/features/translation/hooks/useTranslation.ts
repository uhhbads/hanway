import { useState, useCallback } from "react";
import { translateText } from "../services/translateApi";
import type { TranslationResult } from "@/types";

export function useTranslation() {
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const translation = await translateText(text);
      setResult(translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    translate,
    clear,
  };
}
