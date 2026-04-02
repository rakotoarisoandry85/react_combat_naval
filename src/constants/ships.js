export const SHIPS_DEF = [
  { name: 'Porte-avions', size: 5, symbol: 'PA' },
  { name: 'Croiseur',     size: 4, symbol: 'CR' },
  { name: 'Destroyer',    size: 3, symbol: 'DS' },
  { name: 'Sous-marin',   size: 3, symbol: 'SM' },
  { name: 'Patrouilleur', size: 2, symbol: 'PT' },
];

export const BOARD_SIZE   = 10;
export const COLS_LABELS  = 'ABCDEFGHIJ';

export const DIFFICULTY = {
  easy:   'FACILE',
  medium: 'MOYEN',
  hard:   'DIFFICILE',
};

export const CELL_STATE = {
  EMPTY:  null,
  HIT:   'hit',
  MISS:  'miss',
  SUNK:  'sunk',
};
