import { DIFFICULTIES, LEVELS_PER_DIFFICULTY } from './difficulty';
import { DifficultyId, LevelSettings, Ramp } from './types';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Value of a ramp at a level. Level 1 gives `from`, the last level gives `to`. */
export function atLevel([from, to]: Ramp, level: number): number {
  const t = clamp01((level - 1) / (LEVELS_PER_DIFFICULTY - 1));
  return from + (to - from) * t;
}

/**
 * Settings for one level. Later levels have fewer moves, less time, more tiles that belong to
 * no group, and a higher target, so each level is harder than the one before it.
 */
export function levelSettings(difficulty: DifficultyId, level: number): LevelSettings {
  const cfg = DIFFICULTIES[difficulty];
  return {
    maxDigit: Math.round(atLevel(cfg.maxDigit, level)),
    moves: Math.round(atLevel(cfg.moves, level)),
    timeLimit: cfg.timeLimit ? Math.round(atLevel(cfg.timeLimit, level)) : null,
    filler: atLevel(cfg.filler, level),
    target: Math.round(atLevel(cfg.target, level) / 10) * 10,
  };
}
