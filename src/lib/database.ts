import * as SQLite from "expo-sqlite";
import type { VocabularyItem, ColloquialSuggestion, PracticeSession } from "@/types";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("hanway.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id TEXT PRIMARY KEY,
      chinese TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      english TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      stability REAL DEFAULT 0,
      difficulty REAL DEFAULT 0,
      elapsedDays INTEGER DEFAULT 0,
      scheduledDays INTEGER DEFAULT 0,
      reps INTEGER DEFAULT 0,
      lapses INTEGER DEFAULT 0,
      state TEXT DEFAULT 'new',
      lastReview TEXT
    );

    CREATE TABLE IF NOT EXISTS colloquial_suggestions (
      id TEXT PRIMARY KEY,
      originalPhrase TEXT NOT NULL,
      colloquialPhrase TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      formality TEXT NOT NULL,
      context TEXT NOT NULL,
      explanation TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      upvotes INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS practice_sessions (
      id TEXT PRIMARY KEY,
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      totalCards INTEGER DEFAULT 0,
      correctCount INTEGER DEFAULT 0,
      againCount INTEGER DEFAULT 0,
      hardCount INTEGER DEFAULT 0,
      goodCount INTEGER DEFAULT 0,
      easyCount INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_vocabulary_dueDate ON vocabulary(dueDate);
    CREATE INDEX IF NOT EXISTS idx_vocabulary_state ON vocabulary(state);
  `);
}

// Vocabulary CRUD
export async function addVocabulary(item: VocabularyItem): Promise<void> {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    `INSERT INTO vocabulary (id, chinese, pinyin, english, createdAt, dueDate, stability, difficulty, elapsedDays, scheduledDays, reps, lapses, state, lastReview)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.chinese,
      item.pinyin,
      item.english,
      item.createdAt.toISOString(),
      item.dueDate.toISOString(),
      item.stability,
      item.difficulty,
      item.elapsedDays,
      item.scheduledDays,
      item.reps,
      item.lapses,
      item.state,
      item.lastReview?.toISOString() ?? null,
    ]
  );
}

export async function getAllVocabulary(): Promise<VocabularyItem[]> {
  if (!db) await initDatabase();
  
  const rows = await db!.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM vocabulary ORDER BY createdAt DESC`
  );
  
  return rows.map(rowToVocabularyItem);
}

export async function getDueVocabulary(): Promise<VocabularyItem[]> {
  if (!db) await initDatabase();
  
  const now = new Date().toISOString();
  const rows = await db!.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM vocabulary WHERE dueDate <= ? ORDER BY dueDate ASC`,
    [now]
  );
  
  return rows.map(rowToVocabularyItem);
}

type SQLiteBindValue = string | number | null | Uint8Array;

export async function updateVocabulary(id: string, updates: Partial<VocabularyItem>): Promise<void> {
  if (!db) await initDatabase();
  
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];
  
  if (updates.stability !== undefined) {
    fields.push("stability = ?");
    values.push(updates.stability);
  }
  if (updates.difficulty !== undefined) {
    fields.push("difficulty = ?");
    values.push(updates.difficulty);
  }
  if (updates.elapsedDays !== undefined) {
    fields.push("elapsedDays = ?");
    values.push(updates.elapsedDays);
  }
  if (updates.scheduledDays !== undefined) {
    fields.push("scheduledDays = ?");
    values.push(updates.scheduledDays);
  }
  if (updates.reps !== undefined) {
    fields.push("reps = ?");
    values.push(updates.reps);
  }
  if (updates.lapses !== undefined) {
    fields.push("lapses = ?");
    values.push(updates.lapses);
  }
  if (updates.state !== undefined) {
    fields.push("state = ?");
    values.push(updates.state);
  }
  if (updates.lastReview !== undefined) {
    fields.push("lastReview = ?");
    values.push(updates.lastReview?.toISOString() ?? null);
  }
  if (updates.dueDate !== undefined) {
    fields.push("dueDate = ?");
    values.push(updates.dueDate.toISOString());
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db!.runAsync(
    `UPDATE vocabulary SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export async function deleteVocabulary(id: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(`DELETE FROM vocabulary WHERE id = ?`, [id]);
}

export async function searchVocabulary(query: string): Promise<VocabularyItem[]> {
  if (!db) await initDatabase();
  
  const searchTerm = `%${query}%`;
  const rows = await db!.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM vocabulary 
     WHERE chinese LIKE ? OR pinyin LIKE ? OR english LIKE ?
     ORDER BY createdAt DESC`,
    [searchTerm, searchTerm, searchTerm]
  );
  
  return rows.map(rowToVocabularyItem);
}

// Helper to convert DB row to VocabularyItem
function rowToVocabularyItem(row: Record<string, unknown>): VocabularyItem {
  return {
    id: row.id as string,
    chinese: row.chinese as string,
    pinyin: row.pinyin as string,
    english: row.english as string,
    createdAt: new Date(row.createdAt as string),
    dueDate: new Date(row.dueDate as string),
    stability: row.stability as number,
    difficulty: row.difficulty as number,
    elapsedDays: row.elapsedDays as number,
    scheduledDays: row.scheduledDays as number,
    reps: row.reps as number,
    lapses: row.lapses as number,
    state: row.state as VocabularyItem["state"],
    lastReview: row.lastReview ? new Date(row.lastReview as string) : null,
  };
}

// Practice Sessions
export async function createPracticeSession(session: PracticeSession): Promise<void> {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    `INSERT INTO practice_sessions (id, startedAt, totalCards)
     VALUES (?, ?, ?)`,
    [session.id, session.startedAt.toISOString(), session.totalCards]
  );
}

export async function updatePracticeSession(id: string, updates: Partial<PracticeSession>): Promise<void> {
  if (!db) await initDatabase();
  
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];
  
  if (updates.completedAt) {
    fields.push("completedAt = ?");
    values.push(updates.completedAt.toISOString());
  }
  if (updates.correctCount !== undefined) {
    fields.push("correctCount = ?");
    values.push(updates.correctCount);
  }
  if (updates.againCount !== undefined) {
    fields.push("againCount = ?");
    values.push(updates.againCount);
  }
  if (updates.hardCount !== undefined) {
    fields.push("hardCount = ?");
    values.push(updates.hardCount);
  }
  if (updates.goodCount !== undefined) {
    fields.push("goodCount = ?");
    values.push(updates.goodCount);
  }
  if (updates.easyCount !== undefined) {
    fields.push("easyCount = ?");
    values.push(updates.easyCount);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db!.runAsync(
    `UPDATE practice_sessions SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}
