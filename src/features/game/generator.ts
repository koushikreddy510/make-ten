import { emptyBoard } from './board';
import { pick, Rng, shuffleInPlace } from './rng';
import { sameCell, TARGET_SUM, touching } from './rules';
import { Board, Cell, LevelSettings } from './types';

/** Chance that a group is three tiles instead of two. */
const TRIPLE_CHANCE = 0.35;
const TRIPLE_ATTEMPTS = 20;

/**
 * Builds a board from groups of touching tiles that each add up to 10, so clears always exist
 * under every rule (touching is the strictest). A share of tiles, `filler`, is random instead,
 * which makes later levels harder.
 */
export function generateBoard(rows: number, cols: number, settings: LevelSettings, rng: Rng): Board {
  const { maxDigit, filler } = settings;
  const board = emptyBoard(rows, cols);
  const isFree = (c: Cell) => board[c.r][c.c] === null;
  const randomDigit = () => 1 + Math.floor(rng() * maxDigit);
  const pairDigits = Array.from({ length: maxDigit }, (_, i) => i + 1).filter(
    (d) => TARGET_SUM - d >= 1 && TARGET_SUM - d <= maxDigit,
  );

  const freeNeighbours = (c: Cell, exclude?: Cell): Cell[] => {
    const out: Cell[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const n = { r: c.r + dr, c: c.c + dc };
        if (n.r < 0 || n.c < 0 || n.r >= rows || n.c >= cols) continue;
        if (touching(c, n) && isFree(n) && !(exclude && sameCell(n, exclude))) out.push(n);
      }
    }
    return out;
  };

  const place = (c: Cell, v: number) => (board[c.r][c.c] = v);
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c });
  shuffleInPlace(cells, rng);

  for (const cell of cells) {
    if (!isFree(cell)) continue;
    const firstOptions = freeNeighbours(cell);
    if (firstOptions.length === 0 || rng() < filler) {
      place(cell, randomDigit());
      continue;
    }
    const second = pick(firstOptions, rng);

    if (rng() < TRIPLE_CHANCE) {
      const thirdOptions = freeNeighbours(second, cell);
      if (thirdOptions.length) {
        const third = pick(thirdOptions, rng);
        for (let attempt = 0; attempt < TRIPLE_ATTEMPTS; attempt++) {
          const a = randomDigit();
          const b = randomDigit();
          const c = TARGET_SUM - a - b;
          if (c >= 1 && c <= maxDigit) {
            place(cell, a);
            place(second, b);
            place(third, c);
            break;
          }
        }
        if (!isFree(cell)) continue;
      }
    }
    const a = pick(pairDigits, rng);
    place(cell, a);
    place(second, TARGET_SUM - a);
  }
  return board;
}
