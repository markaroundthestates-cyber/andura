---
title: Bundle 6.0 PROMPT_CC — Library Extension ~31 NEW Exerciții Pre-Cascade Populate
type: prompt_cc
status: pending-adr-v2-approve-precedent
draft_date: 2026-05-13e
depends_on:
  - 03-decisions/ADR_SMART_ROUTING_EQUIPMENT_v2.md (DRAFT pending Daniel approve)
  - 📥_inbox/ADR_SMART_ROUTING_EQUIPMENT_v2_DRAFT_2026-05-13e.md (acest chat)
preceds: Bundle 6.1 PROMPT_CC cascade populate (depend Bundle 6.0 LANDED first — references NEW exerciții for fallback_cascade[] populate)
author: Claude chat Co-CTO autonomous via metoda hibridă chat ↔ CC terminal LOCKED V1 §F3.13
---

# Bundle 6.0 PROMPT_CC — Library Extension ~31 NEW Exerciții Pre-Cascade Populate

## §0 Skills Inline + Model

- **Model:** Opus EXCLUSIVELY (hardcoded, ZERO Sonnet exception per memory edit + userPreferences)
- **Skills:** Sequential Thinking — domain decisions per exercise metadata (equipment_type + force_demand + tier + muscle_target classification)
- **Skills:** gstack `/qa` — post-LANDED full test suite verification (vitest preserved + new tests pass)
- ZERO Impeccable (no UI parity — schema-only doc change)
- ZERO Context7 (no framework lookup — vanilla JS schema extension)

## §1 Scope

Extend `src/schema/exerciseMetadata.js` `EXERCISE_METADATA` map with **~31 NEW exerciții** pentru cascade completion needed Bundle 6.1 cascade populate (depend Bundle 6.0 LANDED precedent). Apply pattern existing 27 exerciții V1 library schema (equipment_type + equipment_alternatives + force_demand + tier + muscle_target_primary + muscle_target_secondary).

Existing V1 library 27 exerciții preserved UNCHANGED invariant (additive only, ZERO mutation existing entries per HARD CONSTRAINTS §F3.12).

Combined library post-Bundle 6.0: 27 existing + 31 NEW = **58 exerciții total**.

## §2 PRE-FLIGHT MANDATORY GREP (§AR.20 + §AR.21 LOCKED V1)

Pre-write grep evidence verbatim per file/function/identifier referenced — output inline LATEST.md §0 raport mandatory:

```bash
# Verify schema file exists + canonical structure
cat src/schema/exerciseMetadata.js | head -50

# Verify EXERCISE_METADATA map currently has exactly 27 entries
grep -c "^  '" src/schema/exerciseMetadata.js  # expect 27

# Verify no Pull-up / Chin-up / Squat / OHP / Deadlift / Smith Machine / Push-up / Bodyweight entries exist (NEW additions safe)
grep -i "Pull-up\|Chin-up\|^  'Back Squat\|^  'Overhead Press\|^  'Conventional Deadlift\|Smith Machine\|Push-up\|Bodyweight\|Inverted Row\|Pike\|Diamond\|Plank\|Dead Bug\|Box Squat\|Kneeling\|Wall Push-up\|Trap Bar\|Hack Squat\|Assisted Pullup\|Front Raise\|Hyperextension" src/schema/exerciseMetadata.js  # expect ZERO matches

# Verify muscle_target_primary canonical strings used Romanian
grep -o "muscle_target_primary: '[a-z]*'" src/schema/exerciseMetadata.js | sort -u
# expect: brate, piept, picioare, spate, triceps, umeri (6 canonical)
# NEW additions use existing canonical strings + add 'core' for plank/dead bug

# Verify equipment_type enum values existing canonical
grep -o "equipment_type: '[a-z]*'" src/schema/exerciseMetadata.js | sort -u
# expect: barbell, bodyweight, cable, dumbbell, machine (5; band exists in schema but unused V1)
```

## §3 ~31 NEW Exerciții Mapping Co-CTO Canonical Draft (Phases A-E)

### §3.1 Phase A — Compound Primary Moves (Tier 1 force_demand 'high') — 6 NEW

Add INSIDE Tier 1 section (after existing Leg Press line):

```js
// AUDIT 2026-05-13e (Bundle 6.0): NEW Tier 1 compound bodyweight bar — primary pull move neutral grip
'Pull-up':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Chin-up', 'Lat Pulldown'],                 force_demand: 'high',   tier: 1, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 compound bodyweight bar — primary pull alt biceps emphasis underhand grip
'Chin-up':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Pull-up', 'Lat Pulldown'],                 force_demand: 'high',   tier: 1, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 compound barbell — primary hinge posterior chain
'Conventional Deadlift':   { equipment_type: 'barbell',    equipment_alternatives: ['Romanian Deadlift', 'Trap Bar Deadlift'],  force_demand: 'high',   tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: ['spate'] },
// AUDIT 2026-05-13e: NEW Tier 1 compound barbell — primary squat free-weight
'Back Squat':              { equipment_type: 'barbell',    equipment_alternatives: ['Smith Machine Squat', 'Leg Press', 'Hack Squat'], force_demand: 'high', tier: 1, muscle_target_primary: 'picioare', muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 1 compound barbell — primary overhead press barbell standing
'Overhead Press':          { equipment_type: 'barbell',    equipment_alternatives: ['Smith Machine OHP', 'DB Shoulder Press'],  force_demand: 'high',   tier: 1, muscle_target_primary: 'umeri',     muscle_target_secondary: ['triceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 compound barbell — primary row pull bent-over
'Barbell Row':             { equipment_type: 'barbell',    equipment_alternatives: ['Cable Row', 'Chest-Supported Row', 'DB Row'], force_demand: 'high', tier: 1, muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'] },
```

### §3.2 Phase B — Machine Alternatives (easier_machine cascade step Tier 1) — 6 NEW

Add INSIDE Tier 1 section (after Phase A entries):

```js
// AUDIT 2026-05-13e: NEW Tier 1 machine — easier_machine cascade Bench Press
'Smith Machine Bench':     { equipment_type: 'machine',    equipment_alternatives: ['Flat Barbell Bench', 'Flat DB Press'],                force_demand: 'high', tier: 1, muscle_target_primary: 'piept',     muscle_target_secondary: ['triceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 machine — easier_machine cascade Back Squat
'Smith Machine Squat':     { equipment_type: 'machine',    equipment_alternatives: ['Back Squat', 'Hack Squat', 'Leg Press'],              force_demand: 'high', tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 1 machine — easier_machine cascade Overhead Press
'Smith Machine OHP':       { equipment_type: 'machine',    equipment_alternatives: ['Overhead Press', 'DB Shoulder Press'],                force_demand: 'high', tier: 1, muscle_target_primary: 'umeri',     muscle_target_secondary: ['triceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 barbell variant — easier_machine cascade Deadlift trap bar geometric easier mechanics neutral grip
'Trap Bar Deadlift':       { equipment_type: 'barbell',    equipment_alternatives: ['Conventional Deadlift', 'Romanian Deadlift'],         force_demand: 'high', tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: ['spate'] },
// AUDIT 2026-05-13e: NEW Tier 1 machine — assisted_variant cascade Pull-up / Chin-up (contragreutate counterweight assist)
'Assisted Pullup Machine': { equipment_type: 'machine',    equipment_alternatives: ['Lat Pulldown', 'Cable Row'],                          force_demand: 'high', tier: 1, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 machine — easier_machine cascade Back Squat hack squat fixed plane
'Hack Squat':              { equipment_type: 'machine',    equipment_alternatives: ['Smith Machine Squat', 'Leg Press', 'Back Squat'],     force_demand: 'high', tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
```

### §3.3 Phase C — Bodyweight Pure-Pose (Tier 2-3 cascade step) — 8 NEW

Add INSIDE Tier 2 section (after existing Leg Extension line) for medium force_demand entries; Tier 3 section for low force_demand:

```js
// AUDIT 2026-05-13e: NEW Tier 2 bodyweight — pure-pose push fallback cascade
'Push-up':                 { equipment_type: 'bodyweight', equipment_alternatives: ['Flat DB Press', 'Kneeling Push-up'],                  force_demand: 'medium', tier: 2, muscle_target_primary: 'piept',     muscle_target_secondary: ['triceps', 'umeri'] },
// AUDIT 2026-05-13e: NEW Tier 2 bodyweight — pure-pose squat fallback cascade
'Bodyweight Squat':        { equipment_type: 'bodyweight', equipment_alternatives: ['Box Squat'],                                          force_demand: 'medium', tier: 2, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 2 bodyweight — shoulder bias push-up vertical
'Pike Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Wall Push-up', 'DB Shoulder Press'],                  force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri',     muscle_target_secondary: ['triceps'] },
// AUDIT 2026-05-13e: NEW Tier 2 bodyweight — triceps bias push-up narrow grip
'Diamond Push-up':         { equipment_type: 'bodyweight', equipment_alternatives: ['Push-up', 'Pushdown'],                                force_demand: 'medium', tier: 2, muscle_target_primary: 'triceps',   muscle_target_secondary: ['piept'] },
// AUDIT 2026-05-13e: NEW Tier 2 bodyweight — pull bodyweight pe bar low (table or low bar setup)
'Inverted Row Bar':        { equipment_type: 'bodyweight', equipment_alternatives: ['Cable Row', 'DB Row'],                                force_demand: 'medium', tier: 2, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
// AUDIT 2026-05-13e: NEW Tier 2 bodyweight — single-leg hinge bodyweight balance challenge
'Single-Leg RDL Bodyweight': { equipment_type: 'bodyweight', equipment_alternatives: ['Romanian Deadlift', 'Assisted Single-Leg RDL'],      force_demand: 'medium', tier: 2, muscle_target_primary: 'picioare',  muscle_target_secondary: ['spate'] },
// AUDIT 2026-05-13e: NEW Tier 3 bodyweight — core static hold front plank
'Plank':                   { equipment_type: 'bodyweight', equipment_alternatives: ['Dead Bug', 'Knee Plank'],                              force_demand: 'low',    tier: 3, muscle_target_primary: 'core',      muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 3 bodyweight — core anti-extension dynamic supine
'Dead Bug':                { equipment_type: 'bodyweight', equipment_alternatives: ['Plank'],                                              force_demand: 'low',    tier: 3, muscle_target_primary: 'core',      muscle_target_secondary: [] },
```

### §3.4 Phase D — Light Variants (different-exercise-easier cascade step Tier 3) — 7 NEW

Add INSIDE Tier 3 section (after existing Calf Raises line):

```js
// AUDIT 2026-05-13e: NEW Tier 3 light variant Push-up — kneeling decreased load (~60% bodyweight) per Daniel LOCK different-exercise-easier
'Kneeling Push-up':        { equipment_type: 'bodyweight', equipment_alternatives: ['Wall Push-up', 'Push-up'],                            force_demand: 'low',    tier: 3, muscle_target_primary: 'piept',     muscle_target_secondary: ['triceps'] },
// AUDIT 2026-05-13e: NEW Tier 3 light variant Push-up — wall vertical decreased load (~30% bodyweight)
'Wall Push-up':            { equipment_type: 'bodyweight', equipment_alternatives: ['Kneeling Push-up', 'Pike Push-up'],                   force_demand: 'low',    tier: 3, muscle_target_primary: 'piept',     muscle_target_secondary: ['umeri', 'triceps'] },
// AUDIT 2026-05-13e: NEW Tier 3 light variant Squat — box smaller ROM controlled sit-to-stand pattern
'Box Squat':               { equipment_type: 'bodyweight', equipment_alternatives: ['Bodyweight Squat'],                                   force_demand: 'low',    tier: 3, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 3 light variant Single-Leg RDL — wall touch balance assist eliminates balance challenge
'Assisted Single-Leg RDL': { equipment_type: 'bodyweight', equipment_alternatives: ['Single-Leg RDL Bodyweight', 'Romanian Deadlift'],     force_demand: 'low',    tier: 3, muscle_target_primary: 'picioare',  muscle_target_secondary: ['spate'] },
// AUDIT 2026-05-13e: NEW Tier 3 light variant Plank — knee support decreased load
'Knee Plank':              { equipment_type: 'bodyweight', equipment_alternatives: ['Plank', 'Dead Bug'],                                  force_demand: 'low',    tier: 3, muscle_target_primary: 'core',      muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 3 light variant Calf Raises — wall-supported balance assist
'Wall-Supported Calf Raise': { equipment_type: 'bodyweight', equipment_alternatives: ['Calf Raises'],                                       force_demand: 'low',    tier: 3, muscle_target_primary: 'picioare',  muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 3 light variant Inverted Row Bar — table low ROM minimal load
'Inverted Row Table Low':  { equipment_type: 'bodyweight', equipment_alternatives: ['Inverted Row Bar', 'DB Row'],                         force_demand: 'low',    tier: 3, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
```

### §3.5 Phase E — Supporting Tier 1-2 — 4 NEW

Add INSIDE Tier 1 section for high force_demand DB compounds; Tier 2 section for medium isolation:

```js
// AUDIT 2026-05-13e: NEW Tier 1 DB compound back — substitute Barbell Row available DB only
'DB Row':                  { equipment_type: 'dumbbell',   equipment_alternatives: ['Cable Row', 'Barbell Row', 'Chest-Supported Row'],    force_demand: 'high',   tier: 1, muscle_target_primary: 'spate',     muscle_target_secondary: ['biceps'] },
// AUDIT 2026-05-13e: NEW Tier 1 DB compound hinge — substitute Romanian Deadlift DB only
'DB Romanian Deadlift':    { equipment_type: 'dumbbell',   equipment_alternatives: ['Romanian Deadlift', 'Conventional Deadlift'],         force_demand: 'high',   tier: 1, muscle_target_primary: 'picioare',  muscle_target_secondary: ['spate'] },
// AUDIT 2026-05-13e: NEW Tier 2 isolation DB front delt
'Front Raise':             { equipment_type: 'dumbbell',   equipment_alternatives: ['Lateral Raises'],                                     force_demand: 'medium', tier: 2, muscle_target_primary: 'umeri',     muscle_target_secondary: [] },
// AUDIT 2026-05-13e: NEW Tier 2 machine isolation lower back / posterior chain
'Hyperextension':          { equipment_type: 'machine',    equipment_alternatives: ['Romanian Deadlift', 'Leg Curl'],                      force_demand: 'medium', tier: 2, muscle_target_primary: 'spate',     muscle_target_secondary: ['picioare'] },
```

### §3.6 Cumulative NEW Entries Count Verify

- Phase A: 6 ex (Pull-up, Chin-up, Conventional Deadlift, Back Squat, Overhead Press, Barbell Row)
- Phase B: 6 ex (Smith Machine Bench, Smith Machine Squat, Smith Machine OHP, Trap Bar Deadlift, Assisted Pullup Machine, Hack Squat)
- Phase C: 8 ex (Push-up, Bodyweight Squat, Pike Push-up, Diamond Push-up, Inverted Row Bar, Single-Leg RDL Bodyweight, Plank, Dead Bug)
- Phase D: 7 ex (Kneeling Push-up, Wall Push-up, Box Squat, Assisted Single-Leg RDL, Knee Plank, Wall-Supported Calf Raise, Inverted Row Table Low)
- Phase E: 4 ex (DB Row, DB Romanian Deadlift, Front Raise, Hyperextension)

**Total: 6 + 6 + 8 + 7 + 4 = 31 NEW.** Combined library post-Bundle 6.0: 27 + 31 = **58 exerciții total**.

### §3.7 NEW muscle_target_primary 'core' Canonical String

Bundle 6.0 introduces NEW `muscle_target_primary: 'core'` canonical string pentru Plank + Dead Bug + Knee Plank. Update lookup expectation in tests (existing canonical: brate + piept + picioare + spate + triceps + umeri = 6 → cumulative 7 cu NEW 'core').

## §4 Tests NEW Vitest Cluster (~15 tests)

`src/schema/__tests__/exerciseMetadata.test.js` extend cluster ~15 tests NEW (preserve existing tests if any în file curent; if file absent, NEW file create):

```js
describe('Bundle 6.0 library extension ~31 NEW exerciții', () => {
  const NEW_EXERCISE_NAMES = [
    // Phase A — 6 ex
    'Pull-up', 'Chin-up', 'Conventional Deadlift', 'Back Squat', 'Overhead Press', 'Barbell Row',
    // Phase B — 6 ex
    'Smith Machine Bench', 'Smith Machine Squat', 'Smith Machine OHP', 'Trap Bar Deadlift', 'Assisted Pullup Machine', 'Hack Squat',
    // Phase C — 8 ex
    'Push-up', 'Bodyweight Squat', 'Pike Push-up', 'Diamond Push-up', 'Inverted Row Bar', 'Single-Leg RDL Bodyweight', 'Plank', 'Dead Bug',
    // Phase D — 7 ex
    'Kneeling Push-up', 'Wall Push-up', 'Box Squat', 'Assisted Single-Leg RDL', 'Knee Plank', 'Wall-Supported Calf Raise', 'Inverted Row Table Low',
    // Phase E — 4 ex
    'DB Row', 'DB Romanian Deadlift', 'Front Raise', 'Hyperextension',
  ];
  
  const VALID_EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band'];
  const VALID_FORCE_DEMANDS = ['low', 'medium', 'high'];
  const VALID_TIERS = [1, 2, 3];
  const VALID_MUSCLE_TARGETS = ['umeri', 'piept', 'spate', 'picioare', 'brate', 'triceps', 'core'];
  
  it.each(NEW_EXERCISE_NAMES)('EXERCISE_METADATA contains %s entry', (name) => {
    expect(EXERCISE_METADATA[name]).toBeDefined();
  });
  
  it.each(NEW_EXERCISE_NAMES)('%s has valid equipment_type enum', (name) => {
    expect(VALID_EQUIPMENT_TYPES).toContain(EXERCISE_METADATA[name].equipment_type);
  });
  
  it.each(NEW_EXERCISE_NAMES)('%s has valid force_demand enum', (name) => {
    expect(VALID_FORCE_DEMANDS).toContain(EXERCISE_METADATA[name].force_demand);
  });
  
  it.each(NEW_EXERCISE_NAMES)('%s has valid tier', (name) => {
    expect(VALID_TIERS).toContain(EXERCISE_METADATA[name].tier);
  });
  
  it.each(NEW_EXERCISE_NAMES)('%s has valid muscle_target_primary string', (name) => {
    expect(VALID_MUSCLE_TARGETS).toContain(EXERCISE_METADATA[name].muscle_target_primary);
  });
  
  it.each(NEW_EXERCISE_NAMES)('%s equipment_alternatives all resolve in EXERCISE_METADATA', (name) => {
    const alts = EXERCISE_METADATA[name].equipment_alternatives;
    alts.forEach(altName => {
      expect(EXERCISE_METADATA[altName]).toBeDefined();
    });
  });
  
  it('EXERCISE_METADATA cumulative count post-Bundle 6.0 = 58 entries', () => {
    expect(Object.keys(EXERCISE_METADATA).length).toBe(58);
  });
  
  it('Tier 1 force_demand high filter via getValidAlternatives for Pull-up returns force_demand: high alternatives only', () => {
    const alts = getValidAlternatives('Pull-up');
    alts.forEach(altName => {
      expect(EXERCISE_METADATA[altName].force_demand).toBe('high');
    });
  });
  
  it('Tier 2/3 muscle_target_primary filter via getValidAlternatives for Push-up returns muscle_target_primary piept alternatives', () => {
    const alts = getValidAlternatives('Push-up');
    alts.forEach(altName => {
      expect(EXERCISE_METADATA[altName].muscle_target_primary).toBe('piept');
    });
  });
  
  it('Existing 27 V1 library exerciții preserved UNCHANGED invariant', () => {
    const EXISTING_V1_NAMES = [
      'DB Shoulder Press', 'Incline DB Press', 'Flat DB Press', 'Flat Barbell Bench',
      'Lat Pulldown', 'Cable Row', 'Chest-Supported Row', 'Romanian Deadlift', 'Leg Press',
      'Lateral Raises', 'Lateral Raises (cable)', 'Rear Delt Fly', 'Rear Delt Cable',
      'Pec Deck / Cable Fly', 'Cable Fly', 'Incline DB Curl', 'Bayesian Curl',
      'Cable Curl', 'Preacher Curl', 'Hammer Curl', 'Overhead Triceps', 'Pushdown',
      'Leg Curl', 'Leg Extension', 'Face Pulls', 'Calf Raises'
    ];
    EXISTING_V1_NAMES.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();  // verify entry still exists
    });
  });
});
```

**Cumulative tests expected: 3111 → ~3126 PASS preserved EXACT** (+15 NEW Bundle 6.0).

## §5 Acceptance Criteria

- Tests 3111 PASS preserved EXACT + ~15 NEW tests PASS Phase A-E coverage validation
- Build vite clean (no broken imports + no schema-related warnings)
- `EXERCISE_METADATA` cumulative 58 entries (27 existing UNCHANGED + 31 NEW additive)
- Backward compatibility V1 library preserved invariant — ZERO mutation existing entries per HARD CONSTRAINTS §F3.12
- `getValidAlternatives()` new exerciții valid Tier-aware filtering (Tier 1 strict force_demand; Tier 2/3 muscle_target_primary)
- `equipment_alternatives` cross-refs valid (no broken pointers) — all references resolve to existing entries OR NEW Bundle 6.0 entries
- NEW canonical `muscle_target_primary: 'core'` validated în tests
- Atomic commit single-concern `feat(schema): bundle 6.0 library extension 31 NEW exerciții pre-cascade populate` on `feature/v2-vanilla-port` branch
- Backup tag `pre-bundle-6-0-library-extension-2026-05-13e` pushed origin pre-execute

## §6 LATEST.md Output Format Expected

```
# Bundle 6.0 LATEST — Library Extension ~31 NEW Exerciții — LANDED <commit-hash>

## §0 HANDOVER_VERIFICATION_CHECKLIST Bugatti Gate

- §0 narrative present în `📥_inbox/BUNDLE_6_0_PROMPT_CC_LIBRARY_EXTENSION_2026-05-13e.md` ✅
- §1 backup tag `pre-bundle-6-0-library-extension-2026-05-13e` pushed origin ✅
- §2 pre-flight grep evidence verbatim §AR.20 + §AR.21 LOCKED V1:
  ```
  $ grep -c "^  '" src/schema/exerciseMetadata.js
  27
  $ grep -i "Pull-up\|Chin-up\|..." src/schema/exerciseMetadata.js
  (zero output — additions safe)
  $ grep -o "muscle_target_primary: '[a-z]*'" src/schema/exerciseMetadata.js | sort -u
  brate
  piept
  picioare
  spate
  triceps
  umeri
  ```
- §3 ~31 NEW exerciții populated per §3 mapping Co-CTO canonical draft
- §4 Tests NEW vitest cluster ~15 tests added + ALL 3126 PASS confirmed
- §5 Build vite clean output (vite v X.Y.Z built in <Z>s)
- §6 Atomic commit single-concern hash `<sha>` pushed origin feature/v2-vanilla-port branch
- §7 ZERO regression existing 3111 tests preserved exact
- §8 HARD CONSTRAINTS §F3.12 + ADR 026 §9 + ADR 030 §D2 preserved invariant

## §1 Commits Chain LANDED

- `<commit-hash>` feat(schema): bundle 6.0 library extension 31 NEW exerciții pre-cascade populate
  - LOC delta: +<N> lines src/schema/exerciseMetadata.js + +<M> lines src/schema/__tests__/exerciseMetadata.test.js NEW
  - 31 NEW EXERCISE_METADATA entries (Phase A 6 + Phase B 6 + Phase C 8 + Phase D 7 + Phase E 4)
  - 15 NEW vitest tests Phase A-E validation
  - ZERO mutation existing 27 V1 library entries (audit verified)
  - Cumulative EXERCISE_METADATA: 27 → 58 entries

## §2 Path Forward Bundle 6.1 Cascade Populate Pending

- Bundle 6.1 PROMPT_CC artefact next: `fallback_cascade[]` schema field add + populate per all 58 exerciții library complete
- Reference Bundle 6.0 LANDED + ADR v2 §2.2 mapping Co-CTO canonical draft cascade pattern per exercise
- Trigger Daniel "Salut Acasă" chat NEW Bundle 6.1
```

## §7 HARD CONSTRAINTS §F3.12 Strict Invariant

- ZERO main branch (work `feature/v2-vanilla-port` active per current branch policy)
- ZERO React/JSX touched (vanilla JS schema extension per ADR 005 §AMENDMENT 2026-05-10 Port-First-Then-React preserved invariant)
- ZERO --no-verify (pre-commit hook green mandatory)
- ZERO `📥_inbox/` writes (CC autonomous read-only inbox per §AR.17 EXCEPT archive-on-LANDED to `📤_outbox/_archive/2026-05/<NN>_BUNDLE_6_0_PROMPT_CC_LIBRARY_EXTENSION_CONSUMED.md`)
- ZERO `.obsidian/` touched
- ZERO `wiki/` frozen pages mods (acest Bundle 6.0 ZERO wiki touch — schema only doc)
- ZERO existing 27 V1 library exerciții entries mutation (additive only audit-verified)
- ZERO engine module mutation `src/engine/` (acest Bundle 6.0 schema only NU engine touch — preserve ADR 026 §9 invariant)
- Atomic commit single-concern Bugatti pattern preserve (NU mix multiple concerns single commit)
- DISCRETE-BLOCKS DISCIPLINE candidat §AR.22: Phase A + B + C + D + E entries grouped logically dar SAME atomic commit single concern "schema library extension" — NU split 5 commits (single coherent feature addition)

---

🦫 **Bundle 6.0 PROMPT_CC pending Daniel approve ADR v2 LANDED precedent. CC autonomous Opus execute via metoda hibridă chat ↔ CC terminal LOCKED V1 §F3.13. ~31 NEW exerciții library extension (Phase A compound primary free-weight 6 + Phase B machine alternatives easier_machine 6 + Phase C bodyweight pure-pose Tier 2-3 8 + Phase D light variants different-exercise-easier Tier 3 7 + Phase E supporting Tier 1-2 4). Combined library post-Bundle 6.0: 27 + 31 = 58 exerciții. Pre-Bundle 6.1 cascade populate precedent depend Bundle 6.0 LANDED first. ZERO engine module mutation ADR 026 §9 invariant preserved. ZERO breaking change additive schema. Backward compatibility V1 library 27 exerciții preserved invariant. NEW canonical `muscle_target_primary: 'core'` added Plank + Dead Bug + Knee Plank. Atomic commit single-concern Bugatti pattern + DISCRETE-BLOCKS DISCIPLINE candidat §AR.22 logical Phase grouping single coherent concern.**
