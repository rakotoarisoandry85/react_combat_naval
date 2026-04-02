import React, { useEffect, useRef } from 'react';

/**
 * BattleLog – scrollable event log panel.
 *
 * entries: Array<{ id, text, cls }>
 */
export default function BattleLog({ entries }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;

  return (
    <div className="log" ref={ref}>
      {entries.map(entry => (
        <div key={entry.id} className={entry.cls}>
          {timestamp} {entry.text}
        </div>
      ))}
    </div>
  );
}
