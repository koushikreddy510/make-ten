import { applyGravity, cloneBoard, countTiles, emptyBoard, filledCells } from './board';
import { DIFFICULTIES } from './difficulty';
import { generateBoard } from './generator';
import { levelSettings } from './levels';
import { canLink, MAX_GROUP, sameCell, TARGET_SUM } from './rules';
import { hashSeed, mulberry32, Rng, shuffleInPlace } from './rng';
import { findGroup } from './solver';
import { Board, Cell, DifficultyId, LevelSettings } from './types';

const BASE_POINTS: Record<number, number> = { 2: 20, 3: 60, 4: 120 };
const MAX_COMBO = 5;
const UNDO_LIMIT = 5;
const SHUFFLE_ATTEMPTS = 30;

interface Snapshot {
  board: Board;
  score: number;
  movesLeft: number;
  combo: number;
  lastClearAt: number | null;
}

export type Status = 'playing' | 'won' | 'lost';

export interface GameState extends Snapshot {
  difficulty: DifficultyId;
  level: number;
  settings: LevelSettings;
  selected: Cell[];
  hint: Cell[] | null;
  timeLeft: number | null;
  hintsLeft: number;
  shufflesLeft: number;
  undosLeft: number;
  status: Status;
  history: Snapshot[];
  /** Whether the player has already used their one continue on this level. */
  continued: boolean;
}

/** Creates the starting state of a level. The board is the same every time for a given level. */
export function newGame(difficulty: DifficultyId, level: number): GameState {
  const cfg = DIFFICULTIES[difficulty];
  const settings = levelSettings(difficulty, level);
  const rng = mulberry32(hashSeed(`${difficulty}-${level}`));
  let board = generateBoard(cfg.rows, cfg.cols, settings, rng);
  if (!findGroup(board, cfg.link)) board = shuffleBoard(board, difficulty, rng);
  return {
    difficulty, level, settings, board,
    selected: [], hint: null, score: 0, combo: 0, lastClearAt: null,
    movesLeft: settings.moves, timeLeft: settings.timeLimit,
    hintsLeft: cfg.hints, shufflesLeft: cfg.shuffles, undosLeft: cfg.undos,
    status: 'playing', history: [], continued: false,
  };
}

/** Same tiles in new positions, retried until at least one group exists. */
export function shuffleBoard(board: Board, difficulty: DifficultyId, rng: Rng): Board {
  const { rows, cols, link } = DIFFICULTIES[difficulty];
  const spots = filledCells(board);
  const values = spots.map((s) => board[s.r][s.c] as number);
  let result = board;
  for (let i = 0; i < SHUFFLE_ATTEMPTS; i++) {
    shuffleInPlace(values, rng);
    result = emptyBoard(rows, cols);
    spots.forEach((s, k) => (result[s.r][s.c] = values[k]));
    if (findGroup(result, link)) break;
  }
  return result;
}

const snapshot = (s: GameState): Snapshot => ({
  board: s.board, score: s.score, movesLeft: s.movesLeft, combo: s.combo, lastClearAt: s.lastClearAt,
});

/** Decides whether the level has been won or lost after a move. */
function settle(s: GameState, rng: Rng): GameState {
  if (countTiles(s.board) === 0 || s.score >= s.settings.target) return { ...s, status: 'won' };
  if (s.movesLeft <= 0) return { ...s, status: 'lost' };
  if (!findGroup(s.board, DIFFICULTIES[s.difficulty].link)) {
    if (s.shufflesLeft > 0) return { ...s, board: shuffleBoard(s.board, s.difficulty, rng) };
    return { ...s, status: 'lost' };
  }
  return s;
}

export const selectionSum = (s: GameState): number =>
  s.selected.reduce((sum, p) => sum + (s.board[p.r][p.c] as number), 0);

/** Handles a tap on a tile: select it, drop it, start over, or clear a finished group. */
export function tapCell(s: GameState, cell: Cell, now: number, rng: Rng = Math.random): GameState {
  if (s.status !== 'playing' || s.board[cell.r][cell.c] === null) return s;
  const cfg = DIFFICULTIES[s.difficulty];

  const index = s.selected.findIndex((p) => sameCell(p, cell));
  if (index >= 0) {
    // Tapping the last tile drops it. Tapping an earlier one does nothing.
    return index === s.selected.length - 1 ? { ...s, selected: s.selected.slice(0, -1), hint: null } : s;
  }

  const last = s.selected[s.selected.length - 1];
  const group = last && canLink(cfg.link, s.board, last, cell) ? [...s.selected, cell] : [cell];
  const sum = group.reduce((n, p) => n + (s.board[p.r][p.c] as number), 0);

  if (sum === TARGET_SUM && group.length >= 2) return clearGroup(s, group, now, rng);
  if (sum > TARGET_SUM || group.length >= MAX_GROUP) return { ...s, selected: [cell], hint: null };
  return { ...s, selected: group, hint: null };
}

function clearGroup(s: GameState, group: Cell[], now: number, rng: Rng): GameState {
  const cfg = DIFFICULTIES[s.difficulty];
  const board = cloneBoard(s.board);
  group.forEach((p) => (board[p.r][p.c] = null));
  const inWindow = s.lastClearAt !== null && now - s.lastClearAt <= cfg.comboWindowMs;
  const combo = inWindow ? s.combo + 1 : 1;
  return settle(
    {
      ...s,
      board: applyGravity(board),
      selected: [],
      hint: null,
      combo,
      lastClearAt: now,
      score: s.score + BASE_POINTS[group.length] * Math.min(combo, MAX_COMBO),
      movesLeft: s.movesLeft - 1,
      history: [...s.history, snapshot(s)].slice(-UNDO_LIMIT),
    },
    rng,
  );
}

export function applyHint(s: GameState): GameState {
  if (s.status !== 'playing' || s.hintsLeft <= 0) return s;
  const group = findGroup(s.board, DIFFICULTIES[s.difficulty].link);
  return group ? { ...s, hint: group, selected: [], hintsLeft: s.hintsLeft - 1 } : s;
}

export function applyShuffle(s: GameState, rng: Rng = Math.random): GameState {
  if (s.status !== 'playing' || s.shufflesLeft <= 0) return s;
  return { ...s, board: shuffleBoard(s.board, s.difficulty, rng), selected: [], hint: null, shufflesLeft: s.shufflesLeft - 1 };
}

export function applyUndo(s: GameState): GameState {
  if (s.status !== 'playing' || s.undosLeft <= 0 || s.history.length === 0) return s;
  const previous = s.history[s.history.length - 1];
  return { ...s, ...previous, selected: [], hint: null, undosLeft: s.undosLeft - 1, history: s.history.slice(0, -1) };
}

/** Gives a lost level one more chance: more moves, or more time, depending on how it was lost. */
export function applyContinue(s: GameState, extra: { moves: number; seconds: number }, rng: Rng = Math.random): GameState {
  if (s.status !== 'lost' || s.continued) return s;
  const outOfTime = s.timeLeft === 0;
  const next: GameState = {
    ...s,
    status: 'playing',
    continued: true,
    selected: [],
    hint: null,
    movesLeft: s.movesLeft <= 0 ? extra.moves : s.movesLeft,
    timeLeft: outOfTime ? extra.seconds : s.timeLeft,
  };
  // If the level ended because no groups were left, mix the tiles so play can go on.
  return findGroup(next.board, DIFFICULTIES[s.difficulty].link)
    ? next
    : { ...next, board: shuffleBoard(next.board, s.difficulty, rng) };
}

/** Moves the clock one second. */
export function tickTimer(s: GameState): GameState {
  if (s.status !== 'playing' || s.timeLeft === null) return s;
  return s.timeLeft <= 1 ? { ...s, timeLeft: 0, status: 'lost' } : { ...s, timeLeft: s.timeLeft - 1 };
}

const STAR_THRESHOLDS = { three: 0.4, two: 0.15 } as const;

export function starsFor(s: GameState): number {
  const ratio = s.movesLeft / s.settings.moves;
  return ratio >= STAR_THRESHOLDS.three ? 3 : ratio >= STAR_THRESHOLDS.two ? 2 : 1;
}

export const COINS_PER_STAR = 10;
export const coinsFor = (stars: number): number => COINS_PER_STAR * stars;
