import { GameState, tapCell } from '@/features/game/engine';
import { mulberry32 } from '@/features/game/rng';
import { findGroup } from '@/features/game/solver';

/** Clears one group the way a player would, one tap at a time. */
export function clearOne(s: GameState, now: number): GameState {
  const group = findGroup(s.board, s.link);
  if (!group) return s;
  return group.reduce((state, cell) => tapCell(state, cell, now, mulberry32(1)), s);
}

/** Plays greedily with no combos (each clear is 10 seconds apart) until the level ends. */
export function playGreedy(s: GameState): GameState {
  let state = s;
  for (let i = 0; i < 100 && state.status === 'playing'; i++) state = clearOne(state, i * 10_000);
  return state;
}
