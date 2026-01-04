import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card,
  type RecordLogItem,
  type RecordLog,
} from "ts-fsrs";
import type { VocabularyItem, Rating as AppRating } from "@/types";

// Initialize FSRS with default parameters
const params = generatorParameters({ enable_fuzz: true });
const scheduler = fsrs(params);

/**
 * Convert app rating to FSRS rating (excluding Manual)
 */
type GradeRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

function toFSRSRating(rating: AppRating): GradeRating {
  switch (rating) {
    case "again":
      return Rating.Again;
    case "hard":
      return Rating.Hard;
    case "good":
      return Rating.Good;
    case "easy":
      return Rating.Easy;
    default:
      return Rating.Good;
  }
}

/**
 * Convert FSRS card state to app card state
 */
function toAppState(state: number): VocabularyItem["state"] {
  switch (state) {
    case 0:
      return "new";
    case 1:
      return "learning";
    case 2:
      return "review";
    case 3:
      return "relearning";
    default:
      return "new";
  }
}

/**
 * Create initial FSRS card from vocabulary item
 */
export function createCardFromVocab(item: VocabularyItem): Card {
  if (item.reps === 0) {
    return createEmptyCard();
  }

  return {
    due: item.dueDate,
    stability: item.stability,
    difficulty: item.difficulty,
    elapsed_days: item.elapsedDays,
    scheduled_days: item.scheduledDays,
    reps: item.reps,
    lapses: item.lapses,
    state: item.state === "new" ? 0 : item.state === "learning" ? 1 : item.state === "review" ? 2 : 3,
    last_review: item.lastReview || undefined,
    learning_steps: 0,
  };
}

/**
 * Schedule next review based on user's rating
 */
export function scheduleReview(
  item: VocabularyItem,
  rating: AppRating
): Partial<VocabularyItem> {
  const card = createCardFromVocab(item);
  const now = new Date();

  const recordLog = scheduler.repeat(card, now) as RecordLog;
  const fsrsRating = toFSRSRating(rating);
  const result = recordLog[fsrsRating] as RecordLogItem;

  return {
    stability: result.card.stability,
    difficulty: result.card.difficulty,
    elapsedDays: result.card.elapsed_days,
    scheduledDays: result.card.scheduled_days,
    reps: result.card.reps,
    lapses: result.card.lapses,
    state: toAppState(result.card.state),
    lastReview: now,
    dueDate: result.card.due,
  };
}

/**
 * Get all scheduling options for a card (for showing intervals to user)
 */
export function getSchedulingOptions(item: VocabularyItem): {
  again: { interval: string; due: Date };
  hard: { interval: string; due: Date };
  good: { interval: string; due: Date };
  easy: { interval: string; due: Date };
} {
  const card = createCardFromVocab(item);
  const now = new Date();
  const recordLog = scheduler.repeat(card, now) as RecordLog;

  const againItem = recordLog[Rating.Again] as RecordLogItem;
  const hardItem = recordLog[Rating.Hard] as RecordLogItem;
  const goodItem = recordLog[Rating.Good] as RecordLogItem;
  const easyItem = recordLog[Rating.Easy] as RecordLogItem;

  return {
    again: {
      interval: formatInterval(againItem.card.scheduled_days),
      due: againItem.card.due,
    },
    hard: {
      interval: formatInterval(hardItem.card.scheduled_days),
      due: hardItem.card.due,
    },
    good: {
      interval: formatInterval(goodItem.card.scheduled_days),
      due: goodItem.card.due,
    },
    easy: {
      interval: formatInterval(easyItem.card.scheduled_days),
      due: easyItem.card.due,
    },
  };
}

/**
 * Format interval for display
 */
function formatInterval(days: number): string {
  if (days < 1) {
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    return `${Math.round(minutes / 60)}h`;
  }
  if (days < 30) {
    return `${Math.round(days)}d`;
  }
  if (days < 365) {
    return `${Math.round(days / 30)}mo`;
  }
  return `${(days / 365).toFixed(1)}y`;
}

/**
 * Calculate retention rate for a set of vocabulary items
 */
export function calculateRetention(items: VocabularyItem[]): number {
  if (items.length === 0) return 0;

  const reviewed = items.filter((item) => item.reps > 0);
  if (reviewed.length === 0) return 0;

  // Simple retention estimation based on lapses ratio
  const totalReps = reviewed.reduce((sum, item) => sum + item.reps, 0);
  const totalLapses = reviewed.reduce((sum, item) => sum + item.lapses, 0);

  if (totalReps === 0) return 0;
  return Math.round(((totalReps - totalLapses) / totalReps) * 100);
}
