import { useState, useCallback, useRef, useEffect } from "react";
import { translateText } from "../services/translateApi";
import { INPUT_LIMITS } from "@/constants";
import type { TranslationResult } from "@/types";

export type TranslationStatus = "idle" | "loading" | "success" | "error";

export interface TranslationState {
  status: TranslationStatus;
  result: TranslationResult | null;
  error: string | null;
}

export function useTranslation() {
  const [state, setState] = useState<TranslationState>({
    status: "idle",
    result: null,
    error: null,
  });
  
  // Request token for freshness check
  const requestIdRef = useRef(0);
  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const translate = useCallback(async (text: string) => {
    const trimmed = text.trim();
    
    if (!trimmed) {
      setState({ status: "idle", result: null, error: null });
      return { success: false, error: "Empty input" };
    }

    // Input length validation
    if (trimmed.length > INPUT_LIMITS.maxTranslationLength) {
      const errorMsg = `Text too long. Maximum ${INPUT_LIMITS.maxTranslationLength} characters allowed.`;
      setState({ status: "error", result: null, error: errorMsg });
      return { success: false, error: errorMsg };
    }

    // Increment request token for freshness
    const currentRequestId = ++requestIdRef.current;
    
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const translation = await translateText(trimmed);
      
      // Freshness check: only apply result if this is still the latest request
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return { success: false, error: "Request superseded" };
      }
      
      setState({ status: "success", result: translation, error: null });
      return { success: true, result: translation };
    } catch (err) {
      // Freshness check
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return { success: false, error: "Request superseded" };
      }
      
      const errorMsg = err instanceof Error ? err.message : "Translation failed";
      setState({ status: "error", result: null, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const clear = useCallback(() => {
    // Cancel any in-flight requests by incrementing the token
    requestIdRef.current++;
    setState({ status: "idle", result: null, error: null });
  }, []);

  return {
    result: state.result,
    isLoading: state.status === "loading",
    error: state.error,
    status: state.status,
    translate,
    clear,
  };
}
