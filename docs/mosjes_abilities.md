# Mosjes Unique Abilities

This document lists each Mosje, their `abilityId`, a short description, and a verification `Status` so we can track which abilities are implemented and working.

- **AZN Cless** (id: `cless` - commented in deck)
  - abilityId: `cless_passive`
  - Ability: Risk & Reward (+ other synergies)
  - Status: Needs verification

- **Michelle** (id: `michelle`)
  - abilityId: `michelle_passive`
  - Ability: Tough Gamble (roll for Quest rewards) + Gandoe Synergy
  - Status: Needs verification

- **Gandoe** (id: `gandoe`)
  - abilityId: `gandoe_synergy`
  - Ability: Elimination Strike: 80 MP once/game; synergy with Michelle/Bowie/Stormey
  - Status: Needs verification

- **Alyssa (Bulldozer)** (id: `alyssa_bulldozer`)
  - abilityId: `alyssa_bulldozer`
  - Ability: Unstoppable: Draw 2, discard 1. Attempting Quests +10 MP. If Alyssa loses 30+ MP in one turn, regain 25 MP.
  - Status: Implemented (partial) — turn-end regain logic present, verify draw/discard behavior

- **Jisca** (id: `jisca`)
  - abilityId: `jisca_perfect_combo`
  - Ability: Perfect Combo: chance to activate another Piecie for 0 MP after activating one; chain effects on success/fail
  - Status: Needs verification

- **Jeffrey** (id: `jeffrey`)
  - abilityId: `jeffrey_passive`
  - Ability: Brute Force: Quests +10 MP, No MP-restore Piecies
  - Status: Needs verification

- **Martin (West)** (id: `west` / `martin`)
  - abilityId: `martin_active`
  - Ability: Calculated Guess: Name card type, draw 2 + 10 MP if correct
  - Status: Needs verification

- **Ronald** (id: `ronald`)
  - abilityId: `ronald_active`
  - Ability: Master Chef (Activated, once per turn): Discard a Food Piecie from your hand to search deck for any card and add it to your hand.
  - Status: Implemented (multiplayer reveal/usage state exists) — verify per-turn usage and UI hide when no Food Piecie in hand

- **Youri** (id: `youri`)
  - abilityId: `youri_active`
  - Ability: Speed Activate: Activate Piecie same turn + draw 1 (20 MP)
  - Status: Needs verification

- **Chris** (id: `chris`)
  - abilityId: `chris_active`
  - Ability: Perfect Setup: Activate face-down Piecie free + 15 MP
  - Status: Needs verification

- **DJ 80/20** (id: `dj`)
  - abilityId: `dj_passive`
  - Ability: Lucky Beats: Reroll dice once/turn + 10 MP/turn
  - Status: Implemented (reroll & start-turn MP present) — verify reroll integration

- **Coert (Luck)** (id: `coert_luck`)
  - abilityId: `coert_luck_passive`
  - Ability: Morning Luck: Roll 4-6 = free Piecie + Binti Food Synergy
  - Status: Needs verification

- **Cless (Teacher)** (id: `cless_teacher`)
  - abilityId: `cless_teacher_passive`
  - Ability: Teaching Moment: Activate Piecie -> Roll 5-6 = draw 1 + 5 MP
  - Status: Needs verification

- **Binti** (id: `binti`)
  - abilityId: `binti_active`
  - Ability: Cutting Words: discard opponent card + Coert Food synergy
  - Status: Needs verification

---
Notes:
- This list is generated from `docs/script.js` `STARTER_DECKS` entries and other mosje definitions found in the code. Some mosjes may appear in other decks or be added later; please point out any missing ones and I will add them.
- For each `Status: Needs verification`, I can run focused tests or add unit/E2E tests to confirm exact behavior.

Next actions you can request:
- I can mark which abilities are already fully implemented by scanning the code for `abilityId` usage and relevant handler functions.
- I can create small unit/E2E tests per ability to verify behavior automatically.
- I can convert this MD file into an HTML admin page with quick "Test ability" buttons to simulate and log outcomes.
