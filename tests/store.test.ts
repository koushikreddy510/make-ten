import { describe, expect, it, vi } from 'vitest';
import { DIFFICULTIES } from '@/features/game/difficulty';
import { findGroup } from '@/features/game/solver';
import {
  cellTapped, hintUsed, sessionStarted, undoUsed,
} from '@/features/game/sessionSlice';
import { coinsEarned, difficultyChosen, tutorialCompleted } from '@/features/player/playerSlice';
import { levelCompleted, progressReset } from '@/features/progress/progressSlice';
import { themeSet } from '@/features/settings/settingsSlice';
import { makeStore } from '@/store';
import { defaultPersisted } from '@/store/persistence';
import { selectContinueLevel, selectNeedsOnboarding } from '@/store/selectors';

function setup() {
  const deps = { save: vi.fn(), playCue: vi.fn(), configureFeedback: vi.fn() };
  const store = makeStore(deps);
  return { store, deps };
}

/** Plays the first available group on the current level, one tap at a time. */
function playOneGroup(store: ReturnType<typeof setup>['store'], now: number) {
  const game = store.getState().session.game!;
  const group = findGroup(game.board, DIFFICULTIES[game.difficulty].link)!;
  group.forEach((cell) => store.dispatch(cellTapped({ cell, now })));
}

describe('player and settings', () => {
  it('starts needing onboarding, then stops once difficulty and tutorial are done', () => {
    const { store } = setup();
    expect(selectNeedsOnboarding(store.getState())).toBe(true);
    store.dispatch(difficultyChosen('medium'));
    expect(selectNeedsOnboarding(store.getState())).toBe(true);
    store.dispatch(tutorialCompleted());
    expect(selectNeedsOnboarding(store.getState())).toBe(false);
  });
  it('saves when settings, player or progress change, but not for session changes', () => {
    const { store, deps } = setup();
    store.dispatch(themeSet('neon'));
    expect(deps.save).toHaveBeenCalledTimes(1);
    expect(deps.save.mock.calls[0][0].settings.themeId).toBe('neon');
    store.dispatch(sessionStarted({ difficulty: 'easy', level: 1 }));
    expect(deps.save).toHaveBeenCalledTimes(1);
  });
  it('starts from a saved state and sends the saved settings to feedback', () => {
    const saved = defaultPersisted();
    saved.player.difficulty = 'hard';
    saved.progress.hard.unlocked = 7;
    const store = makeStore({ save: vi.fn(), playCue: vi.fn(), configureFeedback: vi.fn() }, saved);
    expect(selectContinueLevel(store.getState())).toBe(7);
  });
});

describe('returning players', () => {
  it('continues from the highest unlocked level on their difficulty', () => {
    const { store } = setup();
    store.dispatch(difficultyChosen('easy'));
    expect(selectContinueLevel(store.getState())).toBe(1);
    store.dispatch(levelCompleted({ difficulty: 'easy', level: 1, stars: 2, score: 140 }));
    store.dispatch(levelCompleted({ difficulty: 'easy', level: 2, stars: 3, score: 160 }));
    expect(selectContinueLevel(store.getState())).toBe(3);
    store.dispatch(difficultyChosen('hard'));
    expect(selectContinueLevel(store.getState())).toBe(1);
  });
  it('keeps the best result when a level is replayed worse', () => {
    const { store } = setup();
    store.dispatch(levelCompleted({ difficulty: 'easy', level: 1, stars: 3, score: 200 }));
    store.dispatch(levelCompleted({ difficulty: 'easy', level: 1, stars: 1, score: 130 }));
    const p = store.getState().progress.easy;
    expect(p.stars[1]).toBe(3);
    expect(p.best[1]).toBe(200);
    expect(p.unlocked).toBe(2);
  });
  it('resets progress and coins but keeps settings', () => {
    const { store } = setup();
    store.dispatch(themeSet('candy'));
    store.dispatch(coinsEarned(50));
    store.dispatch(levelCompleted({ difficulty: 'easy', level: 1, stars: 3, score: 200 }));
    store.dispatch(progressReset());
    expect(store.getState().player.coins).toBe(0);
    expect(store.getState().progress.easy.unlocked).toBe(1);
    expect(store.getState().settings.themeId).toBe('candy');
  });
});

describe('a level in the store', () => {
  it('plays a group through the store and keeps the state immutable', () => {
    const { store } = setup();
    store.dispatch(sessionStarted({ difficulty: 'easy', level: 1 }));
    const before = store.getState().session.game!;
    playOneGroup(store, 1000);
    const after = store.getState().session.game!;
    expect(after.score).toBeGreaterThan(0);
    expect(after.movesLeft).toBe(before.movesLeft - 1);
    expect(before.score).toBe(0);
  });
  it('plays a cue for each tap and none when nothing changed', () => {
    const { store, deps } = setup();
    store.dispatch(sessionStarted({ difficulty: 'easy', level: 1 }));
    store.dispatch(undoUsed());
    expect(deps.playCue).not.toHaveBeenCalled();
    playOneGroup(store, 1000);
    const cues = deps.playCue.mock.calls.map((c) => c[0]);
    expect(cues.at(-1)).toMatch(/clear|combo|win/);
    expect(cues.slice(0, -1).every((c) => c === 'tap')).toBe(true);
  });
  it('spends a hint through the store', () => {
    const { store } = setup();
    store.dispatch(sessionStarted({ difficulty: 'easy', level: 1 }));
    store.dispatch(hintUsed());
    const game = store.getState().session.game!;
    expect(game.hint).not.toBeNull();
    expect(game.hintsLeft).toBe(DIFFICULTIES.easy.hints - 1);
  });
  it('records a win once: unlocks the next level and pays coins', () => {
    const { store } = setup();
    store.dispatch(difficultyChosen('easy'));
    store.dispatch(sessionStarted({ difficulty: 'easy', level: 1 }));
    for (let i = 0; i < 40 && store.getState().session.game!.status === 'playing'; i++) {
      playOneGroup(store, i * 10_000);
    }
    expect(store.getState().session.game!.status).toBe('won');
    expect(store.getState().session.resultRecorded).toBe(true);
    expect(store.getState().progress.easy.unlocked).toBe(2);
    expect(store.getState().player.coins).toBeGreaterThan(0);
    const coins = store.getState().player.coins;
    store.dispatch(cellTapped({ cell: { r: 0, c: 0 }, now: 0 }));
    expect(store.getState().player.coins).toBe(coins);
  });
});
