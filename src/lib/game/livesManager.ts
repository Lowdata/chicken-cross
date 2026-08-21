/**
 * Daily 5-Lives Management System
 * Persists daily lives in localStorage and resets every day at midnight (local time).
 */

const STORAGE_KEYS = {
  LIVES_DATE: 'bunnyhop_lives_date',
  LIVES_COUNT: 'bunnyhop_lives_count',
  EXTRA_LIVES: 'bunnyhop_extra_lives',
};

export const MAX_DAILY_LIVES = 5;
export const EXTRA_LIFE_CARROT_COST = 15;

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getRemainingTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}

export interface LivesState {
  lives: number;
  maxLives: number;
  dateStr: string;
  isOutOfLives: boolean;
}

export function loadDailyLives(): LivesState {
  if (typeof window === 'undefined') {
    return { lives: MAX_DAILY_LIVES, maxLives: MAX_DAILY_LIVES, dateStr: '', isOutOfLives: false };
  }

  try {
    const today = getTodayDateString();
    const savedDate = localStorage.getItem(STORAGE_KEYS.LIVES_DATE);
    const savedLives = localStorage.getItem(STORAGE_KEYS.LIVES_COUNT);

    if (savedDate !== today || savedLives === null) {
      // New day! Reset to 5 lives
      localStorage.setItem(STORAGE_KEYS.LIVES_DATE, today);
      localStorage.setItem(STORAGE_KEYS.LIVES_COUNT, String(MAX_DAILY_LIVES));
      return { lives: MAX_DAILY_LIVES, maxLives: MAX_DAILY_LIVES, dateStr: today, isOutOfLives: false };
    }

    const count = parseInt(savedLives, 10);
    const safeCount = isNaN(count) ? MAX_DAILY_LIVES : Math.max(0, count);
    return {
      lives: safeCount,
      maxLives: MAX_DAILY_LIVES,
      dateStr: today,
      isOutOfLives: safeCount <= 0,
    };
  } catch {
    return { lives: MAX_DAILY_LIVES, maxLives: MAX_DAILY_LIVES, dateStr: '', isOutOfLives: false };
  }
}

export function consumeLife(): LivesState {
  const current = loadDailyLives();
  if (current.lives <= 0) {
    return current;
  }

  const newCount = Math.max(0, current.lives - 1);
  try {
    localStorage.setItem(STORAGE_KEYS.LIVES_COUNT, String(newCount));
  } catch {
    // Ignore
  }

  return {
    ...current,
    lives: newCount,
    isOutOfLives: newCount <= 0,
  };
}

export function addLife(): LivesState {
  const current = loadDailyLives();
  const newCount = current.lives + 1;
  try {
    localStorage.setItem(STORAGE_KEYS.LIVES_COUNT, String(newCount));
  } catch {
    // Ignore
  }

  return {
    ...current,
    lives: newCount,
    isOutOfLives: false,
  };
}
