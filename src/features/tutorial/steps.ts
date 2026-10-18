import { newGame, GameState } from '@/features/game/engine';
import { Cell } from '@/features/game/types';

export interface TutorialStep {
  title: string;
  text: string;
  /** Tiles to start with, top row first. */
  rows: number[][];
  /** Tiles to point out. */
  highlight: Cell[];
  /** Whether the player has done what the step asks. */
  isDone: (game: GameState) => boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Make ten',
    text: 'Tap 8, then 2. Tiles that add up to 10 disappear.',
    rows: [[3, 8, 2, 9]],
    highlight: [{ r: 0, c: 1 }, { r: 0, c: 2 }],
    isDone: (g) => g.score > 0,
  },
  {
    title: 'Use more tiles',
    text: 'Groups of up to four tiles work too. Try 2 + 3 + 5.',
    rows: [[2, 3, 5, 9]],
    highlight: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
    isDone: (g) => g.score > 0,
  },
  {
    title: 'Chain combos',
    text: 'Tiles fall and slide together. Clear again quickly to multiply your score.',
    rows: [[6, 1, 5], [4, 9, 5]],
    highlight: [{ r: 0, c: 0 }, { r: 1, c: 0 }],
    isDone: (g) => g.board.every((row) => row.every((v) => v === null)),
  },
];

/** A small practice board. It plays by the "any tiles" rule and never ends the level. */
export function buildTutorialGame(step: TutorialStep): GameState {
  const base = newGame('easy', 1);
  return {
    ...base,
    board: step.rows.map((row) => row.slice()),
    settings: { ...base.settings, target: Number.MAX_SAFE_INTEGER, moves: 99 },
    movesLeft: 99,
    shufflesLeft: 0,
  };
}
