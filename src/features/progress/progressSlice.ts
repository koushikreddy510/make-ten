import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DifficultyId } from '../game/types';

export interface LevelProgress {
  /** Highest level the player may start. */
  unlocked: number;
  /** Best star rating per level. */
  stars: Record<number, number>;
  /** Best score per level. */
  best: Record<number, number>;
}

/** Progress is kept separately for each difficulty. */
export type ProgressState = Record<DifficultyId, LevelProgress>;

const emptyLevelProgress = (): LevelProgress => ({ unlocked: 1, stars: {}, best: {} });
export const initialProgressState = (): ProgressState => ({
  easy: emptyLevelProgress(),
  medium: emptyLevelProgress(),
  hard: emptyLevelProgress(),
});

export interface LevelCompletedPayload {
  difficulty: DifficultyId;
  level: number;
  stars: number;
  score: number;
}

/** Wipes all progress. Other slices listen for this to clear their own related data. */
export const progressReset = createAction('progress/reset');

const progressSlice = createSlice({
  name: 'progress',
  initialState: initialProgressState(),
  reducers: {
    levelCompleted(state, { payload }: PayloadAction<LevelCompletedPayload>) {
      const p = state[payload.difficulty];
      p.unlocked = Math.max(p.unlocked, payload.level + 1);
      p.stars[payload.level] = Math.max(p.stars[payload.level] ?? 0, payload.stars);
      p.best[payload.level] = Math.max(p.best[payload.level] ?? 0, payload.score);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(progressReset, () => initialProgressState());
  },
});

export const { levelCompleted } = progressSlice.actions;
export const progressReducer = progressSlice.reducer;
