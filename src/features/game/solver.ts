import { filledCells } from './board';
import { canLink, MAX_GROUP, sameCell, TARGET_SUM } from './rules';
import { Rng, shuffleInPlace } from './rng';
import { Board, Cell, LinkRule } from './types';

/** First valid group on the board (2 to MAX_GROUP linked tiles adding up to 10), or null. */
export function findGroup(board: Board, rule: LinkRule, rng?: Rng): Cell[] | null {
  const all = filledCells(board);
  const starts = rng ? shuffleInPlace(all.slice(), rng) : all;
  const value = (c: Cell) => board[c.r][c.c] as number;

  const extend = (path: Cell[], sum: number): Cell[] | null => {
    if (sum === TARGET_SUM && path.length >= 2) return path;
    if (path.length >= MAX_GROUP) return null;
    const last = path[path.length - 1];
    for (const next of all) {
      if (sum + value(next) > TARGET_SUM) continue;
      if (path.some((p) => sameCell(p, next)) || !canLink(rule, board, last, next)) continue;
      const found = extend([...path, next], sum + value(next));
      if (found) return found;
    }
    return null;
  };

  for (const start of starts) {
    const found = extend([start], value(start));
    if (found) return found;
  }
  return null;
}
