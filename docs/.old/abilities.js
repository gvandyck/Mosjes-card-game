// Abilities logic moved from script.js


// --- Mosjes Abilities ---
// Each ability is a named function in the MosjesAbilities object for clarity and easy duplication/extension.
export const MosjesAbilities = {
	ronald_active: function(mosjeIndex, localState) {
		const myId = (firebaseEnabled && myRole) ? myRole : 'p1';
		const myPlayer = localState.players[myId];
		if (typeof mosjeIndex === 'number' && myPlayer.mosjes && myPlayer.mosjes[mosjeIndex]) {
			myPlayer.mosjes[mosjeIndex].abilityUsedThisTurn = true;
		}
		// Find Food Piecies in hand
		const foodIndexes = (myPlayer.hand||[]).map((c,i)=>isFoodPiecie(c.name)?i:-1).filter(i=>i!==-1);
		if (foodIndexes.length === 0) {
			alert('You must have a Food Piecie in hand to use Ronald\'s ability.');
			return;
		}
		// ...rest of Ronald ability logic...
	},
	// Example: add more abilities here
	// alyssa_bulldozer: function(mosjeIndex, localState) { ... },
	// gandoe_synergy: function(mosjeIndex, localState) { ... },
};

// For convenience, export the main handler for Ronald as before
export const handleRonaldAbility = MosjesAbilities.ronald_active;

// --- Mosje and Piecie Ability Logic ---

export function playMosjeFromHand(index, localState) {
	let localKey = 'p1';
	if (firebaseEnabled && myRole) localKey = myRole;
	else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
	if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
	const p = localState.players[localKey];
	if (p.mosjes.length >= 2) { alert("You already have 2 Mosjes active!"); return; }
	const card = p.hand[index];
	p.hand.splice(index, 1);
	p.mosjes.push(card);
	const startMp = card.startMp || 0;
	p.mp += startMp;
	popupMP(localKey, startMp);
	log(`${localKey} played Mosje: ${card.name} (+${startMp} MP)`);
	renderAll();
	syncState();
}


export function playSnelleFromHand(index, localState) {
	let localKey = 'p1';
	if (firebaseEnabled && myRole) localKey = myRole;
	else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
	const myId = localState.myId || (localState.currentTurn === 'p1' ? 'p1' : 'p2');
	let playerKey = localState.currentTurn;
	if (firebaseEnabled && myRole) {
		playerKey = myRole;
	} else {
		playerKey = localState.currentTurn;
	}
	let pKey = 'p1';
	if (firebaseEnabled && myRole) pKey = myRole;
	else if (firebaseEnabled && room && room.p2 === playerId) pKey = 'p2';
	else if (!firebaseEnabled) {
		pKey = localState.currentTurn;
	}
	const p = localState.players[pKey];
	if (p.hand.length <= index) return;
	const card = p.hand[index];
	const roomCodeEl = document.getElementById('roomCode');
	if (roomCodeEl) {
		if (typeof renderAll === 'function') renderAll();
		roomCodeEl.innerHTML = roomCodeStr + ' <span style="font-size:10px;color:#888;margin-left:6px;">v' + VERSION + '</span>';
	}
	if (!isSnellePiecie(card)) {
		alert("Not a Snelle Piecie!");
		return;
	}
	const cost = card.cost || 0;
	if (p.mp < cost) {
		alert(`Not enough MP! Cost: ${cost}`);
		return;
	}
	p.mp -= cost;
	popupMP(pKey, -cost);
	p.hand.splice(index, 1);
	log(`${pKey} played Snelle Piecie: ${card.name} (Instant)`);
	if (card.name === 'FF Haaltje Nemen') {
		if (localState.lastDamage && localState.lastDamage.player === pKey) {
			const damage = localState.lastDamage.amount;
			const recovery = Math.min(20, damage);
			p.mp += recovery;
			popupMP(pKey, recovery);
			log(`${pKey} recovered ${recovery} MP (Damage reduced)`);
			localState.lastDamage.amount -= recovery;
			if (localState.lastDamage.amount <= 0) localState.lastDamage = null;
		} else {
			alert("Can only use FF Haaltje Nemen after taking MP damage from a Quest!");
			p.mp += cost;
			popupMP(pKey, cost);
			p.hand.splice(index, 0, card);
			return;
		}
	} else if (card.name === 'Sleutelpuntje') {
		const choice = confirm("Click OK to GAIN 15 MP, Cancel to LOSE 15 MP (Temporary Adjustment)");
		const amount = choice ? 15 : -15;
		p.mp += amount;
		popupMP(pKey, amount);
		log(`${pKey} used Sleutelpuntje: Adjusted MP by ${amount > 0 ? '+' : ''}${amount} (Temporary)`);
		if (!p.durationEffects) p.durationEffects = [];
		p.durationEffects.push({
			name: 'Sleutelpuntje',
			duration: 1,
			revertAmount: amount
		});
	} else if (card.name === 'Bagga of Greed') {
		let target = p.mosjes[0];
		if (p.mosjes.length > 1) {
			const useFirst = confirm(`Bagga of Greed: Lose 10 MP from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
			target = useFirst ? p.mosjes[0] : p.mosjes[1];
		}
		target.mp = (target.mp || 0) - 10;
		p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
		popupMP(pKey, -10);
		let drawn = 0;
		for(let i=0; i<2; i++) {
			if(p.deck.length > 0) {
				p.hand.push(p.deck.pop());
				drawn++;
			}
		}
		log(`${pKey} played Bagga of Greed: Lost 10 MP, Drew ${drawn} cards`);
		localState.pendingDiscard = 1;
		renderAll();
		setTimeout(() => alert("Bagga of Greed: Please discard 1 card from your hand."), 100);
	} else {
		applyPiecieEffect(pKey, card, localState);
	}
	p.discard.push(card);
	renderAll();
	syncState();
}


export function activatePiecie(index, localState) {
    // ...existing code from script.js for activatePiecie...
}


export function returnPiecieToHand(index, localState) {
    // ...existing code from script.js for returnPiecieToHand...
}


export function activatePlaced(localState) {
    // ...existing code from script.js for activatePlaced...
}


export function applyPiecieEffect(turn, card, localState) {
    // ...existing code from script.js for applyPiecieEffect...
}

// Add more ability handlers and effect processing as needed
// Handles Mosje abilities and effect logic for Mosjes Card Game
// Exports: ability handlers, effect parsers, etc.

// ...to be filled in next steps...
