import { useCallback, useRef } from 'react';
import { BOARD_ROWS, BOARD_COLS } from '../constants/ships';
import { idx, rc, getNeighbours } from '../utils/boardUtils';

export function useAI(difficulty) {
  const aiState = useRef({ hits: [], queue: [] });

  const resetAI = useCallback(() => {
    aiState.current = { hits: [], queue: [] };
  }, []);

  const pickCell = useCallback((fired) => {
    const available = [...Array(BOARD_ROWS * BOARD_COLS).keys()].filter(i => !fired[i]);
    if (available.length === 0) return -1;
    const { hits, queue } = aiState.current;

    if (difficulty === 'easy')
      return available[Math.floor(Math.random() * available.length)];

    if (difficulty === 'hard' && queue.length > 0) {
      let pos = queue.shift();
      while (fired[pos] && queue.length > 0) pos = queue.shift();
      if (!fired[pos]) return pos;
    }

    if (hits.length > 0) {
      const nb = [];
      hits.forEach(h => getNeighbours(h).forEach(n => {
        if (!fired[n] && !nb.includes(n)) nb.push(n);
      }));
      if (nb.length > 0) return nb[Math.floor(Math.random() * nb.length)];
    }

    if (difficulty === 'hard') {
      const parity = available.filter(i => { const { r, c } = rc(i); return (r + c) % 2 === 0; });
      const pool   = parity.length > 0 ? parity : available;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }, [difficulty]);

  const registerHit = useCallback((pos) => {
    aiState.current.hits.push(pos);
    if (difficulty === 'hard')
      getNeighbours(pos).forEach(n => {
        if (!aiState.current.queue.includes(n)) aiState.current.queue.push(n);
      });
  }, [difficulty]);

  const registerSunk = useCallback(() => {
    aiState.current = { hits: [], queue: [] };
  }, []);

  return { pickCell, registerHit, registerSunk, resetAI };
}