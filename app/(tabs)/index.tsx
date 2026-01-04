import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_SIZES, SPACING } from "@/constants";
import { TranslationCard, useTranslation } from "@/features/translation";
import { useVocabulary } from "@/features/vocabulary";
import { ColloquialCard, getColloquialAlternatives } from "@/features/colloquial";
import type { ColloquialSuggestion } from "@/types";

export default function TranslateScreen() {
  const [inputText, setInputText] = useState("");
  const { result, isLoading, translate, clear } = useTranslation();
  const { addWord } = useVocabulary();
  const [colloquials, setColloquials] = useState<ColloquialSuggestion[]>([]);
  const [showColloquials, setShowColloquials] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    await translate(inputText);
    setShowColloquials(false);
    setColloquials([]);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await addWord(result.chinese, result.pinyin, result.english);
      Alert.alert("Saved!", `"${result.chinese}" added to your vocabulary.`);
    } catch (error) {
      Alert.alert("Error", "Failed to save word. Please try again.");
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
                onChangeText={setInputText}
                placeholder="Enter text to translate..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                returnKeyType="done"
                onSubmitEditing={handleTranslate}
              />
              {inputText.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.translateButton, !inputText.trim() && styles.disabledButton]}
              onPress={handleTranslate}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.translateButtonText}>
                {isLoading ? "Translating..." : "Translate to Chinese"}
              </Text>
            </TouchableOpacity>
          </View>

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
