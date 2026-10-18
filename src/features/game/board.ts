import { Board, Cell } from './types';

export const emptyBoard = (rows: number, cols: number): Board =>
  Array.from({ length: rows }, () => Array<number | null>(cols).fill(null));

export const cloneBoard = (board: Board): Board => board.map((row) => row.slice());

export const countTiles = (board: Board): number =>
  board.reduce((n, row) => n + row.filter((v) => v !== null).length, 0);

export function filledCells(board: Board): Cell[] {
  const cells: Cell[] = [];
  board.forEach((row, r) => row.forEach((v, c) => v !== null && cells.push({ r, c })));
  return cells;
}

/** Tiles fall to the bottom of their column, then empty columns close up to the left. */
export function applyGravity(board: Board): Board {
  const rows = board.length;
  const cols = board[0].length;
  const columns: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const tiles: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const v = board[r][c];
      if (v !== null) tiles.push(v);
    }
    if (tiles.length) columns.push(tiles);
  }
  const out = emptyBoard(rows, cols);
  columns.forEach((tiles, c) => tiles.forEach((v, i) => (out[rows - 1 - i][c] = v)));
  return out;
}
