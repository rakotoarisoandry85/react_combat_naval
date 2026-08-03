export const SHIPS = [
  { name: 'Porte-avions', size: 5, symbol: 'PA' },
  { name: 'Croiseur', size: 4, symbol: 'CR' },
  { name: 'Destroyer', size: 3, symbol: 'DS' },
  { name: 'Sous-marin', size: 3, symbol: 'SM' },
  { name: 'Patrouilleur', size: 2, symbol: 'PT' },
];

export const BOARD_ROWS = 10; // number of rows (unchanged)
export const BOARD_COLS = 15; // add 5 columns
export const ROW_LABELS = 'ABCDEFGHIJ';
export const COLUMN_LABELS = Array.from({ length: BOARD_COLS }, (_, i) => String(i + 1));

export const DIFFICULTY = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

export const CELL_STATE = {
  EMPTY: null,
  HIT: 'hit',
  MISS: 'miss',
  SUNK: 'sunk',
};

export const SHIPS_DEF = SHIPS;
export const N = BOARD_COLS; // legacy alias (columns count)
export const COLS = ROW_LABELS;
export const COLS_LABELS = ROW_LABELS;
