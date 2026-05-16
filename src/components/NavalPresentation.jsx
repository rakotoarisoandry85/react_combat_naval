import React from 'react';

const rows = 'ABCDEFGHIJ'.split('');
const columns = Array.from({ length: 10 }, (_, i) => i + 1);

function starPoints(cx, cy, outer, inner, points = 12) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function WoodShip({ x, y, width = 128, height = 34, rotate = 0 }) {
  const deck = width * 0.42;
  const plankStart = -width / 2 + 18;

  return (
    <g className="scene-ship scene-ship--wood" transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <ellipse className="scene-shadow" cx="0" cy="18" rx={width * 0.46} ry="9" />
      <path
        className="scene-wake"
        d={`M${-width / 2 - 18},10 C${-width / 2 - 2},4 ${-width / 2 + 10},20 ${-width / 2 + 28},12`}
      />
      <path
        className="ship-hull"
        d={`M${-width / 2 + 10},${-height / 2} L${width / 2 - 12},${-height / 2} Q${width / 2 + 6},0 ${width / 2 - 12},${height / 2} L${-width / 2 + 10},${height / 2} Q${-width / 2 - 12},0 ${-width / 2 + 10},${-height / 2} Z`}
      />
      <path
        className="ship-rail"
        d={`M${-width / 2 + 18},${-height / 2 + 5} L${width / 2 - 18},${-height / 2 + 5} M${-width / 2 + 18},${height / 2 - 5} L${width / 2 - 18},${height / 2 - 5}`}
      />
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={i}
          className="ship-plank"
          x1={plankStart + i * 22}
          y1={-height / 2 + 6}
          x2={plankStart + i * 22}
          y2={height / 2 - 6}
        />
      ))}
      <rect className="ship-cabin" x={-deck / 2} y={-height / 2 + 6} width={deck} height={height - 12} rx="4" />
      <rect className="ship-cabin-top" x={-deck / 2 + 8} y={-height / 2 + 10} width={deck - 16} height={height - 20} rx="3" />
      <circle className="ship-port" cx={-deck / 2 - 16} cy="-7" r="3" />
      <circle className="ship-port" cx={-deck / 2 - 16} cy="7" r="3" />
      <circle className="ship-port" cx={deck / 2 + 18} cy="-7" r="3" />
      <circle className="ship-port" cx={deck / 2 + 18} cy="7" r="3" />
      <rect className="ship-lifeboat" x={width / 2 - 36} y="-11" width="20" height="6" rx="3" />
      <rect className="ship-lifeboat" x={width / 2 - 36} y="5" width="20" height="6" rx="3" />
    </g>
  );
}

function Carrier({ x, y, rotate = 0 }) {
  return (
    <g className="scene-ship scene-ship--carrier" transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <ellipse className="scene-shadow" cx="4" cy="86" rx="55" ry="14" />
      <path
        className="carrier-deck"
        d="M-34,-88 L24,-88 L42,-58 L42,62 L24,90 L-34,82 L-44,36 L-42,-48 Z"
      />
      <path className="carrier-runway" d="M-4,-72 L4,62" />
      <path className="carrier-edge" d="M-24,-78 L-30,62 M24,-58 L28,48" />
      <rect className="carrier-island" x="14" y="16" width="24" height="38" rx="4" />
      {[-46, -16, 18, 52].map((cy, i) => (
        <g key={i} className="carrier-plane" transform={`translate(${i % 2 ? 13 : -17} ${cy})`}>
          <path d="M0,-8 L4,4 L0,9 L-4,4 Z" />
          <path d="M-10,0 L10,0" />
          <path d="M-5,6 L5,6" />
        </g>
      ))}
    </g>
  );
}

function Explosion({ x, y, size = 36 }) {
  return (
    <g className="scene-explosion" transform={`translate(${x} ${y})`}>
      <polygon className="explosion-glow" points={starPoints(0, 0, size * 1.15, size * 0.38)} />
      <polygon className="explosion-core" points={starPoints(0, 0, size * 0.78, size * 0.26, 10)} />
    </g>
  );
}

function Bird({ x, y, scale = 1, rotate = 0 }) {
  return (
    <path
      className="scene-bird"
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
      d="M-18,2 C-10,-8 -3,-8 0,1 C4,-8 12,-8 20,2 C10,-2 5,2 0,8 C-5,2 -10,-2 -18,2 Z"
    />
  );
}

export default function NavalPresentation() {
  return (
    <div className="header__art" aria-label="Scene de reference style bataille navale">
      <svg className="naval-scene" viewBox="0 0 620 420" role="img">
        <title>Scene de bataille navale avec navires en bois, eau bleue et explosions rouges</title>
        <defs>
          <linearGradient id="sceneWater" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#1587cf" />
            <stop offset="0.52" stopColor="#20a9dd" />
            <stop offset="1" stopColor="#0f6fac" />
          </linearGradient>
          <pattern id="sceneWavePattern" width="78" height="52" patternUnits="userSpaceOnUse">
            <path d="M0,24 C15,12 29,36 44,24 S65,12 78,24" fill="none" stroke="#76d7f2" strokeOpacity="0.18" strokeWidth="4" />
            <path d="M-12,45 C4,34 20,56 36,45 S60,34 82,45" fill="none" stroke="#045b94" strokeOpacity="0.18" strokeWidth="5" />
          </pattern>
          <linearGradient id="woodHull" x1="0" x2="1">
            <stop offset="0" stopColor="#8f5327" />
            <stop offset="0.5" stopColor="#b97737" />
            <stop offset="1" stopColor="#6d3d1f" />
          </linearGradient>
          <linearGradient id="metalDeck" x1="0" x2="1">
            <stop offset="0" stopColor="#b9c6cd" />
            <stop offset="1" stopColor="#6d7d87" />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="9" dy="12" stdDeviation="4" floodColor="#063650" floodOpacity="0.38" />
          </filter>
        </defs>

        <rect width="620" height="420" fill="url(#sceneWater)" />
        <rect width="620" height="420" fill="url(#sceneWavePattern)" />
        <path className="scene-water-shade" d="M18,336 C90,312 116,376 188,345 C260,314 286,370 360,338 C438,306 474,364 604,322 L604,420 L18,420 Z" />
        <path className="scene-water-shine" d="M70,252 C148,220 254,276 336,242 C420,208 500,232 580,206" />

        <g className="scene-grid">
          {columns.map((column, index) => (
            <text key={column} x={72 + index * 52} y="31">{column}</text>
          ))}
          {rows.map((row, index) => (
            <text key={row} x="24" y={83 + index * 32}>{row}</text>
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v-${i}`} x1={46 + i * 52} y1="46" x2={46 + i * 52} y2="386" />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h-${i}`} x1="46" y1={46 + i * 34} x2="566" y2={46 + i * 34} />
          ))}
        </g>

        <Bird x="318" y="78" scale="0.72" rotate="-14" />
        <Bird x="82" y="136" scale="0.82" rotate="18" />
        <Bird x="438" y="354" scale="0.68" rotate="-12" />

        <g filter="url(#softShadow)">
          <WoodShip x="154" y="72" width={126} height={34} />
          <WoodShip x="392" y="116" width={128} height={34} />
          <WoodShip x="242" y="238" width={130} height={34} />
          <WoodShip x="470" y="304" width={124} height={34} />
          <WoodShip x="238" y="154" width={112} height={34} rotate="90" />
          <WoodShip x="164" y="326" width={104} height={32} rotate="90" />
          <WoodShip x="300" y="336" width={92} height={32} rotate="90" />
          <Carrier x="512" y="194" rotate="2" />
          <WoodShip x="472" y="362" width={154} height={38} />
        </g>

        <Explosion x="122" y="206" size={38} />
        <Explosion x="420" y="204" size={38} />
        <Explosion x="548" y="58" size={36} />
        <Explosion x="546" y="302" size={34} />
        <Explosion x="112" y="372" size={34} />
      </svg>
    </div>
  );
}
