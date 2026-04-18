// multiplayer.js
// Firebase logic, room creation, player sync

function initFirebase(){
    const apiKey=document.getElementById('apiKey').value.trim();
    try{
        // ...existing code...
    }catch(e){console.error(e);}
}

function syncState() {
  if(firebaseEnabled && localState.roomCode) {
      db.ref('rooms/'+localState.roomCode+'/state').set(localState);
  }
}

function startMatch(){ log('Match starting'); renderAll(); if(firebaseEnabled){ db.ref('rooms/'+localState.roomCode+'/state').on('value',snap=>{ const v=snap.val(); if(v){ localState=sanitizeState(v); renderAll(); }}); }}

let lastTurn = localState.currentTurn;

// Exported for compatibility
function syncStateWithFirebase(state) {
    syncState();
}

// Export functions
window.initFirebase = initFirebase;
window.skipFirebase = skipFirebase;
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.syncState = syncState;
window.syncStateWithFirebase = syncStateWithFirebase;
window.startMatch = startMatch;