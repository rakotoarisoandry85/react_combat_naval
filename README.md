# ⚓ Naval Combat — React App

Jeu de combat naval (Bataille navale) en React 18 + Vite.

## Installation & démarrage

```bash
npm install
npm run dev
```

## Architecture

```
naval-combat/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                    # Point d'entrée React
    ├── App.jsx                     # Composant racine + orchestration
    │
    ├── constants/
    │   └── ships.js                # Définitions des navires, tailles de grille, états
    │
    ├── utils/
    │   └── boardUtils.js           # Fonctions pures : idx/rc, placement, aléatoire, voisins
    │
    ├── hooks/
    │   ├── useAI.js                # Stratégie IA (easy/medium/hard) — hunt & target
    │   └── useGameState.js         # État global du jeu + actions (placement, tir, reset)
    │
    ├── components/
    │   ├── App.jsx         → racine
    │   ├── StatusBar.jsx           # Barre de métriques (coups, touches, précision, phase)
    │   ├── MessageBar.jsx          # Feedback contextuel (touché/raté/victoire/défaite)
    │   ├── FleetSelector.jsx       # Boutons de sélection des navires (phase placement)
    │   ├── Controls.jsx            # Boutons d'action + sélecteur de difficulté
    │   ├── Board.jsx               # Grille 10×10 avec en-têtes + logique de preview
    │   ├── Cell.jsx                # Cellule individuelle (états: ship/hit/miss/sunk/preview)
    │   └── BattleLog.jsx           # Log scrollable des événements
    │
    └── styles/
        └── naval.css               # Thème militaire sombre (Orbitron + Share Tech Mono)
```

## Flux de données

```
App (état difficulty)
 └── useGameState(difficulty)
      ├── useAI(difficulty)          ← stratégie de tir IA
      ├── state { myBoard, enemyBoard, myHits, ships, phase, … }
      └── actions { placeShip, playerShoot, randomPlacement, startBattle, reset }
           │
           ▼
      Composants (props only, pas de state local critique)
      StatusBar / MessageBar / FleetSelector / Controls / Board / BattleLog
```

## Niveaux de difficulté IA

| Niveau  | Stratégie                                                        |
|---------|------------------------------------------------------------------|
| Facile  | Tirs purement aléatoires                                         |
| Moyen   | Hunt/Target : explore les voisins des cellules touchées          |
| Difficile | Parity hunt (damier) + file directionnelle après chaque touche |

## Technologies

- **React 18** — hooks uniquement (useState, useCallback, useRef, useMemo)
- **Vite 5** — bundler ultra-rapide
- **CSS custom** — thème militaire sans librairie UI externe
- **Google Fonts** — Orbitron (titres) + Share Tech Mono (interface)
