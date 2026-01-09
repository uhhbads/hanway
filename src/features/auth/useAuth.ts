import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { AuthService } from './auth.service';
import { onAuthStateChange } from '@/lib/supabase';
import type { User, AuthSession, AuthState } from '@/types';

/**
 * Auth Store using Zustand
 */
interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: (clearData?: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isGuest: true,

  setUser: (user) => set({ user, isGuest: !user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get current session
      const session = await AuthService.getCurrentSession();
      
      if (session?.user) {
        set({
          user: session.user,
          session,
          isGuest: false,
          loading: false,
        });
      } else {
        // No session = guest mode
        set({
          user: null,
          session: null,
          isGuest: true,
          loading: false,
        });
      }

      // Listen for auth state changes
      onAuthStateChange((session) => {
        if (session?.user) {
          set({
            user: session.user,
            session: session as AuthSession,
            isGuest: false,
          });
        } else {
          set({
            user: null,
            session: null,
            isGuest: true,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, isGuest: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      
      const session = await AuthService.signIn(email, password);
      
      // Transfer guest data to authenticated user
      if (session.user.id) {
        const transferredCount = await AuthService.transferGuestData(session.user.id);
        console.log(`Transferred ${transferredCount} vocabulary items to user`);
      }
      
      set({
        user: session.user,
        session,
        isGuest: false,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ loading: true });
      
      const session = await AuthService.signUp(email, password);
      
      // Transfer guest data to new user
      if (session.user.id) {
        const transferredCount = await AuthService.transferGuestData(session.user.id);
        console.log(`Transferred ${transferredCount} vocabulary items to new user`);
      }
      
      set({
        user: session.user,
        session,
        isGuest: false,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true });
      
      const session = await AuthService.signInWithGoogle();
      
      if (!session) {
        set({ loading: false });
        return;
      }
      
      // Transfer guest data
      if (session.user.id) {
        const transferredCount = await AuthService.transferGuestData(session.user.id);
        console.log(`Transferred ${transferredCount} vocabulary items to user`);
      }
      
      set({
        user: session.user,
        session,
        isGuest: false,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signInWithGitHub: async () => {
    try {
      set({ loading: true });
      
      const session = await AuthService.signInWithGitHub();
      
      if (!session) {
        set({ loading: false });
        return;
      }
      
      // Transfer guest data
      if (session.user.id) {
        const transferredCount = await AuthService.transferGuestData(session.user.id);
        console.log(`Transferred ${transferredCount} vocabulary items to user`);
      }
      
      set({
        user: session.user,
        session,
        isGuest: false,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async (clearData = false) => {
    try {
      set({ loading: true });
      
      const { user } = get();
      
      // Optionally clear user data
      if (clearData && user?.id) {
        await AuthService.clearUserData(user.id);
      }
      
      await AuthService.signOut();
      
      set({
        user: null,
        session: null,
        isGuest: true,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

/**
 * Hook for using auth in components
 */
export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    store.initialize();
  }, []);

  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    isGuest: store.isGuest,
    signIn: store.signIn,
    signUp: store.signUp,
    signInWithGoogle: store.signInWithGoogle,
    signInWithGitHub: store.signInWithGitHub,
    signOut: store.signOut,
  };
}
