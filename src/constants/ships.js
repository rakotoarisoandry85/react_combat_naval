export const SHIPS = [
  { name: 'Porte-avions', size: 5, symbol: 'PA' },
  { name: 'Croiseur', size: 4, symbol: 'CR' },
  { name: 'Destroyer', size: 3, symbol: 'DS' },
  { name: 'Sous-marin', size: 3, symbol: 'SM' },
  { name: 'Patrouilleur', size: 2, symbol: 'PT' },
];

export const BOARD_SIZE = 10;
export const ROW_LABELS = 'ABCDEFGHIJ';
export const COLUMN_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String(i + 1));

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
export const N = BOARD_SIZE;
export const COLS = ROW_LABELS;
export const COLS_LABELS = ROW_LABELS;
