import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { COLORS, FONT_SIZES, SPACING, TTS_CONFIG } from "@/constants";
import type { VocabularyItem } from "@/types";

interface VocabItemCardProps {
  item: VocabularyItem;
  onDelete?: () => void;
  onPress?: () => void;
}

export function VocabItemCard({ item, onDelete, onPress }: VocabItemCardProps) {
  const handleSpeak = () => {
    Speech.speak(item.chinese, {
      language: TTS_CONFIG.language,
      pitch: TTS_CONFIG.pitch,
      rate: TTS_CONFIG.rate,
    });
  };

  const getStateColor = () => {
    switch (item.state) {
      case "new":
        return COLORS.primary;
      case "learning":
        return COLORS.warning;
      case "review":
        return COLORS.success;
      case "relearning":
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* State indicator */}
        <View style={[styles.stateIndicator, { backgroundColor: getStateColor() }]} />

        {/* Main info */}
        <View style={styles.mainInfo}>
          <View style={styles.chineseRow}>
            <Text style={styles.chinese}>{item.chinese}</Text>
            <TouchableOpacity onPress={handleSpeak} style={styles.speakerButton}>
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.pinyin}>{item.pinyin}</Text>
          <Text style={styles.english}>{item.english}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <Text style={styles.statText}>{item.reps} reviews</Text>
          {item.state !== "new" && (
            <Text style={styles.dueText}>
              Due: {formatDueDate(item.dueDate)}
            </Text>
          )}
        </View>

        {/* Delete button */}
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function formatDueDate(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Now";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.ceil(days / 7)} weeks`;
  return `${Math.ceil(days / 30)} months`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: SPACING.xs,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  stateIndicator: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  mainInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  chineseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  chinese: {
    fontSize: FONT_SIZES.chinese,
    color: COLORS.text,
    fontWeight: "600",
  },
  speakerButton: {
    padding: SPACING.xs,
  },
  speakerIcon: {
    fontSize: FONT_SIZES.lg,
  },
  pinyin: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  english: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  stats: {
    alignItems: "flex-end",
    marginRight: SPACING.sm,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  dueText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 2,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  deleteIcon: {
    fontSize: FONT_SIZES.lg,
  },
});
