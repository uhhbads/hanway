import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { COLORS, FONT_SIZES, SPACING, TTS_CONFIG } from "@/constants";
import type { VocabularyItem, Rating } from "@/types";
import { getSchedulingOptions } from "../services/fsrs";

interface RecognitionQuizProps {
  item: VocabularyItem;
  options: string[];
  onAnswer: (rating: Rating) => void;
}

export function RecognitionQuiz({ item, options, onAnswer }: RecognitionQuizProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const schedulingOptions = getSchedulingOptions(item);

  const handleSpeak = () => {
    Speech.speak(item.chinese, {
      language: TTS_CONFIG.language,
      pitch: TTS_CONFIG.pitch,
      rate: TTS_CONFIG.rate,
    });
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowAnswer(true);
  };

  const isCorrect = selectedOption === item.english;

  if (showAnswer) {
    return (
      <View style={styles.container}>
        {/* Answer reveal */}
        <View style={styles.answerCard}>
          <Text style={styles.pinyin}>{item.pinyin}</Text>
          <Text style={styles.chinese}>{item.chinese}</Text>
          <TouchableOpacity onPress={handleSpeak} style={styles.speakButton}>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
          <Text style={styles.english}>{item.english}</Text>

          {/* Result */}
          <View style={[styles.resultBadge, isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
            <Text style={styles.resultText}>{isCorrect ? "✓ Correct!" : "✗ Incorrect"}</Text>
          </View>
        </View>

        {/* Rating buttons */}
        <Text style={styles.ratingPrompt}>How well did you know this?</Text>
        <View style={styles.ratingButtons}>
          <TouchableOpacity
            style={[styles.ratingButton, styles.againButton]}
            onPress={() => onAnswer("again")}
          >
            <Text style={styles.ratingLabel}>Again</Text>
            <Text style={styles.ratingInterval}>{schedulingOptions.again.interval}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingButton, styles.hardButton]}
            onPress={() => onAnswer("hard")}
          >
            <Text style={styles.ratingLabel}>Hard</Text>
            <Text style={styles.ratingInterval}>{schedulingOptions.hard.interval}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingButton, styles.goodButton]}
            onPress={() => onAnswer("good")}
          >
            <Text style={styles.ratingLabel}>Good</Text>
            <Text style={styles.ratingInterval}>{schedulingOptions.good.interval}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingButton, styles.easyButton]}
            onPress={() => onAnswer("easy")}
          >
            <Text style={styles.ratingLabel}>Easy</Text>
            <Text style={styles.ratingInterval}>{schedulingOptions.easy.interval}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionCard}>
        <Text style={styles.pinyin}>{item.pinyin}</Text>
        <Text style={styles.chinese}>{item.chinese}</Text>
        <TouchableOpacity onPress={handleSpeak} style={styles.speakButton}>
          <Text style={styles.speakIcon}>🔊</Text>
        </TouchableOpacity>
        <Text style={styles.questionPrompt}>What does this mean?</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleOptionSelect(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  answerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  pinyin: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  chinese: {
    fontSize: FONT_SIZES.chineseLarge,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  speakButton: {
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  speakIcon: {
    fontSize: 32,
  },
  english: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontWeight: "500",
  },
  questionPrompt: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: "center",
  },
  optionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  resultBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  correctBadge: {
    backgroundColor: COLORS.success,
  },
  incorrectBadge: {
    backgroundColor: COLORS.error,
  },
  resultText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: "600",
  },
  ratingPrompt: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  ratingButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
  },
  againButton: {
    backgroundColor: "#dc2626",
  },
  hardButton: {
    backgroundColor: "#f59e0b",
  },
  goodButton: {
    backgroundColor: "#22c55e",
  },
  easyButton: {
    backgroundColor: "#3b82f6",
  },
  ratingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: "600",
  },
  ratingInterval: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});
