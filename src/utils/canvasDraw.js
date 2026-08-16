import { N } from '../constants/ships';

// ---------- Chargement des textures ----------
const shipImages = {};
const SHIP_FILES = [
  'porte-avions',   // si === 0
  'croiseur',       // si === 1
  'destroyer',      // si === 2
  'sous-marin',     // si === 3
  'patrouilleur',   // si === 4
];

SHIP_FILES.forEach((name, i) => {
  const img = new Image();
  img.src = new URL(`../assets/ships/${name}.png`, import.meta.url).href;
  shipImages[i] = img;
});

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

function rrStroke(ctx, x, y, w, h, r) {
  rr(ctx, x, y, w, h, r, null);
  ctx.stroke();
}

/* ── Water ───────────────────────────────────────────────────────────────── */


/* ── Grid ────────────────────────────────────────────────────────────────── */
export function drawGrid(ctx, x0, y0, cs, cols, rows) {
  ctx.font = `bold ${Math.max(9, cs * 0.28)}px Share Tech Mono,monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';

  for (let c = 0; c < N; c++) {
    ctx.fillText(cols?.[c] ?? c + 1, x0 + c * cs + cs / 2, y0 - 10);
  }
  for (let r = 0; r < N; r++) {
    ctx.fillText(rows?.[r] ?? r + 1, x0 - 10, y0 + r * cs + cs / 2);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 0.5;

  for (let c = 0; c <= N; c++) {
    ctx.beginPath();
    ctx.moveTo(x0 + c * cs, y0);
    ctx.lineTo(x0 + c * cs, y0 + N * cs);
    ctx.stroke();
  }
  for (let r = 0; r <= N; r++) {
    ctx.beginPath();
    ctx.moveTo(x0, y0 + r * cs);
    ctx.lineTo(x0 + N * cs, y0 + r * cs);
    ctx.stroke();
  }
}

/* ── Ship avec textures PNG ──────────────────────────────────────────────── */
/* ── Ship (zoomé) ────────────────────────────────────────────────────────── */
export function drawShip(ctx, si, cells, horiz, x0, y0, cs, alpha = 1) {
  if (!cells || cells.length === 0) return;

  const img = shipImages[si];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const minI = Math.min(...cells);
  const r0 = Math.floor(minI / N);
  const c0 = minI % N;

  const px = x0 + c0 * cs;
  const py = y0 + r0 * cs;
  const sw = horiz ? cs * cells.length : cs;
  const sh = horiz ? cs : cs * cells.length;

  // Facteur de zoom (1.0 = taille normale, 1.15 = un peu plus grand)
  const zoom = 1.25;

  const drawW = sw * zoom;
  const drawH = sh * zoom;

  // Centrage du zoom
  const offsetX = (drawW - sw) / 2;
  const offsetY = (drawH - sh) / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(
    px + sw / 2 + 2,
    py + sh / 2 + 3,
    sw * 0.42,
    sh * 0.27,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (horiz) {
    ctx.translate(px + sw / 2, py + sh / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(
      img,
      -drawH / 2,
      -drawW / 2,
      drawH,
      drawW
    );
  } else {
    ctx.drawImage(
      img,
      px - offsetX,
      py - offsetY,
      drawW,
      drawH
    );
  }

  ctx.restore();
}

/* ── Explosion ───────────────────────────────────────────────────────────── */
export function drawExplosion(ctx, cx, cy, cs, frame) {
  const r = cs * 0.38;
  const spikes = 8;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#ff4400';
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / spikes) * Math.PI;
    const rad = i % 2 === 0 ? r * (0.9 + Math.sin(frame * 0.3 + i) * 0.1) : r * 0.45;
    ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffee44';
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ── Miss ────────────────────────────────────────────────────────────────── */
export function drawMiss(ctx, cx, cy, cs) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#aaddff';
  ctx.beginPath();
  ctx.arc(cx, cy, cs * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#88bbee';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

/* ── Preview ─────────────────────────────────────────────────────────────── */
export function drawPreview(ctx, cells, valid, x0, y0, cs) {
  if (!cells || cells.length === 0) return;
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.fillStyle = valid ? '#88ff88' : '#ff8888';
  cells.forEach((i) => {
    const r = Math.floor(i / N);
    const c = i % N;
    ctx.fillRect(x0 + c * cs + 2, y0 + r * cs + 2, cs - 4, cs - 4);
  });
  ctx.restore();
}

/* ── Hover ───────────────────────────────────────────────────────────────── */
export function drawHover(ctx, pos, x0, y0, cs) {
  if (pos < 0) return;
  const r = Math.floor(pos / N);
  const c = pos % N;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#ffdd44';
  ctx.fillRect(x0 + c * cs + 1, y0 + r * cs + 1, cs - 2, cs - 2);
  ctx.restore();
}