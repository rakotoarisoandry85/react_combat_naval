import { useState, useCallback, useRef } from 'react';
import { SHIPS_DEF, CELL_STATE } from '../constants/ships';
import {
  getShipCells,
  canPlaceCells,
  generateRandomFleet,
  coordLabel,
} from '../utils/boardUtils';
import { useAI } from './useAI';

const EMPTY_BOARD = () => Array(100).fill(null);

function buildInitialState() {
  return {
    phase: 'placement',       // 'placement' | 'battle' | 'over'
    myBoard:    EMPTY_BOARD(),
    myHits:     EMPTY_BOARD(),
    enemyBoard: EMPTY_BOARD(),
    myShips:     [],
    enemyShips:  [],
    _enemyShipBoard: EMPTY_BOARD(),
    placedShips: Array(SHIPS_DEF.length).fill(false),
    selectedShip: 0,
    horizontal: true,
    shots: 0,
    hits: 0,
    gameover: false,
    winner: null,
    log: [],
  };
}

export function useGameState(difficulty) {
  const [state, setState] = useState(buildInitialState);
  const ai = useAI(difficulty);
  const aiTimerRef = useRef(null);

  // ─── helpers ──────────────────────────────────────────────────────────────

  const addLog = (text, cls = '') =>
    setState(s => ({ ...s, log: [...s.log, { text, cls, id: Date.now() + Math.random() }] }));

  // ─── placement ────────────────────────────────────────────────────────────

  const selectShip = useCallback((idx) => {
    setState(s => ({ ...s, selectedShip: idx }));
  }, []);

  const toggleOrientation = useCallback(() => {
    setState(s => ({ ...s, horizontal: !s.horizontal }));
  }, []);

  const placeShip = useCallback((pos) => {
    setState(s => {
      if (s.phase !== 'placement') return s;
      const si = s.selectedShip;
      if (si < 0 || si >= SHIPS_DEF.length || s.placedShips[si]) return s;

      const cells = getShipCells(pos, SHIPS_DEF[si].size, s.horizontal);
      if (!canPlaceCells(s.myBoard, cells)) return s;

      const newBoard     = [...s.myBoard];
      const newPlaced    = [...s.placedShips];
      const newMyShips   = [...s.myShips];

      cells.forEach(i => { newBoard[i] = { shipIdx: si }; });
      newPlaced[si] = true;
      newMyShips.push({ idx: si, cells, hits: [] });

      let nextSelected = si + 1;
      while (nextSelected < SHIPS_DEF.length && newPlaced[nextSelected]) nextSelected++;

      return {
        ...s,
        myBoard:      newBoard,
        placedShips:  newPlaced,
        myShips:      newMyShips,
        selectedShip: nextSelected < SHIPS_DEF.length ? nextSelected : -1,
      };
    });
  }, []);

  const getPreviewCells = useCallback((pos) => {
    return (s => {
      if (s.phase !== 'placement' || s.selectedShip < 0) return { cells: [], valid: false };
      const si    = s.selectedShip;
      if (s.placedShips[si]) return { cells: [], valid: false };
      const cells = getShipCells(pos, SHIPS_DEF[si].size, s.horizontal);
      return { cells: cells || [], valid: canPlaceCells(s.myBoard, cells) };
    })(state);
  }, [state]);

  const randomPlacement = useCallback(() => {
    const { board, ships } = generateRandomFleet(SHIPS_DEF);
    setState(s => ({
      ...s,
      myBoard:      board,
      myShips:      ships,
      placedShips:  Array(SHIPS_DEF.length).fill(true),
      selectedShip: -1,
    }));
  }, []);

  // ─── battle ───────────────────────────────────────────────────────────────

  const startBattle = useCallback(() => {
    const { board: enemyShipBoard, ships: enemyShips } = generateRandomFleet(SHIPS_DEF);
    ai.resetAI();
    setState(s => ({
      ...s,
      phase:           'battle',
      enemyBoard:       EMPTY_BOARD(),
      myHits:           EMPTY_BOARD(),
      _enemyShipBoard:  enemyShipBoard,
      enemyShips,
      shots: 0, hits: 0,
      gameover: false, winner: null,
      log: [{ text: 'Bataille navale engagée ! Bonne chance, commandant.', cls: 'log-sys', id: Date.now() }],
    }));
  }, [ai]);

  const playerShoot = useCallback((pos) => {
    setState(s => {
      if (s.phase !== 'battle' || s.gameover || s.enemyBoard[pos]) return s;

      const newEnemyBoard = [...s.enemyBoard];
      const newEnemyShips = s.enemyShips.map(sh => ({ ...sh, hits: [...sh.hits] }));
      const newLog        = [...s.log];
      let newShots = s.shots + 1;
      let newHits  = s.hits;

      const shipData = s._enemyShipBoard[pos];
      if (shipData) {
        newHits++;
        const ship = newEnemyShips[shipData.shipIdx];
        ship.hits.push(pos);
        const sunk = ship.hits.length === ship.cells.length;
        if (sunk) {
          ship.cells.forEach(i => { newEnemyBoard[i] = CELL_STATE.SUNK; });
          newLog.push({ text: `Vous coulez le ${SHIPS_DEF[ship.idx].name} en ${coordLabel(pos)} !`, cls: 'log-sink', id: Date.now() });
        } else {
          newEnemyBoard[pos] = CELL_STATE.HIT;
          newLog.push({ text: `Touché en ${coordLabel(pos)}`, cls: 'log-hit', id: Date.now() });
        }
      } else {
        newEnemyBoard[pos] = CELL_STATE.MISS;
        newLog.push({ text: `Raté en ${coordLabel(pos)}`, cls: 'log-miss', id: Date.now() });
      }

      const enemyAlive = newEnemyShips.filter(sh => sh.hits.length < sh.cells.length).length;
      if (enemyAlive === 0) {
        newLog.push({ text: '=== VICTOIRE ! Félicitations Commandant ! ===', cls: 'log-sink', id: Date.now() + 1 });
        return { ...s, enemyBoard: newEnemyBoard, enemyShips: newEnemyShips, shots: newShots, hits: newHits, gameover: true, winner: 'player', log: newLog };
      }

      return { ...s, enemyBoard: newEnemyBoard, enemyShips: newEnemyShips, shots: newShots, hits: newHits, log: newLog };
    });

    // Schedule AI turn
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      setState(s => {
        if (s.gameover || s.phase !== 'battle') return s;

        const fired   = s.myHits;
        const pos     = ai.pickCell(fired);
        if (pos === -1) return s;

        const newMyHits  = [...s.myHits];
        const newMyShips = s.myShips.map(sh => ({ ...sh, hits: [...sh.hits] }));
        const newLog     = [...s.log];

        const shipData = s.myBoard[pos];
        if (shipData) {
          const ship = newMyShips[shipData.shipIdx];
          ship.hits.push(pos);
          const sunk = ship.hits.length === ship.cells.length;
          if (sunk) {
            ship.cells.forEach(i => { newMyHits[i] = CELL_STATE.SUNK; });
            ai.registerSunk();
            newLog.push({ text: `[IA] Coulé votre ${SHIPS_DEF[ship.idx].name} en ${coordLabel(pos)} !`, cls: 'log-ai', id: Date.now() });
          } else {
            newMyHits[pos] = CELL_STATE.HIT;
            ai.registerHit(pos);
            newLog.push({ text: `[IA] Touché en ${coordLabel(pos)}`, cls: 'log-ai', id: Date.now() });
          }
        } else {
          newMyHits[pos] = CELL_STATE.MISS;
          newLog.push({ text: `[IA] Raté en ${coordLabel(pos)}`, cls: 'log-ai', id: Date.now() });
        }

        const myAlive = newMyShips.filter(sh => sh.hits.length < sh.cells.length).length;
        if (myAlive === 0) {
          newLog.push({ text: '=== DÉFAITE. La mer est cruelle.', cls: 'log-ai', id: Date.now() + 1 });
          return { ...s, myHits: newMyHits, myShips: newMyShips, gameover: true, winner: 'ai', log: newLog };
        }

        return { ...s, myHits: newMyHits, myShips: newMyShips, log: newLog };
      });
    }, 700);
  }, [ai]);

  // ─── reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    ai.resetAI();
    setState(buildInitialState());
  }, [ai]);

  // ─── derived values ───────────────────────────────────────────────────────

  const myAlive     = state.myShips.filter(s => s.hits.length < s.cells.length).length;
  const enemyAlive  = state.enemyShips.filter(s => s.hits.length < s.cells.length).length;
  const accuracy    = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) + '%' : '—';
  const allPlaced   = state.placedShips.every(Boolean);

  return {
    state,
    // actions
    selectShip, toggleOrientation, placeShip, getPreviewCells,
    randomPlacement, startBattle, playerShoot, reset,
    // derived
    myAlive, enemyAlive, accuracy, allPlaced,
  };
}
