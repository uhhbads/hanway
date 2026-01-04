import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { COLORS, FONT_SIZES, SPACING, INPUT_LIMITS } from "@/constants";
import { TranslationCard, useTranslation, detectSenses } from "@/features/translation";
import { useVocabulary } from "@/features/vocabulary";
import { ColloquialCard, getColloquialAlternatives } from "@/features/colloquial";
import type { ColloquialSuggestion, WordSense } from "@/types";

export default function TranslateScreen() {
  const [inputText, setInputText] = useState("");
  const { result, isLoading, error, translate, clear } = useTranslation();
  const { addWord } = useVocabulary();
  const [colloquials, setColloquials] = useState<ColloquialSuggestion[]>([]);
  const [showColloquials, setShowColloquials] = useState(false);
  
  // Sense disambiguation state
  const [senses, setSenses] = useState<WordSense[]>([]);
  const [selectedSense, setSelectedSense] = useState<WordSense | undefined>();
  const [detectingSenses, setDetectingSenses] = useState(false);

  // Show toast for translation errors
  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Translation Error",
        text2: error,
        visibilityTime: 3000,
      });
    }
  }, [error]);

  const handleInputChange = (text: string) => {
    // Enforce max length with feedback
    if (text.length > INPUT_LIMITS.maxTranslationLength) {
      Toast.show({
        type: "info",
        text1: "Character Limit",
        text2: `Maximum ${INPUT_LIMITS.maxTranslationLength} characters allowed`,
        visibilityTime: 2000,
      });
      return;
    }
    setInputText(text);
    // Reset senses when input changes
    setSenses([]);
    setSelectedSense(undefined);
  };

  // Detect senses when input is submitted (before translation)
  const handleDetectSenses = async () => {
    if (!inputText.trim()) return;
    
    setDetectingSenses(true);
    try {
      const detectedSenses = await detectSenses(inputText);
      setSenses(detectedSenses);
      
      // If no ambiguity, translate directly
      if (detectedSenses.length === 0) {
        await performTranslation();
      }
      // Otherwise, show sense chips and wait for selection
    } catch (err) {
      console.warn("Sense detection failed:", err);
      // Continue with translation on error
      await performTranslation();
    } finally {
      setDetectingSenses(false);
    }
  };

  const performTranslation = async (sense?: WordSense) => {
    const response = await translate(inputText, sense);
    if (response.success) {
      setShowColloquials(false);
      setColloquials([]);
    }
  };

  const handleSenseSelect = async (sense: WordSense) => {
    setSelectedSense(sense);
    setSenses([]); // Hide chips after selection
    await performTranslation(sense);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    // If senses are already detected, translate with selected sense (or none)
    if (senses.length > 0 && selectedSense) {
      await performTranslation(selectedSense);
    } else {
      // First, detect if there are ambiguous senses
      await handleDetectSenses();
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await addWord(result.chinese, result.pinyin, result.english);
      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: `"${result.chinese}" added to vocabulary`,
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: err instanceof Error ? err.message : "Please try again",
        visibilityTime: 3000,
      });
    }
  };

  const handleShowColloquials = async () => {
    if (!result) return;
    setShowColloquials(true);
    const suggestions = await getColloquialAlternatives(result.chinese);
    setColloquials(suggestions);
  };

  const handleClear = () => {
    setInputText("");
    clear();
    setColloquials([]);
    setShowColloquials(false);
    setSenses([]);
    setSelectedSense(undefined);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>English</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={handleInputChange}
                placeholder="Enter text to translate..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={INPUT_LIMITS.maxTranslationLength}
                returnKeyType="done"
                onSubmitEditing={handleTranslate}
              />
              {inputText.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputFooter}>
              <Text style={[
                styles.charCount,
                inputText.length > INPUT_LIMITS.maxTranslationLength * 0.9 && styles.charCountWarning
              ]}>
                {inputText.length}/{INPUT_LIMITS.maxTranslationLength}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.translateButton, !inputText.trim() && styles.disabledButton]}
              onPress={handleTranslate}
              disabled={!inputText.trim() || isLoading || detectingSenses}
            >
              <Text style={styles.translateButtonText}>
                {detectingSenses ? "Analyzing..." : isLoading ? "Translating..." : "Translate to Chinese"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sense Disambiguation Chips */}
          {senses.length > 0 && (
            <View style={styles.senseSection}>
              <Text style={styles.senseLabel}>
                Which meaning of "{senses[0]?.word}" do you mean?
              </Text>
              <View style={styles.senseChips}>
                {senses.map((sense) => (
                  <TouchableOpacity
                    key={sense.id}
                    style={[
                      styles.senseChip,
                      selectedSense?.id === sense.id && styles.senseChipSelected,
                    ]}
                    onPress={() => handleSenseSelect(sense)}
                  >
                    <Text style={styles.senseChipText}>{sense.gloss}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Result Section */}
          {result && (
            <>
              <TranslationCard result={result} onSave={handleSave} />

              {/* Colloquial Button */}
              {!showColloquials && (
                <TouchableOpacity style={styles.colloquialButton} onPress={handleShowColloquials}>
                  <Text style={styles.colloquialButtonText}>💬 Show Colloquial Alternatives</Text>
                </TouchableOpacity>
              )}

              {/* Colloquial Alternatives */}
              {showColloquials && (
                <View style={styles.colloquialSection}>
                  <Text style={styles.sectionTitle}>How natives actually say it:</Text>
                  {colloquials.map((suggestion) => (
                    <ColloquialCard key={suggestion.id} suggestion={suggestion} />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Empty State */}
          {!result && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🀄</Text>
              <Text style={styles.emptyTitle}>Start Learning</Text>
              <Text style={styles.emptyText}>
                Enter an English word or phrase to see the Traditional Chinese translation with
                pinyin pronunciation.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  inputSection: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    paddingRight: 40,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  clearButton: {
    position: "absolute",
    right: SPACING.sm,
    top: SPACING.sm,
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.xs,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  charCountWarning: {
    color: COLORS.warning,
  },
  translateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  translateButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: "600",
  },
  senseSection: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  senseLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  senseChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "center",
  },
  senseChip: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  senseChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  senseChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: "500",
  },
  colloquialButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
  },
  colloquialButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  colloquialSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: "center",
    maxWidth: 280,
  },
});
