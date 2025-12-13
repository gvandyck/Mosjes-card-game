let db=null, firebaseEnabled=false, room=null, playerId= Math.random().toString(36).slice(2,9);
let myRole = null;
let localState = {
  roomCode: null,
  players:{
    p1:{deck:[],hand:[],discard:[],piecies:[],mosjes:[],mp:0,level:1,canDraw:true,extraDraws:0},
    p2:{deck:[],hand:[],discard:[],piecies:[],mosjes:[],mp:0,level:1,canDraw:true,extraDraws:0}
  },
  currentTurn:'p1', phase:'draw', activeQuest:null, questDeck:[], place:null, turnCounter: 1
};

const STARTER_DECKS = {
  0: {
    name: 'Physical Force',
    mosjes: [
      {id:'cless',name:'AZN Cless',startMp:10,traits:{Physical:2,Social:2,Creative:1},ability:'Risk & Reward + West/ViannaPoes synergy',flavor:'The Wild Card'},
      {id:'michelle',name:'Michelle',startMp:0,traits:{Physical:2,Social:1,Resilient:2},ability:'Tough Gamble + Gandoe synergy',flavor:'Iron Tuk'},
      {id:'alyssa',name:'Alyssa',startMp:10,traits:{Physical:2,Social:3,Resilient:1},ability:'Party Power: +15 MP when destroying Places',flavor:'Fissa Fissa!'},
      {id:'jeffrey',name:'Jeffrey',startMp:20,traits:{Physical:3,Resilient:1},ability:'Brute Force: all Quests +10 MP',flavor:'The Strongman'}
    ],
    piecies: [
      {name:'Te Hard Gaan',cost:15,effect:'Opponent loses 25 MP',req:'Any'},
      {name:'Te Hard Gaan',cost:15,effect:'Opponent loses 25 MP',req:'Any'},
      {name:'Te Hard Gaan',cost:15,effect:'Opponent loses 25 MP',req:'Any'},
      {name:'Snoeiertje',cost:0,effect:'Quest drains 15 MP from opponent',req:'Any'},
      {name:'Snoeiertje',cost:0,effect:'Quest drains 15 MP from opponent',req:'Any'},
      {name:'Kleine Taks',cost:15,effect:'Opponent loses 10 MP/turn for 4 turns',req:'Lvl 1+'},
      {name:'Kleine Taks',cost:15,effect:'Opponent loses 10 MP/turn for 4 turns',req:'Lvl 1+'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP, next Quest +10 MP',req:'Lvl 1+'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP, next Quest +10 MP',req:'Lvl 1+'},
      {name:'Energy Surge',cost:0,effect:'Gain 20 MP if under 30 MP',req:'Any'},
      {name:'Energy Surge',cost:0,effect:'Gain 20 MP if under 30 MP',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'TweedeKANs',cost:5,effect:'Reroll any die',req:'Any'},
      {name:'TweedeKANs',cost:5,effect:'Reroll any die',req:'Any'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Afblijven!',cost:10,effect:"Can't lose MP until next turn",req:'Any'},
      {name:'Bowie & Stormey',cost:15,effect:'Pet protection (50-75% MP loss reduction)',req:'Any'},
      {name:'ViannaPoes',cost:15,effect:'Pet protection (50% MP loss reduction)',req:'Any'},
      {name:'FF Haaltje Nemen',cost:10,effect:'Reduce MP loss by 20',req:'Any'},
      {name:'FF Haaltje Nemen',cost:10,effect:'Reduce MP loss by 20',req:'Any'},
      {name:'Emergency Healings',cost:10,effect:'Restore 25 MP instantly',req:'Any'},
      {name:'Emergency Healings',cost:10,effect:'Restore 25 MP instantly',req:'Any'},
      {name:'Momentum Rush',cost:0,effect:'Gain 15 MP + draw 1',req:'Any'},
      {name:'Jensen',cost:10,effect:'Ignore Piecie targeting you',req:'Any'}
    ]
  },
  1: {
    name: 'Digital Control',
    mosjes: [
      {id:'west',name:'West',startMp:15,traits:{Mental:3,Technical:1},ability:'Calculated Guess: name card type, gain rewards if correct',flavor:'The Analyzer'},
      {id:'coert',name:'Coert',startMp:10,traits:{Mental:2,Technical:3},ability:'Extra Resources: draw +1 for 10 MP + Binti Food synergy',flavor:'Hawaiian Tech Savant'},
      {id:'youri',name:'Youri',startMp:0,traits:{Technical:3,Mental:2,Resilient:1},ability:'Speed Activate: activate Piecie same turn + Chris synergy',flavor:'The Speedrunner'},
      {id:'chris',name:'Chris',startMp:10,traits:{Physical:3,Technical:2,Social:2},ability:'Perfect Setup: activate face-down Piecie free + Youri synergy',flavor:'The All-Rounder'}
    ],
    piecies: [
      {name:'Keyboard',cost:0,effect:'Digital Mosje: +10 MP, draw 1',req:'Any'},
      {name:'Keyboard',cost:0,effect:'Digital Mosje: +10 MP, draw 1',req:'Any'},
      {name:'Keyboard',cost:0,effect:'Digital Mosje: +10 MP, draw 1',req:'Any'},
      {name:'Mouse',cost:0,effect:'Digital Mosje: +10 MP, look at top 2',req:'Any'},
      {name:'Mouse',cost:0,effect:'Digital Mosje: +10 MP, look at top 2',req:'Any'},
      {name:'Mouse',cost:0,effect:'Digital Mosje: +10 MP, look at top 2',req:'Any'},
      {name:'Controller',cost:0,effect:'Digital Mosje: +10 MP, Quest roll +1',req:'Any'},
      {name:'Controller',cost:0,effect:'Digital Mosje: +10 MP, Quest roll +1',req:'Any'},
      {name:'Controller',cost:0,effect:'Digital Mosje: +10 MP, Quest roll +1',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Warm Kannetje Melk',cost:0,effect:'Lose 10 MP, draw 2',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Zie je die Dingetjes',cost:0,effect:'Look at top 3, pick 1',req:'Lvl 1+'},
      {name:'Zie je die Dingetjes',cost:0,effect:'Look at top 3, pick 1',req:'Lvl 1+'},
      {name:'Bagga of Greed',cost:0,effect:'Draw 3, discard 1',req:'Any'},
      {name:'Bagga of Greed',cost:0,effect:'Draw 3, discard 1',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP',req:'Lvl 1+'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP',req:'Lvl 1+'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Affoe',cost:5,effect:'Opponent loses 15 MP, you gain 10',req:'Any'},
      {name:'Affoe',cost:5,effect:'Opponent loses 15 MP, you gain 10',req:'Any'},
      {name:'Laat me chillen!',cost:10,effect:'Reduce next MP loss by 20',req:'Any'},
      {name:'Emergency Swap',cost:30,effect:'Copy opponent Mosje ability',req:'Lvl 1+'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice',req:'Creative ★'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice',req:'Creative ★'},
      {name:'Counter Strikka',cost:15,effect:'Redirect Piecie',req:'Mental ★★'},
      {name:'Counter Strikka',cost:15,effect:'Redirect Piecie',req:'Mental ★★'},
      {name:'Jensen',cost:10,effect:'Ignore Piecie targeting you',req:'Any'},
      {name:'Sleutelpuntje',cost:5,effect:'Adjust MP by ±15',req:'Any'}
    ]
  },
  2: {
    name: 'Artistic Rhythm',
    mosjes: [
      {id:'dj',name:'DJ 80/20',startMp:20,traits:{Creative:3,Resilient:2},ability:'Lucky Beats: reroll any die once/turn, gain 10 MP/turn',flavor:'The Lucky Mixer'},
      {id:'coert',name:'Coert KasteLuck',startMp:20,traits:{Creative:2,Social:2,Resilient:1},ability:'Morning Luck: free Piecie on 4-6 roll + Binti Food synergy',flavor:'KasteLuck'},
      {id:'cless',name:'Cless Teacher',startMp:10,traits:{Creative:3,Mental:2},ability:'Teaching Moment: draw/MP on 5-6 + West/ViannaPoes synergy',flavor:'The Teacher'},
      {id:'binti',name:'Binti',startMp:5,traits:{Creative:2,Social:3},ability:'Cutting Words: discard opponent card + Coert Food synergy',flavor:'The Sharp Tongue'}
    ],
    piecies: [
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:"Nature's Gift",cost:0,effect:'Gain 30 MP (40 if Resilient ★★+)',req:'Any'},
      {name:"Nature's Gift",cost:0,effect:'Gain 30 MP (40 if Resilient ★★+)',req:'Any'},
      {name:'Varkenspootjes',cost:0,effect:'Binti: +60 MP, others: -30 MP',req:'Any'},
      {name:'MP Amplifier',cost:10,effect:'Next MP gain +50%',req:'Any'},
      {name:'MP Amplifier',cost:10,effect:'Next MP gain +50%',req:'Any'},
      {name:'MP Amplifier',cost:10,effect:'Next MP gain +50%',req:'Any'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP',req:'Lvl 1+'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP',req:'Lvl 1+'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'TweedeKANs',cost:5,effect:'Reroll any die',req:'Any'},
      {name:'TweedeKANs',cost:5,effect:'Reroll any die',req:'Any'},
      {name:'TweedeKANs',cost:5,effect:'Reroll any die',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Grammetje Pieter',cost:0,effect:'Roll: lose 15 or gain 30 MP',req:'Any'},
      {name:'Grammetje Pieter',cost:0,effect:'Roll: lose 15 or gain 30 MP',req:'Any'},
      {name:'Dikke Jonko',cost:0,effect:'You +25, opponents +10, all draw 1',req:'Lvl 1+'},
      {name:'Larry / Zegeltje',cost:0,effect:'High risk roll (big rewards or penalties)',req:'Any'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Synergy Field',cost:15,effect:'MP abilities restore +10 for 3 turns',req:'Any'},
      {name:'ViannaPoes',cost:15,effect:'Pet protection (50% MP loss reduction)',req:'Any'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice (Creative ★★★: choose result)',req:'Creative ★'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice (Creative ★★★: choose result)',req:'Creative ★'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice (Creative ★★★: choose result)',req:'Creative ★'},
      {name:'Emergency Healings',cost:10,effect:'Restore 25 MP instantly',req:'Any'},
      {name:'Emergency Healings',cost:10,effect:'Restore 25 MP instantly',req:'Any'},
      {name:'FF Haaltje Nemen',cost:10,effect:'Reduce MP loss by 20',req:'Any'},
      {name:'Momentum Rush',cost:0,effect:'Gain 15 MP + draw 1',req:'Any'}
    ]
  }
};

const QUESTS = [
  {name:'Arm Wrestling', req:{trait:'Physical',min:2}, success:40, failure:-60},
  {name:'Parkour Challenge', req:{trait:'Physical',min:2,cost:10}, success:50, failure:-70},
  {name:'Sprint Race', req:{trait:'Physical',min:2}, success:70, failure:-80},
  {name:'Strategy Puzzle', req:{trait:'Mental',min:2}, success:25, failure:-20},
  {name:'Artistic Expression', req:{trait:'Creative',min:2}, success:40, failure:-10}
];

function initFirebase(){
  const apiKey=document.getElementById('apiKey').value.trim();
  const projectId=document.getElementById('projectId').value.trim();
  const databaseUrl=document.getElementById('databaseUrl').value.trim();
  document.getElementById('statusText').textContent = 'Connecting to Firebase...';
  console.log('initFirebase called', {apiKey: !!apiKey, projectId, databaseUrl});
  if(!apiKey||!projectId||!databaseUrl){alert('Complete all Firebase fields');return;}
  try{
    firebase.initializeApp({apiKey,projectId,databaseURL:databaseUrl});
    db=firebase.database(); firebaseEnabled=true;
    document.getElementById('firebaseModal').style.display='none';
    document.getElementById('roomModal').style.display='flex';
    document.getElementById('statusText').textContent = 'Connected (Firebase)';
    log('Firebase connected');
  }catch(e){alert('Firebase init error: '+e.message)}
}
function skipFirebase(){ document.getElementById('firebaseModal').style.display='none'; document.getElementById('roomModal').style.display='flex'; log('Running in local-only mode'); }

function createRoom(){
  const code = Math.random().toString(36).slice(2,5).toUpperCase();
  localState.roomCode=code;
  myRole = 'p1';
  document.getElementById('roomCode').textContent=code;
  document.getElementById('roomModal').style.display='none';
  document.getElementById('deckModal').style.display='flex';
  if(firebaseEnabled){
    // Ensure creator is p1 and current turn is p1
    db.ref('rooms/'+code).set({p1:playerId,p2:null,created:Date.now(),current:'p1'});
    db.ref('rooms/'+code).on('value',snap=>{ const v=snap.val(); if(v){ if(v.p2) startMatch(); }});
  }
  log('Room created: '+code);
}
function joinRoom(){
  const code=document.getElementById('joinCode').value.trim().toUpperCase();
  if(!code){document.getElementById('roomHint').textContent='Enter code';return;}
  localState.roomCode=code;
  myRole = 'p2';
  document.getElementById('roomCode').textContent=code;
  if(firebaseEnabled){
    db.ref('rooms/'+code).once('value',snap=>{ 
      if(!snap.exists()){document.getElementById('roomHint').textContent='Room not found';return;} 
      const v=snap.val(); 
      if(v.p2){document.getElementById('roomHint').textContent='Room full';return;} 
      db.ref('rooms/'+code+'/p2').set(playerId); 
      
      // Sync initial state so we know P1 exists
      db.ref('rooms/'+code+'/state').once('value', stateSnap => {
        const s = stateSnap.val();
        if(s) localState = sanitizeState(s);
        document.getElementById('roomModal').style.display='none'; 
        document.getElementById('deckModal').style.display='flex'; 
        log('Joined '+code);
      });
    });
  } else { document.getElementById('roomModal').style.display='none'; document.getElementById('deckModal').style.display='flex'; log('Joined local room '+code); }
}

function pickDeck(index){
  const target = myRole || (localState.players.p1.mosjes.length === 0 ? 'p1' : 'p2');
  const deck = STARTER_DECKS[index];
  
  // Assign up to 1 random Mosje from the deck
  const availableMosjes = [...deck.mosjes];
  localState.players[target].mosjes = [];
  let totalStartMp = 0;
  for (let i = 0; i < 1; i++) {
    if (availableMosjes.length > 0) {
      const idx = Math.floor(Math.random() * availableMosjes.length);
      const selectedMosje = JSON.parse(JSON.stringify(availableMosjes.splice(idx, 1)[0]));
      localState.players[target].mosjes.push(selectedMosje);
      totalStartMp += selectedMosje.startMp || 0;
      log(`${target} assigned Mosje: ${selectedMosje.name}`);
    }
  }
  localState.players[target].mp = totalStartMp;

  localState.players[target].deck = [];
  for(let i=0;i<40;i++) localState.players[target].deck.push(JSON.parse(JSON.stringify(deck.piecies[i%deck.piecies.length])));
  shuffleLocal(localState.players[target].deck);
  for(let i=0;i<5;i++){ if(localState.players[target].deck.length) localState.players[target].hand.push(localState.players[target].deck.pop());}
  // reset draw state for the picker
  localState.players[target].canDraw = true;
  localState.players[target].extraDraws = 0;
  
  if(firebaseEnabled){ db.ref('rooms/'+localState.roomCode+'/state').set(localState); }
  if(localState.players.p1.mosjes.length > 0 && localState.players.p2.mosjes.length > 0){ startMatch(); }
  document.getElementById('deckModal').style.display='none';
  renderAll();
}

function sanitizeState(s) {
  if(!s) return s;
  if(s.players) {
    ['p1','p2'].forEach(k => {
      if(s.players[k]) {
        if(!s.players[k].deck) s.players[k].deck = [];
        if(!s.players[k].hand) s.players[k].hand = [];
        if(!s.players[k].discard) s.players[k].discard = [];
        if(!s.players[k].piecies) s.players[k].piecies = [];
        if(!s.players[k].mosjes) s.players[k].mosjes = [];
      }
    });
  }
  return s;
}

function startMatch(){ log('Match starting'); renderAll(); if(firebaseEnabled){ db.ref('rooms/'+localState.roomCode+'/state').on('value',snap=>{ const v=snap.val(); if(v){ localState=sanitizeState(v); renderAll(); }}); setInterval(()=>{ db.ref('rooms/'+localState.roomCode+'/state').set(localState); },500); }}

function drawCard(){
  // Only allow if it's this client's turn
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const turn = localState.currentTurn; const p = localState.players[turn];
  if(p.deck.length===0){ log('Deck empty'); return; }
  if(!p.canDraw && (!p.extraDraws || p.extraDraws<=0)){ alert('No draws remaining this turn'); return; }
  p.hand.push(p.deck.pop()); log('Drew card');
  if(p.extraDraws && p.extraDraws>0){ p.extraDraws--; }
  else { p.canDraw=false; }
  renderAll(); }
function placePiecie(){
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const turn = localState.currentTurn; const p = localState.players[turn];
  if(p.hand.length===0){ alert('No cards in hand to place'); return; }
  
  const c = p.hand[0];
  const cost = c.cost || 0;
  
  // Only check for positive MP if the card actually has a cost
  if (cost > 0 && p.mp <= 0) {
      alert("You need positive MP (>0) to place a Piecie with a cost!");
      return;
  }
  
  if (p.mp < cost) {
      alert(`Not enough MP to place ${c.name}. Cost: ${cost}, Current MP: ${p.mp}`);
      return;
  }
  
  p.mp -= cost;
  popupMP(turn, -cost);
  
  p.hand.shift(); 
  p.piecies.push({card:c,placedTurn:Date.now()}); 
  log(`Placed ${c.name} for ${cost} MP`); 
  renderAll(); 
}
function activatePiecie(index){
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const turn = localState.currentTurn; const p = localState.players[turn];
  if(p.piecies.length <= index){ alert('Invalid piecie'); return; }
  
  const item = p.piecies.splice(index, 1)[0]; 
  localState.place = {turn, card:item.card, revealed:true}; 
  renderAll();
  
  setTimeout(()=>{
    applyPiecieEffect(turn,item.card);
    p.discard.push(item.card);
    localState.place = null;
    renderAll();
  }, 250);
}
function activatePlaced(){
    // Legacy function, now we use per-card activation
    // But if called, activate the first one
    activatePiecie(0);
}
function applyPiecieEffect(turn,card){ const opp = turn==='p1'?'p2':'p1';
  if(card.effect.includes('Gain')){
    const m=parseInt(card.effect.match(/\d+/)||0);
    localState.players[turn].mp += m; popupMP(turn,m); log(`${turn} gained ${m} MP`);
    checkLevelUp(localState.players[turn], turn);
  } else if(card.effect.includes('Opponent')){
    const m=parseInt(card.effect.match(/\d+/)||0);
    localState.players[opp].mp -= m; popupMP(opp,-m); log(`${opp} lost ${m} MP`);
  }
  // Handle Draw effects: immediate draws and grant extra draw actions
  if(card.effect.match(/Draw\s*\d+/i) || card.effect.match(/draw\d*/i)){
    const n=parseInt(card.effect.match(/\d+/)||1);
    for(let i=0;i<n;i++) if(localState.players[turn].deck.length) localState.players[turn].hand.push(localState.players[turn].deck.pop());
    // grant an extra manual draw action as well so player can use Draw button if intended
    localState.players[turn].extraDraws = (localState.players[turn].extraDraws||0) + n;
    log(`${turn} drew ${n} and gained ${n} extra draw(s)`);
  }
}
function endMainPhase(){
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  localState.phase='quest'; log('Entered Quest Phase'); renderAll(); }
function drawQuest(){
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const q=QUESTS[Math.floor(Math.random()*QUESTS.length)]; localState.activeQuest=q; log('Quest drawn: '+q.name); document.getElementById('rollBtn').disabled=false; renderAll(); }
function rollForQuest(){
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const roll=Math.floor(Math.random()*6)+1; document.getElementById('rollBtn').disabled=true; resolveQuest(roll); }
function attemptQuest(){ rollForQuest(); }
function checkLevelUp(player, turn) {
    while (player.mp >= 100) {
        player.mp -= 100;
        player.level++;
        log(`${turn} leveled up to ${player.level}`);
        if (player.level >= 3) {
            alert((turn === 'p1' ? 'You' : 'Opponent') + ' reached Level 3 — game over');
        }
    }
}

function resolveQuest(roll){ const q = localState.activeQuest; if(!q){ alert('No active quest'); return; } const turn = localState.currentTurn; const p = localState.players[turn]; const trait = q.req && q.req.trait; const min = q.req && q.req.min || 0; let success=false; if(trait){ const val = p.mosjes.reduce((acc, m) => acc + ((m && m.traits && m.traits[trait]) || 0), 0); if(val>=min) success = roll>=3; else success = roll>=5; } else success = roll>=3; const change = success? q.success : q.failure; p.mp += change; popupMP(turn,change); log(`${turn} ${success ? 'succeeded' : 'failed'} quest (${q.name}) roll:${roll} change:${change}`); localState.activeQuest=null; checkLevelUp(p, turn); renderAll(); }
function endTurn(){
  let localKey = 'p1';
  if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  localState.currentTurn = localState.currentTurn==='p1'?'p2':'p1'; localState.phase='draw';
  // reset draw allowance for the new active player
  const cur = localState.currentTurn; localState.players[cur].canDraw = true;
  log('Turn switched to '+localState.currentTurn);
  renderAll(); }

function progressPhase() {
    const myId = localState.myId;
    if (localState.currentTurn !== myId) {
        alert("Not your turn!");
        return;
    }

    if (localState.phase === 'draw') {
        localState.phase = 'main';
        log('Entered Main Phase');
    } else if (localState.phase === 'main') {
        localState.phase = 'quest';
        log('Entered Quest Phase');
    } else if (localState.phase === 'quest') {
        localState.currentTurn = localState.currentTurn === 'p1' ? 'p2' : 'p1';
        localState.phase = 'draw';
        localState.turnCounter++;
        // Reset draw allowance for the new active player
        const newPlayer = localState.players[localState.currentTurn];
        newPlayer.canDraw = true;
        newPlayer.extraDraws = 0; // Also reset extra draws
        log(`Turn ${localState.turnCounter} started for ${localState.currentTurn}. Phase: Draw.`);
    }
    renderAll();
}

function renderAll(){
  console.log('renderAll executing...');
  try {
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
  // document.getElementById('turnIndicator').textContent = myTurn ? "Your Turn" : "Opponent's Turn";
  const phaseEl = document.getElementById('phaseIndicator');
  if(phaseEl) {
      phaseEl.textContent = localState.phase.charAt(0).toUpperCase() + localState.phase.slice(1);
  } else {
      console.warn('phaseIndicator element not found');
  }
  // document.getElementById('turnCount').textContent = localState.turnCounter;

  // Button states
  const isMyTurn = localState.currentTurn === localState.myId;
  const isDrawPhase = localState.phase === 'draw';
  const isMainPhase = localState.phase === 'main';
  const isQuestPhase = localState.phase === 'quest';

  const drawBtn = document.getElementById('drawBtn');
  if(drawBtn) drawBtn.disabled = !isMyTurn || !isDrawPhase;
  
  const placeBtn = document.getElementById('placePiecieBtn');
  if(placeBtn) placeBtn.disabled = !isMyTurn || !isMainPhase;
  
  const activateBtn = document.getElementById('activatePlacedBtn');
  if(activateBtn) activateBtn.disabled = !isMyTurn || !isMainPhase;
  
  const questBtn = document.getElementById('questBtn');
  if(questBtn) questBtn.disabled = !isMyTurn || !isQuestPhase;
  
  // Update progress button text and state based on phase
  const progressBtn = document.getElementById('progressPhaseBtn');
  if(progressBtn) {
    if(isMyTurn) {
        if(isDrawPhase) progressBtn.textContent = 'End Draw Phase';
        else if(isMainPhase) progressBtn.textContent = 'End Main Phase';
        else if(isQuestPhase) progressBtn.textContent = 'End Turn';
    } else {
        progressBtn.textContent = "Opponent's Turn";
    }
    progressBtn.disabled = !isMyTurn;
  }

  function renderMosjeCard(pdata, containerEl){
    if (!containerEl) return; // Guard clause
    containerEl.innerHTML = ''; // Clear previous content
    if(!pdata || !pdata.mosjes) return;
    (pdata.mosjes||[]).forEach(m => {
        const mosjeDiv = document.createElement('div');
        mosjeDiv.className = 'mosje';
        const html = `
          <div style="text-align:left">
            <div style="font-weight:700;font-size:15px">${m.name}</div>
            <div class="smallMuted" style="margin-top:4px">${m.flavor || ''}</div>
            <div style="margin-top:6px">MP: <strong>${pdata.mp}</strong> &nbsp; Level: <strong>${pdata.level}</strong></div>
            <div style="margin-top:6px"><strong>Traits:</strong> ${Object.entries(m.traits||{}).map(t=>`${t[0]} ${t[1]}`).join(', ')}</div>
            <div style="margin-top:6px" class="smallMuted"><strong>Ability:</strong> ${m.ability || ''}</div>
          </div>`;
        mosjeDiv.innerHTML = html;
        containerEl.appendChild(mosjeDiv);
    });
  }
  
  // Mosje displays
  const myMosjesEl = document.getElementById('myMosjes');
  const oppMosjesEl = document.getElementById('oppMosjes');
  
  // Clear them first before calling renderMosjeCard which appends
  if(myMosjesEl) myMosjesEl.innerHTML = '';
  if(oppMosjesEl) oppMosjesEl.innerHTML = '';

  renderMosjeCard(myPlayer, myMosjesEl);
  renderMosjeCard(opp, oppMosjesEl);

  // Hand (show effects clearly, enable drag & drop reorder for own hand only)
  const handArea = document.getElementById('handArea');
  if(handArea) {
      handArea.innerHTML='';
      // Only show hand if this is the local player
      let showHand = true;
      if(firebaseEnabled && room && room.p1 !== playerId && room.p2 !== playerId) showHand = false;
      if(showHand) {
        (myPlayer.hand||[]).forEach((c,i)=>{
          const d=document.createElement('div'); d.className='cardView';
          d.setAttribute('draggable','true');
          d.setAttribute('data-idx',i);
          d.style.cursor = 'grab';
          d.ondragstart = e => { e.dataTransfer.setData('text/plain', i); };
          d.ondragover = e => { e.preventDefault(); d.style.border='2px solid var(--accent)'; };
          d.ondragleave = e => { d.style.border='1px solid #32464f'; };
          d.ondrop = e => {
            e.preventDefault();
            d.style.border='1px solid #32464f';
            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
            if(fromIdx!==i) {
              const card = myPlayer.hand.splice(fromIdx,1)[0];
              myPlayer.hand.splice(i,0,card);
              renderAll();
            }
          };
          const title = document.createElement('div'); title.style.fontWeight='700'; title.textContent = c.name || 'Card';
          const eff = document.createElement('div'); eff.className='smallMuted'; eff.style.marginTop='6px'; eff.textContent = c.effect || '';
          
          const footer = document.createElement('div');
          footer.className = 'smallMuted';
          footer.style.marginTop = '8px';
          let costText = `Cost: ${c.cost > 0 ? c.cost + ' MP' : 'Free'}`;
          let reqText = c.req ? ` | Req: ${c.req}` : '';
          footer.textContent = costText + reqText;

          d.appendChild(title); 
          d.appendChild(eff);
          d.appendChild(footer);

          handArea.appendChild(d);
        });
      } else {
        handArea.innerHTML = '<div class="smallMuted">Opponent hand hidden</div>';
      }
  }

  // Counts
  const myDeckCount = document.getElementById('myDeckCount');
  if(myDeckCount) myDeckCount.textContent = (myPlayer.deck||[]).length;
  
  const myDiscard = document.getElementById('myDiscard');
  if(myDiscard) myDiscard.textContent = (myPlayer.discard||[]).length;
  
  const myHandCount = document.getElementById('myHandCount');
  if(myHandCount) myHandCount.textContent = (myPlayer.hand||[]).length;
  
  const oppPieciesCount = document.getElementById('oppPieciesCount');
  if(oppPieciesCount) oppPieciesCount.textContent = (opp.piecies||[]).length;

  // My placed piecies: show names/effects to owner only, hidden to opponent
  const mpie = document.getElementById('myPiecies'); 
  if(mpie) {
      mpie.innerHTML='';
      // Only show hand if this is the local player
      let showHand = true;
      if(firebaseEnabled && room && room.p1 !== playerId && room.p2 !== playerId) showHand = false;

      (myPlayer.piecies||[]).forEach((item,i)=>{
        const s = document.createElement('div'); s.className='slot'; s.style.flexDirection='column';
        // Only show details if this is the local player
        if(showHand) {
          const n = document.createElement('div'); n.style.fontWeight='700'; n.style.fontSize='13px'; n.textContent = item.card.name || 'Placed';
          const e = document.createElement('div'); e.className='smallMuted'; e.style.fontSize='12px'; e.style.marginTop='6px'; e.textContent = item.card.effect || '';
          s.appendChild(n); s.appendChild(e);
          
          // Add Activate Button
          if (isMyTurn && isMainPhase) {
             const btn = document.createElement('button');
             btn.className = 'btn';
             btn.style.marginTop = '8px';
             btn.style.fontSize = '10px';
             btn.style.padding = '4px 8px';
             btn.textContent = 'Activate';
             btn.onclick = (e) => { e.stopPropagation(); activatePiecie(i); };
             s.appendChild(btn);
          }
        } else {
          s.textContent = '🎴';
        }
        mpie.appendChild(s);
      });
  }
  // Opponent placed piecies: always hidden
  const oppie = document.getElementById('oppPiecies'); 
  if(oppie) {
      oppie.innerHTML='';
      (opp.piecies||[]).forEach(()=>{ const s=document.createElement('div'); s.className='slot'; s.textContent='🎴'; oppie.appendChild(s); });
  }

  // Active Quest: show requirement and outcomes
  const aq = document.getElementById('activeQuest');
  if(aq) {
      if(localState.activeQuest){
        const q = localState.activeQuest;
        let reqText = '';
        if(q.req){ 
            reqText = q.req.trait ? `Requires <strong>${q.req.trait} &ge; ${q.req.min || 0}</strong>` : ''; 
            if(q.req.cost) reqText += ` | Cost: <strong>${q.req.cost} MP</strong>`; 
        }
        aq.innerHTML = `
            <div style="font-weight:700;font-size:15px;">${q.name}</div>
            <div class="smallMuted" style="margin-top:4px;">${reqText}</div>
            <div style="margin-top:6px;">
                <div>Success: <strong style="color:var(--good)">+${q.success} MP</strong></div>
                <div>Failure: <strong style="color:var(--bad)">${q.failure} MP</strong></div>
            </div>
        `;
      } else { aq.innerHTML = 'No active quest'; }
  }

  // Turn indicator + active revealed place (if any)
  /*
  const turnEl = document.getElementById('turnIndicator');
  let turnText = myTurn ? 'YOUR TURN' : 'OPPONENT';
  if(localState.place && localState.place.revealed){
    const pl = localState.place;
    turnText += ` — Active: ${pl.turn} ${pl.card.name} (${pl.card.effect || ''})`;
  }
  turnEl.innerHTML = turnText;
  */
  } catch(e) {
      console.error(e);
      log('Error in renderAll: ' + e.message);
  }
}
function popupMP(player,amount){ if(amount>0) log(`${player} +${amount} MP`); else log(`${player} ${amount} MP`); }
function log(msg){ const el=document.getElementById('log'); const d=document.createElement('div'); d.textContent='['+new Date().toLocaleTimeString()+'] '+msg; el.prepend(d); while(el.children.length>30) el.removeChild(el.lastChild); }
function shuffleLocal(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }}

// show firebase modal first
document.getElementById('firebaseModal').style.display='flex';
renderAll();
