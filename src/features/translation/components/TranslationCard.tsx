import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { COLORS, FONT_SIZES, SPACING, TTS_CONFIG } from "@/constants";
import type { TranslationResult } from "@/types";

interface TranslationCardProps {
  result: TranslationResult;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export function TranslationCard({ result, onSave, showSaveButton = true }: TranslationCardProps) {
  const handleSpeak = () => {
    Speech.speak(result.chinese, {
      language: TTS_CONFIG.language,
      pitch: TTS_CONFIG.pitch,
      rate: TTS_CONFIG.rate,
    });
  };

  return (
    <View style={styles.container}>
      {/* Chinese with Pinyin */}
      <View style={styles.mainContent}>
        <Text style={styles.pinyin}>{result.pinyin}</Text>
        <Text style={styles.chinese}>{result.chinese}</Text>
      </View>

      {/* English */}
      <Text style={styles.english}>{result.english}</Text>

      {/* Character breakdown with optional glosses */}
      <View style={styles.breakdownContainer}>
        {result.characters.map((char, index) => (
          <View key={index} style={styles.characterBox}>
            <Text style={styles.charPinyin}>{char.pinyin}</Text>
            <Text style={styles.character}>{char.character}</Text>
            {char.englishGloss && (
              <Text style={styles.charGloss} numberOfLines={2}>
                {char.englishGloss}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSpeak}>
          <Text style={styles.actionIcon}>🔊</Text>
          <Text style={styles.actionText}>Listen</Text>
        </TouchableOpacity>

        {showSaveButton && onSave && (
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={onSave}>
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  mainContent: {
    alignItems: "center",
    marginBottom: SPACING.md,
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
  },
  english: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  breakdownContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  characterBox: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: "center",
    minWidth: 60,
    maxWidth: 80,
  },
  charPinyin: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  character: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  charGloss: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  actionIcon: {
    fontSize: FONT_SIZES.lg,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: "500",
  },
});
