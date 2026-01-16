/**
 * Utilities for representing and updating Sudoku boards on the frontend.
 */

export const SIZE = 9;

// PUBLIC_INTERFACE
export function createEmptyBoard() {
  /** Create a 9x9 board initialized to 0. */
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

// PUBLIC_INTERFACE
export function cloneBoard(board) {
  /** Deep clone a 9x9 board. */
  return board.map((row) => row.slice());
}

// PUBLIC_INTERFACE
export function buildFixedMapFromBoard(board) {
  /** Return a boolean 9x9 map where true means the cell is fixed (non-zero). */
  return board.map((row) => row.map((v) => v !== 0));
}

// PUBLIC_INTERFACE
export function isValidDigitValue(v) {
  /** True if v is an integer 0..9. */
  return Number.isInteger(v) && v >= 0 && v <= 9;
}

// PUBLIC_INTERFACE
export function boardToKeySet(cells) {
  /**
   * Convert conflict cells from backend ({r,c}[]) into a Set of "r,c".
   * Backend schema: conflicts: { cells: [{r: number, c: number}, ...] }
   */
  const set = new Set();
  if (!Array.isArray(cells)) return set;
  for (const cell of cells) {
    if (
      cell &&
      Number.isInteger(cell.r) &&
      Number.isInteger(cell.c) &&
      cell.r >= 0 &&
      cell.r < 9 &&
      cell.c >= 0 &&
      cell.c < 9
    ) {
      set.add(`${cell.r},${cell.c}`);
    }
  }
  return set;
}

// PUBLIC_INTERFACE
export function updateCell(board, r, c, value) {
  /**
   * Return a new board with board[r][c] updated to value.
   * No mutation.
   */
  const next = cloneBoard(board);
  next[r][c] = value;
  return next;
}
