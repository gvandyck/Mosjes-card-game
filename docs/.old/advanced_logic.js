/**
 * Advanced Game Logic for Mosjes Card Game
 * Handles complex card effects including Dice Rolls, Multi-effects, and Draw mechanics.
 */

const AdvancedLogic = {
    /**
     * Main entry point to process a card's effect.
     * @param {string} playerKey - 'p1' or 'p2'
     * @param {object} card - The card object being played
     * @param {object} context - Object containing game state and helper functions
     * @returns {boolean} - Returns true if the effect was handled, false otherwise.
     */
    processCardEffect: function(playerKey, card, context) {
        let effectText = card.effect ? card.effect.trim() : '';
        // Custom handler for Momentum Boost
        if (effectText.toLowerCase().includes('momentum boost')) {
            return this.handleMomentumBoost(playerKey, card, context);
        }
        console.log(`AdvancedLogic processing raw: ${effectText}`);

        // --- NORMALIZATION TO PREVENT FALSE SPLITS ---
        // 0. Pre-clean: Remove "+" if it appears immediately after "Digital Mosje:" (common typo/format)
        // Matches "Digital Mosje: + 10 MP" -> "Digital Mosje: 10 MP"
        if (effectText.match(/Digital.*?Mosje.*?:?\s*\+/i)) {
             effectText = effectText.replace(/(Digital.*?Mosje.*?:?\s*)\+/i, '$1');
        }

        // 1. Normalize "+10 MP" to "Gain 10 MP"
        // Use global flag 'g' to catch all instances
        if (effectText.match(/\+\s*\d+\s*MP/i)) {
            effectText = effectText.replace(/\+\s*(\d+)\s*MP/gi, 'Gain $1 MP');
        }
        // 2. Normalize "Draw +1" to "Draw 1"
        if (effectText.match(/draw\s*\+\s*\d+/i)) {
            effectText = effectText.replace(/draw\s*\+\s*(\d+)/gi, 'Draw $1');
        }
        // 3. Normalize generic "+X" to "plus X" (e.g. "Quest roll gets +1")
        effectText = effectText.replace(/\+\s*(\d+)/g, 'plus $1');
        // 4. Normalize verbose Digital Mosje condition
        // Broad regex to catch variations like "If you have a Digital-type Mosje..."
        // Also catch "If you have a Digital-type Mosje on field" without colon
        if (effectText.match(/^If you have a Digital.*?Mosje.*?field/i)) {
            effectText = effectText.replace(/^If you have a Digital.*?Mosje.*?field:?\s*/i, 'Digital Mosje: ');
        }
        console.log(`AdvancedLogic normalized: ${effectText}`);
        // Update card object for further processing
        card = { ...card, effect: effectText };
        // --- NORMALIZATION END ---

        // 1. Handle Digital Mosje Conditional Effects (Priority to handle prefixes)
        // Use regex for case-insensitive check, and allow for loose matching
        if (effectText.match(/^Digital Mosje/i)) {
             return this.handleDigitalMosjeEffect(playerKey, card, context);
        }
        // 2. Handle Dice Rolls (Priority to handle prefixes)
        if (effectText.toLowerCase().startsWith('roll:')) {
            return this.handleDiceRollEffect(playerKey, card, context);
        }
        // 3. Handle Multi-effects (split by '+' or ' and ')
        // Regex looks for " + " or " and " or just "," to split effects
        // We need to be careful not to split inside parentheses if possible, but for now simple split
        if (effectText.includes('+') || effectText.toLowerCase().includes(' and ')) {
            return this.handleMultiEffect(playerKey, card, context);
        }
        // 4. Handle Draw Effects
        if (effectText.match(/draw\s*\d+/i) || effectText.match(/draw\d*/i)) {
            // We return false here to let the original script handle it OR we handle it here.
            // The user asked to "add logic", so let's handle it here and return true.
            return this.handleDrawEffect(playerKey, card, context);
        }
        // 5. Handle "Look at top X" effects
        if (effectText.toLowerCase().includes('look at top')) {
            return this.handleLookAtTopEffect(playerKey, card, context);
        }
        // 6. Handle "Next Quest" bonuses
        if (effectText.toLowerCase().includes('next quest')) {
            return this.handleNextQuestEffect(playerKey, card, context);
        }
        // 7. Handle Conditional MP (e.g. "if under 30 MP")
        if (effectText.toLowerCase().includes('if under')) {
            return this.handleConditionalMPEffect(playerKey, card, context);
        }
        // 8. Handle "Restore" effects (e.g. "Restore 25 MP")
        if (effectText.toLowerCase().includes('restore')) {
            this.handleSimpleMPEffect(playerKey, card, context);
            return true;
        }
        // 8.5 Handle "Binti:" conditional (Varkenspootjes)
        if (effectText.includes('Binti:')) {
            return this.handleBintiEffect(playerKey, card, context);
        }
        // 9. Handle standard MP Gain/Loss (if we want to override or extend)
        // For now, we'll return false for simple MP effects to let the original script handle them,
        // unless it's a complex string that the original script might miss.
        return false; // Fallback to original script

    },

    /**
     * Handles the custom effect for Momentum Boost:
     * 1. Restore up to 15 MP to a Mosje if below starting MP.
     * 2. Next Quest: add 10 MP to a Mosje of your choosing.
     */
    handleMomentumBoost: function(playerKey, card, context) {
        const player = context.gameState.players[playerKey];
        // 1. Restore up to 15 MP to a Mosje if below starting MP
        let targetMosje = player.mosjes[0];
        if (player.mosjes.length > 1) {
            const m1 = player.mosjes[0];
            const m2 = player.mosjes[1];
            const useFirst = confirm(`Momentum Boost: Restore up to 15 MP if below starting MP. Select Mosje:\nOK = ${m1.name}\nCancel = ${m2.name}`);
            targetMosje = useFirst ? m1 : m2;
        }
        if (targetMosje) {
            const startMp = targetMosje.startMp || 0;
            const currentMp = targetMosje.mp || 0;
            if (currentMp < startMp) {
                const restoreAmount = Math.min(15, startMp - currentMp);
                targetMosje.mp = currentMp + restoreAmount;
                context.log(`${playerKey} (Momentum Boost): Restored ${restoreAmount} MP to ${targetMosje.name} (MP: ${currentMp} -> ${targetMosje.mp})`);
                context.popupMP(playerKey, restoreAmount);
            } else {
                context.log(`${playerKey} (Momentum Boost): ${targetMosje.name} is at or above starting MP. No MP restored.`);
            }
        }
        // 2. Next Quest: add 10 MP to a Mosje of your choosing
        if (!player.activeEffects) player.activeEffects = [];
        player.activeEffects.push('NextQuestBonus:10:choose');
        context.log(`${playerKey} (Momentum Boost): Will add 10 MP to a Mosje of your choice on next Quest.`);
        return true;
    },

    /**
     * Handles the custom effect for Momentum Boost:
     * 1. Restore up to 15 MP to a Mosje if below starting MP.
     * 2. Next Quest: add 10 MP to a Mosje of your choosing.
     */
    handleMomentumBoost: function(playerKey, card, context) {
        const player = context.gameState.players[playerKey];
        // 1. Restore up to 15 MP to a Mosje if below starting MP
        let targetMosje = player.mosjes[0];
        if (player.mosjes.length > 1) {
            const m1 = player.mosjes[0];
            const m2 = player.mosjes[1];
            const useFirst = confirm(`Momentum Boost: Restore up to 15 MP if below starting MP. Select Mosje:\nOK = ${m1.name}\nCancel = ${m2.name}`);
            targetMosje = useFirst ? m1 : m2;
        }
        if (targetMosje) {
            const startMp = targetMosje.startMp || 0;
            const currentMp = targetMosje.mp || 0;
            if (currentMp < startMp) {
                const restoreAmount = Math.min(15, startMp - currentMp);
                targetMosje.mp = currentMp + restoreAmount;
                context.log(`${playerKey} (Momentum Boost): Restored ${restoreAmount} MP to ${targetMosje.name} (MP: ${currentMp} -> ${targetMosje.mp})`);
                context.popupMP(playerKey, restoreAmount);
            } else {
                context.log(`${playerKey} (Momentum Boost): ${targetMosje.name} is at or above starting MP. No MP restored.`);
            }
        }
        // 2. Next Quest: add 10 MP to a Mosje of your choosing
        if (!player.activeEffects) player.activeEffects = [];
        player.activeEffects.push('NextQuestBonus:10:choose');
        context.log(`${playerKey} (Momentum Boost): Will add 10 MP to a Mosje of your choice on next Quest.`);
        return true;


        // --- NORMALIZATION TO PREVENT FALSE SPLITS ---
        
        // 0. Pre-clean: Remove "+" if it appears immediately after "Digital Mosje:" (common typo/format)
        // Matches "Digital Mosje: + 10 MP" -> "Digital Mosje: 10 MP"
        if (effectText.match(/Digital.*?Mosje.*?:?\s*\+/i)) {
             effectText = effectText.replace(/(Digital.*?Mosje.*?:?\s*)\+/i, '$1');
        }

        // 1. Normalize "+10 MP" to "Gain 10 MP"
        // Use global flag 'g' to catch all instances
        if (effectText.match(/\+\s*\d+\s*MP/i)) {
            effectText = effectText.replace(/\+\s*(\d+)\s*MP/gi, 'Gain $1 MP');
        }
        
        // 2. Normalize "Draw +1" to "Draw 1"
        if (effectText.match(/draw\s*\+\s*\d+/i)) {
            effectText = effectText.replace(/draw\s*\+\s*(\d+)/gi, 'Draw $1');
        }

        // 3. Normalize generic "+X" to "plus X" (e.g. "Quest roll gets +1")
        effectText = effectText.replace(/\+\s*(\d+)/g, 'plus $1');

        // 4. Normalize verbose Digital Mosje condition
        // Broad regex to catch variations like "If you have a Digital-type Mosje..."
        // Also catch "If you have a Digital-type Mosje on field" without colon
        if (effectText.match(/^If you have a Digital.*?Mosje.*?field/i)) {
            effectText = effectText.replace(/^If you have a Digital.*?Mosje.*?field:?\s*/i, 'Digital Mosje: ');
        }

        console.log(`AdvancedLogic normalized: ${effectText}`);

        // Update card object for further processing
        card = { ...card, effect: effectText };
        // --- NORMALIZATION END ---

        // 1. Handle Digital Mosje Conditional Effects (Priority to handle prefixes)
        // Use regex for case-insensitive check, and allow for loose matching
        if (effectText.match(/^Digital Mosje/i)) {
             return this.handleDigitalMosjeEffect(playerKey, card, context);
        }

        // 2. Handle Dice Rolls (Priority to handle prefixes)
        if (effectText.toLowerCase().startsWith('roll:')) {
            return this.handleDiceRollEffect(playerKey, card, context);
        }

        // 3. Handle Multi-effects (split by '+' or ' and ')
        // Regex looks for " + " or " and " or just "," to split effects
        // We need to be careful not to split inside parentheses if possible, but for now simple split
        if (effectText.includes('+') || effectText.toLowerCase().includes(' and ')) {
            return this.handleMultiEffect(playerKey, card, context);
        }

        // 4. Handle Draw Effects
        if (effectText.match(/draw\s*\d+/i) || effectText.match(/draw\d*/i)) {
            // We return false here to let the original script handle it OR we handle it here.
            // The user asked to "add logic", so let's handle it here and return true.
            return this.handleDrawEffect(playerKey, card, context);
        }

        // 5. Handle "Look at top X" effects
        if (effectText.toLowerCase().includes('look at top')) {
            return this.handleLookAtTopEffect(playerKey, card, context);
        }

        // 6. Handle "Next Quest" bonuses
        if (effectText.toLowerCase().includes('next quest')) {
            return this.handleNextQuestEffect(playerKey, card, context);
        }

        // 7. Handle Conditional MP (e.g. "if under 30 MP")
        if (effectText.toLowerCase().includes('if under')) {
            return this.handleConditionalMPEffect(playerKey, card, context);
        }

        // 8. Handle "Restore" effects (e.g. "Restore 25 MP")
        if (effectText.toLowerCase().includes('restore')) {
            this.handleSimpleMPEffect(playerKey, card, context);
            return true;
        }

        // 8.5 Handle "Binti:" conditional (Varkenspootjes)
        if (effectText.includes('Binti:')) {
            return this.handleBintiEffect(playerKey, card, context);
        }

        // 9. Handle standard MP Gain/Loss (if we want to override or extend)
        // For now, we'll return false for simple MP effects to let the original script handle them,
        // unless it's a complex string that the original script might miss.
        
        return false; // Fallback to original script
    },

    /**
     * Handles effects with multiple parts (e.g., "Gain 15 MP + draw 1")
     */
    handleMultiEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        // Split by '+' or 'and'
        const parts = effectText.split(/\+| and /i).map(s => s.trim());
        
        context.log(`${playerKey} triggers multi-effect: ${parts.join(' & ')}`);

        let allHandled = true;
        parts.forEach(part => {
            // Create a dummy card object for the sub-effect
            const subCard = { ...card, effect: part };
            
            // Recursively process. If it's a simple MP effect, processCardEffect returns false,
            // so we need to handle simple MP effects here if we want to be fully self-contained.
            const handled = this.processCardEffect(playerKey, subCard, context);
            
            if (!handled) {
                // If AdvancedLogic didn't handle it, it might be a simple MP effect.
                // We can manually invoke the simple logic here or rely on the caller.
                // But since we are inside a multi-effect, the caller (script.js) won't see the split parts.
                // So we MUST handle simple MP effects here.
                this.handleSimpleMPEffect(playerKey, subCard, context);
            }
        });

        return true;
    },

    /**
     * Handles "Roll:" effects.
     * Parses strings like "Roll: 1=discard 1, 2-5=nothing, 6=draw 2"
     */
    handleDiceRollEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        const roll = Math.floor(Math.random() * 6) + 1;
        context.log(`${playerKey} rolled a ${roll} for ${card.name}! (Effect: ${card.effect})`);
        
        // Parse the conditions
        // Remove "Roll:" prefix
        const conditions = effectText.substring(5).split(',');
        
        let matchFound = false;

        for (let cond of conditions) {
            cond = cond.trim();
            // Format: "1=effect" or "1-3=effect"
            const [range, result] = cond.split('=').map(s => s ? s.trim() : '');
            
            if (!range || !result) continue;

            if (this.checkRollRange(roll, range)) {
                context.log(`Roll ${roll} matches condition "${range}": ${result}`);
                
                // Execute the result as a card effect
                const resultCard = { ...card, effect: result };
                const handled = this.processCardEffect(playerKey, resultCard, context);
                if (!handled) {
                    this.handleSimpleMPEffect(playerKey, resultCard, context);
                }
                matchFound = true;
                break; // Only execute one matching condition
            }
        }

        if (!matchFound) {
            // Handle generic "Roll: lose 15 or gain 30 MP" (Grammetje Pieter)
            // If no specific ranges were found, maybe it's a text description.
            // We can implement a default behavior or specific overrides.
            if (effectText.includes('lose 15 or gain 30 MP')) {
                // Custom logic for Grammetje Pieter if not strictly parsed
                if (roll <= 3) {
                    this.handleSimpleMPEffect(playerKey, { effect: 'Lose 15 MP' }, context);
                } else {
                    this.handleSimpleMPEffect(playerKey, { effect: 'Gain 30 MP' }, context);
                }
                matchFound = true;
            } else {
                context.log(`No specific effect found for roll ${roll}.`);
            }
        }

        return true;
    },

    /**
     * Helper to check if a roll matches a range string like "1", "1-3", "4+"
     */
    checkRollRange: function(roll, rangeStr) {
        if (rangeStr.includes('-')) {
            const [min, max] = rangeStr.split('-').map(Number);
            return roll >= min && roll <= max;
        } else if (rangeStr.includes('+')) {
            const min = parseInt(rangeStr);
            return roll >= min;
        } else {
            return roll === parseInt(rangeStr);
        }
    },

    /**
     * Handles "Draw X cards" logic.
     */
    handleDrawEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        // Only match the number immediately after 'draw', not any number in the string
        let amount = 1;
        const match = effectText.match(/draw\s*(\d+)/i);
        if (match && match[1]) {
            amount = parseInt(match[1]);
        } else if (/draw\b/i.test(effectText)) {
            amount = 1;
        } else if (effectText.toLowerCase().includes('draw 2')) { // Fallback for specific text
            amount = 2;
        }

        const player = context.gameState.players[playerKey];
        
        context.log(`${playerKey} activates draw effect: Drawing ${amount} cards.`);

        for (let i = 0; i < amount; i++) {
            if (player.deck.length > 0) {
                player.hand.push(player.deck.pop());
            } else {
                context.log('Deck is empty, cannot draw.');
            }
        }
        
        // Check for Discard requirement (e.g., "Draw 3, discard 1")
        const discardMatch = effectText.match(/discard\s*(\d+)/i);
        if (discardMatch && discardMatch[1]) {
            const discardAmount = parseInt(discardMatch[1]);
            context.log(`${playerKey} must discard ${discardAmount} card(s).`);
            
            // Set pending discard state
            context.gameState.pendingDiscard = discardAmount;
            
            // Trigger UI update if renderAll is available
            if (context.renderAll) {
                context.renderAll();
            }
        }

        // Check for Lose MP requirement (e.g. "Lose 10 MP, draw 2")
        const loseMatch = effectText.match(/Lose\s*(\d+)\s*MP/i);
        if (loseMatch && loseMatch[1]) {
             const loseAmount = parseInt(loseMatch[1]);
             
             // Targeting Logic for MP Cost
             if (player.mosjes.length > 1) {
                 const m1 = player.mosjes[0];
                 const m2 = player.mosjes[1];
                 // Simple toggle for 2 mosjes
                 const useFirst = confirm(`Select Mosje to pay ${loseAmount} MP:\nOK = ${m1.name}\nCancel = ${m2.name}`);
                 const target = useFirst ? m1 : m2;
                 context.log(`${playerKey} selected ${target.name} to lose ${loseAmount} MP`);
             }

             player.mp -= loseAmount;
             context.popupMP(playerKey, -loseAmount);
             context.log(`${playerKey} lost ${loseAmount} MP (Effect cost). MP: ${player.mp + loseAmount} -> ${player.mp}`);
        }
        
        return true;
    },

    /**
     * Handles "Look at top X, pick Y" logic.
     */
    handleLookAtTopEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        // Parse "Look at top 3"
        const lookMatch = effectText.match(/look at top\s*(\d+)/i);
        const count = lookMatch ? parseInt(lookMatch[1]) : 3;
        
        // Parse "pick X"
        let pickCount = 0;
        if (effectText.toLowerCase().includes('pick')) {
            const pickMatch = effectText.match(/pick.*?(\d+)/i);
            pickCount = pickMatch ? parseInt(pickMatch[1]) : 1;
        }

        // Parse remaining action
        let remainingAction = 'top';
        if (effectText.toLowerCase().includes('discard the others')) {
            remainingAction = 'discard';
        } else if (effectText.toLowerCase().includes('shuffle')) {
            remainingAction = 'shuffle';
        }

        const player = context.gameState.players[playerKey];
        
        if (player.deck.length < count) {
            context.log(`Not enough cards in deck to look at top ${count}.`);
        }

        // Take top X cards
        const revealedCards = [];
        const actualCount = Math.min(count, player.deck.length);
        
        for (let i = 0; i < actualCount; i++) {
            revealedCards.push(player.deck.pop());
        }
        
        context.log(`${playerKey} looks at top ${actualCount} cards.`);
        
        // Set state for UI to render the selection modal/overlay
        context.gameState.pendingSelection = {
            cards: revealedCards,
            count: pickCount,
            type: 'pick_from_top',
            source: 'deck',
            remainingAction: remainingAction
        };
        
        if (context.renderAll) {
            context.renderAll();
        }

        return true;
    },

    /**
     * Handles "Digital Mosje:" conditional effects.
     */
    handleDigitalMosjeEffect: function(playerKey, card, context) {
        const p = context.gameState.players[playerKey];
        // Check for explicit type 'Digital' OR Technical trait > 0
        const hasDigital = p.mosjes.some(m => (m.type === 'Digital') || (m.traits && m.traits.Technical > 0));
        
        if (hasDigital) {
            // Use regex replace to be case-insensitive and handle potential spacing
            // Remove "Digital Mosje" and optional colon/spaces
            let remainingEffect = card.effect.replace(/^Digital Mosje:?\s*/i, '').trim();
            
            // Normalize "+10 MP" to "Gain 10 MP" to prevent split issues with "+"
            remainingEffect = remainingEffect.replace(/\+\s*(\d+)\s*MP/gi, 'Gain $1 MP');
            
            // Replace comma with " and " to ensure multi-effect parser catches it
            remainingEffect = remainingEffect.replace(',', ' and ');
            
            const tempCard = { ...card, effect: remainingEffect };
            return this.processCardEffect(playerKey, tempCard, context);
        } else {
            context.log(`${playerKey} activated ${card.name} but has no Digital Mosje (No effect)`);
            return true;
        }
    },

    /**
     * Handles "Next Quest" bonuses (e.g. "Next Quest +10 MP")
     */
    handleNextQuestEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        // Match "Next Quest +10 MP" or "Next Quest gives +10 MP" or "Next Quest ... 10 MP"
        const match = effectText.match(/Next Quest.*?(\d+)\s*MP/i);
        if (match && match[1]) {
            const bonus = parseInt(match[1]);
            const player = context.gameState.players[playerKey];
            if (!player.activeEffects) player.activeEffects = [];
            // If effect specifies 'choose', allow player to pick Mosje on quest resolution
            if (effectText.toLowerCase().includes('choose') || effectText.toLowerCase().includes('your choice')) {
                player.activeEffects.push(`NextQuestBonus:${bonus}:choose`);
                context.log(`${playerKey} will gain +${bonus} MP on next Quest (choose Mosje).`);
            } else {
                player.activeEffects.push(`NextQuestBonus:${bonus}`);
                context.log(`${playerKey} will gain +${bonus} MP on next Quest`);
            }
            return true;
        }
        return false;
    },

    /**
     * Handles Conditional MP (e.g. "Gain 20 MP if under 30 MP")
     */
    handleConditionalMPEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        const player = context.gameState.players[playerKey];
        
        // Parse condition "if under X MP"
        const condMatch = effectText.match(/if under (\d+)\s*MP/i);
        if (condMatch && condMatch[1]) {
            const threshold = parseInt(condMatch[1]);
            if (player.mp < threshold) {
                // Condition met, process the "Gain X MP" part
                // We can reuse handleSimpleMPEffect by stripping the condition
                const simpleEffect = effectText.split('if')[0].trim();
                this.handleSimpleMPEffect(playerKey, { ...card, effect: simpleEffect }, context);
            } else {
                context.log(`${playerKey} MP (${player.mp}) is not under ${threshold}. No effect.`);
            }
            return true;
        }
        return false;
    },

    /**
     * Handles "Binti:" conditional effects (Varkenspootjes).
     */
    handleBintiEffect: function(playerKey, card, context) {
        const player = context.gameState.players[playerKey];
        // Check if Binti is on the field
        const bintiMosje = player.mosjes.find(m => m.name.includes('Binti'));
        if (bintiMosje) {
            // +60 MP to Binti herself
            bintiMosje.mp = (bintiMosje.mp || 0) + 60;
            context.log(`${playerKey} (Binti active): Gained 60 MP from Varkenspootjes. MP: ${bintiMosje.mp - 60} -> ${bintiMosje.mp}`);
        } else {
            // -30 MP to team
            player.mp -= 30;
            context.popupMP(playerKey, -30);
            context.log(`${playerKey} (No Binti): Lost 30 MP from Varkenspootjes. MP: ${player.mp + 30} -> ${player.mp}`);
        }
        // Always recalc team MP
        if (player.mosjes && player.mosjes.length > 0) {
            player.mp = player.mosjes.reduce((sum, mos) => sum + (mos.mp || 0), 0);
        }
        context.popupMP(playerKey, bintiMosje ? 60 : -30);
        if (context.checkLevelUp) context.checkLevelUp(player, playerKey);
        return true;
    },

    /**
     * Handles simple MP Gain/Loss/Drain logic (extracted from original script)
     */
    handleSimpleMPEffect: function(playerKey, card, context) {
        const effectText = card.effect;
        const oppKey = playerKey === 'p1' ? 'p2' : 'p1';
        const player = context.gameState.players[playerKey];
        const opponent = context.gameState.players[oppKey];

        const gainMatch = effectText.match(/Gain\s*(\d+)/i) || effectText.match(/\+\s*(\d+)\s*MP/i);
        if (gainMatch) {
            let m = parseInt(gainMatch[1] || 0);
            
            // Check for Synergy Field
            if (player.activeEffects && player.activeEffects.includes('Synergy Field')) {
                m += 10;
                context.log('Synergy Field active: +10 MP bonus');
            }
            
            // TARGETING LOGIC (Individual Mosje)
            let targetMosje = player.mosjes[0];
            if (player.mosjes.length > 1) {
                // If we are in a context where we can't prompt (e.g. automated), default to first?
                // But usually we can prompt.
                const m1 = player.mosjes[0];
                const m2 = player.mosjes[1];
                const useFirst = confirm(`Select Mosje for +${m} MP:\nOK = ${m1.name}\nCancel = ${m2.name}`);
                targetMosje = useFirst ? m1 : m2;
            }
            
            if (targetMosje) {
                targetMosje.mp = (targetMosje.mp || 0) + m;
                context.log(`${playerKey} gained ${m} MP (Target: ${targetMosje.name}, MP: ${targetMosje.mp - m} -> ${targetMosje.mp})`);
            } else {
                // Fallback if no mosjes
                player.mp += m;
                context.log(`${playerKey} gained ${m} MP (Team Total, MP: ${player.mp - m} -> ${player.mp})`);
            }

            // Recalculate Team MP
            if (player.mosjes && player.mosjes.length > 0) {
                player.mp = player.mosjes.reduce((sum, mos) => sum + (mos.mp || 0), 0);
            }

            context.popupMP(playerKey, m);
            context.checkLevelUp(player, playerKey);
        } 
        else if (effectText.match(/Lose\s*\d+/i) || effectText.match(/drains\s*\d+/i) || effectText.match(/-\s*\d+\s*MP/i)) {
            // "Opponent loses...", "Lose...", or "-15 MP..."
            // We need to know WHO loses.
            
            let target = playerKey;
            let amount = parseInt(effectText.match(/\d+/)[0] || 0);

            if (effectText.toLowerCase().includes('opponent')) {
                target = oppKey;
                context.gameState.players[target].mp -= amount;
                context.popupMP(target, -amount);
                context.log(`${target} lost ${amount} MP. MP: ${context.gameState.players[target].mp + amount} -> ${context.gameState.players[target].mp}`);
            } else if (effectText.toLowerCase().includes('lose') || effectText.includes('-')) {
                // "Lose 10 MP" usually implies self unless specified
                // BUT if it's "-15 MP" and NOT opponent, it might be self cost.
                // However, usually "-X MP" on a card effect implies damage/cost to self OR damage to opponent if specified.
                // The user case: "-15 MP of opponent mosje" -> handled by 'opponent' check above.
                
                // If it falls through here, it's likely self (cost).
                context.gameState.players[target].mp -= amount;
                context.popupMP(target, -amount);
                context.log(`${target} lost ${amount} MP. MP: ${context.gameState.players[target].mp + amount} -> ${context.gameState.players[target].mp}`);
            }
        }
        else if (effectText.toLowerCase().includes('restore')) {
             let m = parseInt(effectText.match(/\d+/)[0] || 0);
             
             // Check for Resilient Bonus (e.g. "Resilient ★★: 35 MP")
             if (effectText.includes('Resilient') && player.mosjes.some(mos => mos.traits && mos.traits.Resilient >= 2)) {
                 const bonusMatch = effectText.match(/Resilient.*?:.*?(\d+)/i);
                 if (bonusMatch) {
                     m = parseInt(bonusMatch[1]);
                     context.log('Resilient Bonus applied!');
                 }
             }

             // Check for Synergy Field
             if (player.activeEffects && player.activeEffects.includes('Synergy Field')) {
                 m += 10;
                 context.log('Synergy Field active: +10 MP bonus');
             }

             // TARGETING LOGIC (Individual Mosje)
             let targetMosje = player.mosjes[0];
             if (player.mosjes.length > 1) {
                 const m1 = player.mosjes[0];
                 const m2 = player.mosjes[1];
                 const useFirst = confirm(`Select Mosje to Restore ${m} MP:\nOK = ${m1.name}\nCancel = ${m2.name}`);
                 targetMosje = useFirst ? m1 : m2;
             }

             if (targetMosje) {
                 targetMosje.mp = (targetMosje.mp || 0) + m;
                 context.log(`${playerKey} restored ${m} MP to ${targetMosje.name} (MP: ${targetMosje.mp - m} -> ${targetMosje.mp})`);
             } else {
                 player.mp += m;
                 context.log(`${playerKey} restored ${m} MP (Team Total, MP: ${player.mp - m} -> ${player.mp})`);
             }

             // Recalculate Team MP
             if (player.mosjes && player.mosjes.length > 0) {
                 player.mp = player.mosjes.reduce((sum, mos) => sum + (mos.mp || 0), 0);
             }

             context.popupMP(playerKey, m);
             context.checkLevelUp(player, playerKey);
        }
    }
};

// Expose to window/global scope
window.AdvancedLogic = AdvancedLogic;
