import React from 'react';

/**
 * MessageBar – contextual feedback shown between status bar and board.
 *
 * variant: 'default' | 'hit' | 'miss' | 'win' | 'lose'
 */
export default function MessageBar({ text, variant = 'default' }) {
  const variantClass = variant !== 'default' ? `msg--${variant}` : 'msg--pulse';
  return (
    <div className={`msg ${variantClass}`}>
      {text}
    </div>
  );
}
