// main.js
// Entry point: initializes the game, imports modules, starts main loop

function testFirebaseConnection() {
    if (window.db) {
        const testRef = window.db.ref('connection_test');
        testRef.set({ timestamp: Date.now(), status: 'ok' }, function(error) {
            let statusMsg = document.getElementById('firebaseStatus');
            if (!statusMsg) {
                statusMsg = document.createElement('div');
                statusMsg.id = 'firebaseStatus';
                statusMsg.style = 'position:fixed;top:10px;right:10px;background:#222;color:#fff;padding:8px 16px;border-radius:6px;z-index:9999;font-size:14px;';
                document.body.appendChild(statusMsg);
            }
            if (error) {
                statusMsg.textContent = 'Firebase: Connection FAILED';
                statusMsg.style.background = '#c0392b';
            } else {
                statusMsg.textContent = 'Firebase: Connected';
                statusMsg.style.background = '#27ae60';
            }
        });
    }
}

function startGame() {
    // ...initialize game...
    updateUI(window.localState);
    setTimeout(testFirebaseConnection, 1000);
}

window.onload = startGame;