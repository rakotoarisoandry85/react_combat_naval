import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BOARD_ROWS, BOARD_COLS, CELL_STATE, COLUMN_LABELS, ROW_LABELS } from '../constants/ships';
import {
  drawExplosion,
  drawGrid,
  drawHover,
  drawMiss,
  drawPreview,
  drawShip,
  drawWater,
} from '../utils/canvasDraw';

const BOARD_PAD = 26;

export default function Board({
  isEnemy = false,
  myHits,
  myShips = [],
  enemyBoard,
  enemyShips = [],
  getPreviewCells,
  onShoot,
  onPlace,
  phase,
  gameover,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const frameRef = useRef(0);
  const [metrics, setMetrics] = useState({ width: 360, height: 360, x0: BOARD_PAD, y0: BOARD_PAD, cs: 33 });
  const [hoverPreview, setHoverPreview] = useState({ cells: [], valid: false });
  const [hoverEnemy, setHoverEnemy] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;

    const resize = () => {
      const available = Math.max(280, Math.floor(host.getBoundingClientRect().width || 360));
      const cs = Math.max(22, Math.floor((available - BOARD_PAD - 6) / BOARD_COLS));
      const width = BOARD_PAD + cs * BOARD_COLS + 4;
      const height = BOARD_PAD + cs * BOARD_ROWS + 4;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.height = `${height}px`;
      setMetrics({ width, height, x0: BOARD_PAD, y0: BOARD_PAD, cs });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const getCellFromEvent = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;

    const rect = canvas.getBoundingClientRect();
    const mx = (event.clientX - rect.left) * (metrics.width / rect.width);
    const my = (event.clientY - rect.top) * (metrics.height / rect.height);
    const c = Math.floor((mx - metrics.x0) / metrics.cs);
    const r = Math.floor((my - metrics.y0) / metrics.cs);

    if (c < 0 || c >= BOARD_COLS || r < 0 || r >= BOARD_ROWS) return -1;
    return r * BOARD_COLS + c;
  }, [metrics]);

  const drawBoard = useCallback((frame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const ratioX = canvas.width / metrics.width;
    const ratioY = canvas.height / metrics.height;
    const waterWidth = metrics.cs * BOARD_COLS;
    const waterHeight = metrics.cs * BOARD_ROWS;

    ctx.setTransform(ratioX, 0, 0, ratioY, 0, 0);
    ctx.clearRect(0, 0, metrics.width, metrics.height);
    drawWater(ctx, metrics.x0, metrics.y0, waterWidth, waterHeight, metrics.cs, frame + (isEnemy ? 50 : 0));
    drawGrid(ctx, metrics.x0, metrics.y0, metrics.cs, COLUMN_LABELS, ROW_LABELS);

    if (!isEnemy) {
      myShips.forEach(ship => {
        drawShip(ctx, ship.si ?? ship.idx, ship.cells, ship.h ?? ship.horizontal, metrics.x0, metrics.y0, metrics.cs);
      });
    } else if (gameover) {
      enemyShips.forEach(ship => {
        if (ship.hits.length < ship.cells.length) {
          drawShip(ctx, ship.si ?? ship.idx, ship.cells, ship.h ?? ship.horizontal, metrics.x0, metrics.y0, metrics.cs, 0.55);
        }
      });
    }

    const hits = isEnemy ? enemyBoard : myHits;
    for (let pos = 0; pos < BOARD_ROWS * BOARD_COLS; pos++) {
      const value = hits?.[pos];
      const cx = metrics.x0 + (pos % BOARD_COLS) * metrics.cs + metrics.cs / 2;
      const cy = metrics.y0 + Math.floor(pos / BOARD_COLS) * metrics.cs + metrics.cs / 2;

      if (value === CELL_STATE.HIT || value === CELL_STATE.SUNK) {
        drawExplosion(ctx, cx, cy, metrics.cs, frame + pos);
      } else if (value === CELL_STATE.MISS) {
        drawMiss(ctx, cx, cy, metrics.cs);
      }
    }

    if (!isEnemy && phase === 'placement') {
      drawPreview(ctx, hoverPreview.cells, hoverPreview.valid, metrics.x0, metrics.y0, metrics.cs);
    }

    if (isEnemy && phase === 'battle' && !gameover && hoverEnemy >= 0 && !enemyBoard?.[hoverEnemy]) {
      drawHover(ctx, hoverEnemy, metrics.x0, metrics.y0, metrics.cs);
    }
  }, [enemyBoard, enemyShips, gameover, hoverEnemy, hoverPreview, isEnemy, metrics, myHits, myShips, phase]);

  useEffect(() => {
    const tick = () => {
      frameRef.current += 1;
      drawBoard(frameRef.current);
      animationRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [drawBoard]);

  const handleMouseMove = useCallback((event) => {
    const pos = getCellFromEvent(event);

    if (!isEnemy && phase === 'placement' && pos >= 0 && getPreviewCells) {
      setHoverPreview(getPreviewCells(pos));
      return;
    }

    if (isEnemy && phase === 'battle' && !gameover) {
      setHoverEnemy(pos);
      return;
    }

    setHoverPreview({ cells: [], valid: false });
    setHoverEnemy(-1);
  }, [gameover, getCellFromEvent, getPreviewCells, isEnemy, phase]);

  const handleMouseLeave = useCallback(() => {
    setHoverPreview({ cells: [], valid: false });
    setHoverEnemy(-1);
  }, []);

  const handleClick = useCallback((event) => {
    const pos = getCellFromEvent(event);
    if (pos < 0) return;

    if (isEnemy && phase === 'battle' && !gameover && !enemyBoard?.[pos]) {
      onShoot?.(pos);
      return;
    }

    if (!isEnemy && phase === 'placement') {
      onPlace?.(pos);
    }
  }, [enemyBoard, gameover, getCellFromEvent, isEnemy, onPlace, onShoot, phase]);

  const canvasClass = [
    'board-canvas',
    isEnemy && phase === 'battle' && !gameover ? 'board-canvas--shootable' : '',
  ].filter(Boolean).join(' ');

  return (
    <canvas
      ref={canvasRef}
      className={canvasClass}
      aria-label={isEnemy ? 'Grille ennemie illustree' : 'Grille de votre flotte illustree'}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
