import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_SIZES, SPACING } from "@/constants";
import { useAppStore } from "@/store/useAppStore";
import { calculateRetention } from "@/features/practice";

export default function ProfileScreen() {
  const { vocabulary, stats } = useAppStore();

  const retention = calculateRetention(vocabulary);
  const totalReviews = vocabulary.reduce((sum, item) => sum + item.reps, 0);
  const wordsLearned = vocabulary.filter((item) => item.state === "review").length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🎓</Text>
          </View>
          <Text style={styles.greeting}>Keep Learning!</Text>
          <Text style={styles.subtitle}>Taiwan Mandarin Learner</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{vocabulary.length}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{wordsLearned}</Text>
            <Text style={styles.statLabel}>Learned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{retention}%</Text>
            <Text style={styles.statLabel}>Retention</Text>
          </View>
        </View>

        {/* Learning Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.progressLabel}>New</Text>
              <Text style={styles.progressValue}>
                {vocabulary.filter((v) => v.state === "new").length}
              </Text>
            </View>
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.progressLabel}>Learning</Text>
              <Text style={styles.progressValue}>
                {vocabulary.filter((v) => v.state === "learning").length}
              </Text>
            </View>
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.progressLabel}>Review</Text>
              <Text style={styles.progressValue}>
                {vocabulary.filter((v) => v.state === "review").length}
              </Text>
            </View>
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.progressLabel}>Relearning</Text>
              <Text style={styles.progressValue}>
                {vocabulary.filter((v) => v.state === "relearning").length}
              </Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Hanway</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>漢Way</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.aboutText}>
              Learn Traditional Chinese the way native speakers in Taiwan actually talk.
              Bridge the gap between textbook learning and real conversation.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 40,
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  progressLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  progressValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: "center",
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  aboutText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
