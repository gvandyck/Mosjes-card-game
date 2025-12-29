Run instructions for MOSJES MVP (local via VS Code)

1) Open the workspace folder in Visual Studio Code.
   - File → Open Folder → select the `Prototype` folder (the parent of `docs`).

2) In VS Code install the "Live Server" extension (Ritwick Dey) if not installed.

3) Open the file:
   - `docs/mosjes_local.html`

4) Start Live Server:
   - Right-click the HTML file → "Open with Live Server"
   - Or click the "Go Live" button in the status bar.
   - This will open http://127.0.0.1:5500/... and serve the page.

5) Firebase setup (optional for 2-player remote play):
   - Create a Firebase project at https://console.firebase.google.com/
   - Create a Realtime Database (test mode is fine for playtesting)
   - Go to Project Settings → copy API Key, Project ID, and Database URL
   - Paste these into the Firebase modal that appears when the page loads
   - After connecting, create a room and share the 6-character code with your opponent

6) Local play (no Firebase):
   - Click "Skip (Local Play)" in the Firebase modal; the game will run locally in your browser.
   - Note: Local mode is single-device only (use two browser windows/tabs for limited testing).

7) Basic controls:
   - Create or join a room
   - Choose a starter deck, then pick a Mosje from the deck
   - Draw cards, place piecies, activate them, draw quests and roll dice
   - First Mosje to reach Level 3 wins

Known limitations (MVP):
- Gameplay is simplified for testing: no snelle piecies, limited synergies, simple quest logic
- Firebase validation and reconnection are basic; use for casual playtesting only
- UI is minimal but functional; feedback and iteration expected

If you want, I can:
- Walk you through Firebase setup step-by-step while you share the Firebase values
- Add an index.html in repo root or wire up better multi-tab testing
- Improve sync/reconnect behavior and room expiration logic
