import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

// Supabase configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth redirect configuration
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: 'hanway',
  path: 'auth/callback',
});

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) throw error;

  // Open the OAuth provider URL in a browser
  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    if (result.type === 'success') {
      const url = result.url;
      // Extract session from callback URL
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSessionFromUrl({ url });
      if (sessionError) throw sessionError;
      return sessionData;
    }
  }

  return null;
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) throw error;

  // Open the OAuth provider URL in a browser
  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    if (result.type === 'success') {
      const url = result.url;
      // Extract session from callback URL
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSessionFromUrl({ url });
      if (sessionError) throw sessionError;
      return sessionData;
    }
  }

  return null;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
