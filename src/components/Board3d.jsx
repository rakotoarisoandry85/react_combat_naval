import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BOARD_ROWS, BOARD_COLS, CELL_STATE, COLUMN_LABELS, ROW_LABELS } from '../constants/ships';

const CELL_SIZE = 1;
const GAP = 0.05;

// ---------- Eau animée ----------
function Water() {
  const mesh = useRef();
  const geo = useMemo(() => new THREE.PlaneGeometry(
    BOARD_COLS * CELL_SIZE,
    BOARD_ROWS * CELL_SIZE,
    BOARD_COLS * 2,
    BOARD_ROWS * 2
  ), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.8 + t) * 0.08 + Math.sin(y * 0.6 + t * 1.3) * 0.06);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} geometry={geo}>
      <meshStandardMaterial color="#1e6fa8" roughness={0.25} metalness={0.1} />
    </mesh>
  );
}

// ---------- Une case ----------
function Cell({
  index,
  isEnemy,
  value,
  isHover,
  isPreview,
  previewValid,
  onClick,
  onHover,
}) {
  const r = Math.floor(index / BOARD_COLS);
  const c = index % BOARD_COLS;
  const x = (c - (BOARD_COLS - 1) / 2) * CELL_SIZE;
  const z = (r - (BOARD_ROWS - 1) / 2) * CELL_SIZE;

  let color = '#1a4a70';
  if (isPreview) color = previewValid ? '#66ff66' : '#ff6666';
  else if (isHover) color = '#ffdd44';
  else if (value === CELL_STATE.HIT || value === CELL_STATE.SUNK) color = '#ff4400';
  else if (value === CELL_STATE.MISS) color = '#88bbee';

  return (
    <mesh
      position={[x, 0.02, z]}
      onClick={(e) => { e.stopPropagation(); onClick?.(index); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover?.(index); }}
      onPointerOut={() => onHover?.(-1)}
    >
      <boxGeometry args={[CELL_SIZE - GAP, 0.04, CELL_SIZE - GAP]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={isPreview || isHover ? 0.55 : value ? 0.85 : 0.25}
      />
    </mesh>
  );
}

// ---------- Navire 3D simple (style bois) ----------
function Ship3D({ ship, visible = true }) {
  if (!visible || !ship?.cells?.length) return null;

  const cells = ship.cells;
  const minI = Math.min(...cells);
  const r0 = Math.floor(minI / BOARD_COLS);
  const c0 = minI % BOARD_COLS;
  const horizontal = ship.h ?? ship.horizontal;

  const length = cells.length * CELL_SIZE - GAP;
  const width = CELL_SIZE - GAP * 2;

  const centerC = c0 + (horizontal ? (cells.length - 1) / 2 : 0);
  const centerR = r0 + (horizontal ? 0 : (cells.length - 1) / 2);

  const x = (centerC - (BOARD_COLS - 1) / 2) * CELL_SIZE;
  const z = (centerR - (BOARD_ROWS - 1) / 2) * CELL_SIZE;

  return (
    <group position={[x, 0.25, z]} rotation={[0, horizontal ? 0 : Math.PI / 2, 0]}>
      {/* Coque */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length, 0.35, width]} />
        <meshStandardMaterial color="#8b5a20" roughness={0.7} />
      </mesh>
      {/* Pont */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[length * 0.92, 0.08, width * 0.85]} />
        <meshStandardMaterial color="#a8702a" />
      </mesh>
      {/* Superstructure */}
      <mesh position={[length * 0.15, 0.4, 0]}>
        <boxGeometry args={[length * 0.3, 0.35, width * 0.6]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
    </group>
  );
}

// ---------- Grille + labels ----------
function GridLabels() {
  return (
    <group>
      {COLUMN_LABELS.map((label, c) => (
        <Text
          key={`col-${c}`}
          position={[(c - (BOARD_COLS - 1) / 2) * CELL_SIZE, 0.1, -((BOARD_ROWS) / 2) * CELL_SIZE - 0.6]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      ))}
      {ROW_LABELS.split('').map((label, r) => (
        <Text
          key={`row-${r}`}
          position={[-((BOARD_COLS) / 2) * CELL_SIZE - 0.6, 0.1, (r - (BOARD_ROWS - 1) / 2) * CELL_SIZE]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

// ---------- Scène principale ----------
function Scene({
  isEnemy,
  myHits,
  myShips = [],
  enemyBoard,
  enemyShips = [],
  getPreviewCells,
  onShoot,
  onPlace,
  phase,
  gameover,
}) {
  const [hover, setHover] = useState(-1);
  const [preview, setPreview] = useState({ cells: [], valid: false });

  const hits = isEnemy ? enemyBoard : myHits;

  const handleHover = useCallback((pos) => {
    setHover(pos);
    if (!isEnemy && phase === 'placement' && pos >= 0 && getPreviewCells) {
      setPreview(getPreviewCells(pos));
    } else {
      setPreview({ cells: [], valid: false });
    }
  }, [isEnemy, phase, getPreviewCells]);

  const handleClick = useCallback((pos) => {
    if (pos < 0) return;
    if (isEnemy && phase === 'battle' && !gameover && !enemyBoard?.[pos]) {
      onShoot?.(pos);
    }
    if (!isEnemy && phase === 'placement') {
      onPlace?.(pos);
    }
  }, [isEnemy, phase, gameover, enemyBoard, onShoot, onPlace]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[12, 18, 10]} intensity={1.3} castShadow />
      <Water />
      <GridLabels />

      {/* Cases */}
      {Array.from({ length: BOARD_ROWS * BOARD_COLS }).map((_, i) => (
        <Cell
          key={i}
          index={i}
          isEnemy={isEnemy}
          value={hits?.[i]}
          isHover={hover === i}
          isPreview={preview.cells.includes(i)}
          previewValid={preview.valid}
          onClick={handleClick}
          onHover={handleHover}
        />
      ))}

      {/* Navires */}
      {!isEnemy && myShips.map((ship, i) => (
        <Ship3D key={i} ship={ship} />
      ))}
      {isEnemy && gameover && enemyShips.map((ship, i) => (
        <Ship3D key={i} ship={ship} visible={ship.hits.length < ship.cells.length} />
      ))}

      <OrbitControls
        enablePan={true}
        minDistance={8}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

// ---------- Composant exporté ----------
export default function Board3D(props) {
  return (
    <div style={{ width: '100%', height: 420, borderRadius: 8, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 14, 16], fov: 45 }}
        shadows
        style={{ background: '#0a1a2a' }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}