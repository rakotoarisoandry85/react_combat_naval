import React from 'react';

export default function StatusBar({ shots, hits, myAlive, enemyAlive, accuracy, phase }) {
  const phaseLabel = { placement: 'PLACEMENT', battle: 'COMBAT', over: 'FIN' }[phase] ?? phase;

  return (
    <div className="status-bar">
      <Stat label="COUPS JOUES" value={shots} />
      <Stat label="TOUCHES" value={hits} />
      <Stat label="VOS NAVIRES" value={myAlive} className={myAlive <= 2 ? 'danger' : myAlive <= 3 ? 'warn' : ''} />
      <Stat label="NAVIRES ENNEMIS" value={enemyAlive} />
      <Stat label="PRECISION" value={accuracy} />
      <Stat label="PHASE" value={phaseLabel} />
    </div>
  );
}

function Stat({ label, value, className = '' }) {
  return (
    <div className="status-bar__stat">
      <span className="status-bar__label">{label}</span>
      <span className={`status-bar__value${className ? ` status-bar__value--${className}` : ''}`}>
        {value}
      </span>
    </div>
  );
}
