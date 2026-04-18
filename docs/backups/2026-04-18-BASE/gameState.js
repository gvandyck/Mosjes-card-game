// --- Quest Definitions ---
const QUESTS = [
    // ...existing code...
];
window.QUESTS = QUESTS;
// Starter Decks (moved from script.js)
const STARTER_DECKS = {
    0: {
        // ...existing code...
    },
    // ...existing decks from script.js...
};
window.STARTER_DECKS = STARTER_DECKS;
// Game version
const VERSION = "2025-29-12-v9";
window.VERSION = VERSION;
// --- Deck/Hand Management & Turn Logic ---
function pickDeck(index) {
    // ...existing code...
}

function drawCard() {
    // ...existing code...
}

function placePiecie(index = 0) {
    // ...existing code...
}

function playMosjeFromHand(index) {
    // ...existing code...
}

function playSnelleFromHand(index) {
    // ...existing code...
}

function returnPiecieToHand(index) {
    // ...existing code...
}

function activatePlaced() {
    // ...existing code...
}

function sanitizeState(s) {
    // ...existing code...
}

function checkTurnChangePopup() {
    // ...existing code...
}

// Export deck/turn logic
window.pickDeck = pickDeck;
window.drawCard = drawCard;
window.placePiecie = placePiecie;
window.playMosjeFromHand = playMosjeFromHand;
window.playSnelleFromHand = playSnelleFromHand;
window.returnPiecieToHand = returnPiecieToHand;
window.activatePlaced = activatePlaced;
window.sanitizeState = sanitizeState;
window.checkTurnChangePopup = checkTurnChangePopup;
// gameState.js
// Core game state, turn/phase logic, deck/hand management

let db = null;
let firebaseEnabled = false;
let room = null;
let playerId = Math.random().toString(36).slice(2,9);
let myRole = null;
const localState = {
    roomCode: null,
    players:{
        p1:{deck:[],hand:[],discard:[],piecies:[],mosjes:[],mp:0,level:1,canDraw:true,extraDraws:0,questAttempted:false,activeQuest:null},
        p2:{deck:[],hand:[],discard:[],piecies:[],mosjes:[],mp:0,level:1,canDraw:true,extraDraws:0,questAttempted:false,activeQuest:null}
    },
    currentTurn:'p1', phase:'draw', questDeck:[], place:null, sharedPlace:null, turnCounter: 1, turnActions: [],
    gameLog: [], // Persistent log of all actions
    ronaldReveal: {active: false, hand: [], by: null, resolved: false} // Multiplayer Ronald hand reveal state
};

// Improved log function: keeps all logs in localState.gameLog
function log(msg) {
    if (!localState.gameLog) localState.gameLog = [];
    const entry = { msg, turn: localState.turnCounter, player: localState.currentTurn, timestamp: Date.now() };
    localState.gameLog.push(entry);
    // Optionally, also print to console for debugging
    if (typeof window !== 'undefined' && window.console) console.log(msg);
    // If you have a log area in the UI, update it here (optional)
}

function nextTurn() {
    // ...existing code...
}

// Export state and functions
window.db = db;
window.firebaseEnabled = firebaseEnabled;
window.room = room;
window.playerId = playerId;
window.myRole = myRole;
window.localState = localState;
window.nextTurn = nextTurn;
window.log = log;