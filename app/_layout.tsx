import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { COLORS } from "@/constants";
import { onDatabaseError, initDatabase } from "@/lib/database";

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start
    initDatabase().catch((err) => {
      console.error("Database init failed:", err);
    });
    
    // Listen for database errors and show toast
    const unsubscribe = onDatabaseError((error) => {
      Toast.show({
        type: "error",
        text1: "Database Error",
        text2: error.message,
        visibilityTime: 4000,
      });
    });
    
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
