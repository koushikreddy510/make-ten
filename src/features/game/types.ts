export type DifficultyId = 'easy' | 'medium' | 'hard';

/** A board position. `r` is the row (0 = top), `c` is the column (0 = left). */
export interface Cell {
  r: number;
  c: number;
}

/** Rows of tiles. `null` is an empty slot. */
export type Board = (number | null)[][];

/**
 * How two tiles may be linked into the same group:
 * - `any`: any two tiles
 * - `line`: same row, column or diagonal, with nothing in between
 * - `touch8`: neighbours, diagonals included
 * - `touch4`: neighbours, no diagonals
 */
export type LinkRule = 'any' | 'line' | 'touch8' | 'touch4';

/** A value that moves from `from` (level 1) to `to` (last level). */
export type Ramp = readonly [from: number, to: number];

/** What stays the same for every level of one difficulty. */
export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  blurb: string;
  rows: number;
  cols: number;
  link: LinkRule;
  hints: number;
  shuffles: number;
  undos: number;
  comboWindowMs: number;
  /** Largest tile digit. */
  maxDigit: Ramp;
  moves: Ramp;
  /** Seconds, or null for an untimed difficulty. */
  timeLimit: Ramp | null;
  /** Share of the board filled with tiles that belong to no group. */
  filler: Ramp;
  /** Score needed to win. */
  target: Ramp;
}

/** The concrete numbers for one level, derived from a difficulty and a level number. */
export interface LevelSettings {
  maxDigit: number;
  moves: number;
  timeLimit: number | null;
  filler: number;
  target: number;
}
