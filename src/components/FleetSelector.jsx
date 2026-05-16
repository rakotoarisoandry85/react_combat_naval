import React from 'react';
import { SHIPS } from '../constants/ships';

export default function FleetSelector({ placedShips, selectedShip, onSelect }) {
  return (
    <div className="fleet-bar">
      <span className="fleet-bar__label">FLOTTE:</span>
      {SHIPS.map((ship, i) => {
        const placed = placedShips[i];
        const selected = selectedShip === i;
        const classes = ['btn--ship', placed ? 'placed' : selected ? 'selected' : ''].filter(Boolean).join(' ');

        return (
          <button
            key={ship.symbol}
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
