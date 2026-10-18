import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import {
  applyContinue, applyHint, applyShuffle, applyUndo, GameState, newDailyGame, newGame, tapCell, tickTimer,
} from './engine';
import { Cell, DifficultyId } from './types';

/** The level being played right now. It is thrown away when the player leaves the level. */
export interface SessionState {
  game: GameState | null;
  paused: boolean;
  /** Whether the win has already been added to the player's progress. */
  resultRecorded: boolean;
  /** Whether the win-screen coin bonus has been claimed. */
  bonusClaimed: boolean;
}

const initialState: SessionState = { game: null, paused: false, resultRecorded: false, bonusClaimed: false };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<{ difficulty: DifficultyId; level: number }>) {
      state.game = newGame(action.payload.difficulty, action.payload.level);
      state.paused = false;
      state.resultRecorded = false;
      state.bonusClaimed = false;
    },
    dailyStarted(state, action: PayloadAction<{ dateKey: string }>) {
      state.game = newDailyGame(action.payload.dateKey);
      state.paused = false;
      state.resultRecorded = false;
      state.bonusClaimed = false;
    },
    cellTapped(state, action: PayloadAction<{ cell: Cell; now: number }>) {
      if (state.game) state.game = tapCell(current(state.game), action.payload.cell, action.payload.now);
    },
    hintUsed(state) {
      if (state.game) state.game = applyHint(current(state.game));
    },
    shuffleUsed(state) {
      if (state.game) state.game = applyShuffle(current(state.game));
    },
    undoUsed(state) {
      if (state.game) state.game = applyUndo(current(state.game));
    },
    continueGranted(state, action: PayloadAction<{ moves: number; seconds: number }>) {
      if (state.game) state.game = applyContinue(current(state.game), action.payload);
    },
    bonusClaimed(state) {
      state.bonusClaimed = true;
    },
    clockTicked(state) {
      if (state.game) state.game = tickTimer(current(state.game));
    },
    paused(state) {
      state.paused = true;
    },
    resumed(state) {
      state.paused = false;
    },
    resultRecorded(state) {
      state.resultRecorded = true;
    },
  },
});

export const {
  sessionStarted, dailyStarted, cellTapped, hintUsed, shuffleUsed, undoUsed, clockTicked, paused, resumed, resultRecorded,
  continueGranted, bonusClaimed,
} = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
