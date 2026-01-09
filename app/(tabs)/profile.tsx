import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, FONT_SIZES, SPACING } from "@/constants";
import { useAppStore } from "@/store/useAppStore";
import { calculateRetention } from "@/features/practice";
import { useAuth } from "@/features/auth/useAuth";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const router = useRouter();
  const { vocabulary, stats } = useAppStore();
  const { user, isGuest, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const retention = calculateRetention(vocabulary);
  const totalReviews = vocabulary.reduce((sum, item) => sum + item.reps, 0);
  const wordsLearned = vocabulary.filter((item) => item.state === "review").length;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Do you want to keep your vocabulary data for next time?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut(true);
              Toast.show({
                type: 'success',
                text1: 'Signed Out',
                text2: 'Your data has been deleted',
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Sign Out Failed',
                text2: error.message || 'Could not sign out',
              });
            } finally {
              setIsSigningOut(false);
            }
          },
        },
        {
          text: 'Keep Data',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut(false);
              Toast.show({
                type: 'success',
                text1: 'Signed Out',
                text2: 'Your data is preserved',
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Sign Out Failed',
                text2: error.message || 'Could not sign out',
              });
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
    );
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isGuest ? '👤' : '🎓'}</Text>
          </View>
          
          {isGuest ? (
            <>
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeText}>Guest Mode</Text>
              </View>
              <Text style={styles.greeting}>Welcome, Guest!</Text>
              <Text style={styles.subtitle}>Sign in to sync your progress</Text>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
              >
                <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.subtitle}>{user?.email || 'Taiwan Mandarin Learner'}</Text>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={isSigningOut}
              >
                <Text style={styles.signOutButtonText}>
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  guestBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  guestBadgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
