import { BOARD_SIZE, COLS_LABELS } from '../constants/ships';

export const idx = (r, c) => r * BOARD_SIZE + c;
export const rc  = (i)    => ({ r: Math.floor(i / BOARD_SIZE), c: i % BOARD_SIZE });
export const coordLabel = (i) => {
  const { r, c } = rc(i);
  return `${COLS_LABELS[c]}${r + 1}`;
};

/**
 * Returns list of cell indices for a ship placed at `pos` with given size/orientation.
 * Returns null if placement goes out of bounds.
 */
export function getShipCells(pos, size, horizontal) {
  const { r, c } = rc(pos);
  const cells = [];
  for (let k = 0; k < size; k++) {
    const nr = horizontal ? r     : r + k;
    const nc = horizontal ? c + k : c;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return null;
    cells.push(idx(nr, nc));
  }
  return cells;
}

/**
 * Checks if a set of cells can be placed on the board
 * (no overlap, no adjacency with existing ships).
 */
export function canPlaceCells(board, cells) {
  if (!cells) return false;
  for (const i of cells) {
    if (board[i]) return false;
    const { r, c } = rc(i);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (board[idx(nr, nc)] && !cells.includes(idx(nr, nc))) return false;
        }
      }
    }
  }
  return true;
}

/** Generates a random valid ship placement for a fleet on an empty board. */
export function generateRandomFleet(shipsDef) {
  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  const ships  = [];

  for (let si = 0; si < shipsDef.length; si++) {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const pos        = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE);
      const cells      = getShipCells(pos, shipsDef[si].size, horizontal);
      if (canPlaceCells(board, cells)) {
        cells.forEach(i => { board[i] = { shipIdx: si }; });
        ships.push({ idx: si, cells, hits: [] });
        placed = true;
      }
    }
  }
  return { board, ships };
}

/** Returns neighbour cell indices (up/down/left/right) within bounds. */
export function getNeighbours(pos) {
  const { r, c } = rc(pos);
  return [
    [r - 1, c], [r + 1, c],
    [r, c - 1], [r, c + 1],
  ]
    .filter(([nr, nc]) => nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE)
    .map(([nr, nc]) => idx(nr, nc));
}
