import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { levelFinished } from '@/features/ads/adsSlice';
import { coinsEarned } from '@/features/player/playerSlice';
import { levelCompleted } from '@/features/progress/progressSlice';
import { cellTapped, hintUsed, resultRecorded, shuffleUsed, undoUsed } from '@/features/game/sessionSlice';
import { coinsFor, starsFor } from '@/features/game/engine';
import { Cue, cueForChange } from '@/features/game/cues';
import { PersistedState, SAVE_VERSION } from './persistence';
import type { RootState } from './index';

/** Things the store reaches out to. Swapped for fakes in tests. */
export interface ListenerDeps {
  save: (state: PersistedState) => void | Promise<void>;
  playCue: (cue: Cue) => void;
  configureFeedback: (settings: { sound: boolean; haptics: boolean }) => void;
}

export const toPersisted = (s: RootState): PersistedState => ({
  version: SAVE_VERSION,
  player: s.player,
  settings: s.settings,
  progress: s.progress,
});

/**
 * Side effects that follow state changes, kept out of components and reducers:
 * saving, recording wins, and playing sound and haptics.
 */
export function createListeners(deps: ListenerDeps) {
  const listeners = createListenerMiddleware();
  const start = listeners.startListening.withTypes<RootState>();

  // Save whenever anything that should survive a restart changes.
  start({
    predicate: (_action, now, before) =>
      now.player !== before.player || now.settings !== before.settings || now.progress !== before.progress,
    effect: (_action, api) => {
      const state = api.getState();
      deps.configureFeedback(state.settings);
      void deps.save(toPersisted(state));
    },
  });

  // Add a win to the player's progress, once.
  start({
    predicate: (_action, now) => now.session.game?.status === 'won' && !now.session.resultRecorded,
    effect: (_action, api) => {
      const { game } = api.getState().session;
      if (!game) return;
      const stars = starsFor(game);
      api.dispatch(resultRecorded());
      api.dispatch(levelCompleted({ difficulty: game.difficulty, level: game.level, stars, score: game.score }));
      api.dispatch(coinsEarned(coinsFor(stars)));
      api.dispatch(levelFinished());
    },
  });

  // Sound and haptics for what the player just did.
  start({
    matcher: isAnyOf(cellTapped, hintUsed, shuffleUsed, undoUsed),
    effect: (action, api) => {
      const before = api.getOriginalState().session.game;
      const after = api.getState().session.game;
      if (!before || !after) return;
      const cue = hintUsed.match(action) || shuffleUsed.match(action) || undoUsed.match(action)
        ? after === before ? null : 'tap'
        : cueForChange(before, after);
      if (cue) deps.playCue(cue);
    },
  });


  

  return listeners;
}
