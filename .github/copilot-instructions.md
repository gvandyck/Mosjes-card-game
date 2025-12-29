# Mosjes Card Game - AI Coding Instructions

## Project Overview
Mosjes is a web-based multiplayer card game built with **Vanilla JavaScript**, **HTML**, and **CSS**. It uses **Firebase Realtime Database** for multiplayer synchronization and is deployed via **FTP** to a static host.

## Architecture & Core Concepts

### 1. File Structure
- **Root**: `docs/` serves as the web root.
- **Entry Points**:
  - `docs/mosjes_local.html`: Main entry point for local development and testing.
  - `docs/index.html`: Production entry point.
- **Logic**:
  - `docs/script.js`: **Monolithic core**. Handles game state (`localState`), UI rendering, event listeners, and Firebase synchronization.
  - `docs/advanced_logic.js`: **Effect Parser**. Handles complex card text parsing, normalization (e.g., converting "+10 MP" to "Gain 10 MP"), and execution.

### 2. State Management
- **`localState`**: The single source of truth for the game state.
  - Structure: `{ roomCode, players: { p1, p2 }, currentTurn, phase, activeQuest, ... }`
  - **Sync**: Changes to `localState` are pushed to Firebase. Incoming Firebase updates overwrite `localState` and trigger UI re-renders.

### 3. Data Handling
- **Card Data**: Hardcoded in `script.js` within the `STARTER_DECKS` constant.
- **Database**: `docs/mosjes_card_database.txt` serves as the design reference, but the actual implementation is in JS objects.

## Development Workflows

### Local Development
- **Tool**: Use **VS Code Live Server** extension.
- **Process**: Open `docs/mosjes_local.html` with Live Server.
- **Multiplayer Testing**: Open two browser windows/tabs. Use "Skip (Local Play)" for single-device testing or configure Firebase for remote play.

### Deployment
- **Method**: FTP Upload via PowerShell.
- **Script**: `deploy.ps1`
- **Target**: `ftp://eightytwenty.nl/...`
- **Process**: Run `.\deploy.ps1` in a PowerShell terminal to upload `script.js`, `index.html`, and `mosjes_local.html`.

## Coding Conventions & Patterns

### Card Effect Parsing
- **Normalization**: `advanced_logic.js` normalizes effect text before processing.
  - *Example*: `+10 MP` is converted to `Gain 10 MP`.
- **Implementation**: When adding new card effects, ensure they are handled in `AdvancedLogic.processCardEffect` and added to the normalization rules if necessary.

### UI Updates
- **Pattern**: Reactive-style updates. Functions like `updateUI()` or specific render functions (e.g., `renderHand()`) are called after state changes.
- **DOM Manipulation**: Direct DOM manipulation using `document.getElementById` and `innerHTML`.

### Firebase Integration
- **Configuration**: Firebase credentials are input via a modal in the UI or hardcoded variables (currently `firebaseEnabled` defaults to `false`).
- **Room Logic**: Room codes are used to match players.

## Critical Files
- `docs/script.js`: Main game loop and state.
- `docs/advanced_logic.js`: Card effect logic.
- `docs/mosjes_local.html`: Dev entry point.
- `deploy.ps1`: Deployment script.
