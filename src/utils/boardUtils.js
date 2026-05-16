import { BOARD_SIZE, ROW_LABELS, SHIPS } from '../constants/ships';

export const idx = (r, c) => r * BOARD_SIZE + c;
export const rc = (i) => ({ r: Math.floor(i / BOARD_SIZE), c: i % BOARD_SIZE });
export const coordLabel = (i) => {
  const { r, c } = rc(i);
  return `${ROW_LABELS[r]}${c + 1}`;
};
export const coordLbl = coordLabel;

export function getShipCells(pos, size, horizontal) {
  const { r: r0, c: c0 } = rc(pos);
  const cells = [];
  for (let k = 0; k < size; k++) {
    const nr = horizontal ? r0 : r0 + k;
    const nc = horizontal ? c0 + k : c0;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return null;
    cells.push(idx(nr, nc));
  }
  return cells;
}

export function canPlaceCells(board, cells) {
  if (!cells) return false;
  for (const i of cells) {
    if (board[i]) return false;
    const { r, c } = rc(i);
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE)
          if (board[idx(nr, nc)] && !cells.includes(idx(nr, nc))) return false;
      }
  }
  return true;
}
export const canPlace = canPlaceCells;

export function generateRandomFleet(shipsDef = SHIPS) {
  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  const ships = [];
  for (let si = 0; si < shipsDef.length; si++) {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const pos = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE);
      const cells = getShipCells(pos, shipsDef[si].size, horizontal);
      if (canPlaceCells(board, cells)) {
        cells.forEach(i => { board[i] = { shipIdx: si, si }; });
        ships.push({ idx: si, si, cells, horizontal, h: horizontal, hits: [] });
        placed = true;
      }
    }
  }
  return { board, ships, fleet: ships };
}
export const randomFleet = generateRandomFleet;

export function getNeighbours(pos) {
  const { r, c } = rc(pos);
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
    .filter(([nr, nc]) => nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE)
    .map(([nr, nc]) => idx(nr, nc));
}
