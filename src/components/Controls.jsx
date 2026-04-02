import React from 'react';
import { DIFFICULTY } from '../constants/ships';

/**
 * Controls – action buttons + difficulty selector.
 *
 * Props:
 *  - phase         : 'placement' | 'battle' | 'over'
 *  - allPlaced     : bool
 *  - difficulty    : string
 *  - onRotate / onRandom / onStart / onReset / onDiffChange
 */
export default function Controls({
  phase,
  allPlaced,
  difficulty,
  onRotate,
  onRandom,
  onStart,
  onReset,
  onDiffChange,
}) {
  const inPlacement = phase === 'placement';

  return (
    <div className="controls">
      <button onClick={onRotate}  disabled={!inPlacement}>↻ PIVOTER</button>
      <button onClick={onRandom}  disabled={!inPlacement} className="btn--primary">⚡ PLACEMENT AUTO</button>
      <button onClick={onStart}   disabled={!allPlaced || phase !== 'placement'} className="btn--primary">▶ LANCER LA BATAILLE</button>
      <button onClick={onReset}   className="btn--danger">↺ RESET</button>

      <select
        value={difficulty}
        onChange={e => onDiffChange(e.target.value)}
        disabled={phase === 'battle'}
      >
        {Object.entries(DIFFICULTY).map(([val, label]) => (
          <option key={val} value={val}>Difficulté: {label}</option>
        ))}
      </select>
    </div>
  );
}
