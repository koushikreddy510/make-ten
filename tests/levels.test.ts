import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, DIFFICULTY_ORDER, LEVELS_PER_DIFFICULTY } from '@/features/game/difficulty';
import { newGame } from '@/features/game/engine';
import { levelSettings } from '@/features/game/levels';
import { playGreedy } from './helpers';

const levels = Array.from({ length: LEVELS_PER_DIFFICULTY }, (_, i) => i + 1);

describe('level curve', () => {
  it.each(DIFFICULTY_ORDER)('%s gets harder every level', (id) => {
    const all = levels.map((l) => levelSettings(id, l));
    for (let i = 1; i < all.length; i++) {
      expect(all[i].moves).toBeLessThanOrEqual(all[i - 1].moves);
      expect(all[i].target).toBeGreaterThanOrEqual(all[i - 1].target);
      expect(all[i].filler).toBeGreaterThanOrEqual(all[i - 1].filler);
    }
    expect(all[29].target / all[29].moves).toBeGreaterThan(all[0].target / all[0].moves);
  });
  it('is harder at the same level on a harder difficulty', () => {
    const [e, m, h] = DIFFICULTY_ORDER.map((id) => levelSettings(id, 15));
    expect(m.target).toBeGreaterThan(e.target);
    expect(h.target).toBeGreaterThan(m.target);
  });
  it.each(DIFFICULTY_ORDER)('%s levels are winnable without combos (greedy bot)', (id) => {
    const failures = levels.filter((l) => playGreedy(newGame(id, l)).status !== 'won');
    // A simple bot should win most levels. Some of the hardest may need combos and planning.
    expect(failures.length).toBeLessThanOrEqual(6);
    expect(failures.filter((l) => l <= 10)).toEqual([]);
  });
  it('keeps targets inside what the board can give', () => {
    for (const id of DIFFICULTY_ORDER) {
      const cfg = DIFFICULTIES[id];
      expect(levelSettings(id, 30).target).toBeLessThanOrEqual((cfg.rows * cfg.cols) / 2 * 20);
    }
  });
});
