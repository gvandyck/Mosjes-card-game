// Firebase logic moved from script.js
export let firebaseEnabled = false;
export let db = null;

export function initFirebase(apiKey, projectId, databaseUrl) {
	// document.getElementById('statusText').textContent = 'Connecting to Firebase...';
	console.log('initFirebase called', {apiKey: !!apiKey, projectId, databaseUrl});
	if(!apiKey||!projectId||!databaseUrl){alert('Complete all Firebase fields');return;}
	try {
		firebase.initializeApp({apiKey,projectId,databaseURL:databaseUrl});
		db=firebase.database(); firebaseEnabled=true;
		// document.getElementById('firebaseModal').style.display='none';
		document.getElementById('setupModal').style.display='flex';
		// document.getElementById('statusText').textContent = 'Connected (Firebase)';
		log('Firebase connected');
	} catch(e) {
		console.warn('Firebase init error: '+e.message);
	}
}

export function skipFirebase() {
	// document.getElementById('firebaseModal').style.display='none';
	document.getElementById('setupModal').style.display='flex';
}

// Room creation
export function createRoomInFirebase(code, playerId, localState) {
	if (!db) throw new Error('Firebase DB not initialized');
	db.ref('rooms/' + code).set({
		p1: playerId,
		p2: null,
		created: Date.now()
	});
	db.ref('rooms/' + code + '/state').set(localState);
}

// Join room
export function joinRoomInFirebase(code, playerId, onSuccess, onError) {
	if (!db) throw new Error('Firebase DB not initialized');
	db.ref('rooms/' + code).once('value', snap => {
		if (!snap.exists()) {
			if (onError) onError('Room not found');
			return;
		}
		const v = snap.val();
		if (v.p2) {
			if (onError) onError('Room full');
			return;
		}
		db.ref('rooms/' + code).update({ p2: playerId });
		if (onSuccess) onSuccess(v);
	});
}

// Listen for state updates
export function listenForStateUpdates(code, onUpdate) {
	if (!db) throw new Error('Firebase DB not initialized');
	db.ref('rooms/' + code + '/state').on('value', snap => {
		const v = snap.val();
		if (v && onUpdate) onUpdate(v);
	});
}

// Push state to Firebase
export function pushStateToFirebase(code, localState) {
	if (!db) throw new Error('Firebase DB not initialized');
	db.ref('rooms/' + code + '/state').set(localState);
}

// Handles Firebase initialization and multiplayer sync for Mosjes Card Game
// Exports: initFirebase, skipFirebase, firebaseEnabled, db, createRoomInFirebase, joinRoomInFirebase, listenForStateUpdates, pushStateToFirebase

// ...to be filled in next steps...
