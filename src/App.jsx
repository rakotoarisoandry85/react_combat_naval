import React, { useState, useMemo } from 'react';
import { useGameState }   from './hooks/useGameState';
import StatusBar          from './components/StatusBar';
import MessageBar         from './components/MessageBar';
import FleetSelector      from './components/FleetSelector';
import Controls           from './components/Controls';
import Board              from './components/Board';
import BattleLog          from './components/BattleLog';
import { SHIPS_DEF }      from './constants/ships';
import './styles/naval.css';

export default function App() {
  const [difficulty, setDifficulty] = useState('medium');

  const {
    state,
    selectShip, toggleOrientation, placeShip, getPreviewCells,
    randomPlacement, startBattle, playerShoot, reset,
    myAlive, enemyAlive, accuracy, allPlaced,
  } = useGameState(difficulty);

  // ── Derived message ──────────────────────────────────────────────────────
  const { msgText, msgVariant } = useMemo(() => {
    const { phase, gameover, winner, selectedShip, horizontal, placedShips } = state;

    if (phase === 'over' || gameover) {
      return winner === 'player'
        ? { msgText: '🏆 VICTOIRE ! Flotte ennemie détruite ! La mer vous appartient !', msgVariant: 'win' }
        : { msgText: '💀 DÉFAITE — Votre flotte a été anéantie...', msgVariant: 'lose' };
    }

    if (phase === 'placement') {
      if (allPlaced) return { msgText: '✓ Tous les navires placés — Lancez la bataille !', msgVariant: 'default' };
      const si = selectedShip;
      const ship = SHIPS_DEF[si];
      const orient = horizontal ? 'Horizontal ↔' : 'Vertical ↕';
      return ship
        ? { msgText: `Placez: ${ship.name} (taille ${ship.size}) — ${orient}`, msgVariant: 'default' }
        : { msgText: '▶ Sélectionnez un navire à placer', msgVariant: 'default' };
    }

    return { msgText: '⚔ COMBAT ENGAGÉ — Cliquez sur les eaux ennemies pour tirer !', msgVariant: 'default' };
  }, [state, allPlaced]);

  // ── Difficulty change resets game ────────────────────────────────────────
  const handleDiffChange = (val) => {
    setDifficulty(val);
    reset();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>⚓ NAVAL COMBAT ⚓</h1>
        <p>SYSTÈME DE COMBAT NAVAL TACTIQUE v2.0</p>
      </header>

      {/* Status */}
      <StatusBar
        shots={state.shots}
        hits={state.hits}
        myAlive={myAlive}
        enemyAlive={enemyAlive}
        accuracy={accuracy}
        phase={state.phase}
      />

      {/* Message */}
      <MessageBar text={msgText} variant={msgVariant} />

      {/* Fleet selector (placement only) */}
      {state.phase === 'placement' && (
        <FleetSelector
          placedShips={state.placedShips}
          selectedShip={state.selectedShip}
          onSelect={selectShip}
        />
      )}

      {/* Controls */}
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

      {/* Boards */}
      <div className="boards-row">
        <div className="board-wrap">
          <div className="board-label">◈ VOTRE FLOTTE</div>
          <Board
            isEnemy={false}
            myBoard={state.myBoard}
            myHits={state.myHits}
            getPreviewCells={getPreviewCells}
            onPlace={placeShip}
            phase={state.phase}
            gameover={state.gameover}
          />
        </div>

        <div className="board-wrap">
          <div className="board-label">◈ EAUX ENNEMIES</div>
          <Board
            isEnemy={true}
            enemyBoard={state.enemyBoard}
            enemyShipBoard={state._enemyShipBoard}
            onShoot={playerShoot}
            phase={state.phase}
            gameover={state.gameover}
          />
        </div>
      </div>

      {/* Log */}
      <BattleLog entries={state.log} />
    </div>
  );
}
