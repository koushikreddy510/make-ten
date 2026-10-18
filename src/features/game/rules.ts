import { Board, Cell, LinkRule } from './types';

export const TARGET_SUM = 10;
/** The most tiles one group can contain. */
export const MAX_GROUP = 4;

export const RULE_TEXT: Record<LinkRule, string> = {
  any: 'Pick any tiles that add up to 10.',
  line: 'Tiles must see each other in a straight line, with nothing in between.',
  touch8: 'Tiles must touch, corners included.',
  touch4: 'Tiles must touch side to side. Corners do not count.',
};

/** Short names, for headings and share messages. */
export const RULE_NAME: Record<LinkRule, string> = {
  any: 'Free pick',
  line: 'Straight lines',
  touch8: 'Touching',
  touch4: 'Side by side',
};

export const sameCell = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c;

/** Neighbours of `a`, including diagonals. Used by the generator, whatever the player's rule is. */
export function touching(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return (dr !== 0 || dc !== 0) && dr <= 1 && dc <= 1;
}

function clearLine(board: Board, a: Cell, b: Cell): boolean {
  const dr = Math.sign(b.r - a.r);
  const dc = Math.sign(b.c - a.c);
  const straight = a.r === b.r || a.c === b.c || Math.abs(b.r - a.r) === Math.abs(b.c - a.c);
  if (!straight) return false;
  let r = a.r + dr;
  let c = a.c + dc;
  while (r !== b.r || c !== b.c) {
    if (board[r][c] !== null) return false;
    r += dr;
    c += dc;
  }
  return true;
}

/** Whether tile `b` may be added to a group whose last tile is `a`. */
export function canLink(rule: LinkRule, board: Board, a: Cell, b: Cell): boolean {
  if (sameCell(a, b)) return false;
  switch (rule) {
    case 'any':
      return true;
    case 'line':
      return clearLine(board, a, b);
    case 'touch8':
      return touching(a, b);
    case 'touch4':
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }
}
