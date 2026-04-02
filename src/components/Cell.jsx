import React from 'react';

/**
 * Cell – a single square on a game board.
 *
 * Props:
 *  - state      : null | 'ship' | 'hit' | 'miss' | 'sunk' | 'revealed'
 *  - preview    : null | 'ok' | 'err'   (placement preview overlay)
 *  - clickable  : bool
 *  - onClick    : fn
 *  - onMouseEnter / onMouseLeave : fn
 */
const Cell = React.memo(function Cell({
  state = null,
  preview = null,
  clickable = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const classes = ['cell'];
  if (clickable)         classes.push('cell--clickable');
  if (state === 'ship')  classes.push('cell--ship');
  if (state === 'hit')   classes.push('cell--hit');
  if (state === 'miss')  classes.push('cell--miss');
  if (state === 'sunk')  classes.push('cell--sunk');
  if (state === 'revealed') classes.push('cell--ship', 'cell--revealed');
  if (preview === 'ok')  classes.push('cell--preview-ok');
  if (preview === 'err') classes.push('cell--preview-err');

  return (
    <div
      className={classes.join(' ')}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
});

export default Cell;
