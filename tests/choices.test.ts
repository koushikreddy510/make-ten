import { describe, expect, it, vi } from 'vitest';
import { THEME_IDS } from '@/core/theme/themes';
import { DIFFICULTY_ORDER, LEVELS_PER_DIFFICULTY } from '@/features/game/difficulty';
import { DIFFICULTIES } from '@/features/game/difficulty';
import { cellTapped, sessionStarted } from '@/features/game/sessionSlice';
import { findGroup } from '@/features/game/solver';
import { difficultyChosen } from '@/features/player/playerSlice';
import { themeSet } from '@/features/settings/settingsSlice';
import { makeStore } from '@/store';
import { migrate } from '@/store/persistence';

const newStore = () => makeStore({ save: vi.fn(), playCue: vi.fn(), configureFeedback: vi.fn() });

describe('whatever the player picks keeps working', () => {
  it.each(THEME_IDS)('theme %s is saved and loaded back', (themeId) => {
    const save = vi.fn();
    const store = makeStore({ save, playCue: vi.fn(), configureFeedback: vi.fn() });
    // Switch away first, so choosing the default theme is a real change that gets saved.
    store.dispatch(themeSet(themeId === 'neon' ? 'candy' : 'neon'));
    store.dispatch(themeSet(themeId));
    const saved = JSON.parse(JSON.stringify(save.mock.calls.at(-1)![0]));
    expect(migrate(saved).settings.themeId).toBe(themeId);
  });

  it.each(DIFFICULTY_ORDER)('every %s level can be started and played to the end', (difficulty) => {
    const store = newStore();
    store.dispatch(difficultyChosen(difficulty));
    for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
      store.dispatch(sessionStarted({ difficulty, level }));
      for (let move = 0; move < 100 && store.getState().session.game!.status === 'playing'; move++) {
        const game = store.getState().session.game!;
        const group = findGroup(game.board, DIFFICULTIES[difficulty].link);
        if (!group) break;
        group.forEach((cell) => store.dispatch(cellTapped({ cell, now: move * 10_000 })));
      }
      expect(['won', 'lost']).toContain(store.getState().session.game!.status);
    }
  });

  it('switching difficulty keeps each difficulty’s own progress', () => {
    const store = newStore();
    store.dispatch(difficultyChosen('easy'));
    store.dispatch(sessionStarted({ difficulty: 'easy', level: 1 }));
    for (let move = 0; move < 100 && store.getState().session.game!.status === 'playing'; move++) {
      const game = store.getState().session.game!;
      findGroup(game.board, 'any')!.forEach((cell) => store.dispatch(cellTapped({ cell, now: move * 10_000 })));
    }
    const easyUnlocked = store.getState().progress.easy.unlocked;
    store.dispatch(difficultyChosen('hard'));
    expect(store.getState().progress.hard.unlocked).toBe(1);
    store.dispatch(difficultyChosen('easy'));
    expect(store.getState().progress.easy.unlocked).toBe(easyUnlocked);
  });
});
