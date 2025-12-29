// UI/modal logic moved from script.js
// (If not already present, add modal functions, showDeckModal, showGraveyard, closeGraveyardModal, etc.)

// Example: showDeckModal, showGraveyard, closeGraveyardModal already present from previous steps.
// Add any remaining modal/UI helpers here as needed.
// --- UI Rendering Functions ---
export function renderAll() {
	console.log('renderAll executing...');
	try {
		// Ensure Mosje stats are initialized (Migration/Safety)
		['p1', 'p2'].forEach(pid => {
			if (localState.players[pid] && localState.players[pid].mosjes) {
				localState.players[pid].mosjes.forEach(m => {
					if (m.mp === undefined) m.mp = m.startMp || 0;
					if (m.level === undefined) m.level = 1;
				});
				// Recalculate Team MP to ensure sync
				localState.players[pid].mp = localState.players[pid].mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
			}
		});
		checkTurnChangePopup();

		// Determine local player key
		let myId = 'p1', oppId = 'p2';
		if (myRole === 'p2' || (firebaseEnabled && room && room.p2 === playerId)) {
			myId = 'p2';
			oppId = 'p1';
		}
		localState.myId = myId; // Store for easier access
		const myPlayer = localState.players[myId];
		const opp = localState.players[oppId];
		const myTurn = localState.currentTurn === myId;

		// Update turn and phase indicators
		const phaseEl = document.getElementById('phaseIndicator');
		if(phaseEl) {
			phaseEl.textContent = localState.phase.charAt(0).toUpperCase() + localState.phase.slice(1);
		} else {
			console.warn('phaseIndicator element not found');
		}

		// Render Shared Place
		const sharedPlaceEl = document.getElementById('sharedPlace');
		if (sharedPlaceEl) {
			if (localState.sharedPlace) {
				const sp = localState.sharedPlace;
				sharedPlaceEl.innerHTML = `
					<div style="font-weight:700; color:var(--accent)">${sp.card.name}</div>
					<div class="smallMuted" style="margin-top:4px">${sp.card.effect}</div>
					<div class="smallMuted" style="margin-top:4px; font-size:10px">Owner: ${sp.turn}</div>
				`;
				sharedPlaceEl.style.border = '2px solid var(--accent)';
			} else {
				sharedPlaceEl.innerHTML = 'No Place';
				sharedPlaceEl.style.border = '1px solid #444';
			}
		}

		// Button states
		const isMyTurn = localState.currentTurn === localState.myId;
		const isDrawPhase = localState.phase === 'draw';
		const isMainPhase = localState.phase === 'main';
		const isQuestPhase = localState.phase === 'quest';
		const isDiscarding = localState.pendingDiscard > 0;

		const drawBtn = document.getElementById('drawBtn');
		if(drawBtn) drawBtn.disabled = !isMyTurn || !isDrawPhase || isDiscarding;
		const placeBtn = document.getElementById('placePiecieBtn');
		if(placeBtn) placeBtn.disabled = !isMyTurn || !isMainPhase || isDiscarding;
		const activateBtn = document.getElementById('activatePlacedBtn');
		if(activateBtn) activateBtn.disabled = !isMyTurn || !isMainPhase || isDiscarding;
		const questBtn = document.getElementById('questBtn');
		if(questBtn) questBtn.disabled = !isMyTurn || !isQuestPhase || isDiscarding;
		const progressBtn = document.getElementById('progressPhaseBtn');
		if(progressBtn) {
			if(isMyTurn) {
				if(isDrawPhase) progressBtn.textContent = 'End Draw Phase';
				else if(isMainPhase) progressBtn.textContent = 'End Main Phase';
				else if(isQuestPhase) progressBtn.textContent = 'End Turn';
			} else {
				progressBtn.textContent = "Opponent's Turn";
			}
			progressBtn.disabled = !isMyTurn || isDiscarding;
			if (isDiscarding) {
				progressBtn.textContent = `Discard ${localState.pendingDiscard} card(s)`;
			}
		}

		// Mosje displays
		const myMosjesEl = document.getElementById('myMosjes');
		const oppMosjesEl = document.getElementById('oppMosjes');
		if(myMosjesEl) myMosjesEl.innerHTML = '';
		if(oppMosjesEl) oppMosjesEl.innerHTML = '';
		renderMosjeCard(myPlayer, myMosjesEl);
		renderMosjeCard(opp, oppMosjesEl);
		// ... (rest of renderAll, including hand, field, etc.)
	} catch(e) {
		log('Error in renderAll: ' + e.message);
	}
}

function renderMosjeCard(pdata, containerEl) {
	// ...full function body from script.js...
}
// Handles UI rendering and modal logic for Mosjes Card Game
// Exports: renderAll, showDeckModal, showGraveyard, etc.


import { localState, log } from './gameState.js';

export function showDeckModal(options = {}) {
	let myId = 'p1';
	if (myRole === 'p2' || (firebaseEnabled && room && room.p2 === playerId)) myId = 'p2';
	const deck = localState.players[myId].deck;
	const deckModal = document.getElementById('deckModal');
	let deckList = document.getElementById('deckList');
	if (deckModal) {
		deckModal.className = 'modal';
		let cardDiv = deckModal.querySelector('.card');
		if (!cardDiv) {
			cardDiv = document.createElement('div');
			cardDiv.className = 'card';
			deckModal.appendChild(cardDiv);
		}
		cardDiv.style.background = 'var(--panel)';
		cardDiv.style.borderRadius = '10px';
		cardDiv.style.padding = '20px';
		cardDiv.style.border = '2px solid var(--accent)';
		cardDiv.style.width = '90%';
		cardDiv.style.maxWidth = '440px';
		cardDiv.innerHTML = `<h2 style='color:var(--accent);margin:0 0 16px 0;text-align:center'>Deck</h2><div id='deckList'></div>`;
		deckList = cardDiv.querySelector('#deckList');
	}
	if (deckList) {
		if (deck.length === 0) {
			deckList.innerHTML = '<div class="smallMuted">Deck is empty.</div>';
		} else {
			deckList.innerHTML = deck.map((c, i) => {
				if (options.selectable) {
					return `<div class='deck-selectable' data-idx='${i}' style='padding:8px 0;border-bottom:1px solid #222;cursor:pointer;background:rgba(255,255,255,0.05);border-radius:6px;margin:2px 0;' onmouseover="this.style.background='#ffe5b4'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">${c.name || c}</div>`;
				} else {
					return `<div style='padding:8px 0;border-bottom:1px solid #222;'>${c.name || c}</div>`;
				}
			}).join('');
		}
	}
	if(deckModal) deckModal.style.display = 'flex';
	// If selectable, add click listeners
	if (options.selectable && typeof options.onSelect === 'function' && deckList) {
		Array.from(deckList.querySelectorAll('.deck-selectable')).forEach(el => {
			el.onclick = function() {
				const idx = parseInt(this.getAttribute('data-idx'));
				options.onSelect(deck[idx], idx);
				closeDeckModal();
			};
		});
	}
	document.getElementById('graveyardModal').style.display = 'flex';
}
export function closeDeckModal() {
	document.getElementById('deckModal').style.display = 'none';
}

export function closeGraveyardModal() {
	document.getElementById('graveyardModal').style.display = 'none';
}

export function showGraveyard() {
	let pId = 'p1';
	if (firebaseEnabled && myRole) pId = myRole;
	else if (localState.myId) pId = localState.myId;
	const p = localState.players[pId];
	if (!p || !p.discard) return;
	if (p.discard.length === 0) {
		alert("Graveyard is empty.");
		return;
	}
	localState.pendingSelection = {
		cards: [...p.discard],
		count: 0,
		type: 'view_graveyard',
		source: 'discard',
		remainingAction: 'none'
	};
	if (typeof renderAll === 'function') renderAll();
}
