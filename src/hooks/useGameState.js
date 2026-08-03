import { useState, useCallback, useRef, useEffect } from 'react';
import { BOARD_ROWS, BOARD_COLS, CELL_STATE, SHIPS } from '../constants/ships';
import {
  getShipCells,
  canPlaceCells,
  generateRandomFleet,
  coordLabel,
} from '../utils/boardUtils';
import { useAI } from './useAI';

const EMPTY_BOARD = () => Array(BOARD_ROWS * BOARD_COLS).fill(CELL_STATE.EMPTY);

function buildInitialState() {
  return {
    phase: 'placement',
    myBoard: EMPTY_BOARD(),
    myHits: EMPTY_BOARD(),
    enemyBoard: EMPTY_BOARD(),
    _enemyShipBoard: EMPTY_BOARD(),
    myShips: [],
    enemyShips: [],
    placedShips: Array(SHIPS.length).fill(false),
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

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  const selectShip = useCallback((shipIndex) => {
    setState(s => {
      if (s.phase !== 'placement' || s.placedShips[shipIndex]) return s;
      return { ...s, selectedShip: shipIndex };
    });
  }, []);

  const toggleOrientation = useCallback(() => {
    setState(s => ({ ...s, horizontal: !s.horizontal }));
  }, []);

  const getPreviewCells = useCallback((pos) => {
    if (state.phase !== 'placement' || state.selectedShip < 0) return { cells: [], valid: false };
    const ship = SHIPS[state.selectedShip];
    if (!ship || state.placedShips[state.selectedShip]) return { cells: [], valid: false };

    const cells = getShipCells(pos, ship.size, state.horizontal);
    return { cells: cells || [], valid: canPlaceCells(state.myBoard, cells) };
  }, [state]);

  const placeShip = useCallback((pos) => {
    setState(s => {
      if (s.phase !== 'placement') return s;

      const shipIndex = s.selectedShip;
      const ship = SHIPS[shipIndex];
      if (!ship || s.placedShips[shipIndex]) return s;

      const cells = getShipCells(pos, ship.size, s.horizontal);
      if (!canPlaceCells(s.myBoard, cells)) return s;

      const myBoard = [...s.myBoard];
      const placedShips = [...s.placedShips];
      const myShips = [...s.myShips];

      cells.forEach(i => { myBoard[i] = { shipIdx: shipIndex, si: shipIndex }; });
      placedShips[shipIndex] = true;
      myShips.push({
        idx: shipIndex,
        si: shipIndex,
        cells,
        horizontal: s.horizontal,
        h: s.horizontal,
        hits: [],
      });

      let nextSelected = shipIndex + 1;
      while (nextSelected < SHIPS.length && placedShips[nextSelected]) nextSelected++;

      return {
        ...s,
        myBoard,
        myShips,
        placedShips,
        selectedShip: nextSelected < SHIPS.length ? nextSelected : -1,
      };
    });
  }, []);

  const randomPlacement = useCallback(() => {
    const { board, ships } = generateRandomFleet(SHIPS);
    setState(s => ({
      ...s,
      myBoard: board,
      myShips: ships,
      placedShips: Array(SHIPS.length).fill(true),
      selectedShip: -1,
    }));
  }, []);

  const startBattle = useCallback(() => {
    const { board, ships } = generateRandomFleet(SHIPS);
    ai.resetAI();
    setState(s => ({
      ...s,
      phase: 'battle',
      enemyBoard: EMPTY_BOARD(),
      myHits: EMPTY_BOARD(),
      _enemyShipBoard: board,
      enemyShips: ships,
      shots: 0,
      hits: 0,
      gameover: false,
      winner: null,
      log: [{ text: 'Bataille navale engagee ! Bonne chance, commandant.', cls: 'log-sys', id: Date.now() }],
    }));
  }, [ai]);

  const playerShoot = useCallback((pos) => {
    setState(s => {
      if (s.phase !== 'battle' || s.gameover || s.enemyBoard[pos]) return s;

      const enemyBoard = [...s.enemyBoard];
      const enemyShips = s.enemyShips.map(ship => ({ ...ship, hits: [...ship.hits] }));
      const log = [...s.log];
      const shots = s.shots + 1;
      let hits = s.hits;
      const shipData = s._enemyShipBoard[pos];

      if (shipData) {
        const shipIndex = shipData.shipIdx ?? shipData.si;
        const ship = enemyShips[shipIndex];
        hits++;
        ship.hits.push(pos);

        if (ship.hits.length === ship.cells.length) {
          ship.cells.forEach(i => { enemyBoard[i] = CELL_STATE.SUNK; });
          log.push({ text: `Coule le ${SHIPS[shipIndex].name} en ${coordLabel(pos)} !`, cls: 'log-sink', id: Date.now() });
        } else {
          enemyBoard[pos] = CELL_STATE.HIT;
          log.push({ text: `Touche en ${coordLabel(pos)}`, cls: 'log-hit', id: Date.now() });
        }
      } else {
        enemyBoard[pos] = CELL_STATE.MISS;
        log.push({ text: `Rate en ${coordLabel(pos)}`, cls: 'log-miss', id: Date.now() });
      }

      const enemyAlive = enemyShips.filter(ship => ship.hits.length < ship.cells.length).length;
      if (enemyAlive === 0) {
        log.push({ text: '=== VICTOIRE ! ===', cls: 'log-sink', id: Date.now() + 1 });
        return {
          ...s,
          phase: 'over',
          enemyBoard,
          enemyShips,
          shots,
          hits,
          gameover: true,
          winner: 'player',
          log,
        };
      }

      return { ...s, enemyBoard, enemyShips, shots, hits, log };
    });

    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      setState(s => {
        if (s.gameover || s.phase !== 'battle') return s;

        const pos = ai.pickCell(s.myHits);
        if (pos === -1) return s;

        const myHits = [...s.myHits];
        const myShips = s.myShips.map(ship => ({ ...ship, hits: [...ship.hits] }));
        const log = [...s.log];
        const shipData = s.myBoard[pos];

        if (shipData) {
          const shipIndex = shipData.shipIdx ?? shipData.si;
          const ship = myShips[shipIndex];
          ship.hits.push(pos);

          if (ship.hits.length === ship.cells.length) {
            ship.cells.forEach(i => { myHits[i] = CELL_STATE.SUNK; });
            ai.registerSunk();
            log.push({ text: `[IA] Coule votre ${SHIPS[shipIndex].name} en ${coordLabel(pos)} !`, cls: 'log-ai', id: Date.now() });
          } else {
            myHits[pos] = CELL_STATE.HIT;
            ai.registerHit(pos);
            log.push({ text: `[IA] Touche en ${coordLabel(pos)}`, cls: 'log-ai', id: Date.now() });
          }
        } else {
          myHits[pos] = CELL_STATE.MISS;
          log.push({ text: `[IA] Rate en ${coordLabel(pos)}`, cls: 'log-ai', id: Date.now() });
        }

        const myAlive = myShips.filter(ship => ship.hits.length < ship.cells.length).length;
        if (myAlive === 0) {
          log.push({ text: '=== DEFAITE. ===', cls: 'log-ai', id: Date.now() + 1 });
          return {
            ...s,
            phase: 'over',
            myHits,
            myShips,
            gameover: true,
            winner: 'ai',
            log,
          };
        }

        return { ...s, myHits, myShips, log };
      });
    }, 800);
  }, [ai]);

  const reset = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    ai.resetAI();
    setState(buildInitialState());
  }, [ai]);

  const myAlive = state.myShips.filter(ship => ship.hits.length < ship.cells.length).length;
  const enemyAlive = state.enemyShips.filter(ship => ship.hits.length < ship.cells.length).length;
  const accuracy = state.shots > 0 ? `${Math.round((state.hits / state.shots) * 100)}%` : '-';
  const allPlaced = state.placedShips.every(Boolean);

  return {
    state,
    selectShip,
    toggleOrientation,
    placeShip,
    getPreviewCells,
    randomPlacement,
    startBattle,
    playerShoot,
    reset,
    myAlive,
    enemyAlive,
    accuracy,
    allPlaced,
  };
}
