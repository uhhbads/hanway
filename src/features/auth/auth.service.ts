import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGitHub,
  signOut as supabaseSignOut,
  getSession,
} from '@/lib/supabase';
import { initDatabase } from '@/lib/database';
import type { AuthSession } from '@/types';
import * as SQLite from 'expo-sqlite';

/**
 * Auth Service
 * Handles authentication operations and guest-to-user upgrades
 */

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthSession> {
    const result = await signInWithEmail(email, password);
    
    if (!result.session) {
      throw new Error('No session returned from sign in');
    }
    
    return result.session as AuthSession;
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string): Promise<AuthSession> {
    const result = await signUpWithEmail(email, password);
    
    if (!result.session) {
      throw new Error('No session returned from sign up');
    }
    
    return result.session as AuthSession;
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<AuthSession | null> {
    const result = await signInWithGoogle();
    
    if (result?.session) {
      return result.session as AuthSession;
    }
    
    return null;
  }

  /**
   * Sign in with GitHub OAuth
   */
  static async signInWithGitHub(): Promise<AuthSession | null> {
    const result = await signInWithGitHub();
    
    if (result?.session) {
      return result.session as AuthSession;
    }
    
    return null;
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    await supabaseSignOut();
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<AuthSession | null> {
    const session = await getSession();
    return session as AuthSession | null;
  }

  /**
   * Transfer guest data to authenticated user
   * This assigns all vocabulary items with NULL user_id to the authenticated user
   */
  static async transferGuestData(userId: string): Promise<number> {
    // Ensure database is initialized and migrated before querying user_id column
    await initDatabase();
    const db = await SQLite.openDatabaseAsync('hanway.db');
    
    // Update all vocabulary items that don't have a user_id (guest items)
    const result = await db.runAsync(
      `UPDATE vocabulary SET user_id = ? WHERE user_id IS NULL`,
      [userId]
    );
    
    return result.changes;
  }

  /**
   * Clear user data on sign out (optional based on user preference)
   */
  static async clearUserData(userId: string): Promise<void> {
    // Ensure database is initialized and migrated before querying user_id column
    await initDatabase();
    const db = await SQLite.openDatabaseAsync('hanway.db');
    
    // Delete all vocabulary items belonging to this user
    await db.runAsync(
      `DELETE FROM vocabulary WHERE user_id = ?`,
      [userId]
    );
  }

  /**
   * Get vocabulary count for current user/guest
   */
  static async getVocabularyCount(userId?: string): Promise<number> {
    // Ensure database is initialized and migrated before querying user_id column
    await initDatabase();
    const db = await SQLite.openDatabaseAsync('hanway.db');
    
    let query: string;
    let params: any[];
    
    if (userId) {
      // Authenticated user: count items belonging to this user
      query = `SELECT COUNT(*) as count FROM vocabulary WHERE user_id = ?`;
      params = [userId];
    } else {
      // Guest: count items with NULL user_id
      query = `SELECT COUNT(*) as count FROM vocabulary WHERE user_id IS NULL`;
      params = [];
    }
    
    const result = await db.getFirstAsync<{ count: number }>(query, params);
    return result?.count ?? 0;
  }
}
