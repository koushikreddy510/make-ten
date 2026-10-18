import { GameState, selectionSum } from './engine';
import { TARGET_SUM } from './rules';

export type Cue = 'tap' | 'clear' | 'combo' | 'error' | 'win' | 'lose';

/** Which cue fits what just happened, found by comparing the game before and after an action. */
export function cueForChange(before: GameState, after: GameState): Cue | null {
  if (after === before) return null;
  if (before.status === 'playing' && after.status === 'won') return 'win';
  if (before.status === 'playing' && after.status === 'lost') return 'lose';
  if (after.score > before.score) return after.combo > 1 ? 'combo' : 'clear';
  if (after.selected.length === 1 && before.selected.length >= 1) {
    const tile = after.selected[0];
    if (selectionSum(before) + (after.board[tile.r][tile.c] as number) > TARGET_SUM) return 'error';
  }
  return 'tap';
}
