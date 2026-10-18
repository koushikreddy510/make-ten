import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DifficultyId } from '../game/types';
import { progressReset } from '../progress/progressSlice';

/** Who the player is and what they own. Add profile fields here when accounts arrive. */
export interface PlayerState {
  /** The difficulty the player plays on, or null until they pick one on first launch. */
  difficulty: DifficultyId | null;
  tutorialSeen: boolean;
  coins: number;
  /** Set by the one-time "Remove ads" purchase. */
  adsRemoved: boolean;
}

export const initialPlayerState: PlayerState = { difficulty: null, tutorialSeen: false, coins: 0, adsRemoved: false };

const playerSlice = createSlice({
  name: 'player',
  initialState: initialPlayerState,
  reducers: {
    difficultyChosen(state, action: PayloadAction<DifficultyId>) {
      state.difficulty = action.payload;
    },
    tutorialCompleted(state) {
      state.tutorialSeen = true;
    },
    adsRemovedSet(state, action: PayloadAction<boolean>) {
      state.adsRemoved = action.payload;
    },
    coinsEarned(state, action: PayloadAction<number>) {
      state.coins += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(progressReset, (state) => {
      state.coins = 0;
    });
  },
});

export const { difficultyChosen, tutorialCompleted, coinsEarned, adsRemovedSet } = playerSlice.actions;
export const playerReducer = playerSlice.reducer;
