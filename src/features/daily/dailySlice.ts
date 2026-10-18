import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { progressReset } from '../progress/progressSlice';
import { DateKey, previousDateKey } from './dateKey';

export interface DailyResult {
  stars: number;
  score: number;
}

export interface DailyState {
  /** Days in a row with a finished daily board, as of `lastCompleted`. */
  streak: number;
  bestStreak: number;
  lastCompleted: DateKey | null;
  /** Best result per date. Only the most recent days are kept. */
  results: Record<DateKey, DailyResult>;
}

export const initialDailyState: DailyState = { streak: 0, bestStreak: 0, lastCompleted: null, results: {} };

const KEEP_DAYS = 60;

/** The streak after finishing the board for `dateKey`. */
export function nextStreak(lastCompleted: DateKey | null, streak: number, dateKey: DateKey): number {
  if (lastCompleted === dateKey) return streak;
  return lastCompleted === previousDateKey(dateKey) ? streak + 1 : 1;
}

/** The streak to show today. A missed day ends it, but it is still safe until the day is over. */
export function streakOn(state: DailyState, today: DateKey): number {
  if (state.lastCompleted === today || state.lastCompleted === previousDateKey(today)) return state.streak;
  return 0;
}

const dailySlice = createSlice({
  name: 'daily',
  initialState: initialDailyState,
  reducers: {
    dailyCompleted(state, action: PayloadAction<{ dateKey: DateKey; stars: number; score: number }>) {
      const { dateKey, stars, score } = action.payload;
      const before = state.results[dateKey];
      if (!before) {
        state.streak = nextStreak(state.lastCompleted, state.streak, dateKey);
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        if (!state.lastCompleted || dateKey > state.lastCompleted) state.lastCompleted = dateKey;
      }
      state.results[dateKey] = { stars: Math.max(before?.stars ?? 0, stars), score: Math.max(before?.score ?? 0, score) };
      const keys = Object.keys(state.results).sort();
      for (const old of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete state.results[old];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(progressReset, () => initialDailyState);
  },
});

export const { dailyCompleted } = dailySlice.actions;
export const dailyReducer = dailySlice.reducer;
