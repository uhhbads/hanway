import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_SIZES, SPACING } from "@/constants";
import { VocabItemCard, useVocabulary } from "@/features/vocabulary";

export default function VocabularyScreen() {
  const { vocabulary, isLoading, search, removeWord, refresh } = useVocabulary();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      search(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, search]);

  const handleDelete = (id: string, chinese: string) => {
    Alert.alert(
      "Delete Word",
      `Are you sure you want to delete "${chinese}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeWord(id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading vocabulary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search vocabulary..."
          placeholderTextColor={COLORS.textMuted}
        />
        {searchQuery.length > 0 && (
          <Text style={styles.searchIcon}>🔍</Text>
        )}
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {vocabulary.length} word{vocabulary.length !== 1 ? "s" : ""} saved
        </Text>
        <View style={styles.statsBadges}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.statBadgeText}>
              {vocabulary.filter((v) => v.state === "new").length} new
            </Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statBadgeText}>
              {vocabulary.filter((v) => v.state === "review").length} review
            </Text>
          </View>
        </View>
      </View>

      {/* Vocabulary List */}
      {vocabulary.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>No vocabulary yet</Text>
          <Text style={styles.emptyText}>
            Start by translating some words and saving them to your vocabulary.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vocabulary}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VocabItemCard
              item={item}
              onDelete={() => handleDelete(item.id, item.chinese)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  searchIcon: {
    fontSize: FONT_SIZES.lg,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  statsBadges: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  statBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    maxWidth: 280,
  },
});
