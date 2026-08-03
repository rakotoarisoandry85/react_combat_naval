import { BOARD_ROWS, BOARD_COLS } from '../constants/ships';

/* ── Water texture ──────────────────────────────────────────────────────── */
export function drawWater(ctx, x0, y0, width, height, cs, frame) {
  ctx.fillStyle = '#1e6fa8';
  ctx.fillRect(x0, y0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  const off = (frame * 0.4) % cs;
  for (let wx = x0 - cs + off; wx < x0 + width; wx += cs * 0.7) {
    ctx.beginPath(); ctx.moveTo(wx, y0); ctx.lineTo(wx + width * 0.3, y0 + height); ctx.stroke();
  }
  for (let wy = y0 + (frame * 0.3) % 18; wy < y0 + height; wy += 18) {
    ctx.beginPath(); ctx.moveTo(x0, wy);
    for (let lx = x0; lx <= x0 + width; lx += 8)
      ctx.lineTo(lx, wy + Math.sin((lx - x0) * 0.08) * 2.5);
    ctx.stroke();
  }
}

/* ── Grid lines + headers ───────────────────────────────────────────────── */
export function drawGrid(ctx, x0, y0, cs, cols, rows) {
  const C = (cols && cols.length) || BOARD_COLS;
  const R = (rows && rows.length) || BOARD_ROWS;

  ctx.font      = `bold ${Math.max(9, cs * 0.28)}px Share Tech Mono,monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let c = 0; c < C; c++) ctx.fillText(cols?.[c] ?? c + 1, x0 + c * cs + cs / 2, y0 - 10);
  for (let r = 0; r < R; r++) ctx.fillText(rows?.[r] ?? r + 1, x0 - 10, y0 + r * cs + cs / 2);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth   = 0.5;
  for (let c = 0; c <= C; c++) { ctx.beginPath(); ctx.moveTo(x0+c*cs, y0); ctx.lineTo(x0+c*cs, y0+R*cs); ctx.stroke(); }
  for (let r = 0; r <= R; r++) { ctx.beginPath(); ctx.moveTo(x0, y0+r*cs); ctx.lineTo(x0+C*cs, y0+r*cs); ctx.stroke(); }
}

/* ── Rounded rect helpers ───────────────────────────────────────────────── */
function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}
function rrStroke(ctx, x, y, w, h, r) {
  rr(ctx, x, y, w, h, r, null); ctx.stroke();
}

/* ── Ship drawing (wooden, top-down) ────────────────────────────────────── */
export function drawShip(ctx, si, cells, horiz, x0, y0, cs, alpha = 1) {
  if (!cells || cells.length === 0) return;
  const minI = Math.min(...cells);
  const r0   = Math.floor(minI / BOARD_COLS), c0 = minI % BOARD_COLS;
  const px   = x0 + c0 * cs, py = y0 + r0 * cs;
  const sw   = horiz ? cs * cells.length : cs;
  const sh   = horiz ? cs : cs * cells.length;
  const m    = 3;

  ctx.save();
  ctx.globalAlpha = alpha;

  /* Shadow */
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(px + sw/2 + 4, py + sh/2 + 5, sw * 0.42, sh * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Hull layers */
  rr(ctx, px+m,   py+m,   sw-m*2,   sh-m*2,   Math.min(sw,sh)*0.22, '#5a3010');
  rr(ctx, px+m+2, py+m+2, sw-m*2-4, sh-m*2-4, Math.min(sw,sh)*0.18, '#8b5a20');

  /* Deck planks */
  let toggle = true;
  if (horiz) {
    for (let lx = px+m+4; lx < px+sw-m-4; lx += 5) {
      ctx.fillStyle = toggle ? '#a8702a' : '#9a6525'; toggle = !toggle;
      ctx.fillRect(lx, py+m+4, 3, sh-m*2-8);
    }
  } else {
    for (let ly = py+m+4; ly < py+sh-m-4; ly += 5) {
      ctx.fillStyle = toggle ? '#a8702a' : '#9a6525'; toggle = !toggle;
      ctx.fillRect(px+m+4, ly, sw-m*2-8, 3);
    }
  }

  /* Hull outline */
  ctx.strokeStyle = '#3d2008'; ctx.lineWidth = 1.5;
  rrStroke(ctx, px+m, py+m, sw-m*2, sh-m*2, Math.min(sw,sh)*0.22);

  /* Bow */
  ctx.fillStyle = '#3d2008';
  if (horiz) {
    ctx.beginPath(); ctx.moveTo(px+sw-m, py+sh/2);
    ctx.lineTo(px+sw-m-cs*0.3, py+m+4); ctx.lineTo(px+sw-m-cs*0.3, py+sh-m-4);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(px+sw/2, py+sh-m);
    ctx.lineTo(px+m+4, py+sh-m-cs*0.3); ctx.lineTo(px+sw-m-4, py+sh-m-cs*0.3);
    ctx.closePath(); ctx.fill();
  }

  const cx = px + sw / 2, cy = py + sh / 2;

  /* Superstructures */
  if (si === 0) {        /* Porte-avions */
    ctx.fillStyle = '#888';
    if (horiz) {
      ctx.fillRect(cx-sw*0.25, py+m+3, sw*0.5, sh*0.32);
      ctx.fillStyle = '#555'; ctx.fillRect(cx-cs*0.2, py+m+2, cs*0.4, sh*0.18);
      ctx.fillStyle = '#aaa';
      for (let ax = cx-sw*0.2; ax < cx+sw*0.2; ax += cs*0.5)
        ctx.fillRect(ax, py+m+5, cs*0.35, sh*0.22);
    } else {
      ctx.fillRect(px+m+3, cy-sh*0.25, sw*0.32, sh*0.5);
      ctx.fillStyle = '#555'; ctx.fillRect(px+m+2, cy-cs*0.2, sw*0.18, cs*0.4);
      ctx.fillStyle = '#aaa';
      for (let ay = cy-sh*0.2; ay < cy+sh*0.2; ay += cs*0.5)
        ctx.fillRect(px+m+5, ay, sw*0.22, cs*0.35);
    }
  } else if (si === 1) { /* Croiseur */
    rr(ctx, cx-cs*0.3, cy-cs*0.28, cs*0.6, cs*0.56, 4, '#777');
    rr(ctx, cx-cs*0.15, cy-cs*0.38, cs*0.3, cs*0.28, 3, '#555');
    const tf = horiz
      ? { x: px+m+cs*0.2, y: cy-cs*0.15 }
      : { x: cx-cs*0.15,  y: py+m+cs*0.2 };
    rr(ctx, tf.x, tf.y, cs*0.3, cs*0.3, cs*0.1, '#888');
    ctx.fillStyle = '#444';
    ctx.fillRect(tf.x+cs*0.12, horiz ? tf.y+cs*0.05 : tf.y+cs*0.12, cs*0.06, cs*0.2);
  } else if (si === 2) { /* Destroyer */
    rr(ctx, cx-cs*0.25, cy-cs*0.22, cs*0.5, cs*0.44, 3, '#666');
    rr(ctx, cx-cs*0.12, cy-cs*0.32, cs*0.24, cs*0.22, 2, '#444');
    ctx.fillStyle = '#888';
    ctx.fillRect(cx-cs*0.06, horiz ? cy-cs*0.05 : cy+cs*0.05, cs*0.12, cs*0.18);
  } else if (si === 3) { /* Sous-marin */
    ctx.fillStyle = 'rgba(40,60,80,0.8)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, horiz ? sw*0.38 : sw*0.3, horiz ? sh*0.3 : sh*0.38, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#6699aa'; ctx.lineWidth = 1; ctx.stroke();
    rr(ctx, cx-cs*0.1, cy-cs*0.1, cs*0.2, cs*0.2, 2, '#446677');
    ctx.fillStyle = '#88aacc';
    ctx.fillRect(cx-cs*0.03, cy-cs*0.18, cs*0.06, cs*0.1);
  } else {               /* Patrouilleur */
    rr(ctx, cx-cs*0.2, cy-cs*0.18, cs*0.4, cs*0.36, 3, '#775522');
    ctx.fillStyle = '#553311';
    ctx.fillRect(cx-cs*0.05, horiz ? cy-cs*0.08 : cy+cs*0.05, cs*0.1, cs*0.14);
  }

  /* Wake */
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  if (horiz) {
    ctx.beginPath(); ctx.moveTo(px+m, cy-4); ctx.quadraticCurveTo(px-cs, cy, px-cs*0.5, cy+3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px+m, cy+4); ctx.quadraticCurveTo(px-cs, cy, px-cs*0.5, cy-3); ctx.stroke();
  }

  ctx.restore();
}

/* ── Explosion star ─────────────────────────────────────────────────────── */
export function drawExplosion(ctx, cx, cy, cs, frame) {
  const r      = cs * 0.38;
  const spikes = 8;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle   = '#ff4400';
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / spikes) * Math.PI;
    const rad = i % 2 === 0 ? r * (0.9 + Math.sin(frame * 0.3 + i) * 0.1) : r * 0.45;
    ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle   = '#ffee44';
  ctx.globalAlpha = 0.75;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ── Miss splash ────────────────────────────────────────────────────────── */
export function drawMiss(ctx, cx, cy, cs) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle   = '#aaddff';
  ctx.beginPath(); ctx.arc(cx, cy, cs * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#88bbee'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

/* ── Placement preview ──────────────────────────────────────────────────── */
export function drawPreview(ctx, cells, valid, x0, y0, cs) {
  if (!cells || cells.length === 0) return;
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.fillStyle   = valid ? '#88ff88' : '#ff8888';
  cells.forEach(i => {
    const r = Math.floor(i / BOARD_COLS), c = i % BOARD_COLS;
    ctx.fillRect(x0 + c * cs + 2, y0 + r * cs + 2, cs - 4, cs - 4);
  });
  ctx.restore();
}

/* ── Hover highlight ────────────────────────────────────────────────────── */
export function drawHover(ctx, pos, x0, y0, cs) {
  if (pos < 0) return;
  const r = Math.floor(pos / BOARD_COLS), c = pos % BOARD_COLS;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle   = '#ffdd44';
  ctx.fillRect(x0 + c * cs + 1, y0 + r * cs + 1, cs - 2, cs - 2);
  ctx.restore();
}
