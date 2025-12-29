// Handles localState and state management for Mosjes Card Game
// Exports: localState, syncState, checkLevelUp, etc.


// Game state object
export let localState = {
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
export function log(msg) {
	if (!localState.gameLog) localState.gameLog = [];
	const entry = { msg, turn: localState.turnCounter, player: localState.currentTurn, timestamp: Date.now() };
	localState.gameLog.push(entry);
	// Optionally, also print to console for debugging
	if (typeof window !== 'undefined' && window.console) console.log(msg);
	// If you have a log area in the UI, update it here (optional)
}
