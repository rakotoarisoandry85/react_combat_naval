import { useCallback, useRef } from 'react';
import { BOARD_SIZE } from '../constants/ships';
import { idx, rc, getNeighbours } from '../utils/boardUtils';

/**
 * useAI – encapsulates the enemy AI shooting strategy.
 *
 * Difficulty levels:
 *  - easy  : pure random
 *  - medium: hunt/target – follow up on hits with neighbour search
 *  - hard  : parity-based hunt + directional targeting
 */
export function useAI(difficulty) {
  const aiState = useRef({ hits: [], queue: [] });

  const resetAI = useCallback(() => {
    aiState.current = { hits: [], queue: [] };
  }, []);

  /**
   * Picks the next cell for the AI to shoot.
   * @param {Array} fired - array of cell indices already fired upon
   * @returns {number} chosen cell index
   */
  const pickCell = useCallback((fired) => {
    const available = [...Array(BOARD_SIZE * BOARD_SIZE).keys()].filter(i => !fired[i]);
    if (available.length === 0) return -1;

    const { hits, queue } = aiState.current;

    if (difficulty === 'easy') {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Hard: drain directional queue first
    if (difficulty === 'hard' && queue.length > 0) {
      let pos = queue.shift();
      while (fired[pos] && queue.length > 0) pos = queue.shift();
      if (!fired[pos]) return pos;
    }

    // Medium/Hard: neighbour hunt around known hits
    if (hits.length > 0) {
      const neighbours = [];
      hits.forEach(h => {
        getNeighbours(h).forEach(n => {
          if (!fired[n] && !neighbours.includes(n)) neighbours.push(n);
        });
      });
      if (neighbours.length > 0) {
        return neighbours[Math.floor(Math.random() * neighbours.length)];
      }
    }

    // Hard: parity-based search (checkerboard pattern)
    if (difficulty === 'hard') {
      const parity = available.filter(i => {
        const { r, c } = rc(i);
        return (r + c) % 2 === 0;
      });
      const pool = parity.length > 0 ? parity : available;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
  }, [difficulty]);

  /**
   * Registers that the AI's last shot at `pos` was a hit (not sunk).
   * Updates internal targeting state.
   */
  const registerHit = useCallback((pos) => {
    aiState.current.hits.push(pos);
    if (difficulty === 'hard') {
      getNeighbours(pos).forEach(n => {
        if (!aiState.current.queue.includes(n)) {
          aiState.current.queue.push(n);
        }
      });
    }
  }, [difficulty]);

  /** Call when a ship is fully sunk – resets the targeting state. */
  const registerSunk = useCallback(() => {
    aiState.current.hits  = [];
    aiState.current.queue = [];
  }, []);

  return { pickCell, registerHit, registerSunk, resetAI };
}
