import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { COLORS, FONT_SIZES, SPACING, TTS_CONFIG } from "@/constants";
import type { ColloquialSuggestion } from "@/types";

interface ColloquialCardProps {
  suggestion: ColloquialSuggestion;
  onUpvote?: () => void;
}

export function ColloquialCard({ suggestion, onUpvote }: ColloquialCardProps) {
  const handleSpeak = () => {
    Speech.speak(suggestion.colloquialPhrase, {
      language: TTS_CONFIG.language,
      pitch: TTS_CONFIG.pitch,
      rate: TTS_CONFIG.rate,
    });
  };

  const getFormalityColor = () => {
    switch (suggestion.formality) {
      case "casual":
        return COLORS.success;
      case "polite":
        return COLORS.warning;
      case "formal":
        return COLORS.primary;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with formality badge */}
      <View style={styles.header}>
        <View style={[styles.formalityBadge, { backgroundColor: getFormalityColor() }]}>
          <Text style={styles.formalityText}>{suggestion.formality}</Text>
        </View>
        {suggestion.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.phraseRow}>
          <View style={styles.phraseInfo}>
            <Text style={styles.pinyin}>{suggestion.pinyin}</Text>
            <Text style={styles.phrase}>{suggestion.colloquialPhrase}</Text>
            {suggestion.englishGloss && (
              <Text style={styles.englishGloss}>{suggestion.englishGloss}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleSpeak} style={styles.speakButton}>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
        </View>

        {/* Context */}
        <View style={styles.contextBox}>
          <Text style={styles.contextLabel}>When to use:</Text>
          <Text style={styles.contextText}>{suggestion.context}</Text>
        </View>

        {/* Explanation */}
        <Text style={styles.explanation}>{suggestion.explanation}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.upvoteButton} onPress={onUpvote}>
          <Text style={styles.upvoteIcon}>👍</Text>
          <Text style={styles.upvoteCount}>{suggestion.upvotes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: SPACING.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  formalityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formalityText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  verifiedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: "500",
  },
  content: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  phraseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phraseInfo: {
    flex: 1,
  },
  pinyin: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  phrase: {
    fontSize: FONT_SIZES.chinese,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: 2,
  },
  englishGloss: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    fontStyle: "italic",
  },
  speakButton: {
    padding: SPACING.sm,
  },
  speakIcon: {
    fontSize: 24,
  },
  contextBox: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  contextLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  contextText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  explanation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontStyle: "italic",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  upvoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: SPACING.xs,
  },
  upvoteIcon: {
    fontSize: FONT_SIZES.md,
  },
  upvoteCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
