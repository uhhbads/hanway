import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_SIZES, SPACING } from "@/constants";
import { useVocabulary } from "@/features/vocabulary";
import { RecognitionQuiz, scheduleReview } from "@/features/practice";
import { HanziWriterView } from "@/features/hanzi";
import { updateVocabulary } from "@/lib/database";
import { useAppStore } from "@/store/useAppStore";
import type { VocabularyItem, Rating } from "@/types";

type PracticeMode = "quiz" | "stroke" | null;

export default function PracticeScreen() {
  const { vocabulary, getDueCards } = useVocabulary();
  const { dueCards, setDueCards, currentCardIndex, setCurrentCardIndex, updateVocabularyItem } = useAppStore();
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    loadDueCards();
  }, [vocabulary]);

  const loadDueCards = async () => {
    const cards = await getDueCards();
    setDueCards(cards);
    setCurrentCardIndex(0);
  };

  const handleAnswer = async (rating: Rating) => {
    const currentCard = dueCards[currentCardIndex];
    if (!currentCard) return;

    // Calculate new SRS values
    const updates = scheduleReview(currentCard, rating);

    // Update in database
    await updateVocabulary(currentCard.id, updates);

    // Update in store
    updateVocabularyItem(currentCard.id, updates);

    // Update session stats
    setSessionStats((prev) => ({
      correct: rating !== "again" ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));

    // Move to next card
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session complete
      setPracticeMode(null);
    }
  };

  const generateQuizOptions = (correctAnswer: string): string[] => {
    const allAnswers = vocabulary
      .map((v) => v.english)
      .filter((a) => a !== correctAnswer);
    
    // Shuffle and take 3 wrong answers
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, 3);
    
    // Add correct answer and shuffle
    const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    return options;
  };

  const currentCard = dueCards[currentCardIndex];

  // Session complete view
  if (practiceMode && currentCardIndex >= dueCards.length) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Session Complete!</Text>
          <Text style={styles.completeStats}>
            {sessionStats.correct} / {sessionStats.total} correct
          </Text>
          <Text style={styles.completePercent}>
            {sessionStats.total > 0
              ? Math.round((sessionStats.correct / sessionStats.total) * 100)
              : 0}
            % retention
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setPracticeMode(null);
              loadDueCards();
              setSessionStats({ correct: 0, total: 0 });
            }}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz mode
  if (practiceMode === "quiz" && currentCard) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentCardIndex + 1) / dueCards.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentCardIndex + 1} / {dueCards.length}
          </Text>
        </View>

        <RecognitionQuiz
          key={currentCard.id}
          item={currentCard}
          options={generateQuizOptions(currentCard.english)}
          onAnswer={handleAnswer}
        />
      </SafeAreaView>
    );
  }

  // Stroke practice mode
  if (practiceMode === "stroke" && currentCard) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.strokeContainer}>
          <Text style={styles.strokeTitle}>Practice Stroke Order</Text>
          <Text style={styles.strokeSubtitle}>{currentCard.english}</Text>
          
          <View style={styles.hanziContainer}>
            {currentCard.chinese.split("").map((char, index) => (
              <View key={index} style={styles.characterWrapper}>
                <Text style={styles.charLabel}>{char}</Text>
                <HanziWriterView
                  character={char}
                  width={150}
                  height={150}
                  autoAnimate={true}
                  showOutline={true}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (currentCardIndex < dueCards.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
              } else {
                setPracticeMode(null);
              }
            }}
          >
            <Text style={styles.nextButtonText}>
              {currentCardIndex < dueCards.length - 1 ? "Next Character" : "Finish"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main practice menu
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.menuContainer}>
        {/* Due cards summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{dueCards.length}</Text>
          <Text style={styles.summaryLabel}>cards due for review</Text>
        </View>

        {/* Practice options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, dueCards.length === 0 && styles.disabledCard]}
            onPress={() => dueCards.length > 0 && setPracticeMode("quiz")}
            disabled={dueCards.length === 0}
          >
            <Text style={styles.optionEmoji}>🎯</Text>
            <Text style={styles.optionTitle}>Recognition Quiz</Text>
            <Text style={styles.optionDescription}>
              Test your knowledge of word meanings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, dueCards.length === 0 && styles.disabledCard]}
            onPress={() => dueCards.length > 0 && setPracticeMode("stroke")}
            disabled={dueCards.length === 0}
          >
            <Text style={styles.optionEmoji}>✍️</Text>
            <Text style={styles.optionTitle}>Stroke Order</Text>
            <Text style={styles.optionDescription}>
              Learn how to write characters correctly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {dueCards.length === 0 && vocabulary.length > 0 && (
          <View style={styles.emptyDue}>
            <Text style={styles.emptyDueText}>
              🎉 All caught up! No cards due for review.
            </Text>
          </View>
        )}

        {vocabulary.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No vocabulary to practice</Text>
            <Text style={styles.emptyText}>
              Add some words from the Translate tab first.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  menuContainer: {
    padding: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  summaryNumber: {
    fontSize: 64,
    fontWeight: "700",
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  disabledCard: {
    opacity: 0.5,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  emptyDue: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  emptyDueText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: SPACING.xl,
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
  },
  completeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  completeTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  completeStats: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  completePercent: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: "600",
  },
  strokeContainer: {
    padding: SPACING.md,
    alignItems: "center",
  },
  strokeTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  strokeSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  hanziContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  characterWrapper: {
    alignItems: "center",
  },
  charLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: "600",
  },
});
