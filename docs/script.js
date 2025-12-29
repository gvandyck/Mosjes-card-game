// TEST HOOK: Setup state for ability tests (bypass modals, set up Ronald, hand, deck, etc.)
window.testSetupAbilityState = function() {
    // Hide setup modal if present
    const modal = document.getElementById('setupModal');
    if (modal) modal.style.display = 'none';
    // Set up state for Ronald ability test
    localState.currentTurn = 'p1';
    localState.phase = 'main';
    localState.myId = 'p1';
    localState.players.p1.mosjes = [{ name: 'Ronald', abilityId: 'ronald_active', mp: 0, level: 1 }];
    localState.players.p1.hand = [{ name: 'Kannetje Melk', cost: 0 }, { name: 'Some Card', cost: 10 }];
    localState.players.p1.deck = [{ name: 'TutorTarget', cost: 0 }, { name: 'Other', cost: 0 }];
    localState.players.p1.discard = [];
    renderAll();
};
// Helper: Identify Food Piecies by name
function isFoodPiecie(cardName) {
    const foodNames = [
        'Kannetje Melk',
        'Broodje Döner',
        'Warm Kannetje Melk',
        'Ronald Kip',
        "Chef's Special",
        'Varkenspootjes',
        "Nature's Gift"
    ];
    return foodNames.some(name => cardName && cardName.toLowerCase().includes(name.toLowerCase()));
}
// --- Deck & Graveyard Modal Logic ---
const VERSION = "2025-12-29-10";
function showDeckModal() {
    let myId = 'p1';
    if (myRole === 'p2' || (firebaseEnabled && room && room.p2 === playerId)) myId = 'p2';
    const deck = localState.players[myId].deck;
    const deckList = document.getElementById('deckList');
    if (deckList) {
        if (deck.length === 0) {
            deckList.innerHTML = '<div class="smallMuted">Deck is empty.</div>';
        } else {
            deckList.innerHTML = deck.map((c, i) => `<div style='padding:4px 0;border-bottom:1px solid #222;'>${c.name || c}</div>`).join('');
        }
    }
    document.getElementById('deckModal').style.display = 'flex';
}

// Enhanced deck modal: supports selection for Ronald's ability or generic deck search
function showDeckModal(options = {}) {
    // options: {selectable: bool, onSelect: function(card, index)}
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
}
        }
    }
    document.getElementById('graveyardModal').style.display = 'flex';
}

function closeGraveyardModal() {
    document.getElementById('graveyardModal').style.display = 'none';
}
let db=null, firebaseEnabled=false, room=null, playerId= Math.random().toString(36).slice(2,9);
let myRole = null;
let localState = {
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

const STARTER_DECKS = {
  0: {
    name: 'Physical Force',
    mosjes: [
    // {id:'cless',name:'AZN Cless',type:'Fighting',startMp:10,traits:{Physical:2,Social:2,Creative:1},ability:'Risk & Reward + Martin/ViannaPoes synergy',abilityId:'cless_passive',flavor:'The Wild Card'},
    {id:'michelle',name:'Michelle',type:'Fighting',startMp:0,traits:{Physical:2,Social:1,Resilient:2},ability:'Tough Gamble (roll for Quest rewards) + Gandoe Synergy',abilityId:'michelle_passive',flavor:'Iron Tuk'},
    {id:'gandoe',name:'Gandoe',type:'Fighting',startMp:0,traits:{Physical:3,Resilient:2},ability:'Elimination Strike: 80 MP, once/game, send opponent\'s lowest-level Mosje to graveyard. Synergy: With Michelle & Bowie & Stormey, reduce all MP loss by 75% and both gain 15 MP/turn (2 turns, 15 MP cost).',abilityId:'gandoe_synergy',flavor:'The Destroyer'},
    {id:'alyssa_bulldozer',name:'Alyssa',type:'Fighting',startMp:0,traits:{Physical:3,Resilient:2,Social:3},ability:'Unstoppable: Draw 2, discard 1. Attempting Quests +10 MP. If Alyssa loses 30+ MP in one turn, regain 25 MP.',abilityId:'alyssa_bulldozer',flavor:'The Bulldozer'},
    {id:'jisca',name:'Jisca',type:'Artistic',startMp:0,traits:{Creative:3,Social:2,Mental:2},ability:'Perfect Combo: When you activate a Piecie, after resolving its effect, roll a die: 4-6 = activate another Piecie from hand for 0 MP (Quickplay). Chain success: opponent loses 15 MP. Chain fail: Jisca loses 10 MP (if 0 MP, ignore).',abilityId:'jisca_perfect_combo',flavor:'The Maestro'},
      {id:'jeffrey',name:'Jeffrey',type:'Fighting',startMp:20,traits:{Physical:3,Resilient:1},ability:'Brute Force: Quests +10 MP, No MP-restore Piecies',abilityId:'jeffrey_passive',flavor:'The Strongman'}
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
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP and next Quest +10 MP',req:'Lvl 1+'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP and next Quest +10 MP',req:'Lvl 1+'},
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
      {name:'ViannaPoes',cost:15,effect:'2 turns: Cless/Hayabusa reduce MP damages/losses/reduction of Quest results or Piecie effects by 50%. This card stays active on the field as long as this effect lasts.',req:'Any'},
      {name:'FF Haaltje Nemen',cost:0,effect:'Reduce MP loss by 20',req:'Any'},
      {name:'FF Haaltje Nemen',cost:0,effect:'Reduce MP loss by 20',req:'Any'},
      {name:'Emergency Healings',cost:10,effect:'Restore 25 MP instantly',req:'Any'},
      {name:'Emergency Healings',cost:10,effect:'Restore 25 MP instantly',req:'Any'},
      {name:'Momentum Rush',cost:0,effect:'Gain 15 MP + draw 1',req:'Any'},
      {name:'Jensen',cost:10,effect:'Ignore Piecie targeting you',req:'Any'},
      {name:'The Gym',cost:0,effect:'Place: Fighting gain 25 MP/turn',req:'Any'},
      {name:'Obby 1',cost:0,effect:'Place: All lose 10 MP/turn, Quests +15 MP',req:'Any'}
    ]
  },
  1: {
    name: 'Digital Control',
    mosjes: [
      {id:'west',name:'Martin',type:'Digital',startMp:15,traits:{Mental:3,Technical:1},ability:'Calculated Guess: Name card type, draw 2 + 10 MP if correct',abilityId:'martin_active',flavor:'Señor West'},
        {id:'ronald',name:'Ronald',type:'Digital',startMp:0,traits:{Mental:2,Technical:2,Resilient:2},ability:'Master Chef (Activated, once per turn): Discard a Food Piecie from your hand. If you do, search your deck for any card and add it to your hand.',abilityId:'ronald_active',flavor:'The Master Chef'},
      {id:'youri',name:'Youri',type:'Digital',startMp:0,traits:{Technical:3,Mental:2,Resilient:1},ability:'Speed Activate: Activate Piecie same turn + draw 1 (20 MP)',abilityId:'youri_active',flavor:'The Speedrunner'},
      {id:'chris',name:'Chris',type:'Digital',startMp:10,traits:{Physical:3,Technical:2,Social:2},ability:'Perfect Setup: Activate face-down Piecie free + 15 MP',abilityId:'chris_active',flavor:'The All-Rounder'}
    ],
    piecies: [
      {name:'Keyboard',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and draw 1 card',req:'Any'},
      {name:'Keyboard',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and draw 1 card',req:'Any'},
      {name:'Keyboard',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and draw 1 card',req:'Any'},
      {name:'Mouse',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and look at top 2 cards',req:'Any'},
      {name:'Mouse',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and look at top 2 cards',req:'Any'},
      {name:'Mouse',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and look at top 2 cards',req:'Any'},
      {name:'Controller',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and your next Quest roll gets +1',req:'Any'},
      {name:'Controller',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and your next Quest roll gets +1',req:'Any'},
      {name:'Controller',cost:0,effect:'Pick a Digital Mosje: Gain 10 MP and your next Quest roll gets +1',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Kannetje Melk',cost:0,effect:'Gain 25 MP',req:'Any'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Broodje Döner',cost:0,effect:'Gain 35 MP',req:'Lvl 1+'},
      {name:'Warm Kannetje Melk',cost:0,effect:'Lose 10 MP, draw 2',req:'Any'},
        {name:'Ronald Kip',cost:0,effect:'Gain 50 MP to your active Mosje. RONALD SYNERGY: If Ronald (The Master Chef) is on field, gain 60 MP instead of 50 MP, and draw 1 card.',req:'Any'},
        {name:"Chef's Special",cost:10,effect:"If you have Ronald on field: Look at opponent's hand, then gain 30 MP for each Piecie card they have. Otherwise: Gain 15 MP.",req:'Lvl 1+'},
        {name:'Ronald Kip',cost:0,effect:'Gain 50 MP to your active Mosje. RONALD SYNERGY: If Ronald The Master Chef is on field, gain 60 MP instead of 50 MP, and draw 1 card.',req:'Any'},
        {name:"Chef's Special",cost:10,effect:'If you have Ronald on field: Look at opponent\'s hand, then gain 30 MP for each Piecie card they have. Otherwise: Gain 15 MP.',req:'Lvl 1+'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Gun een Piece',cost:0,effect:'Draw 2 cards',req:'Any'},
      {name:'Zie je die Dingetjes',cost:0,effect:'Look at top 3, pick 1',req:'Lvl 1+'},
      {name:'Zie je die Dingetjes',cost:0,effect:'Look at top 3, pick 1',req:'Lvl 1+'},
      {name:'Bagga of Greed',cost:0,effect:'Draw 2, discard 1',req:'Any'},
      {name:'Bagga of Greed',cost:0,effect:'Draw 2, discard 1',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'Quest Prep',cost:10,effect:'Next Quest roll +2',req:'Any'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP',req:'Lvl 1+'},
      {name:'Momentum Boost',cost:0,effect:'Restore 15 MP',req:'Lvl 1+'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Affoe',cost:5,effect:'-15 MP of opponent mosje and your mosje gains 10 MP',req:'Any'},
      {name:'Affoe',cost:5,effect:'-15 MP of opponent mosje and your mosje gains 10 MP',req:'Any'},
      {name:'Laat me chillen!',cost:10,effect:'Reduce next MP loss by 20',req:'Any'},
      {name:'Emergency Swap',cost:30,effect:'Copy opponent Mosje ability',req:'Lvl 1+'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice',req:'Creative ★'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice',req:'Creative ★'},
      {name:'Counter Strikka',cost:15,effect:'Redirect Piecie',req:'Mental ★★'},
      {name:'Counter Strikka',cost:15,effect:'Redirect Piecie',req:'Mental ★★'},
      {name:'Jensen',cost:10,effect:'Ignore Piecie targeting you',req:'Any'},
      {name:'Sleutelpuntje',cost:5,effect:'Adjust MP by ±15',req:'Any'},
      {name:'Digital Gaming Stop',cost:0,effect:'Place: Digital Equipment +5 MP',req:'Any'},
      {name:'Bank Chilling',cost:0,effect:'Place: Mental ★★+ gain +15 MP on draw 2+',req:'Any'}
    ]
  },
  2: {
    name: 'Artistic Rhythm',
    mosjes: [
      {id:'dj',name:'DJ 80/20',type:'Artistic',startMp:20,traits:{Creative:3,Resilient:2},ability:'Lucky Beats: Reroll dice once/turn + 10 MP/turn',abilityId:'dj_passive',flavor:'The Lucky Mixer'},
      {id:'coert_luck',name:'Coert',type:'Artistic',startMp:20,traits:{Creative:2,Social:2,Resilient:1},ability:'Morning Luck: Roll 4-6 = free Piecie + Binti Food Synergy',abilityId:'coert_luck_passive',flavor:'KasteLuck'},
      {id:'cless_teacher',name:'Cless',type:'Artistic',startMp:10,traits:{Creative:3,Mental:2},ability:'Teaching Moment: Activate Piecie -> Roll 5-6 = draw 1 + 5 MP',abilityId:'cless_teacher_passive',flavor:'The Teacher'},
      {id:'binti',name:'Binti',type:'Artistic',startMp:5,traits:{Creative:2,Social:3},ability:'Cutting Words: discard opponent card + Coert Food synergy',abilityId:'binti_active',flavor:'The Sharp Tongue'}
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
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Slecht Gezet',cost:0,effect:'Destroy Place',req:'Any'},
      {name:'Affoe',cost:5,effect:'-15 MP of opponent mosje and your mosje gains 10 MP',req:'Any'},
      {name:'Affoe',cost:5,effect:'-15 MP of opponent mosje and your mosje gains 10 MP',req:'Any'},
      {name:'Laat me chillen!',cost:10,effect:'Reduce next MP loss by 20',req:'Any'},
      {name:'Emergency Swap',cost:30,effect:'Copy opponent Mosje ability',req:'Lvl 1+'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice',req:'Creative ★'},
      {name:'Lucky Cóin',cost:10,effect:'Reroll dice',req:'Creative ★'},
      {name:'Counter Strikka',cost:15,effect:'Redirect Piecie',req:'Mental ★★'},
      {name:'Counter Strikka',cost:15,effect:'Redirect Piecie',req:'Mental ★★'},
      {name:'Jensen',cost:10,effect:'Ignore Piecie targeting you',req:'Any'},
      {name:'Sleutelpuntje',cost:5,effect:'Adjust MP by ±15',req:'Any'},
      {name:'Digital Gaming Stop',cost:0,effect:'Place: Digital Equipment +5 MP',req:'Any'},
      {name:'Bank Chilling',cost:0,effect:'Place: Mental ★★+ gain +15 MP on draw 2+',req:'Any'}
    ]
  }
};

const QUESTS = [
  // Physical
  {name:'Arm Wrestling', desc:'Roll: Phys ★ = 5+, ★★ = 3+, ★★★ = 2+', req:{trait:'Physical'}, type:'roll_trait', params:{1:5, 2:3, 3:2}, success:40, failure:-60},
  {name:'Parkour Challenge', desc:'Pay 10 MP + Roll 4+', req:{trait:'Physical', cost:10}, type:'pay_roll', params:{cost:10, target:4}, success:50, failure:-70},
  {name:'Sprint Race', desc:'Physical ★★+ auto success', req:{trait:'Physical'}, type:'auto_trait', params:{trait:'Physical', min:2}, success:70, failure:-80},
  {name:'Endurance Test', desc:'Have 60+ MP OR Phys ★★★', req:{trait:'Physical'}, type:'condition', params:{mp:60, trait:'Physical', traitMin:3}, success:60, failure:-70},
  
  // Mental
  {name:'Strategy Puzzle', desc:'Mental ★★ + Discard 1 card', req:{trait:'Mental'}, type:'discard_condition', params:{trait:'Mental', min:2, discard:1}, success:25, failure:-20},
  {name:'Calculate Odds', desc:'Reveal top 3: if 2+ same type succeed', req:{trait:'Mental'}, type:'reveal_check', params:{count:3, match:2}, success:20, failure:-10},
  {name:'Quick Thinking', desc:'Roll: Mental ★ = 5+, ★★ = 4+, ★★★ = 3+', req:{trait:'Mental'}, type:'roll_trait', params:{1:5, 2:4, 3:3}, success:20, failure:-20},
  
  // Social
  {name:'Inspire Crowd', desc:'Roll: Social ★ = 5+, ★★ = 4+, ★★★ = 3+', req:{trait:'Social'}, type:'roll_trait', params:{1:5, 2:4, 3:3}, success:25, failure:-20},
  {name:'Team Building', desc:'Social ★★+ auto success', req:{trait:'Social'}, type:'auto_trait', params:{trait:'Social', min:2}, success:22, failure:-40},
  
  // Creative
  {name:'Artistic Expression', desc:'Creative ★★ + Draw 2 cards', req:{trait:'Creative'}, type:'draw_condition', params:{trait:'Creative', min:2, draw:2}, success:40, failure:-10},
  {name:'Improvise!', desc:'Creative ★★★ OR pay 15 MP', req:{trait:'Creative'}, type:'pay_or_trait', params:{trait:'Creative', min:3, cost:15}, success:50, failure:-20},
  {name:'Lucky Break', desc:'Roll: Creative ★ = 5+, ★★ = 4+, ★★★ = 2+', req:{trait:'Creative'}, type:'roll_trait', params:{1:5, 2:4, 3:2}, success:70, failure:-40},
  {name:'Create Masterpiece', desc:'Creative ★★ + 3+ Piecies in play', req:{trait:'Creative'}, type:'condition_piecies', params:{trait:'Creative', min:2, piecies:3}, success:60, failure:-20},
  
  // Technical
  {name:'Debug System', desc:'Tech ★★ + Look at top 5 of any deck', req:{trait:'Technical'}, type:'look_deck', params:{trait:'Technical', min:2, count:5}, success:40, failure:-60},
  {name:'Precision Work', desc:'Roll: Tech ★ = 5+, ★★ = 4+, ★★★ = 3+', req:{trait:'Technical'}, type:'roll_trait', params:{1:5, 2:4, 3:3}, success:70, failure:-70},
  
  // Resilient
  {name:'Survive Storm', desc:'Resilient ★★ OR have less than 30 MP', req:{trait:'Resilient'}, type:'condition_mp_low', params:{trait:'Resilient', min:2, mpMax:30}, success:30, failure:-50},
  {name:'Tough It Out', desc:'Roll: Res ★ = 5+, ★★ = 4+, ★★★ = 3+', req:{trait:'Resilient'}, type:'roll_trait', params:{1:5, 2:4, 3:3}, success:80, failure:-80},
  
  // Mixed/Special
  {name:'Leap of Faith', desc:'Roll: 1-3 = Fail, 4-6 = Success', req:{}, type:'simple_roll', params:{target:4}, success:60, failure:-20},
  {name:'Speed Run', desc:'Activate 2 Piecies this turn', req:{}, type:'action_count', params:{action:'activate', count:2}, success:60, failure:-50},
  {name:'The Gauntlet', desc:'Complete 3 different actions this turn', req:{}, type:'unique_actions', params:{count:3}, success:50, failure:-15}
];

function initFirebase(){
  const apiKey=document.getElementById('apiKey').value.trim();
  const projectId=document.getElementById('projectId').value.trim();
  const databaseUrl=document.getElementById('databaseUrl').value.trim();
  // document.getElementById('statusText').textContent = 'Connecting to Firebase...';
  console.log('initFirebase called', {apiKey: !!apiKey, projectId, databaseUrl});
  if(!apiKey||!projectId||!databaseUrl){alert('Complete all Firebase fields');return;}
  try{
    firebase.initializeApp({apiKey,projectId,databaseURL:databaseUrl});
    db=firebase.database(); firebaseEnabled=true;
    // document.getElementById('firebaseModal').style.display='none'; 
    document.getElementById('setupModal').style.display='flex'; 
    // document.getElementById('statusText').textContent = 'Connected (Firebase)';
    log('Firebase connected');
  }catch(e){
      console.warn('Firebase init error: '+e.message);
      // Fallback to local mode silently or show error?
      // User asked to remove popup, so we just log it.
  }
}
function skipFirebase(){ 
    // document.getElementById('firebaseModal').style.display='none'; 
    document.getElementById('setupModal').style.display='flex'; 
    log('Running in local-only mode'); 
}

let selectedDeckIndex = 0;

function selectDeck(index, el) {
    selectedDeckIndex = index;
    document.querySelectorAll('.deck-option').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
}



// Removed duplicate window.handleCreateRoom assignments above. Only the correct one at the bottom of the file remains.

function handleJoinRoom() {
    joinRoom(selectedDeckIndex);
}

function createRoom(deckIndex){
  // Generate 3 random digits (100-999)
  const code = Math.floor(100 + Math.random() * 900).toString();
    localState.roomCode=code;
    myRole = 'p1';
    const roomCodeEl = document.getElementById('roomCode');
    if (roomCodeEl) {
        roomCodeEl.innerHTML = code + ' <span style="font-size:10px;color:#888;margin-left:6px;">v' + VERSION + '</span>';
    }
    document.getElementById('setupModal').style.display='none';
  
  // Pick deck immediately (updates localState)
  pickDeck(deckIndex);
  
  if(firebaseEnabled){
    // Set metadata
    db.ref('rooms/'+code).set({
        p1:playerId,
        p2:null,
        created:Date.now()
    });
    
    // Set initial state
    db.ref('rooms/'+code+'/state').set(localState);

    // Listen for P2 joining (metadata update)
    db.ref('rooms/'+code).on('value', snap => { 
        const v=snap.val(); 
        if(v && v.p2) {
            // P2 joined
            if(localState.players.p2.mosjes.length > 0) startMatch();
        }
    });
    
    // Listen for state updates (from P2)
    db.ref('rooms/'+code+'/state').on('value', snap => {
        const v = snap.val();
        if(v) {
            localState = sanitizeState(v);
            renderAll();
            if(localState.players.p1.mosjes.length > 0 && localState.players.p2.mosjes.length > 0){ startMatch(); }
        }
    });
  }
  log('Room created: '+code);
}

function joinRoom(deckIndex){
  const code=document.getElementById('joinCode').value.trim().toUpperCase();
  if(!code){
      document.getElementById('roomHint').textContent='Enter code';
      return;
  }
    localState.roomCode=code;
    myRole = 'p2';
    const roomCodeEl = document.getElementById('roomCode');
    if (roomCodeEl) {
        roomCodeEl.innerHTML = code + ' <span style="font-size:10px;color:#888;margin-left:6px;">v' + VERSION + '</span>';
    }
  
  if(firebaseEnabled){
    db.ref('rooms/'+code).once('value', snap => { 
      if(!snap.exists()){
          document.getElementById('roomHint').textContent='Room not found';
          return;
      } 
      const v=snap.val(); 
      if(v.p2){
          document.getElementById('roomHint').textContent='Room full';
          return;
      } 
      
      // Load existing state if available
      if (v.state) {
          localState = sanitizeState(v.state);
      }
      
      // Join success (update metadata)
      db.ref('rooms/'+code).update({p2:playerId});
      
      // Listen for state updates
      db.ref('rooms/'+code+'/state').on('value', snap => { 
          const val=snap.val(); 
          if(val){ 
              localState=sanitizeState(val); 
              renderAll(); 
              if(localState.players.p1.mosjes.length > 0 && localState.players.p2.mosjes.length > 0){ startMatch(); }
          }
      });
      
      document.getElementById('setupModal').style.display='none';
      pickDeck(deckIndex); // This will update localState and push to Firebase
      log('Joined room: '+code);
    });
  } else {
      // Local join
      document.getElementById('setupModal').style.display='none';
      pickDeck(deckIndex);
      log('Joined room (Local): '+code);
  }
}

function pickDeck(index){
  const target = myRole || (localState.players.p1.mosjes.length === 0 ? 'p1' : 'p2');
  const deck = STARTER_DECKS[index];
  
    // Assign 1 random Mosje from the deck as starter
    let availableMosjes = [...deck.mosjes];
    localState.players[target].mosjes = [];
    let totalStartMp = 0;
    // If Digital deck, always include Ronald as starter for testing
    if (deck.name === 'Digital Control') {
        const ronaldIdx = availableMosjes.findIndex(m => m.id === 'ronald');
        let selectedMosje;

function playMosjeFromHand(index) {
    let localKey = 'p1';
    if (firebaseEnabled && myRole) localKey = myRole;
    else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
    
    if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
    
    const p = localState.players[localKey];
    if (p.mosjes.length >= 2) {
        alert("You already have 2 Mosjes active!");
        return;
    }
    
    const card = p.hand[index];
    // Remove from hand
    p.hand.splice(index, 1);
    
    // Add to Mosjes
    p.mosjes.push(card);
    
    // Add Start MP
    const startMp = card.startMp || 0;
    p.mp += startMp;
    popupMP(localKey, startMp);
    
    log(`${localKey} played Mosje: ${card.name} (+${startMp} MP)`);
    
    renderAll();
    syncState();
}

function playSnelleFromHand(index) {
    let localKey = 'p1';
    if (firebaseEnabled && myRole) localKey = myRole;
    else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
    
    // Snelle Piecies can be played during opponent's turn, but we still need to know who is playing
    // In local mode, we assume the current UI user is the one playing from their hand
    // But we need to be careful about 'turn' variable.
    // If it's my turn, I am 'turn'. If it's opponent's turn, I am NOT 'turn'.
    
    const myId = localState.myId || (localState.currentTurn === 'p1' ? 'p1' : 'p2'); // Fallback for local
    // Actually, we should use the player whose hand we are clicking.
    // In this simple UI, we always render "My Hand" at the bottom.
    // So we are always acting as 'myId' (or inferred local player).
    
    // Let's determine 'me' based on the view.
    // In local-only (hotseat), 'myId' might not be set correctly if we just switch turns.
    // But the UI renders 'myPlayer' based on 'localState.currentTurn' usually?
    // Wait, in hotseat, 'myPlayer' is usually the active player.
    // BUT Snelle Piecies are for the NON-active player (during opponent turn).
    // If hotseat, we can't really simulate "opponent playing from hand" easily because the hand shown IS the active player's hand.
    // However, for the "Local MVP" where we might be testing, let's assume we are clicking on the hand that is visible.
    
    // If we are in hotseat mode, the "Your Hand" is the current turn player's hand.
    // So we can't really play Snelle cards as the opponent in hotseat mode easily without split screen.
    // BUT, if we are in Network mode (Firebase), 'myRole' is set.
    
    let playerKey = localState.currentTurn;
    if (firebaseEnabled && myRole) {
        playerKey = myRole;
    } else {
        // In local hotseat, we can only interact as the current turn player usually.
        // But if we want to test Snelle Piecies, maybe we allow the current player to play them?
        // The prompt says "Snelle Piecies can be played during opponents turns".
        // In hotseat, you ARE the opponent when it's their turn.
        // So if I am P1, and it is P2's turn, I can't see my hand in hotseat mode usually.
        // Let's assume for now we just enable the logic for "Instant Play" regardless of turn,
        // and if it happens to be the active player's turn, it's just a fast play.
        // If it's network mode, it allows playing out of turn.
    }

    // For simplicity in this function:
    // We operate on the player who owns the hand (which is passed implicitly by index if we assume 'myPlayer').
    // We need to know WHICH player is 'myPlayer'.
    
    let pKey = 'p1';
    if (firebaseEnabled && myRole) pKey = myRole;
    else if (firebaseEnabled && room && room.p2 === playerId) pKey = 'p2';
    else if (!firebaseEnabled) {
        // In hotseat, 'myPlayer' is 'localState.players[localState.currentTurn]'.
        // So we are playing as the active player.
        pKey = localState.currentTurn;
    }

    const p = localState.players[pKey];
    if (p.hand.length <= index) return;
    const card = p.hand[index];

    const roomCodeEl = document.getElementById('roomCode');
    if (roomCodeEl) {
        // Use the actual room code if available, else fallback
        let roomCodeStr = (localState && localState.roomCode) ? localState.roomCode : '';
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

    // Execute
    p.mp -= cost;
    popupMP(pKey, -cost);
    
    // Remove from hand
    p.hand.splice(index, 1);
    
    log(`${pKey} played Snelle Piecie: ${card.name} (Instant)`);

    // Special Logic for FF Haaltje Nemen (Hand Play)
    if (card.name === 'FF Haaltje Nemen') {
        // Try to apply to lastDamage, but if not present, warn and refund
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
            // Refund and return card
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
        // Lose 10 MP
        let target = p.mosjes[0];
        if (p.mosjes.length > 1) {
            const useFirst = confirm(`Bagga of Greed: Lose 10 MP from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
            target = useFirst ? p.mosjes[0] : p.mosjes[1];
        }
        target.mp = (target.mp || 0) - 10;
        p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
        popupMP(pKey, -10);

        // Draw 2 cards
        let drawn = 0;
        for(let i=0; i<2; i++) {
            if(p.deck.length > 0) {
                p.hand.push(p.deck.pop());
                drawn++;
            }
        }
        log(`${pKey} played Bagga of Greed: Lost 10 MP, Drew ${drawn} cards`);
        
        // Require Discard 1
        localState.pendingDiscard = 1;
        renderAll();
        setTimeout(() => alert("Bagga of Greed: Please discard 1 card from your hand."), 100);
    } else {
        // For other Snelle Piecies, we might need to define their instant effects here
        // or treat them as "Placed and Activated immediately"
        // Currently, most Snelle Piecies are activated from the field (Piecie zone).
        // If played from hand, we should probably put them in discard pile and apply effect?
        // Or put them in Piecie zone and activate?
        
        // Let's assume "Play from Hand" = "Activate Effect immediately then Discard"
        // We can reuse applyPiecieEffect logic?
        // But applyPiecieEffect expects it to be in the piecie list usually?
        // No, it takes (turn, card).
        
        applyPiecieEffect(pKey, card);
    }
    
    p.discard.push(card);
    renderAll();
    syncState();
}

function drawCard(){
  // Only allow if it's this client's turn
  let localKey = 'p1';
  if (firebaseEnabled && myRole) localKey = myRole;
  else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const turn = localState.currentTurn; const p = localState.players[turn];
  if(p.deck.length===0){ log('Deck empty'); return; }
  if(!p.canDraw && (!p.extraDraws || p.extraDraws<=0)){ alert('No draws remaining this turn'); return; }
  p.hand.push(p.deck.pop()); log('Drew card');
  if(p.extraDraws && p.extraDraws>0){ p.extraDraws--; }
  else { 
      p.canDraw=false; 
      // Auto-advance to Main Phase if in Draw Phase
      if (localState.phase === 'draw') {
          localState.phase = 'main';
          log('Auto-advanced to Main Phase');
      }
  }
  if(!localState.turnActions) localState.turnActions = [];
  localState.turnActions.push('draw');
  renderAll(); syncState(); }
function placePiecie(index = 0){
  let localKey = 'p1';
  if (firebaseEnabled && myRole) localKey = myRole;
  else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  const turn = localState.currentTurn; const p = localState.players[turn];
  if(p.hand.length <= index){ alert('Invalid card'); return; }
  
  const c = p.hand[index];
  // Cost is now paid on activation, not placement
  p.hand.splice(index, 1); 
  p.piecies.push({card:c,placedTurn:Date.now()}); 
  log(`Placed ${c.name} (Cost: ${c.cost||0} MP will be paid on activation)`); 
  if(!localState.turnActions) localState.turnActions = [];
  localState.turnActions.push('place');
  renderAll(); syncState();
}
function activatePiecie(index){

    let localKey = 'p1';
    if (firebaseEnabled && myRole) localKey = myRole;
    else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';

    // Determine who is activating
    let activatingPlayerKey = localState.currentTurn;
    if (firebaseEnabled && myRole) activatingPlayerKey = myRole;

    // Always initialize 'p' at the top
    let p = localState.players[activatingPlayerKey];
    if (!firebaseEnabled) {
        p = localState.players[localState.currentTurn];
    }
    if (firebaseEnabled && myRole) {
        activatingPlayerKey = myRole;
    } else {
        // ...existing code...
    }

    // --- FIX: Declare itemToCheck at the top before any use ---
    if(p.piecies.length <= index){ alert('Invalid piecie'); return; }
    const itemToCheck = p.piecies[index];



    // --- Jisca Perfect Combo Mechanic ---
    // Override for Network Mode to allow out-of-turn
    p = localState.players[activatingPlayerKey];
    // If not network mode, fallback to current turn (standard behavior)
    if (!firebaseEnabled) {
        p = localState.players[localState.currentTurn];
    }
    // After resolving a Piecie, if Jisca is active, roll a die for chain
    // Only for the player who controls Jisca
    const jisca = p.mosjes && p.mosjes.find(m => m.id === 'jisca');
    if (jisca && !itemToCheck._jiscaChain) { // Prevent recursion
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            log(`Jisca Perfect Combo: Rolled a ${roll}`);
            if (roll >= 4) {
                // Chain success: allow activating ANY card from hand (Quickplay, pay cost as normal)
                if (p.hand.length === 0) {
                    log('Jisca: No cards in hand to chain.');
                } else {
                    let msg = 'Jisca Chain! Choose a card from your hand to activate (Quickplay, pay cost):\n';
                    p.hand.forEach((c, idx) => { msg += `${idx+1}: ${c.name}\n`; });
                    const choice = prompt(msg);
                    const sel = parseInt(choice)-1;
                    if (p.hand[sel]) {
                        const card = p.hand[sel];
                        // Remove from hand, add to piecies, activate immediately (pay cost as normal)
                        p.hand.splice(sel, 1);
                        p.piecies.push({card, active: false, _jiscaChain: true});
                        activatePiecie(p.piecies.length-1);
                        // Chain success: opponent loses 15 MP (choose target)
                        const oppKey = activatingPlayerKey === 'p1' ? 'p2' : 'p1';
                        const opp = localState.players[oppKey];
                        if (opp.mosjes && opp.mosjes.length > 0) {
                            let target = opp.mosjes[0];
                            if (opp.mosjes.length > 1) {
                                const useFirst = confirm(`Jisca Chain: Opponent loses 15 MP. Target:\nOK = ${opp.mosjes[0].name}\nCancel = ${opp.mosjes[1].name}`);
                                target = useFirst ? opp.mosjes[0] : opp.mosjes[1];
                            }
                            target.mp = Math.max(0, (target.mp||0) - 15);
                            popupMP(oppKey, -15);
                            log(`Jisca Chain: ${oppKey} (${target.name}) loses 15 MP!`);
                        }
                    }
                }
            } else {
                // Chain fail: Jisca loses 10 MP (if >0)
                if ((jisca.mp||0) > 0) {
                    jisca.mp = Math.max(0, jisca.mp - 10);
                    popupMP(activatingPlayerKey, -10);
                    log('Jisca Chain failed: Jisca loses 10 MP.');
                } else {
                    log('Jisca Chain failed: Jisca at 0 MP, no penalty.');
                }
            }
            renderAll();
            syncState();
        }, 350); // After effect resolves
    }

    const isSnelle = isSnellePiecie(itemToCheck.card.name);

    // Turn Check
    if (!isSnelle && localState.currentTurn !== activatingPlayerKey && firebaseEnabled) {
        alert('Not your turn!'); return;
    }

    // In hotseat, we effectively enforce turn by only showing active player.
    // So we don't need to change much there.

    // Check for active Mosje
    if (!p.mosjes || p.mosjes.length === 0) {
        alert("You need an active Mosje to activate Piecies!");
        return;
    }

  const cost = itemToCheck.card.cost || 0;

  // Check MP
  if (cost > 0 && p.mp < cost) {
      alert(`Not enough MP to activate ${itemToCheck.card.name}. Cost: ${cost}, Current MP: ${p.mp}`);
      return;
  }

  // Deduct MP from specific Mosje
  if (cost > 0) {
      let payer = p.mosjes[0];
      if (p.mosjes.length > 1) {
          const capable = p.mosjes.filter(m => (m.mp||0) >= cost);
          if (capable.length === 0) {
               alert(`No Mosje has enough MP to pay ${cost}!`);
               return;
          } else if (capable.length === 1) {
              payer = capable[0];
          } else {
              const useFirst = confirm(`Pay ${cost} MP from which Mosje?\nOK = ${capable[0].name}\nCancel = ${capable[1].name}`);
              payer = useFirst ? capable[0] : capable[1];
          }
      }
      
      if ((payer.mp||0) < cost) {
           alert(`Not enough MP on ${payer.name}!`);
           return;
      }
      payer.mp -= cost;
      popupMP(activatingPlayerKey, -cost);
  }

  if(!localState.turnActions) localState.turnActions = [];
  localState.turnActions.push('activate');

  const cardName = itemToCheck.card.name;
  log(`${activatingPlayerKey} activating: ${cardName}`);

  // Special handling for Kleine Taks
  if (cardName === 'Kleine Taks') {
      const oppKey = activatingPlayerKey === 'p1' ? 'p2' : 'p1';
      const opp = localState.players[oppKey];
      if (!opp.durationEffects) opp.durationEffects = [];
      opp.durationEffects.push({ name: 'Kleine Taks', duration: 4 });
      log(`${activatingPlayerKey} activated Kleine Taks on ${oppKey} (Duration: 4 Turns)`);
      
      // Remove from piecies and discard
      const item = p.piecies.splice(index, 1)[0]; 
      p.discard.push(item.card);
      renderAll();
      syncState();
      return;
  }

  // Special handling for FF Haaltje Nemen
  if (cardName === 'FF Haaltje Nemen') {
      // Check if damage was taken recently (from ANY source)
      if (localState.lastDamage && localState.lastDamage.player === activatingPlayerKey) {
          const damage = localState.lastDamage.amount;
          const recovery = Math.min(20, damage);
          let targetM = p.mosjes[0];
          if (localState.lastDamage.mosjeIndex !== undefined && p.mosjes[localState.lastDamage.mosjeIndex]) {
              targetM = p.mosjes[localState.lastDamage.mosjeIndex];
          }
          targetM.mp = (targetM.mp || 0) + recovery;
          popupMP(activatingPlayerKey, recovery);
          log(`${activatingPlayerKey} used FF Haaltje Nemen: Reduced damage by ${recovery} MP on ${targetM.name}`);
          localState.lastDamage.amount -= recovery;
          if (localState.lastDamage.amount <= 0) localState.lastDamage = null;
          const item = p.piecies.splice(index, 1)[0]; 
          p.discard.push(item.card);
          renderAll();
          syncState();
          return;
      } else {
          alert("Can only use FF Haaltje Nemen after taking MP damage!");
          if (cost > 0 && p.mosjes.length > 0) {
              p.mosjes[0].mp += cost;
              popupMP(activatingPlayerKey, cost);
          }
          return;
      }
  }

  const isDuration = ['Afblijven!', 'TweedeKANs', 'Quest Prep', 'Snoeiertje', 'Controller', 'Kleine Taks', 'Synergy Field', 'Sleutelpuntje', 'ViannaPoes', 'MP Amplifier'].includes(cardName);

  if (isDuration) {
      // Special handling for Controller (Conditional Duration)
      if (stackCount > 1) {
          log(`${cardName} stacked! (Active count: ${stackCount})`);
      }
      
      // Add to durationEffects
      if (!p.durationEffects) p.durationEffects = [];
      let duration = 1;
      if (cardName === 'Afblijven!') duration = 2; // Lasts through opponent's turn
      if (cardName === 'ViannaPoes') duration = 2;
      
      p.durationEffects.push({ name: cardName, duration: duration });
      
      log(`${activatingPlayerKey} activated ${cardName} (Duration: ${duration} Turn(s))`);
      renderAll();
      syncState();
  } else if (itemToCheck.card.effect && itemToCheck.card.effect.startsWith('Place:')) {
      // Check if a place is already active
      if (localState.sharedPlace) {
          alert("A Place card is already active! You must destroy it first (e.g. with Slecht Gezet).");
          return;
      }

      const item = p.piecies.splice(index, 1)[0];
      
      localState.sharedPlace = { turn: activatingPlayerKey, card: item.card };
      log(`${activatingPlayerKey} activated Place: ${item.card.name}`);
      renderAll();
      syncState();
    } else {
            const item = p.piecies.splice(index, 1)[0];
            // Ronald Master Chef: +10 MP for Food Piecie (apply immediately before effect, only if Ronald is active)
            const player = localState.players[activatingPlayerKey];
            if (player && player.mosjes && player.mosjes.some(m => m.name === 'Ronald') && isFoodPiecie(item.card.name)) {
                // Target Ronald specifically
                let ronald = player.mosjes.find(m => m.name === 'Ronald');
                if (ronald) {
                    ronald.mp = (ronald.mp || 0) + 10;
                    player.mp = player.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
                    popupMP(activatingPlayerKey, 10);
                    log(`${activatingPlayerKey} (Ronald) Master Chef: +10 MP for Food Piecie (${item.card.name})`);
                }
            }
            localState.place = {turn: activatingPlayerKey, card:item.card, revealed:true};
            renderAll();
            syncState();
            setTimeout(()=>{
                applyPiecieEffect(activatingPlayerKey,item.card);
                p.discard.push(item.card);
                localState.place = null;
                renderAll();
                syncState();
            }, 250);
    }
}
function returnPiecieToHand(index) {
  let localKey = 'p1';
  if (firebaseEnabled && myRole) localKey = myRole;
  else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  
  const p = localState.players[localKey];
  if (!p.piecies || p.piecies.length <= index) return;
  
  const item = p.piecies[index];
  if (item.active) {
      alert("Cannot return an active Piecie!");
      return;
  }

  // Check Cost (10 MP)
  if (p.mp < 10) {
      alert("Not enough MP! Returning a Piecie costs 10 MP.");
      return;
  }

  // Pay Cost
  let costRemaining = 10;
  for (let m of p.mosjes) {
      if ((m.mp || 0) >= costRemaining) {
          m.mp -= costRemaining;
          costRemaining = 0;
          break;
      } else {
          costRemaining -= (m.mp || 0);
          m.mp = 0;
      }
  }
  // Recalculate total MP
  p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
  popupMP(localKey, -10);
  
  // Remove from piecies
  p.piecies.splice(index, 1);
  
  // Add to hand
  p.hand.push(item.card);
  
  log(`${localKey} returned ${item.card.name} to hand (-10 MP)`);
  
  renderAll();
  syncState();
}

function activatePlaced(){
    // Legacy function, now we use per-card activation
    // But if called, activate the first one
    activatePiecie(0);
}
function applyPiecieEffect(turn,card){ const opp = turn==='p1'?'p2':'p1';
  
  // Advanced Logic Integration
  if (window.AdvancedLogic) {
    const context = {
        gameState: localState,
        popupMP: popupMP,
        log: log,
        checkLevelUp: checkLevelUp,
        renderAll: renderAll
    };
    if (window.AdvancedLogic.processCardEffect(turn, card, context)) {
        return; // Handled by advanced logic
    }
  }

  // Specific Handlers for Digital Equipment
  if (card.name === 'Keyboard') {
      const p = localState.players[turn];
      const digitalMosjes = p.mosjes.filter(m => m.type === 'Digital');
      
      if (digitalMosjes.length === 0) {
          log(`${turn} used Keyboard but has no Digital Mosje.`);
          return;
      }
      
      let target = digitalMosjes[0];
      if (digitalMosjes.length > 1) {
          const useFirst = confirm(`Target ${digitalMosjes[0].name}? (OK)\nOr ${digitalMosjes[1].name}? (Cancel)`);
          target = useFirst ? digitalMosjes[0] : digitalMosjes[1];
      }
      
      log(`${turn} targeted ${target.name} with Keyboard`);
      target.mp = (target.mp || 0) + 10;
      popupMP(turn, 10);
      
      // Draw 1
      if(p.deck.length) p.hand.push(p.deck.pop());
      log(`${turn} drew 1 card`);
      
      checkLevelUp(p, turn);
      return;
  }
  
  if (card.name === 'Mouse') {
      const p = localState.players[turn];
      const digitalMosjes = p.mosjes.filter(m => m.type === 'Digital');
      
      if (digitalMosjes.length === 0) {
          log(`${turn} used Mouse but has no Digital Mosje.`);
          return;
      }
      
      let target = digitalMosjes[0];
      if (digitalMosjes.length > 1) {
          const useFirst = confirm(`Target ${digitalMosjes[0].name}? (OK)\nOr ${digitalMosjes[1].name}? (Cancel)`);
          target = useFirst ? digitalMosjes[0] : digitalMosjes[1];
      }
      
      log(`${turn} targeted ${target.name} with Mouse`);
      target.mp = (target.mp || 0) + 10;
      popupMP(turn, 10);
      
      // Look at top 2
      if (p.deck.length > 0) {
          const count = Math.min(2, p.deck.length);
          const topCards = p.deck.slice(p.deck.length - count).reverse();
          localState.pendingSelection = {
              cards: topCards,
              count: 0,
              type: 'view_top',
              source: 'deck',
              remainingAction: 'top'
          };
          renderAll();
      }
      
      checkLevelUp(p, turn);
      return;
  }

  // Handle Larry / Zegeltje
  if (card.name === 'Larry / Zegeltje') {
      const roll = Math.floor(Math.random() * 6) + 1;
      log(`${turn} rolled ${roll} for Larry / Zegeltje`);
      
      const p = localState.players[turn];
      
      if (roll <= 2) {
          // 1-2: Lose 25 MP, Discard 1
          log(`Larry Result (1-2): Lose 25 MP and Discard 1`);
          
          // Lose 25 MP (Targeting)
          let target = p.mosjes[0];
          if (p.mosjes.length > 1) {
              const useFirst = confirm(`Larry Penalty: Lose 25 MP from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
              target = useFirst ? p.mosjes[0] : p.mosjes[1];
          }
          target.mp = (target.mp || 0) - 25;
          popupMP(turn, -25);
          
          // Discard 1
          localState.pendingDiscard = 1;
          setTimeout(() => alert("Larry Penalty: Please discard 1 card."), 100);
          
      } else if (roll <= 4) {
          // 3-4: Gain 20 MP
          log(`Larry Result (3-4): Gain 20 MP`);
          
          let target = p.mosjes[0];
          if (p.mosjes.length > 1) {
              const useFirst = confirm(`Larry Reward: Gain 20 MP for which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
              target = useFirst ? p.mosjes[0] : p.mosjes[1];
          }
          target.mp = (target.mp || 0) + 20;
          popupMP(turn, 20);
          
      } else {
          // 5-6: Gain 40 MP, Draw 2
          log(`Larry Result (5-6): Gain 40 MP and Draw 2`);
          
          let target = p.mosjes[0];
          if (p.mosjes.length > 1) {
              const useFirst = confirm(`Larry Reward: Gain 40 MP for which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
              target = useFirst ? p.mosjes[0] : p.mosjes[1];
          }
          target.mp = (target.mp || 0) + 40;
          popupMP(turn, 40);
          
          // Draw 2
          for(let i=0; i<2; i++) {
              if(p.deck.length) p.hand.push(p.deck.pop());
          }
          log(`${turn} drew 2 cards`);
      }
      
      // Update Team MP
      p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
      checkLevelUp(p, turn);
      renderAll();
      return;
  }

  // Handle Grammetje Pieter
  if (card.name === 'Grammetje Pieter') {
      const roll = Math.floor(Math.random() * 6) + 1;
      log(`${turn} rolled ${roll} for Grammetje Pieter`);
      const p = localState.players[turn];
      
      if (roll <= 3) {
          // 1-3: Lose 15 MP
          let target = p.mosjes[0];
          if (p.mosjes.length > 1) {
              const useFirst = confirm(`Grammetje Pieter (Rolled ${roll}): Lose 15 MP from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
              target = useFirst ? p.mosjes[0] : p.mosjes[1];
          }
          target.mp = (target.mp || 0) - 15;
          popupMP(turn, -15);
          log(`${turn} lost 15 MP (Grammetje Pieter)`);
      } else {
          // 4-6: Gain 30 MP
          let target = p.mosjes[0];
          if (p.mosjes.length > 1) {
              const useFirst = confirm(`Grammetje Pieter (Rolled ${roll}): Gain 30 MP for which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
              target = useFirst ? p.mosjes[0] : p.mosjes[1];
          }
          target.mp = (target.mp || 0) + 30;
          popupMP(turn, 30);
          log(`${turn} gained 30 MP (Grammetje Pieter)`);
      }
      p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
      checkLevelUp(p, turn);
      renderAll();
      return;
  }

  // Handle Te Hard Gaan (Explicit Handler)
  if (card.name === 'Te Hard Gaan') {
      const oppP = localState.players[opp];
      // Ensure action is tracked for quests like Speed Run
      if(!localState.turnActions) localState.turnActions = [];
      localState.turnActions.push('activate');
      if (oppP.activeEffects && oppP.activeEffects.includes('Afblijven!')) {
          log(`${opp} is immune to MP loss (Afblijven!)`);
      } else {
          let target = oppP.mosjes[0];
          if (oppP.mosjes.length > 1) {
              const useFirst = confirm(`Te Hard Gaan: Opponent loses 25 MP. Select Target:\nOK = ${oppP.mosjes[0].name}\nCancel = ${oppP.mosjes[1].name}`);
              target = useFirst ? oppP.mosjes[0] : oppP.mosjes[1];
          }
          target.mp = (target.mp || 0) - 25;
          oppP.mp = oppP.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
          // Record Damage for FF Haaltje Nemen
          localState.lastDamage = {
              player: opp,
              amount: 25,
              source: 'card',
              timestamp: Date.now(),
              mosjeIndex: oppP.mosjes.indexOf(target)
          };
          popupMP(opp, -25);
          log(`${turn} used Te Hard Gaan: ${opp} lost 25 MP (Target: ${target.name})`);
      }
      renderAll();
      return;
  }

  // Handle Warm Kannetje Melk
  if (card.name === 'Warm Kannetje Melk') {
      const p = localState.players[turn];
      let target = p.mosjes[0];
      if (p.mosjes.length > 1) {
          const useFirst = confirm(`Warm Kannetje Melk: Lose 10 MP from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
          target = useFirst ? p.mosjes[0] : p.mosjes[1];
      }
      
      // Deduct 10 MP (Prevent negative)
      let currentMp = target.mp || 0;
      let loss = 10;
      if (currentMp < 10) loss = currentMp; // Clamp to 0
      
      target.mp = currentMp - loss;
      p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
      popupMP(turn, -loss);
      
      // Draw 2
      for(let i=0; i<2; i++) {
          if(p.deck.length) p.hand.push(p.deck.pop());
      }
      
      log(`${turn} used Warm Kannetje Melk: Lost ${loss} MP, Drew 2 cards`);
      renderAll();
      return;
  }

  // Handle Affoe
  if (card.name === 'Affoe') {
      const p = localState.players[turn];
      const oppP = localState.players[opp];
      
      // Step 1: Damage Opponent (15 MP)
      if (oppP.mosjes && oppP.mosjes.length > 0) {
          if (oppP.activeEffects && oppP.activeEffects.includes('Afblijven!')) {
              log(`${opp} is immune to MP loss (Afblijven!)`);
          } else {
              let target = oppP.mosjes[0];
              if (oppP.mosjes.length > 1) {
                  const useFirst = confirm(`Affoe: Opponent loses 15 MP. Select Target:\nOK = ${oppP.mosjes[0].name}\nCancel = ${oppP.mosjes[1].name}`);
                  target = useFirst ? oppP.mosjes[0] : oppP.mosjes[1];
              }
              
              // Deduct 15 MP (Prevent negative)
              let currentMp = target.mp || 0;
              let loss = 15;
              
              // Handle Level Downgrade Logic if needed (reusing logic from Quest Failure if applicable, but usually card effects just drain MP)
              // Let's stick to simple drain clamped at 0 for now unless specified otherwise.
              if (currentMp < 15) loss = currentMp;
              
              target.mp = currentMp - loss;
              oppP.mp = oppP.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
              
              // Record Damage
              localState.lastDamage = {
                  player: opp,
                  amount: loss,
                  source: 'card',
                  timestamp: Date.now(),
                  mosjeIndex: oppP.mosjes.indexOf(target)
              };
              
              popupMP(opp, -loss);
              log(`${turn} used Affoe: ${opp} lost ${loss} MP (Target: ${target.name})`);
          }
      }
      
      // Step 2: Gain 10 MP
      let gain = 10;
      // Check for Synergy Field
      if (p.activeEffects && p.activeEffects.includes('Synergy Field')) {
          gain += 10;
          log('Synergy Field active: +10 MP bonus');
      }
      // Check for MP Amplifier
      if (p.activeEffects && p.activeEffects.includes('MP Amplifier')) {
          const baseGain = gain;
          gain = Math.ceil(gain * 1.5);
          log(`MP Amplifier active: +50% MP bonus (Base: ${baseGain} -> Amplified: ${gain})`);
          p.activeEffects = p.activeEffects.filter(e => e !== 'MP Amplifier');
      }

      let myTarget = p.mosjes[0];
      if (p.mosjes.length > 1) {
          const useFirst = confirm(`Affoe: Gain ${gain} MP for which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
          myTarget = useFirst ? p.mosjes[0] : p.mosjes[1];
      }
      
      myTarget.mp = (myTarget.mp || 0) + gain;
      p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
      popupMP(turn, gain);
      log(`${turn} gained ${gain} MP (Affoe)`);
      
      checkLevelUp(p, turn);
      renderAll();
      return;
  }

  // Handle Destroy Place
  if (card.effect === 'Destroy Place' || card.name === 'Slecht Gezet') {
      if (localState.sharedPlace) {
          const sp = localState.sharedPlace;
          // Discard to owner's discard
          if (sp.turn && localState.players[sp.turn]) {
              localState.players[sp.turn].discard.push(sp.card);
          }
          localState.sharedPlace = null;
          log(`${turn} destroyed Place: ${sp.card.name}`);
          
          // Alyssa Ability: Party Power (+15 MP when Place destroyed)
          const p = localState.players[turn];
          const hasAlyssa = p.mosjes.some(m => m.id === 'alyssa');
          if (hasAlyssa) {
              p.mp += 15;
              popupMP(turn, 15);
              log(`Alyssa Party Power: +15 MP`);
          }
          
      } else {
          log(`${turn} used Destroy Place but no Place was active.`);
      }
      renderAll();
      return;
  }

  if(card.effect.includes('Gain')){
    let m=parseInt(card.effect.match(/\d+/)||0);
    // Check for Synergy Field
    if (localState.players[turn].activeEffects && localState.players[turn].activeEffects.includes('Synergy Field')) {
        m += 10;
        log('Synergy Field active: +10 MP bonus');
    }
    // Check for MP Amplifier
    if (localState.players[turn].activeEffects && localState.players[turn].activeEffects.includes('MP Amplifier')) {
        const baseM = m;
        m = Math.ceil(m * 1.5);
        log(`MP Amplifier active: +50% MP bonus (Base: ${baseM} -> Amplified: ${m})`);
        // Remove MP Amplifier effect (it's one-time use for next gain)
        localState.players[turn].activeEffects = localState.players[turn].activeEffects.filter(e => e !== 'MP Amplifier');
    }



    // TARGETING LOGIC: If multiple Mosjes, ask which one to apply to
    let targetMosje = localState.players[turn].mosjes[0];
    if (localState.players[turn].mosjes.length > 1) {
        const m1 = localState.players[turn].mosjes[0];
        const m2 = localState.players[turn].mosjes[1];
        // Simple toggle for 2 mosjes
        const useFirst = confirm(`Target ${m1.name}? (OK)\nOr ${m2.name}? (Cancel)`);
        targetMosje = useFirst ? m1 : m2;
        log(`${turn} targeted ${targetMosje.name} with ${card.name}`);
    }

    // Update Individual MP
    const oldMp = targetMosje.mp || 0;
    targetMosje.mp = oldMp + m;

    // Update Team MP (Sum)
    localState.players[turn].mp = localState.players[turn].mosjes.reduce((sum, mos) => sum + (mos.mp || 0), 0);

    popupMP(turn,m); 
    log(`${turn} gained ${m} MP (Target: ${targetMosje.name}, MP: ${oldMp} -> ${targetMosje.mp})`);
    checkLevelUp(localState.players[turn], turn);
  } else if(card.effect.includes('Opponent')){
    const m=parseInt(card.effect.match(/\d+/)||0);
    if (localState.players[opp].activeEffects && localState.players[opp].activeEffects.includes('Afblijven!')) {
        log(`${opp} is immune to MP loss (Afblijven!)`);
    } else {
        // TARGETING LOGIC (Opponent Mosje)
        let targetMosje = localState.players[opp].mosjes[0];
        if (localState.players[opp].mosjes.length > 1) {
            const m1 = localState.players[opp].mosjes[0];
            const m2 = localState.players[opp].mosjes[1];
            const useFirst = confirm(`Select Opponent Mosje to lose ${m} MP:\nOK = ${m1.name}\nCancel = ${m2.name}`);
            targetMosje = useFirst ? m1 : m2;
        }
        
        let damage = m;
        // Handle ViannaPoes Protection
        if (localState.players[opp].activeEffects && localState.players[opp].activeEffects.includes('ViannaPoes')) {
            if (targetMosje && (targetMosje.name.includes('Cless') || targetMosje.name.includes('Hayabusa'))) {
                const originalDamage = damage;
                damage = Math.ceil(damage * 0.5);
                log(`ViannaPoes Protection: Reduced damage from ${originalDamage} to ${damage} MP for ${targetMosje.name}`);
            }
        }

        if (targetMosje) {
            const oldMp = targetMosje.mp || 0;
            targetMosje.mp = oldMp - damage;
            // Prevent negative MP? Or allow? Usually min 0.
            // if (targetMosje.mp < 0) targetMosje.mp = 0; 
            // Let's allow negative for now or clamp at 0? Game rules usually imply 0 floor.
            // But let's stick to simple subtraction.
            
            // Update Team MP
            localState.players[opp].mp = localState.players[opp].mosjes.reduce((sum, mos) => sum + (mos.mp || 0), 0);

            popupMP(opp,-damage); 
            log(`${opp} lost ${damage} MP (Target: ${targetMosje.name}, MP: ${oldMp} -> ${targetMosje.mp})`);
        }
    }
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
  if (firebaseEnabled && myRole) localKey = myRole;
  else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  localState.phase='quest'; log('Entered Quest Phase'); renderAll(); }
window.drawAndAttemptQuest = function() {
    let localKey = 'p1';
    if (firebaseEnabled && myRole) localKey = myRole;
    else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
    
    if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }

    if (localState.phase !== 'quest') { alert('Not in Quest Phase!'); return; }

    const playerState = localState.players[localKey];
    if (!playerState.activeQuest) {
        if (playerState.questAttempted) {
            alert('You can only attempt 1 quest per turn!');
            return;
        }
        // Step 1: Draw Quest
        const q = QUESTS[Math.floor(Math.random() * QUESTS.length)];
        playerState.activeQuest = q;
        log('Quest drawn: ' + q.name);
        renderAll();
        syncState();
    } else {
        // Step 2: Attempt Quest
        playerState.questAttempted = true;

        // Snoeiertje Logic: Deal 15 damage when attempting
        const p = playerState;
        const oppKey = localKey === 'p1' ? 'p2' : 'p1';
        const opp = localState.players[oppKey];
        if (p.activeEffects && p.activeEffects.includes('Snoeiertje')) {
             if (opp.activeEffects && opp.activeEffects.includes('Afblijven!')) {
                 log(`Snoeiertje blocked by Afblijven!`);
             } else {
                 // Target Opponent Mosje
                 let target = opp.mosjes[0];
                 if (opp.mosjes.length > 1) {
                     const useFirst = confirm(`Snoeiertje: Opponent loses 15 MP. Select Target:\nOK = ${opp.mosjes[0].name}\nCancel = ${opp.mosjes[1].name}`);
                     target = useFirst ? opp.mosjes[0] : opp.mosjes[1];
                 }
                 
                 let damage = 15;
                 // Handle ViannaPoes Protection
                 if (opp.activeEffects && opp.activeEffects.includes('ViannaPoes')) {
                     if (target && (target.name.includes('Cless') || target.name.includes('Hayabusa'))) {
                         const originalDamage = damage;
                         damage = Math.ceil(damage * 0.5);
                         log(`ViannaPoes Protection: Reduced Snoeiertje damage from ${originalDamage} to ${damage} MP for ${target.name}`);
                     }
                 }

                 const oldMp = target.mp || 0;
                 target.mp = oldMp - damage;
                 opp.mp = opp.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
                 popupMP(oppKey, -damage);
                 log(`Snoeiertje: Dealt ${damage} damage to ${oppKey} (Target: ${target.name}, MP: ${oldMp} -> ${target.mp})`);
             }
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        resolveQuest(roll);
    }
}

function drawQuest(){
  // Legacy / Unused
  if(window.drawAndAttemptQuest) window.drawAndAttemptQuest();
}
function rollForQuest(){
  // Legacy / Unused
  if(window.drawAndAttemptQuest) window.drawAndAttemptQuest();
}
function attemptQuest(){ if(window.drawAndAttemptQuest) window.drawAndAttemptQuest(); }
function checkLevelUp(player, turn, source = 'other') {
    // Check Individual Mosjes
    if (player.mosjes) {
        player.mosjes.forEach(m => {
            if ((m.mp || 0) >= 100) {
                if (source === 'quest') {
                    while ((m.mp || 0) >= 100) {
                        m.mp -= 100;
                        m.level = (m.level || 1) + 1;
                        log(`${turn}: ${m.name} leveled up to ${m.level}!`);
                        if (m.level >= 3) {
                            alert((turn === 'p1' ? 'You' : 'Opponent') + ' reached Level 3 with ' + m.name + ' — game over');
                        }
                    }
                } else {
                    m.mp = 100;
                    // log(`${turn}: ${m.name} MP capped at 100`);
                }
            }
        });
        // Recalculate Team MP just in case
        player.mp = player.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
    }
    
    // Legacy Check (if needed for fallback)
    /*
    if (player.mp >= 100) {
        // ...
    }
    */
}

function resolveQuest(initialRoll){
    const turn = localState.currentTurn;
    const p = localState.players[turn];
    // Alyssa Bulldozer: +10 MP on quest attempt
    if (p.mosjes && p.mosjes.some(m => m.abilityId === 'alyssa_bulldozer')) {
        // Find Alyssa Bulldozer
        let alyssa = p.mosjes.find(m => m.abilityId === 'alyssa_bulldozer');
        alyssa.mp = (alyssa.mp || 0) + 10;
        popupMP(turn, 10);
        log(`${turn} (Alyssa Bulldozer) Unstoppable: +10 MP for attempting quest`);
    }
    const q = localState.players[turn].activeQuest;
    if(!q){ alert('No active quest'); return; }
    
    let baseRoll = initialRoll;
    let roll = initialRoll;
  let bonus = 0;
  let bonusDesc = [];

  // Apply Quest Prep & Controller & NextQuestBonus
  if (p.activeEffects) {
      const prepCount = p.activeEffects.filter(e => e === 'Quest Prep').length;
      if (prepCount > 0) {
          const val = 2 * prepCount;
          bonus += val;
          bonusDesc.push(`Quest Prep x${prepCount} (+${val})`);
      }
      
      const controllerCount = p.activeEffects.filter(e => e === 'Controller').length;
      if (controllerCount > 0) {
          const val = 1 * controllerCount;
          bonus += val;
          bonusDesc.push(`Controller x${controllerCount} (+${val})`);
      }

      // Handle NextQuestBonus:X
      const bonusEffects = p.activeEffects.filter(e => e.startsWith('NextQuestBonus:'));
      bonusEffects.forEach(e => {
          const val = parseInt(e.split(':')[1]);
          bonus += val;
          bonusDesc.push(`Bonus (+${val})`);
      });
      // Remove consumed bonuses
      p.activeEffects = p.activeEffects.filter(e => !e.startsWith('NextQuestBonus:'));
  }

  roll += bonus;
  if (bonus > 0) {
      log(`Roll Base: ${baseRoll}. Modifiers: ${bonusDesc.join(', ')}. Total: ${roll}`);
  } else {
      log(`Roll: ${baseRoll} (No modifiers)`);
  }

  const getTrait = (t) => p.mosjes.reduce((acc, m) => acc + ((m && m.traits && m.traits[t]) || 0), 0);

  const checkSuccess = (currentRoll) => {
      let s = false;
      let m = '';
      const rollDisplay = bonus > 0 ? `${baseRoll}+${bonus}=${currentRoll}` : `${currentRoll}`;
      
      switch(q.type) {
        case 'roll_trait': {
          const t = q.req.trait;
          const lvl = getTrait(t);
          const target = q.params[lvl] || (lvl >= 3 ? q.params[3] : 6);
          s = currentRoll >= target;
          m = `Rolled ${rollDisplay} (Need ${target}+ with ${t} ${lvl})`;
          break;
        }
        case 'pay_roll': {
          if(p.mp >= q.params.cost) {
            p.mp -= q.params.cost;
            popupMP(turn, -q.params.cost);
            s = currentRoll >= q.params.target;
            m = `Paid ${q.params.cost} MP. Rolled ${rollDisplay} (Need ${q.params.target}+)`;
          } else {
            s = false;
            m = `Not enough MP to pay ${q.params.cost}`;
          }
          break;
        }
        case 'auto_trait': {
          const lvl = getTrait(q.params.trait);
          s = lvl >= q.params.min;
          m = `${q.params.trait} Level ${lvl} (Need ${q.params.min}+)`;
          break;
        }
        case 'condition': {
          const lvl = getTrait(q.params.trait);
          const mpOk = p.mp >= q.params.mp;
          s = (lvl >= q.params.traitMin) || mpOk;
          m = `Condition: ${q.params.trait} ${lvl} or MP ${p.mp} (Need ${q.params.traitMin}+ or ${q.params.mp}+)`;
          break;
        }
        case 'condition_piecies': {
          const lvl = getTrait(q.params.trait);
          const piecieCount = p.piecies.length;
          s = (lvl >= q.params.min) && (piecieCount >= q.params.piecies);
          m = `${q.params.trait} ${lvl} & ${piecieCount} Piecies (Need ${q.params.min}+ & ${q.params.piecies}+)`;
          break;
        }
        case 'condition_mp_low': {
          const lvl = getTrait(q.params.trait);
          s = (lvl >= q.params.min) || (p.mp < q.params.mpMax);
          m = `${q.params.trait} ${lvl} or MP < ${q.params.mpMax}`;
          break;
        }
        case 'simple_roll': {
          s = currentRoll >= q.params.target;
          m = `Rolled ${rollDisplay} (Need ${q.params.target}+)`;
          break;
        }
        case 'action_count': {
          const actions = localState.turnActions || [];
          const count = actions.filter(a => a === q.params.action).length;
          s = count >= q.params.count;
          m = `Performed ${q.params.action} ${count} times (Need ${q.params.count})`;
          break;
        }
        case 'unique_actions': {
          const actions = localState.turnActions || [];
          const unique = new Set(actions).size;
          s = unique >= q.params.count;
          m = `Unique actions: ${unique} (Need ${q.params.count})`;
          break;
        }
        case 'pay_or_trait': {
          const lvl = getTrait(q.params.trait);
          if (lvl >= q.params.min) {
              s = true;
              m = `${q.params.trait} Level ${lvl} (Need ${q.params.min}+)`;
          } else {
              // Check if any Mosje has enough MP to pay
              let payer = p.mosjes.find(m => (m.mp||0) >= q.params.cost);
              
              if (payer) {
                  // If multiple capable, ask which one
                  if (p.mosjes.filter(m => (m.mp||0) >= q.params.cost).length > 1) {
                      const useFirst = confirm(`Pay ${q.params.cost} MP for Quest from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
                      payer = useFirst ? p.mosjes[0] : p.mosjes[1];
                  }
                  
                  payer.mp -= q.params.cost;
                  p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
                  popupMP(turn, -q.params.cost);
                  s = true;
                  m = `Paid ${q.params.cost} MP from ${payer.name} (Trait too low)`;
              } else {
                  s = false;
                  m = `Trait too low & No Mosje has ${q.params.cost} MP`;
              }
          }
          break;
        }
        case 'discard_condition': {
           const lvl = getTrait(q.params.trait);
           if (lvl >= q.params.min && p.hand.length >= q.params.discard) {
               p.hand.splice(Math.floor(Math.random() * p.hand.length), 1);
               s = true;
               m = `Discarded card & ${q.params.trait} Level ${lvl}`;
           } else {
               s = false;
               m = `Need ${q.params.trait} ${q.params.min}+ & cards in hand`;
           }
           break;
        }
        case 'draw_condition': {
            const lvl = getTrait(q.params.trait);
            // Check if player has drawn 2+ cards this turn
            const actions = localState.turnActions || [];
            const drawCount = actions.filter(a => a === 'draw').length;
            
            if (lvl >= q.params.min || drawCount >= 2) {
                s = true;
                m = `Success: ${q.params.trait} Level ${lvl} OR Drawn ${drawCount} cards (Need 2+)`;
            } else {
                s = false;
                m = `Need ${q.params.trait} ${q.params.min}+ OR Draw 2+ cards (Drawn: ${drawCount})`;
            }
            break;
        }
        case 'reveal_check': {
            if (p.deck.length >= q.params.count) {
                const revealed = p.deck.slice(0, q.params.count);
                const counts = {};
                revealed.forEach(c => counts[c.name] = (counts[c.name] || 0) + 1);
                const maxMatch = Math.max(...Object.values(counts));
                s = maxMatch >= q.params.match;
                m = `Revealed ${q.params.count}, Max match: ${maxMatch} (Need ${q.params.match})`;
            } else {
                s = false;
                m = `Not enough cards to reveal`;
            }
            break;
        }
        case 'look_deck': {
            const lvl = getTrait(q.params.trait);
            if (lvl >= q.params.min) {
                s = true;
                m = `${q.params.trait} Level ${lvl}. Looked at top 5 (simulated)`;
                const top5 = p.deck.slice(0, q.params.count).map(c=>c.name).join(', ');
                log(`Top 5 cards: ${top5}`);
            } else {
                s = false;
                m = `Need ${q.params.trait} ${q.params.min}+`;
            }
            break;
        }
        default:
          s = currentRoll >= 4;
          m = `Standard Roll ${rollDisplay} (Need 4+)`;
      }
      return { s, m };
  };

  let result = checkSuccess(roll);
  success = result.s;
  msg = result.m;

  // Handle TweedeKANs (Reroll on failure)
  if (!success && p.activeEffects && p.activeEffects.includes('TweedeKANs')) {
      const rollingTypes = ['roll_trait', 'pay_roll', 'simple_roll'];
      if (rollingTypes.includes(q.type)) {
          if (q.type === 'pay_roll') {
             p.mp += q.params.cost; // Refund for retry
             popupMP(turn, q.params.cost);
             log(`TweedeKANs: Rerolling (Cost refunded for retry)`);
          } else {
             log(`TweedeKANs: Rerolling...`);
          }

          const newRoll = Math.floor(Math.random() * 6) + 1;
          let finalNewRoll = newRoll;
          
          if (p.activeEffects) {
              const prepCount = p.activeEffects.filter(e => e === 'Quest Prep').length;
              if (prepCount > 0) {
                  finalNewRoll += (2 * prepCount);
              }
              const controllerCount = p.activeEffects.filter(e => e === 'Controller').length;
              if (controllerCount > 0) {
                  finalNewRoll += (1 * controllerCount);
              }
          }
          
          result = checkSuccess(finalNewRoll);
          success = result.s;
          msg = result.m + ` (Rerolled)`;
          roll = finalNewRoll;
      }
  }

  // Handle Lucky Cóin (Hand) - Reroll on failure
  if (!success) {
      const luckyCoinIdx = p.hand.findIndex(c => c.name === 'Lucky Cóin');
      if (luckyCoinIdx !== -1) {
           const coinCard = p.hand[luckyCoinIdx];
           const cost = coinCard.cost || 0;
           // Check if it's a rolling quest
           const rollingTypes = ['roll_trait', 'pay_roll', 'simple_roll'];
           
           if (rollingTypes.includes(q.type) && p.mp >= cost) {
               if (confirm(`Quest Failed! Play Lucky Cóin (Cost: ${cost}) to reroll?`)) {
                   // Pay Cost
                   p.mp -= cost;
                   popupMP(turn, -cost);
                   
                   // Discard
                   p.hand.splice(luckyCoinIdx, 1);
                   p.discard.push(coinCard);
                   log(`${turn} played Lucky Cóin from hand to reroll!`);
                   
                   if (q.type === 'pay_roll') {
                       // Refund the previous attempt so checkSuccess can pay again
                       p.mp += q.params.cost;
                       popupMP(turn, q.params.cost);
                   }

                   const newRoll = Math.floor(Math.random() * 6) + 1;
                   let finalNewRoll = newRoll;
                   
                   // Re-apply persistent bonuses
                   if (p.activeEffects) {
                        const prepCount = p.activeEffects.filter(e => e === 'Quest Prep').length;
                        if (prepCount > 0) finalNewRoll += (2 * prepCount);
                        
                        const controllerCount = p.activeEffects.filter(e => e === 'Controller').length;
                        if (controllerCount > 0) finalNewRoll += (1 * controllerCount);
                   }
                   
                   log(`Lucky Cóin Reroll: ${newRoll} -> ${finalNewRoll}`);
                   
                   const result = checkSuccess(finalNewRoll);
                   success = result.s;
                   msg = result.m + ` (Lucky Cóin Reroll)`;
                   roll = finalNewRoll;
               }
           }
      }
  }

  let change = success ? q.success : q.failure;
  
  if (localState.sharedPlace && localState.sharedPlace.card.name === 'Obby 1') {
      change += 15;
      msg += ' (Obby 1 Bonus)';
  } 
  
  // Handle Afblijven! (Immune to MP loss)
  let finalChange = change;
  if (finalChange < 0 && p.activeEffects && p.activeEffects.includes('Afblijven!')) {
      log(`Afblijven! active: Prevented ${Math.abs(finalChange)} MP loss`);
      finalChange = 0;
  }

  // Handle NextQuestBonus (Momentum Boost)
  if (success && finalChange > 0 && p.activeEffects) {
      const bonusEffects = p.activeEffects.filter(e => e.startsWith('NextQuestBonus:'));
      bonusEffects.forEach(e => {
          const bonus = parseInt(e.split(':')[1]);
          finalChange += bonus;
          log(`Momentum Boost Bonus: +${bonus} MP`);
      });
      // Remove consumed bonuses
      p.activeEffects = p.activeEffects.filter(e => !e.startsWith('NextQuestBonus:'));
  }

  // --- UNIQUE ABILITY HOOKS (Quest Resolution) ---
  if (success && finalChange > 0) {
      p.mosjes.forEach(m => {
          // Jeffrey: Brute Force (+10 MP)
          if (m.abilityId === 'jeffrey_passive') {
              finalChange += 10;
              log(`${turn} (Jeffrey) Brute Force: +10 MP`);
          }
          
          // Michelle: Tough Gamble (Roll for multiplier)
          if (m.abilityId === 'michelle_passive') {
              const gambleRoll = Math.floor(Math.random() * 6) + 1;
              log(`${turn} (Michelle) Tough Gamble Roll: ${gambleRoll}`);
              if (gambleRoll <= 3) {
                  const oldChange = finalChange;
                  finalChange = Math.floor(finalChange / 2);
                  log(`Tough Gamble (1-3): Halved Reward (${oldChange} -> ${finalChange})`);
              } else {
                  const oldChange = finalChange;
                  finalChange = finalChange * 2;
                  log(`Tough Gamble (4-6): Doubled Reward (${oldChange} -> ${finalChange})`);
              }
          }
      });
  }
  // --- END HOOKS ---

  // Handle Snoeiertje Self-Damage (End of Quest)
  if (p.activeEffects && p.activeEffects.includes('Snoeiertje')) {
      log(`Snoeiertje active: You lose 15 MP`);
      let selfTarget = p.mosjes[0];
      if (p.mosjes.length > 1) {
          const useFirst = confirm(`Snoeiertje Self-Damage (15 MP). Select Mosje:\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
          selfTarget = useFirst ? p.mosjes[0] : p.mosjes[1];
      }
      // Prevent negative MP
      let newMp = (selfTarget.mp || 0) - 15;
      if (newMp < 0) newMp = 0;
      selfTarget.mp = newMp;

      p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
      popupMP(turn, -15);
  }

  // TARGETING LOGIC for Quest Result
  let targetMosje = p.mosjes[0];
  let targetMosjeIndex = 0;
  if (p.mosjes.length > 1) {
      const m1 = p.mosjes[0];
      const m2 = p.mosjes[1];
      const action = finalChange >= 0 ? 'Gain' : 'Lose';
      const useFirst = confirm(`Quest Result (${action} ${Math.abs(finalChange)} MP). Select Mosje:\nOK = ${m1.name}\nCancel = ${m2.name}`);
      targetMosje = useFirst ? m1 : m2;
      targetMosjeIndex = useFirst ? 0 : 1;
  }

  // Handle ViannaPoes Protection
  if (finalChange < 0 && p.activeEffects && p.activeEffects.includes('ViannaPoes')) {
      if (targetMosje && (targetMosje.name.includes('Cless') || targetMosje.name.includes('Hayabusa'))) {
          const reduction = Math.floor(Math.abs(finalChange) * 0.5);
          finalChange += reduction; // Reduce the loss (add positive to negative)
          log(`ViannaPoes Protection: Reduced damage by ${reduction} MP for ${targetMosje.name}`);
      }
  }

  // Store damage info for FF Haaltje Nemen
  if (finalChange < 0) {
      localState.lastDamage = {
          player: turn,
          amount: Math.abs(finalChange),
          source: 'quest',
          timestamp: Date.now(),
          mosjeIndex: targetMosjeIndex
      };
      // Alyssa Bulldozer: Track MP lost this turn
      if (!p._alyssaBulldozerLoss) p._alyssaBulldozerLoss = 0;
      // Only count if Alyssa is the target
      if (p.mosjes[targetMosjeIndex] && p.mosjes[targetMosjeIndex].abilityId === 'alyssa_bulldozer') {
          p._alyssaBulldozerLoss += Math.abs(finalChange);
      }
  } else {
      localState.lastDamage = null;
  }

  // Check for NextQuestBonus:10:choose effect
  let bonusApplied = false;
  if (p.activeEffects) {
    const idx = p.activeEffects.findIndex(e => e.startsWith('NextQuestBonus:10:choose'));
    if (idx !== -1 && finalChange > 0) {
      // Let player pick which Mosje gets +10 MP
      let bonusTarget = p.mosjes[0];
      if (p.mosjes.length > 1) {
        const m1 = p.mosjes[0];
        const m2 = p.mosjes[1];
        const useFirst = confirm(`Momentum Boost: Next Quest! Add 10 MP to which Mosje?\nOK = ${m1.name}\nCancel = ${m2.name}`);
        bonusTarget = useFirst ? m1 : m2;
      }
      bonusTarget.mp = (bonusTarget.mp || 0) + 10;
      log(`${turn} (Momentum Boost): Added 10 MP to ${bonusTarget.name} (MP: ${(bonusTarget.mp - 10)} -> ${bonusTarget.mp})`);
      popupMP(turn, 10);
      p.activeEffects.splice(idx, 1);
      bonusApplied = true;
    }
  }
  if (targetMosje) {
      if (finalChange < 0) {
          const damage = Math.abs(finalChange);
          let mVal = targetMosje.mp || 0;
          let mLvl = targetMosje.level || 1;
          
          if (damage > mVal) {
              if (mLvl > 1) {
                  mLvl--;
                  mVal += 100; // Refund level cost
                  mVal -= damage;
                  log(`${targetMosje.name} downgraded to Level ${mLvl} to absorb damage!`);
              } else {
                  mVal = 0;
              }
          } else {
              mVal -= damage;
          }
          if (mVal < 0) mVal = 0;
          
          targetMosje.mp = mVal;
          targetMosje.level = mLvl;
      } else {
          targetMosje.mp = (targetMosje.mp || 0) + finalChange;
      }
  }
  
  // Update Team MP
  p.mp = p.mosjes.reduce((sum, mos) => sum + (mos.mp || 0), 0);

  popupMP(turn, finalChange); 
  log(`${turn} ${success ? 'succeeded' : 'failed'} quest (${q.name}): ${msg}. Change: ${finalChange} (Target: ${targetMosje ? targetMosje.name : 'Team'})`); 
    localState.players[turn].activeQuest = null;
  checkLevelUp(p, turn, 'quest'); 
  renderAll(); 
  syncState();
}
function checkTurnStartAbilities(playerKey) {
    const player = localState.players[playerKey];
    
    // Reset Ability Usage
    player.mosjes.forEach(m => m.abilityUsedThisTurn = false);
    renderAll(); // Ensure UI updates after reset
    
    player.mosjes.forEach(m => {
        if (m.abilityId === 'dj_passive') {
            // DJ 80/20: Gain 10 MP
            player.mp += 10;
            popupMP(playerKey, 10);
            log(`${playerKey} (DJ 80/20) Turn Start: Gained 10 MP`);
        }
        if (m.abilityId === 'coert_luck_passive') {
            // Coert Luck: Roll 4-6 = Free Piecie
            const roll = Math.floor(Math.random() * 6) + 1;
            log(`${playerKey} (Coert Luck) rolled ${roll} for Morning Luck`);
            if (roll >= 4) {
                // Grant Free Piecie Effect
                if (!player.activeEffects) player.activeEffects = [];
                player.activeEffects.push('CoertLuckFreePiecie');
                log(`${playerKey} (Coert Luck) Success! Next Piecie this turn is free.`);
            }
        }
    });
}

function checkTurnEndAbilities(playerKey) {
    const player = localState.players[playerKey];
    
    player.mosjes.forEach(m => {
        if (m.abilityId === 'cless_passive') {
            // AZN Cless: Risk & Reward
            const roll = Math.floor(Math.random() * 6) + 1;
            log(`${playerKey} (AZN Cless) End Turn Risk & Reward Roll: ${roll}`);
            
            if (roll === 1) {
                // Discard 1
                if (player.hand.length > 0) {
                    const rIdx = Math.floor(Math.random() * player.hand.length);
                    const disc = player.hand.splice(rIdx, 1)[0];
                    player.discard.push(disc);
                    log(`${playerKey} (AZN Cless) Rolled 1: Discarded ${disc.name}`);
                }
            } else if (roll === 6) {
                // Draw 2 + Gain 10 MP
                if (player.deck.length > 0) player.hand.push(player.deck.pop());
                if (player.deck.length > 0) player.hand.push(player.deck.pop());
                player.mp += 10;
                popupMP(playerKey, 10);
                log(`${playerKey} (AZN Cless) Rolled 6: Jackpot! Draw 2 + 10 MP`);
            } else {
                log(`${playerKey} (AZN Cless) Rolled ${roll}: No effect.`);
            }
        }
    });
}

function endTurn(){
    // Alyssa Bulldozer: Regain 25 MP if lost 30+ MP this turn
    ['p1','p2'].forEach(pid => {
        const p = localState.players[pid];
        if (p && p.mosjes && p.mosjes.some(m => m.abilityId === 'alyssa_bulldozer')) {
            if (p._alyssaBulldozerLoss && p._alyssaBulldozerLoss >= 30) {
                let alyssa = p.mosjes.find(m => m.abilityId === 'alyssa_bulldozer');
                alyssa.mp = (alyssa.mp || 0) + 25;
                popupMP(pid, 25);
                log(`${pid} (Alyssa Bulldozer) Unstoppable: Regained 25 MP for losing 30+ MP this turn`);
            }
            p._alyssaBulldozerLoss = 0;
        }
    });
  let localKey = 'p1';
  if (firebaseEnabled && myRole) localKey = myRole;
  else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
  
  if (localState.currentTurn !== localKey) { alert('Not your turn!'); return; }
  
    // Reset Quest Attempted flag and active quests for new turn
    localState.players.p1.questAttempted = false;
    localState.players.p2.questAttempted = false;
    localState.players.p1.activeQuest = null;
    localState.players.p2.activeQuest = null;
    // Reset Ronald reveal/draw usage for both players
    localState.players.p1._ronaldRevealUsedThisTurn = false;
    localState.players.p2._ronaldRevealUsedThisTurn = false;
  
  // Reset MP Amplifier if unused (optional, but good practice if it's turn-based)
  // Actually, MP Amplifier is "Next MP gain", so it might persist.
  // But usually effects clear at end of turn unless duration.
  // Let's keep it persistent until used or maybe clear it?
  // The card says "Next MP gain", implying it could be next turn.
  // But let's leave it for now.

  // Cleanup effects for ENDING player
  const endingPlayer = localState.players[localState.currentTurn];
  
  // Trigger End Turn Abilities (e.g. AZN Cless)
  checkTurnEndAbilities(localState.currentTurn);
  
  // Process Duration Effects
  if (endingPlayer.durationEffects) {
      endingPlayer.durationEffects.forEach(eff => {
          eff.duration--;
          // Handle Reversion for expired effects
          if (eff.duration <= 0 && eff.revertAmount) {
              endingPlayer.mp -= eff.revertAmount; // Revert the gain/loss
              popupMP(localState.currentTurn, -eff.revertAmount);
              log(`${localState.currentTurn} effect ${eff.name} expired. Reverted ${eff.revertAmount} MP.`);
          }
      });
      endingPlayer.durationEffects = endingPlayer.durationEffects.filter(eff => eff.duration > 0);
      
      // Rebuild activeEffects
      endingPlayer.activeEffects = endingPlayer.durationEffects.map(eff => eff.name);
  } else {
      endingPlayer.activeEffects = [];
  }

  // Handle Piecies cleanup (only discard if effect expired)
  if (endingPlayer.piecies) {
      const keptPiecies = [];
      endingPlayer.piecies.forEach(item => {
          if (item.active) {
              // Check if effect is still active
              if (endingPlayer.activeEffects && endingPlayer.activeEffects.includes(item.card.name)) {
                  keptPiecies.push(item); // Keep it
              } else {
                  endingPlayer.discard.push(item.card); // Discard it
              }
          } else {
              keptPiecies.push(item);
          }
      });
      endingPlayer.piecies = keptPiecies;
  }

    localState.currentTurn = localState.currentTurn==='p1'?'p2':'p1'; localState.phase='draw';
        // Ensure new turn allows quest draw for both players
        localState.players.p1.questAttempted = false;
        localState.players.p2.questAttempted = false;
  
  // Start of Turn Logic for NEW player
  const cur = localState.currentTurn; 
  
  // Trigger Start Turn Abilities (e.g. DJ 80/20, Coert Luck)
  checkTurnStartAbilities(cur);

  const newPlayer = localState.players[cur];
  newPlayer.canDraw = true;
  localState.turnActions = []; // Reset actions for new turn
  
  // Kleine Taks Damage (Opponent of the current player has Kleine Taks active?)
  // No, Kleine Taks is played BY a player ON the opponent.
  // If P1 plays Kleine Taks, it's in P1's activeEffects (as a duration item).
  // The effect is "Opponent loses 10 MP/turn".
  // So at the start of P2's turn (or end of P1's turn?), P2 should lose MP.
  // Let's do it at start of turn.
  
  const opponentKey = cur === 'p1' ? 'p2' : 'p1';
  const opponentPlayer = localState.players[opponentKey];
  
  if (opponentPlayer.activeEffects && opponentPlayer.activeEffects.includes('Kleine Taks')) {
      // Wait, if P1 plays it, it's in P1's activeEffects.
      // So we check if OPPONENT (the one who played it) has it active.
      // If P1 has Kleine Taks active, P2 loses MP.
      // So if current turn is P2, check if P1 has Kleine Taks.
  }
  
  // Correct Logic: Check if the OTHER player has Kleine Taks active.
  // Actually, Kleine Taks is applied to the VICTIM's durationEffects.
  // So we just check if the current player (newPlayer) has it.
  
  if (newPlayer.durationEffects) {
      const taks = newPlayer.durationEffects.find(e => e.name === 'Kleine Taks');
      if (taks) {
          // Check for immunity
          if (newPlayer.activeEffects && newPlayer.activeEffects.includes('Afblijven!')) {
              log(`Kleine Taks blocked by Afblijven!`);
          } else {
              // Target a Mosje (First one with MP > 0)
              let target = newPlayer.mosjes.find(m => (m.mp||0) > 0);
              if (!target && newPlayer.mosjes.length > 0) target = newPlayer.mosjes[0]; // Fallback
              
              if (target) {
                  target.mp = (target.mp || 0) - 10;
                  // Update Team MP
                  newPlayer.mp = newPlayer.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
                  
                  popupMP(cur, -10);
                  log(`Kleine Taks: ${cur} lost 10 MP from ${target.name} (${taks.duration} turns left)`);
              }
          }
      }
  }

  log('Turn switched to '+localState.currentTurn);
  renderAll(); 
}

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
        // Cleanup effects for the player ending their turn
        const endingPlayerKey = localState.currentTurn;
        const endingPlayer = localState.players[endingPlayerKey];
        
        // Remove active duration cards
        if (endingPlayer.piecies) {
            const keptPiecies = [];
            endingPlayer.piecies.forEach(item => {
                if (item.active) {
                    endingPlayer.discard.push(item.card);
                    log(`${endingPlayerKey} discarded active card: ${item.card.name}`);
                } else {
                    keptPiecies.push(item);
                }
            });
            endingPlayer.piecies = keptPiecies;
        }
        // Clear active effects list
        endingPlayer.activeEffects = [];

        localState.currentTurn = localState.currentTurn === 'p1' ? 'p2' : 'p1';
        localState.phase = 'draw';
        localState.turnCounter++;
        localState.turnActions = []; // Reset actions for new turn
        // Reset draw allowance for the new active player
        const newPlayer = localState.players[localState.currentTurn];
        newPlayer.canDraw = true;
        newPlayer.extraDraws = 0; // Also reset extra draws
        
        // Apply Place Effects
        if (localState.sharedPlace) {
            const spCard = localState.sharedPlace.card;
            if (spCard.name === 'The Gym') {
                // Fighting gain 25 MP/turn
                const hasFighting = newPlayer.mosjes.some(m => m.type === 'Fighting');
                if (hasFighting) {
                    newPlayer.mp += 25;
                    popupMP(localState.currentTurn, 25);
                    log(`The Gym: ${localState.currentTurn} gained 25 MP (Fighting Mosje)`);
                }
            } else if (spCard.name === 'Obby 1') {
                // All lose 10 MP/turn
                newPlayer.mp -= 10;
                popupMP(localState.currentTurn, -10);
                log(`Obby 1: ${localState.currentTurn} lost 10 MP`);
            }
        }

        log(`Turn ${localState.turnCounter} started for ${localState.currentTurn}. Phase: Draw.`);
    }
    renderAll();
    syncState();
}

function activateMosjeAbility(mosjeIndex) {
    const myId = localState.myId;
    if (localState.currentTurn !== myId) { alert("Not your turn!"); return; }
    
    const player = localState.players[myId];
    const mosje = player.mosjes[mosjeIndex];
    
    if (!mosje.abilityId) return;
    if (mosje.abilityUsedThisTurn) { alert("Ability already used this turn!"); return; }
    
    // Specific Ability Logic
    let success = false;
    
    switch (mosje.abilityId) {
        case 'martin_active': // Calculated Guess
            const type = prompt("Guess top card type of Opponent's deck:\n(Fighting, Digital, Artistic, Piecie, Quest)");
            if (!type) return;
            
            // Check Opponent Deck
            const oppId = myId === 'p1' ? 'p2' : 'p1';
            const opp = localState.players[oppId];
            if (opp.deck.length === 0) { alert("Opponent deck empty!"); return; }
            
            const topCard = opp.deck[opp.deck.length - 1]; // Peek
            const actualType = topCard.type || 'Piecie'; // Piecies might not have type property in deck?
            // Actually Piecies in STARTER_DECKS don't have 'type' property explicitly, but they are in 'piecies' array.
            // Mosjes have 'type'.
            // Let's assume if it has 'cost', it's a Piecie.
            let checkType = actualType;
            if (topCard.cost !== undefined) checkType = 'Piecie';
            
            alert(`Top card was: ${topCard.name} (${checkType})`);
            
            if (checkType.toLowerCase() === type.toLowerCase()) {
                // Correct
                player.hand.push(player.deck.pop());
                player.hand.push(player.deck.pop()); // Draw 2
                player.mp += 10;
                popupMP(myId, 10);
                log(`${myId} (Martin) guessed CORRECTLY! Drew 2 cards + 10 MP.`);
            } else {
                // Wrong
                player.mp -= 10;
                popupMP(myId, -10);
                log(`${myId} (Martin) guessed WRONG. Lost 10 MP.`);
            }
            success = true;
            break;
            
        case 'coert_tech_active': // Extra Resources
            if (player.mp < 10) { alert("Not enough MP (Need 10)"); return; }
            if (player.deck.length === 0) { alert("Deck empty"); return; }
            
            player.mp -= 10;
            popupMP(myId, -10);
            player.hand.push(player.deck.pop());
            log(`${myId} (Coert) used Extra Resources: Paid 10 MP, Drew 1 card.`);
            success = true;
            break;
            
        case 'youri_active': // Speedrunner: select Piecie from hand, Place+Activate, then draw 1
            if (player.mp < 20) { alert("Not enough MP (Need 20)"); return; }
            if ((mosje.abilityUseCount || 0) >= 3) { alert("Max 3 uses per game!"); return; }
            // Find Piecies in hand
            const handPiecies = player.hand.map((c, i) => (c.cost !== undefined ? {card: c, idx: i} : null)).filter(x => x);
            if (handPiecies.length === 0) { alert("No Piecie in hand to activate!"); return; }
            let msg = 'Select Piecie to Speed Activate (from hand):\n';
            handPiecies.forEach((p, i) => { msg += `${i+1}: ${p.card.name}\n`; });
            const choice = prompt(msg);
            const handIdx = parseInt(choice) - 1;
            if (handPiecies[handIdx]) {
                player.mp -= 20;
                popupMP(myId, -20);
                mosje.abilityUseCount = (mosje.abilityUseCount || 0) + 1;
                // Remove from hand, add to piecies (placed)
                const piecieCard = player.hand.splice(handPiecies[handIdx].idx, 1)[0];
                player.piecies.push({card: piecieCard, active: false});
                // Activate immediately (last index)
                activatePiecie(player.piecies.length - 1);
                // Draw 1 card
                if (player.deck.length > 0) player.hand.push(player.deck.pop());
                log(`${myId} (Youri) Speedrunner: Placed and activated ${piecieCard.name} from hand, drew 1 card. (Uses: ${mosje.abilityUseCount}/3)`);
                success = true;
            } else {
                alert("Invalid selection");
            }
            break;
            
        case 'chris_active': // Perfect Setup
            // Req: 3+ face-down piecies
            const faceDownCount = player.piecies.filter(p => !p.active).length;
            if (faceDownCount < 3) { alert("Need 3+ face-down Piecies!"); return; }
            
            const cChoice = prompt(`Enter index of Piecie to Activate Free (1-${player.piecies.length}):`);
            const cIdx = parseInt(cChoice) - 1;
            
            if (player.piecies[cIdx] && !player.piecies[cIdx].active) {
                // Activate for free (refund cost if activatePiecie charges it? activatePiecie usually checks cost)
                // We need to bypass cost or refund it.
                // activatePiecie checks MP.
                // Let's give temporary MP or flag it?
                // Easier: Just add the MP cost of the card to player before activating, effectively making it free.
                const pCard = player.piecies[cIdx].card;
                const cost = pCard.cost || 0;
                player.mp += cost; // Pre-fund
                
                activatePiecie(cIdx);
                
                player.mp += 15; // Bonus
                popupMP(myId, 15);
                log(`${myId} (Chris) Perfect Setup: Activated ${pCard.name} free + 15 MP`);
                success = true;
            }
            break;
            
        case 'binti_active': // Cutting Words
            // Cost: Discard 1 Piecie from hand
            const pieciesInHand = player.hand.map((c, i) => (c.cost !== undefined ? i : -1)).filter(i => i !== -1);
            if (pieciesInHand.length === 0) { alert("No Piecie in hand to discard!"); return; }
            
            const bChoice = prompt(`Discard which Piecie? (Enter Hand Index 1-${player.hand.length})`);
            const bIdx = parseInt(bChoice) - 1;
            
            if (player.hand[bIdx] && player.hand[bIdx].cost !== undefined) {
                const discarded = player.hand.splice(bIdx, 1)[0];
                player.discard.push(discarded);
                
                // Opponent Effect
                const oppId = myId === 'p1' ? 'p2' : 'p1';
                const opp = localState.players[oppId];
                
                // Opponent discards random
                if (opp.hand.length > 0) {
                    const rIdx = Math.floor(Math.random() * opp.hand.length);
                    const oppDiscard = opp.hand.splice(rIdx, 1)[0];
                    opp.discard.push(oppDiscard);
                    log(`${myId} (Binti) forced ${oppId} to discard ${oppDiscard.name}`);
                }
                
                opp.mp -= 10;
                popupMP(oppId, -10);
                log(`${myId} (Binti) used Cutting Words!`);
                success = true;
            } else {
                alert("Invalid selection or not a Piecie");
            }
            break;
            
        case 'alyssa_bulldozer':
            // Unstoppable: Draw 2, choose 1, discard 1
            if (player.deck.length < 2) { alert("Not enough cards in deck!"); return; }
            const drawn = [player.deck.pop(), player.deck.pop()];
            // Show both cards to player and ask which to keep
            var alyssaMsg = `Alyssa Unstoppable: Choose a card to KEEP (1 or 2):\n1: ${drawn[0].name}\n2: ${drawn[1].name}`;
            const alyssaChoice = prompt(alyssaMsg);
            let keepIdx = parseInt(alyssaChoice) === 2 ? 1 : 0;
            let discardIdx = keepIdx === 0 ? 1 : 0;
            player.hand.push(drawn[keepIdx]);
            player.discard.push(drawn[discardIdx]);
            log(`${myId} (Alyssa Bulldozer) drew 2, kept ${drawn[keepIdx].name}, discarded ${drawn[discardIdx].name}`);
            success = true;
            break;
        default:
            alert("This ability is Passive (Automatic)");
            return;
    }
    
    if (success) {
        mosje.abilityUsedThisTurn = true;
        renderAll();
        syncState();
    }
}

function renderAll(){
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
  // document.getElementById('turnIndicator').textContent = myTurn ? "Your Turn" : "Opponent's Turn";
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

  // document.getElementById('turnCount').textContent = localState.turnCounter;

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
    progressBtn.disabled = !isMyTurn || isDiscarding;
    if (isDiscarding) {
        progressBtn.textContent = `Discard ${localState.pendingDiscard} card(s)`;
    }
  }

  function renderMosjeCard(pdata, containerEl){
    if (!containerEl) return; // Guard clause
    const isMyContainer = containerEl.id === 'myMosjes';
    containerEl.innerHTML = ''; // Clear previous content
    if(!pdata || !pdata.mosjes) return;
    
    // Render up to 2 slots
    for (let i = 0; i < 2; i++) {
        if (i < pdata.mosjes.length) {
            const m = pdata.mosjes[i];
            const mosjeDiv = document.createElement('div');
            mosjeDiv.className = 'mosje-card';
            
                        // Image Mapping with alternation
                        let bgImage = 'Visuals/dj.png'; // Default
                        // Static variable to alternate images
                        if (!window._mosjeAltState) window._mosjeAltState = {};
                        // Toggle state for each render
                        window._mosjeAltState[m.id] = !window._mosjeAltState[m.id];

                        if (m.id === 'michelle') {
                                bgImage = window._mosjeAltState[m.id]
                                    ? 'Visuals/Michelle-Iron-Tuk2.jpeg'
                                    : 'Visuals/Michelle-Iron-Tuk-Alt.jpeg.jpg';
                        }
                        else if (m.id === 'binti') {
                                bgImage = window._mosjeAltState[m.id]
                                    ? 'Visuals/binti-the-sharp-tongue.jpg'
                                    : 'Visuals/binti-the-sharp-tongue-ALT.jpg';
                        }
                        else if (m.id === 'alyssa_bulldozer') bgImage = 'Visuals/Alyssa The Bulldozer.png';
                        else if (m.id === 'gandoe') bgImage = 'Visuals/gandoe-the-destroyer.jpg';
                        else if (m.id === 'jisca') bgImage = 'Visuals/Jisca The Maestro.png';
                        else if (m.id === 'jeffrey') bgImage = 'Visuals/Jeffrey-The-Strongman.JPG';
                        else if (m.id === 'coert_tech') bgImage = 'Visuals/coert-hawaiian-tech-savant.jpg';
                        else if (m.id === 'ronald') bgImage = 'Visuals/Ronald The Master Chef.png';
                        else if (m.id === 'dj') bgImage = 'Visuals/dj.png';
                        else if (m.id === 'cless_teacher') bgImage = 'Visuals/Cless Teacher.jpg';
                        else if (m.id === 'coert_luck') {
                                bgImage = window._mosjeAltState[m.id]
                                    ? 'Visuals/Coert Kasteluck.jpeg'
                                    : 'Visuals/Coert Kasteluck-ALT.jpeg.jpg';
                        }
                        else if (m.id === 'alyssa') bgImage = 'Visuals/alyssa-fissa.jpg';
                        else if (m.id === 'west') bgImage = 'Visuals/Martin senor West.jpeg';
                        else if (m.id === 'chris') {
                                bgImage = window._mosjeAltState[m.id]
                                    ? 'Visuals/Chris The All-Rounder.jpg'
                                    : 'Visuals/Chris-the-allrounder-ALT.jpg';
                        }
                        else if (m.id === 'youri') bgImage = 'Visuals/Youri The Speedrunner.jpg';
            
            mosjeDiv.style.backgroundImage = `url('${bgImage}')`;
            
            // Add Drop Zone for Mosje Targeting
            mosjeDiv.ondragover = (e) => {
                e.preventDefault();
                mosjeDiv.style.border = '2px solid #e67e22';
            };
            mosjeDiv.ondragleave = (e) => {
                mosjeDiv.style.border = '1px solid #444';
            };
            mosjeDiv.ondrop = (e) => {
                e.preventDefault();
                mosjeDiv.style.border = '1px solid #444';
                const data = e.dataTransfer.getData('text/plain');
                
                // Check if it's a card from hand (Mosje Play)
                if (data.startsWith('hand:')) {
                    const handIdx = parseInt(data.split(':')[1]);
                    
                    // Verify it's my turn and my hand
                    let localKey = 'p1';
                    if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
                    
                    const isMyContainer = containerEl.id === 'myMosjes';
                    
                    if (isMyContainer && localState.currentTurn === localKey) {
                         const p = localState.players[localKey];
                         const card = p.hand[handIdx];
                         
                         // Check if it is a Mosje card (has startMp)
                         if (card.startMp !== undefined) {
                             if (confirm(`Swap ${m.name} with ${card.name}? (MP/Level will reset)`)) {
                                 // Perform Swap
                                 // 1. Remove from hand
                                 p.hand.splice(handIdx, 1);
                                 
                                 // 2. Add old Mosje to hand
                                 p.hand.push(m);
                                 
                                 // 3. Place new Mosje in slot
                                 p.mosjes[i] = card;
                                 
                                 // 4. Reset Stats
                                 card.mp = card.startMp || 0;
                                 card.level = 1;
                                 
                                 // Recalculate Team MP
                                 p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
                                 
                                 log(`${localKey} swapped ${m.name} for ${card.name}. Stats reset.`);
                                 renderAll();
                                 syncState();
                             }
                         } else {
                             alert("That is not a Mosje card!");
                         }
                    }
                    return;
                }
            };

                        const html = `
                            <div class="mosje-header">
                                <div class="mosje-title-group">
                                        <div class="mosje-name">${m.name}</div>
                                        <div class="mosje-flavor">"${m.flavor || 'The Hero'}"</div>
                                        <div class="mosje-type" style="font-size:10px;color:#888;margin-top:2px;">${m.type || ''}</div>
                                </div>
                                <div class="mosje-hp">
                                        <span>MP</span>${m.mp !== undefined ? m.mp : pdata.mp}
                                </div>
                            </div>
              <div class="mosje-content">
                 <div class="mosje-traits">
                    ${Object.entries(m.traits||{}).map(t=>`
                        <div class="mosje-trait-item">
                            <span>${t[0]}</span>
                            <span style="color:#ffd700">${'★'.repeat(t[1])}</span>
                        </div>
                    `).join('')}
                 </div>
                 <div class="mosje-ability">
                    <strong>Unique Ability</strong>
                    ${m.ability || 'No ability'}
                    ${(myTurn && isMyContainer && ['martin_active','coert_tech_active','youri_active','chris_active','binti_active','ronald_active'].includes(m.abilityId) && !m.abilityUsedThisTurn) ? 
                        (m.abilityId === 'ronald_active' ? `<button class="ability-btn" id="ronald-mosje-ability-btn-${i}" style="background:#e67e22;">Use Ronald Ability</button>` : `<button class="ability-btn" onclick="activateMosjeAbility(${i})">Activate</button>`) : ''}
                    ${(m.abilityUsedThisTurn) ? '<div style="color:#e74c3c; font-size:10px">(Used)</div>' : ''}
                 </div>
                 <div class="mosje-footer">
                    <div class="mosje-icon">★</div>
                    <div>Level ${m.level !== undefined ? m.level : pdata.level}</div>
                    <div>Mosjes 2025</div>
                 </div>
              </div>
            `;
            mosjeDiv.innerHTML = html;
            containerEl.appendChild(mosjeDiv);
            // Attach Ronald ability button handler (CSP compliant)
            if (myTurn && isMyContainer && m.abilityId === 'ronald_active' && !m.abilityUsedThisTurn) {
                setTimeout(function() {
                    var btn = document.getElementById(`ronald-mosje-ability-btn-${i}`);
                    if (btn) btn.onclick = function() { window.ronaldAbility(i); };
                }, 0);
            }
        } else {
            // Empty Slot
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'mosje-card empty-slot';
            emptyDiv.style.border = '2px dashed #444';
            emptyDiv.style.display = 'flex';
            emptyDiv.style.alignItems = 'center';
            emptyDiv.style.justifyContent = 'center';
            emptyDiv.style.color = '#666';
            emptyDiv.style.background = 'rgba(0,0,0,0.2)';
            emptyDiv.innerHTML = '<div>Empty Mosje Slot<br><small>(Drag Mosje Here)</small></div>';
            
            // Drag Drop Logic for Playing Mosje
            emptyDiv.ondragover = (e) => {
                e.preventDefault();
                emptyDiv.style.border = '2px dashed #27ae60';
                emptyDiv.style.background = 'rgba(39, 174, 96, 0.1)';
            };
            emptyDiv.ondragleave = (e) => {
                emptyDiv.style.border = '2px dashed #444';
                emptyDiv.style.background = 'rgba(0,0,0,0.2)';
            };
            emptyDiv.ondrop = (e) => {
                e.preventDefault();
                emptyDiv.style.border = '2px dashed #444';
                emptyDiv.style.background = 'rgba(0,0,0,0.2)';
                
                const data = e.dataTransfer.getData('text/plain');
                if (data.startsWith('hand:')) {
                    const handIdx = parseInt(data.split(':')[1]);
                    // Verify it's my turn and my hand
                    let localKey = 'p1';
                    if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';
                    
                    // Check if this container belongs to me
                   
                    // We can infer this if containerEl === myMosjesEl
                    const isMyContainer = containerEl.id === 'myMosjes';
                    
                    if (isMyContainer && localState.currentTurn === localKey) {
                         const card = localState.players[localKey].hand[handIdx];
                         const isMosje = card.type === 'Fighting' || card.type === 'Digital' || card.type === 'Artistic';
                         

                         if (isMosje) {
                             playMosjeFromHand(handIdx);
                         } else {
                             alert("That is not a Mosje card!");
                         }
                    }
                }
            };
            
            containerEl.appendChild(emptyDiv);
        }
    }
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
            // Ronald: Ability button now on Mosje card, not hand area
            if(showHand) {
                const handLabel = document.querySelector('#handLabel, .hand-label');
                if (handLabel) {
                    handLabel.innerHTML = 'Your Hand';
                }
            }
        // Check for pending discard
        if (localState.pendingDiscard > 0) {
            const msg = document.createElement('div');
            msg.style.width = '100%';
            msg.style.textAlign = 'center';
            msg.style.color = 'var(--bad)';
            msg.style.fontWeight = 'bold';
if (typeof window !== 'undefined') {
    window.ronaldAbility = function(mosjeIndex) {
        const myId = (firebaseEnabled && myRole) ? myRole : 'p1';
        const myPlayer = localState.players[myId];
        // Only mark ability used after effect completes
        if (typeof mosjeIndex === 'number' && myPlayer.mosjes && myPlayer.mosjes[mosjeIndex]) {
            myPlayer.mosjes[mosjeIndex].abilityUsedThisTurn = true;
        }
        // Find Food Piecies in hand
        const foodIndexes = (myPlayer.hand||[]).map((c,i)=>isFoodPiecie(c.name)?i:-1).filter(i=>i!==-1);
        if (foodIndexes.length === 0) {
            alert('You must have a Food Piecie in hand to use Ronald\'s ability.');
            return;
        }
                // Prompt to select which Food Piecie to discard (styled like ShowDeckModal)
                let modal = document.createElement('div');
                modal.id = 'ronaldAbilityModal';
                modal.className = 'modal';
                let cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.style.background = 'var(--panel)';
                cardDiv.style.borderRadius = '10px';
                cardDiv.style.padding = '20px';
                cardDiv.style.border = '2px solid var(--accent)';
                cardDiv.style.width = '90%';
                cardDiv.style.maxWidth = '440px';
                cardDiv.innerHTML = `<h2 style='color:var(--accent);margin:0 0 16px 0;text-align:center'>Ronald: Discard a Food Piecie</h2><div id='ronaldFoodList' class='flex' style='gap:20px;flex-wrap:wrap;justify-content:center;'></div><button id='ronaldCancelBtn' class='btn' style='margin-top:18px;'>Cancel</button>`;
                modal.appendChild(cardDiv);
                document.body.appendChild(modal);
                // Render food piecies as selectable cards
                let foodList = cardDiv.querySelector('#ronaldFoodList');
                foodList.innerHTML = foodIndexes.map(i => {
                    const c = myPlayer.hand[i];
                    return `<div class='deck-selectable cardView' data-idx='${i}' style='cursor:pointer;transition:transform .1s;'>
                        <div style='font-weight:bold;font-size:1.1em;margin-bottom:6px;'>${c.name}</div>
                        <div style='font-size:0.95em;color:#9fb7b1;'>${c.effect||''}</div>
                    </div>`;
                }).join('');
                document.getElementById('ronaldCancelBtn').onclick = function() {
                    document.body.removeChild(modal);
                };
                // Card grid click handler (styled like ShowDeckModal)
                Array.from(foodList.querySelectorAll('.deck-selectable')).forEach(el => {
                    el.onclick = function() {
                        const idx = parseInt(this.getAttribute('data-idx'));
                        const discarded = myPlayer.hand.splice(idx,1)[0];
                        myPlayer.discard.push(discarded);
                        document.body.removeChild(modal);
                        // Mark ability used for correct Mosje
                        if (typeof mosjeIndex === 'number' && myPlayer.mosjes && myPlayer.mosjes[mosjeIndex]) {
                            myPlayer.mosjes[mosjeIndex].abilityUsedThisTurn = true;
                        }
                        // Now use deck modal for card selection
                        showDeckModal({
                            selectable: true,
                            onSelect: function(card, deckIdx) {
                                // Remove from deck, add to hand
                                const selected = myPlayer.deck.splice(deckIdx,1)[0];
                                myPlayer.hand.push(selected);
                                myPlayer._ronaldRevealUsedThisTurn = true;
                                log('Ronald ability: Discarded Food Piecie and tutored '+selected.name);
                                renderAll();
                                syncState();
                            }
                        });
                    };
                });
    };
}

// Helper: Show deck search modal

                    // Multiplayer Ronald reveal modal logic
                    if (firebaseEnabled && localState.ronaldReveal && localState.ronaldReveal.active) {
                        const reveal = localState.ronaldReveal;
                        // Show to opponent only, and only if not resolved
                        if (reveal.by && myRole && reveal.by !== myRole && !reveal.resolved) {
                            showRonaldRevealModal(reveal.hand, false, function() {
                                // On close, mark as resolved and sync
                                localState.ronaldReveal.resolved = true;
                                syncState();
                            });
                        }
                        // After resolved, allow Ronald to draw
                        if (reveal.by && myRole && reveal.by === myRole && reveal.resolved) {
                            // Only allow once per reveal
                            if (!window._ronaldDrawnForThisReveal) {
                                window._ronaldDrawnForThisReveal = true;
                                const myPlayer = localState.players[myRole];
                                if (myPlayer.deck.length > 0) {
                                    myPlayer.hand.push(myPlayer.deck.pop());
                                    log('Drew 1 card for Ronald ability (after opponent closed modal)');
                                } else {
                                    log('Deck empty, cannot draw for Ronald ability');
                                }
                                // Reset reveal state
                                setTimeout(()=>{
                                    localState.ronaldReveal = {active:false, hand:[], by:null, resolved:false};
                                    window._ronaldDrawnForThisReveal = false;
                                    renderAll();
                                    syncState();
                                }, 200);
                            }
                        }
                    }
            msg.style.marginBottom = '10px';
            msg.textContent = `DISCARD PHASE: Select ${localState.pendingDiscard} card(s) to discard`;
            handArea.appendChild(msg);
        }

        const total = (myPlayer.hand||[]).length;
        (myPlayer.hand||[]).forEach((c,i)=>{
          const d=document.createElement('div'); d.className='cardView';
          
          if (localState.pendingDiscard > 0) {
              // Discard Mode
              d.style.border = '2px solid var(--bad)';
              d.style.cursor = 'pointer';
              d.onclick = () => {
                  if(confirm(`Discard ${c.name}?`)) {
                      myPlayer.hand.splice(i, 1);
                      myPlayer.discard.push(c);
                      localState.pendingDiscard--;
                      log(`Discarded ${c.name}`);
                      renderAll();
                  }
              };
          } else {
              // Normal Mode
              d.setAttribute('draggable','true');
              d.setAttribute('data-idx',i);
              d.style.setProperty('--i', i);
              d.style.setProperty('--total', total);
              d.style.cursor = 'grab';
              d.ondragstart = e => { 
                  e.dataTransfer.setData('text/plain', 'hand:' + i); 
              };
              d.onmousemove = e => {
                  const rect = d.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  d.style.setProperty('--x', x + 'px');
                  d.style.setProperty('--y', y + 'px');
              };
              d.ondragover = e => { e.preventDefault(); d.style.border='2px solid var(--accent)'; };
              d.ondragleave = e => { d.style.border='1px solid #32464f'; };
              d.ondrop = e => {
                e.preventDefault();
                d.style.border='1px solid #32464f';
                const data = e.dataTransfer.getData('text/plain');
                if (data.startsWith('hand:')) {
                    const fromIdx = parseInt(data.split(':')[1]);
                    if(fromIdx!==i) {
                      const card = myPlayer.hand.splice(fromIdx,1)[0];
                      myPlayer.hand.splice(i,0,card);
                      renderAll();
                    }
                }
              };
          }

          const isMosje = c.type === 'Fighting' || c.type === 'Digital' || c.type === 'Artistic';
          if (isMosje) {
              d.style.border = '2px solid gold';
              // Removed background override to keep consistent styling
          }

          const title = document.createElement('div'); title.style.fontWeight='700'; title.textContent = c.name || 'Card';
          const eff = document.createElement('div'); eff.className='smallMuted'; eff.style.marginTop='6px'; 
          
          if (isMosje) {
             eff.textContent = `Mosje: ${c.type}`;
          } else {
             eff.textContent = c.effect || '';
          }
          
          const footer = document.createElement('div');
          footer.className = 'smallMuted';
          footer.style.marginTop = '8px';
          
          if (isMosje) {
              footer.textContent = `Start MP: ${c.startMp}`;
          } else {
              let costText = `Cost: ${c.cost > 0 ? c.cost + ' MP' : 'Free'}`;
              let reqText = c.req ? ` | Req: ${c.req}` : '';
              footer.textContent = costText + reqText;
          }

          d.appendChild(title); 
          d.appendChild(eff);
          d.appendChild(footer);

          // Mosje Play Button (Removed in favor of Drag & Drop)
          /*
          if (isMosje && myPlayer.mosjes.length < 2 && (!localState.pendingDiscard || localState.pendingDiscard <= 0)) {
              const playBtn = document.createElement('button');
              playBtn.className = 'btn';
              playBtn.style.marginTop = '6px';
              playBtn.style.fontSize = '10px';
              playBtn.style.padding = '2px 6px';
              playBtn.style.background = '#27ae60'; // Green
              playBtn.textContent = 'Play Mosje';
              playBtn.onclick = (e) => {
                  e.stopPropagation();
                  playMosjeFromHand(i);
              };
              d.appendChild(playBtn);
          }
          */

          // Snelle Piecie Quick Play Button (Only in normal mode)
          if (isSnellePiecie(c.name) && (!localState.pendingDiscard || localState.pendingDiscard <= 0)) {
              const quickBtn = document.createElement('button');
              quickBtn.className = 'btn';
              quickBtn.style.marginTop = '6px';
              quickBtn.style.fontSize = '10px';
              quickBtn.style.padding = '2px 6px';
              quickBtn.style.background = '#e67e22'; // Orange for "Quick"
              quickBtn.textContent = '⚡ Quick Play';
              quickBtn.title = 'Play instantly (even on opponent turn)';
              
              // Check MP
              if (myPlayer.mp < (c.cost || 0)) {
                  quickBtn.disabled = true;
                  quickBtn.style.opacity = '0.5';
                  quickBtn.title = 'Not enough MP';
              } else {
                  quickBtn.onclick = (e) => {
                      e.stopPropagation(); // Prevent drag start if clicking button
                      if(confirm(`Play ${c.name} instantly for ${c.cost||0} MP?`)) {
                          playSnelleFromHand(i);
                      }
                  };
              }
              d.appendChild(quickBtn);
          }

          // Add Glow Effect Logic
          d.addEventListener('mousemove', (e) => {
              const rect = d.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              d.style.setProperty('--x', x);
              d.style.setProperty('--y', y);
          });

          handArea.appendChild(d);
        });
    } else {
      handArea.innerHTML = '<div class="smallMuted">Opponent hand hidden</div>';
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

  // MP Counts
  const myTotalMp = document.getElementById('myTotalMp');
  if(myTotalMp) myTotalMp.textContent = myPlayer.mp;
  
  const oppTotalMp = document.getElementById('oppTotalMp');
  if(oppTotalMp) oppTotalMp.textContent = opp.mp;

  // My placed piecies: show names/effects to owner only, hidden to opponent
  const mpie = document.getElementById('myPiecies'); 
  if(mpie) {
      mpie.innerHTML='';
      // Only show hand if this is the local player
      let showHand = true;
      if(firebaseEnabled && room && room.p1 !== playerId && room.p2 !== playerId) showHand = false;

      // Render 5 fixed slots
      for(let i=0; i<5; i++) {
          const item = (myPlayer.piecies || [])[i];
          const s = document.createElement('div'); 
          s.className='slot'; 
          s.style.flexDirection='column';
          
          if (item) {
              // Slot has a card
              if(showHand) {
                  const n = document.createElement('div'); n.style.fontWeight='700'; n.style.fontSize='13px'; n.textContent = item.card.name || 'Placed';
                  
                  // Cost & Req Display
                  const info = document.createElement('div');
                  info.style.fontSize='11px';
                  info.style.marginTop='4px';
                  info.style.display='flex';
                  info.style.justifyContent='space-between';
                  info.style.width='100%';
                  
                  const c = document.createElement('span'); 
                  c.style.color='var(--gold)'; 
                  c.textContent = 'Cost: ' + (item.card.cost || 0);
                  
                  const r = document.createElement('span');
                  r.style.color='#aaa';
                  r.textContent = 'Req: ' + (item.card.req || '-');
                  
                  info.appendChild(c);
                  info.appendChild(r);

                  const e = document.createElement('div'); e.className='smallMuted'; e.style.fontSize='12px'; e.style.marginTop='4px'; e.textContent = item.card.effect || '';
                  
                  s.appendChild(n); 
                  s.appendChild(info); 
                  s.appendChild(e);
                  
                  // Add Activate Button
                  // Allow activation if it's my turn OR if it's a Snelle Piecie (any time)
                  const isSnelle = isSnellePiecie(item.card.name);
                  const canActivate = (isMyTurn && isMainPhase) || isSnelle;

                  if (canActivate) {
                     if (item.active) {
                         const badge = document.createElement('div');
                         badge.className = 'btn';
                         badge.style.marginTop = '8px';
                         badge.style.fontSize = '10px';
                         badge.style.padding = '4px 8px';
                         badge.style.background = '#2ecc71';
                         badge.style.cursor = 'default';
                         badge.textContent = 'Active';
                         s.appendChild(badge);
                     } else {
                         const btn = document.createElement('button');
                         btn.className = 'btn';
                         btn.style.marginTop = '8px';
                         btn.style.fontSize = '10px';
                         btn.style.padding = '4px 8px';
                         btn.textContent = isSnelle && !isMyTurn ? '⚡ Quick Activate' : 'Activate';
                         if(isSnelle && !isMyTurn) btn.style.background = '#e67e22';
                         
                         // Check MP cost
                         const cost = item.card.cost || 0;
                         if (myPlayer.mp < cost) {
                             btn.disabled = true;
                             btn.title = "Not enough MP";
                             btn.style.opacity = "0.5";
                             btn.style.cursor = "not-allowed";
                         }

                         btn.onclick = (e) => { 
                             e.stopPropagation(); 
                             // Trigger animation on the slot
                             s.classList.add('activate-animation');
                             // Wait for animation to start/finish slightly before processing logic
                             setTimeout(() => activatePiecie(i), 1000); 
                         };
                         s.appendChild(btn);

                         // Return to Hand Button
                         const retBtn = document.createElement('button');
                         retBtn.className = 'btn';
                         retBtn.style.marginTop = '4px';
                         retBtn.style.fontSize = '10px';
                         retBtn.style.padding = '2px 6px';
                         retBtn.style.background = '#95a5a6'; // Grey
                         retBtn.textContent = 'Return';
                         retBtn.title = 'Return to Hand';
                         retBtn.onclick = (e) => {
                             e.stopPropagation();
                             if(confirm(`Return ${item.card.name} to hand for 10 MP?`)) {
                                 returnPiecieToHand(i);
                             }
                         };
                         s.appendChild(retBtn);
                     }
                  }
              } else {
                  s.textContent = '🎴';
              }
          } else {
              // Empty slot - Drop Zone
              s.textContent = 'Empty Slot';
              s.classList.add('empty');
              s.style.opacity = '0.5';
              
              if (showHand && isMyTurn && isMainPhase) {
                  s.ondragover = (e) => { e.preventDefault(); s.style.border = '2px dashed var(--accent)'; s.style.opacity = '1'; };
                  s.ondragleave = (e) => { s.style.border = '2px dashed #29404a'; s.style.opacity = '0.5'; };
                  s.ondrop = (e) => {
                      e.preventDefault();
                      s.style.border = '2px dashed #29404a';
                      s.style.opacity = '0.5';
                      const data = e.dataTransfer.getData('text/plain');
                      if (data.startsWith('hand:')) {
                          const idx = parseInt(data.split(':')[1]);
                          if (!isNaN(idx)) {
                              placePiecie(idx);
                          }
                      }
                  };
              }
          }
          mpie.appendChild(s);
      }
  }
  // Opponent placed piecies: always hidden
  const oppie = document.getElementById('oppPiecies'); 
  if(oppie) {
      oppie.innerHTML='';
      // Render 5 fixed slots for opponent too
      for(let i=0; i<5; i++) {
          const item = (opp.piecies || [])[i];
          const s=document.createElement('div'); 
          s.className='slot'; 
          if(item) {
              s.textContent='🎴'; 
          } else {
              s.textContent='Empty';
              s.style.opacity = '0.3';
          }
          oppie.appendChild(s); 
      }
  }

  // Active Quest: show requirement and outcomes
  const aq = document.getElementById('activeQuest');
  
  if(aq) {
            const curQuest = (localState.players && localState.players[localState.currentTurn]) ? localState.players[localState.currentTurn].activeQuest : null;
            if(curQuest){
                const q = curQuest;
        let reqText = q.desc || '';
        if(!reqText && q.req){ 
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
        if(questBtn) {
            questBtn.textContent = "Attempt Quest";
            questBtn.disabled = !isMyTurn || !isQuestPhase;
        }
      } else { 
          aq.innerHTML = 'No active quest'; 
          if(questBtn) {
              questBtn.textContent = "Draw Quest";
              questBtn.disabled = !isMyTurn || !isQuestPhase;
          }
      }
  }

  // Handle Pending Selection (Look at top X)
  const selectionModal = document.getElementById('selectionModal');
  // Allow viewing if it's my turn OR if it's a view-only action (remainingAction === 'none')
  if (localState.pendingSelection && (isMyTurn || localState.pendingSelection.remainingAction === 'none')) {
      if (!selectionModal) {
          // Create modal if it doesn't exist
          const m = document.createElement('div');
          m.id = 'selectionModal';
          m.className = 'modal';
          m.style.display = 'flex';
          m.style.zIndex = '200';
          m.innerHTML = `
            <div class="card" style="width:90%; max-width:600px; max-height:85vh; display:flex; flex-direction:column; text-align:center;">
                <h3 id="selectionTitle" style="color:var(--accent);margin:0 0 16px 0; flex-shrink:0;">Select Card(s)</h3>
                <div id="selectionContainer" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:16px; overflow-y:auto; flex:1; min-height:0; padding: 4px;"></div>
                <div class="smallMuted" id="selectionInstruction" style="flex-shrink:0;">Pick 1 card to keep</div>
            </div>
          `;
          document.body.appendChild(m);
      } else {
          selectionModal.style.display = 'flex';
      }

      const container = document.getElementById('selectionContainer');
      container.innerHTML = '';
      const instruction = document.getElementById('selectionInstruction');
      const title = document.getElementById('selectionTitle');
      const count = localState.pendingSelection.count;
      
      if (count > 0) {
          if(title) title.textContent = 'Select Card(s)';
          instruction.textContent = `Pick ${count} card(s) to add to your hand.`;
      } else {
          if(title) title.textContent = 'View Cards';
          instruction.textContent = `Look at the cards.`;
      }

      // Helper to finish
      const finishSelection = () => {
          const remaining = localState.pendingSelection.cards;
          const action = localState.pendingSelection.remainingAction || 'shuffle';
          
        if (result === 'failure') {
            // MP loss
            let loss = quest.failure;
            // Check for ViannaPoes/other effects
            const p = localState.players[playerKey];
            if (p.activeEffects && p.activeEffects.includes('ViannaPoes')) {
                loss = Math.ceil(loss * 0.5);
                log('ViannaPoes: MP loss halved!');
            }
            // Gandoe Synergy
            if (p.activeEffects && p.activeEffects.includes('Gandoe Synergy')) {
                loss = Math.ceil(loss * 0.25);
                log('Gandoe Synergy: MP loss reduced by 75%!');
            }
            // Clamp loss to available MP
            let target = p.mosjes[0];
            if (p.mosjes.length > 1) {
                const useFirst = confirm(`Quest Failure: Lose MP from which Mosje?\nOK = ${p.mosjes[0].name}\nCancel = ${p.mosjes[1].name}`);
                target = useFirst ? p.mosjes[0] : p.mosjes[1];
            }
            let actualLoss = Math.min(loss, target.mp || 0);
            target.mp = (target.mp || 0) - actualLoss;
            p.mp = p.mosjes.reduce((sum, m) => sum + (m.mp || 0), 0);
            // Record last damage for Snelle Piecie (FF Haaltje Nemen)
            localState.lastDamage = {
                player: playerKey,
                amount: actualLoss,
                source: 'quest',
                timestamp: Date.now(),
                mosjeIndex: p.mosjes.indexOf(target)
            };
            popupMP(playerKey, -actualLoss);
            log(`${playerKey} failed quest: Lost ${actualLoss} MP (${target.name})`);
            checkLevelUp(p, playerKey);
            renderAll();
            syncState();
            return;
        }
                  localState.pendingSelection.cards.splice(idx, 1);
                  localState.pendingSelection.count--;
                  
                  if (localState.pendingSelection.count <= 0) {
                      finishSelection();
                  } else {
                      renderAll();
                  }
              }
          };
          
          container.appendChild(d);
      });

      // Add Done button if count <= 0
      if (count <= 0) {
          let doneBtn = document.getElementById('selectionDoneBtn');
          if (!doneBtn) {
              doneBtn = document.createElement('button');
              doneBtn.id = 'selectionDoneBtn';
              doneBtn.textContent = 'Done';
              doneBtn.style.marginTop = '16px';
              doneBtn.style.padding = '8px 16px';
              doneBtn.style.cursor = 'pointer';
              doneBtn.onclick = finishSelection;
              instruction.parentNode.appendChild(doneBtn);
          }
      } else {
          const doneBtn = document.getElementById('selectionDoneBtn');
          if (doneBtn) doneBtn.remove();
      }
  } else if (selectionModal) {
      selectionModal.style.display = 'none';
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

// Auto-init Firebase on load
window.addEventListener('load', () => {
    initFirebase();
});

// New Handlers for Combined UI
window.handleCreateRoom = function() {
    const deckIdx = document.getElementById('selectedDeckIndex').value;
    createRoom(deckIdx);
};

window.handleJoinRoom = function() {
    const deckIdx = document.getElementById('selectedDeckIndex').value;
    joinRoom(deckIdx);
};

// View Graveyard and Deck functions
window.showGraveyard = function() {
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
    renderAll();
};

window.showDeck = function() {
    let pId = 'p1';
    if (firebaseEnabled && myRole) pId = myRole;
    else if (localState.myId) pId = localState.myId;
    
    const p = localState.players[pId];
    if (!p || !p.deck) return;
    
    if (p.deck.length === 0) {
        alert("Deck is empty.");
        return;
    }
    localState.pendingSelection = {
        cards: [...p.deck],
        count: 0,
        type: 'view_deck',
        source: 'deck',
        remainingAction: 'none'
    };
    renderAll();
};
