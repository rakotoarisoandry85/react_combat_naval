import React from 'react';
import { SHIPS_DEF } from '../constants/ships';

/**
 * FleetSelector – shows buttons for each ship during placement phase.
 * Highlights selected ship, greys out placed ships.
 */
export default function FleetSelector({ placedShips, selectedShip, onSelect }) {
  return (
    <div className="fleet-bar">
      <span className="fleet-bar__label">FLOTTE:</span>
      {SHIPS_DEF.map((ship, i) => {
        const placed   = placedShips[i];
        const selected = selectedShip === i;
        const classes  = ['btn--ship', placed ? 'placed' : selected ? 'selected' : ''].filter(Boolean).join(' ');
        return (
          <button
            key={i}
            className={classes}
            disabled={placed}
            onClick={() => !placed && onSelect(i)}
          >
            {ship.name} ({ship.size})
          </button>
        );
      })}
    </div>
  );
}
