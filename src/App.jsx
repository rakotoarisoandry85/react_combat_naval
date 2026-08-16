import React, { useMemo, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import StatusBar from './components/StatusBar';
import MessageBar from './components/MessageBar';
import FleetSelector from './components/FleetSelector';
import Controls from './components/Controls';
import Board from './components/Board';
import Board3D from './components/Board3D';
import BattleLog from './components/BattleLog';
import NavalPresentation from './components/NavalPresentation';
import SplashScreen from './components/SplashScreen';
import { SHIPS } from './constants/ships';
import './styles/naval.css';

export default function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [view3D, setView3D] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // ✅ Tous les hooks doivent être appelés AVANT tout return conditionnel
  const {
    state,
    selectShip,
    toggleOrientation,
    placeShip,
    getPreviewCells,
    randomPlacement,
    startBattle,
    playerShoot,
    reset,
    myAlive,
    enemyAlive,
    accuracy,
    allPlaced,
  } = useGameState(difficulty);

  const { msgText, msgVariant } = useMemo(() => {
    const { phase, gameover, winner, selectedShip, horizontal } = state;

    if (phase === 'over' || gameover) {
      return winner === 'player'
        ? { msgText: 'VICTOIRE ! Flotte ennemie detruite.', msgVariant: 'win' }
        : { msgText: 'DEFAITE. Votre flotte a ete aneantie.', msgVariant: 'lose' };
    }

    if (phase === 'placement') {
      if (allPlaced) {
        return { msgText: 'Tous les navires sont places. Lancez la bataille !', msgVariant: 'default' };
      }

      const ship = SHIPS[selectedShip];
      const orientation = horizontal ? 'Horizontal' : 'Vertical';
      return ship
        ? { msgText: `Placez: ${ship.name} (taille ${ship.size}) - ${orientation}`, msgVariant: 'default' }
        : { msgText: 'Selectionnez un navire a placer', msgVariant: 'default' };
    }

    return { msgText: 'COMBAT ENGAGE - Cliquez sur les eaux ennemies pour tirer !', msgVariant: 'default' };
  }, [state, allPlaced]);

  const handleDiffChange = (val) => {
    setDifficulty(val);
    reset();
  };

  // ✅ Le return conditionnel se place APRÈS tous les hooks
  if (showSplash) {
    return <SplashScreen onStart={() => setShowSplash(false)} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__content">
          <h1>NAVAL COMBAT</h1>
          <p>SYSTEME DE COMBAT NAVAL TACTIQUE v2.0</p>
        </div>
        <NavalPresentation />
      </header>

      <StatusBar
        shots={state.shots}
        hits={state.hits}
        myAlive={myAlive}
        enemyAlive={enemyAlive}
        accuracy={accuracy}
        phase={state.phase}
      />

      <MessageBar text={msgText} variant={msgVariant} />

      {state.phase === 'placement' && (
        <FleetSelector
          placedShips={state.placedShips}
          selectedShip={state.selectedShip}
          onSelect={selectShip}
        />
      )}

      <Controls
        phase={state.phase}
        allPlaced={allPlaced}
        difficulty={difficulty}
        onRotate={toggleOrientation}
        onRandom={randomPlacement}
        onStart={startBattle}
        onReset={reset}
        onDiffChange={handleDiffChange}
      />

      {/* Bouton bascule 2D / 3D */}
      <div style={{ textAlign: 'center', margin: '12px 0 18px' }}>
        <button
          className="btn"
          onClick={() => setView3D((v) => !v)}
          style={{
            background: view3D ? '#1e6fa8' : '#2d5a3d',
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
        >
          {view3D ? '🖥️ Passer en vue 2D' : '🌐 Passer en vue 3D'}
        </button>
      </div>

      <div className="boards-row">
        {/* VOTRE FLOTTE */}
        <div className="board-wrap">
          <div className="board-label">VOTRE FLOTTE</div>
          {view3D ? (
            <Board3D
              isEnemy={false}
              myHits={state.myHits}
              myShips={state.myShips}
              getPreviewCells={getPreviewCells}
              onPlace={placeShip}
              phase={state.phase}
              gameover={state.gameover}
            />
          ) : (
            <Board
              isEnemy={false}
              myHits={state.myHits}
              myShips={state.myShips}
              getPreviewCells={getPreviewCells}
              onPlace={placeShip}
              phase={state.phase}
              gameover={state.gameover}
            />
          )}
        </div>

        {/* EAUX ENNEMIES */}
        <div className="board-wrap">
          <div className="board-label">EAUX ENNEMIES</div>
          {view3D ? (
            <Board3D
              isEnemy={true}
              enemyBoard={state.enemyBoard}
              enemyShips={state.enemyShips}
              onShoot={playerShoot}
              phase={state.phase}
              gameover={state.gameover}
            />
          ) : (
            <Board
              isEnemy={true}
              enemyBoard={state.enemyBoard}
              enemyShips={state.enemyShips}
              onShoot={playerShoot}
              phase={state.phase}
              gameover={state.gameover}
            />
          )}
        </div>
      </div>

      <BattleLog entries={state.log} />
    </div>
  );
}