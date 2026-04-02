import React, { useState, useCallback } from 'react';
import Cell from './Cell';
import { COLS_LABELS, CELL_STATE } from '../constants/ships';
import { idx } from '../utils/boardUtils';

/**
 * Board – renders a 10×10 grid with row/col headers.
 *
 * Props:
 *  - isEnemy        : bool – enemy board (shoot mode) vs player board (display)
 *  - myBoard        : Array(100) – cell data for the player grid
 *  - myHits         : Array(100) – AI shots on player grid
 *  - enemyBoard     : Array(100) – player shots on enemy grid
 *  - enemyShipBoard : Array(100) – revealed after game-over
 *  - getPreviewCells: fn(pos) → { cells, valid } – only used on player board during placement
 *  - onShoot        : fn(pos)  – only used on enemy board
 *  - onPlace        : fn(pos)  – only used on player board during placement
 *  - phase          : 'placement' | 'battle' | 'over'
 *  - gameover       : bool
 */
export default function Board({
  isEnemy = false,
  myBoard,
  myHits,
  enemyBoard,
  enemyShipBoard,
  getPreviewCells,
  onShoot,
  onPlace,
  phase,
  gameover,
}) {
  const [hoverPreview, setHoverPreview] = useState({ cells: [], valid: false });

  const handleMouseEnter = useCallback((pos) => {
    if (!isEnemy && phase === 'placement' && getPreviewCells) {
      setHoverPreview(getPreviewCells(pos));
    }
  }, [isEnemy, phase, getPreviewCells]);

  const handleMouseLeave = useCallback(() => {
    setHoverPreview({ cells: [], valid: false });
  }, []);

  const handleClick = useCallback((pos) => {
    if (isEnemy && phase === 'battle' && !gameover) onShoot?.(pos);
    if (!isEnemy && phase === 'placement')           onPlace?.(pos);
  }, [isEnemy, phase, gameover, onShoot, onPlace]);

  const getCellState = useCallback((pos) => {
    if (isEnemy) {
      const v = enemyBoard?.[pos];
      if (v === CELL_STATE.SUNK) return 'sunk';
      if (v === CELL_STATE.HIT)  return 'hit';
      if (v === CELL_STATE.MISS) return 'miss';
      if (gameover && enemyShipBoard?.[pos] && !v) return 'revealed';
      return null;
    } else {
      const hit = myHits?.[pos];
      if (hit === CELL_STATE.SUNK) return 'sunk';
      if (hit === CELL_STATE.HIT)  return 'hit';
      if (hit === CELL_STATE.MISS) return 'miss';
      if (myBoard?.[pos]) return 'ship';
      return null;
    }
  }, [isEnemy, enemyBoard, myHits, myBoard, enemyShipBoard, gameover]);

  const isClickable = useCallback((pos) => {
    if (isEnemy) return phase === 'battle' && !gameover && !enemyBoard?.[pos];
    return phase === 'placement';
  }, [isEnemy, phase, gameover, enemyBoard]);

  const getPreview = useCallback((pos) => {
    if (isEnemy || phase !== 'placement') return null;
    if (!hoverPreview.cells.includes(pos)) return null;
    return hoverPreview.valid ? 'ok' : 'err';
  }, [isEnemy, phase, hoverPreview]);

  const cells = [];

  // Top-left corner
  cells.push(<div key="corner" className="grid__header" />);

  // Column headers
  for (let c = 0; c < 10; c++) {
    cells.push(<div key={`ch-${c}`} className="grid__header">{COLS_LABELS[c]}</div>);
  }

  // Rows
  for (let r = 0; r < 10; r++) {
    cells.push(<div key={`rh-${r}`} className="grid__header">{r + 1}</div>);
    for (let c = 0; c < 10; c++) {
      const pos = idx(r, c);
      cells.push(
        <Cell
          key={pos}
          state={getCellState(pos)}
          preview={getPreview(pos)}
          clickable={isClickable(pos)}
          onClick={() => handleClick(pos)}
          onMouseEnter={() => handleMouseEnter(pos)}
          onMouseLeave={handleMouseLeave}
        />
      );
    }
  }

  return <div className="grid">{cells}</div>;
}
