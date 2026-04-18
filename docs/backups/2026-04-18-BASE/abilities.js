// --- Ability Activation Logic ---
function activatePiecie(index) {
    let localKey = 'p1';
    if (firebaseEnabled && myRole) localKey = myRole;
    else if (firebaseEnabled && room && room.p2 === playerId) localKey = 'p2';

    // ...existing code...
}

function applyPiecieEffect(turn, card) {
    // ...existing code...
}

// Export ability logic
window.activatePiecie = activatePiecie;
window.applyPiecieEffect = applyPiecieEffect;
// abilities.js
// Functions for unique card abilities and piece logic

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

// Example ability function
function activateAbility(card, state) {
    // ...implement ability logic...
}

// Export functions
window.isFoodPiecie = isFoodPiecie;
window.activateAbility = activateAbility;