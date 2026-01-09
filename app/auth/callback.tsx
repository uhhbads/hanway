import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { AuthService } from '@/features/auth';

/**
 * OAuth callback handler
 * This route handles the redirect back from OAuth providers (Google, GitHub)
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // Get the current session (should be set by Supabase after OAuth redirect)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        // Transfer guest data to the authenticated user
        const transferred = await AuthService.transferGuestData(session.user.id);
        console.log(`Transferred ${transferred} vocabulary items to user`);

        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: 'Successfully signed in',
        });

        router.replace('/(tabs)');
      } else {
        // No session, redirect to sign in
        router.replace('/auth/sign-in');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: error.message || 'Could not complete sign in',
      });
      router.replace('/auth/sign-in');
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
