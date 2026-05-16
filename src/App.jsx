import React, { useMemo, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import StatusBar from './components/StatusBar';
import MessageBar from './components/MessageBar';
import FleetSelector from './components/FleetSelector';
import Controls from './components/Controls';
import Board from './components/Board';
import BattleLog from './components/BattleLog';
import NavalPresentation from './components/NavalPresentation';
import { SHIPS } from './constants/ships';
import './styles/naval.css';

export default function App() {
  const [difficulty, setDifficulty] = useState('medium');

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
      if (allPlaced) return { msgText: 'Tous les navires sont places. Lancez la bataille !', msgVariant: 'default' };

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

      <div className="boards-row">
        <div className="board-wrap">
          <div className="board-label">VOTRE FLOTTE</div>
          <Board
            isEnemy={false}
            myHits={state.myHits}
            myShips={state.myShips}
            getPreviewCells={getPreviewCells}
            onPlace={placeShip}
            phase={state.phase}
            gameover={state.gameover}
          />
        </div>

        <div className="board-wrap">
          <div className="board-label">EAUX ENNEMIES</div>
          <Board
            isEnemy={true}
            enemyBoard={state.enemyBoard}
            enemyShips={state.enemyShips}
            onShoot={playerShoot}
            phase={state.phase}
            gameover={state.gameover}
          />
        </div>
      </div>

      <BattleLog entries={state.log} />
    </div>
  );
}
