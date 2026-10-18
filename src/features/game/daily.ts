import { hashSeed } from './rng';
import { LevelSettings, LinkRule } from './types';

/** The rules that take turns as "rule of the day". */
export const DAILY_RULES: readonly LinkRule[] = ['any', 'line', 'touch8', 'touch4'];

/** One setting for every daily board, so scores are comparable between players. */
export const DAILY_SETTINGS: LevelSettings = {
  maxDigit: 9,
  moves: 20,
  timeLimit: null,
  filler: 0.2,
  target: 260,
};

export const dailySettings = (): LevelSettings => ({ ...DAILY_SETTINGS });

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "2026-10-18" to a whole number of days since 1970, in UTC so it never depends on time zone. */
export function dayNumber(dateKey: string): number {
  return Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / MS_PER_DAY);
}

/** Today's rule. It changes at midnight on the player's own clock and rotates through every rule. */
export function dailyRule(dateKey: string): LinkRule {
  return DAILY_RULES[(dayNumber(dateKey) + (hashSeed('rule') % DAILY_RULES.length)) % DAILY_RULES.length];
}
