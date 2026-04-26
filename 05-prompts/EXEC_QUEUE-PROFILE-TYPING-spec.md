# EXEC_QUEUE Spec — Profile Typing Layer

**Pentru:** `10-exec-queue/EXEC_QUEUE.md`  
**Task:** PROFILE-TYPING  
**Type:** Append after TASK AA-DETECTION  
**Dependencies:** ADR 011 schema additions pushed, ADR 014 NOT required (consume self-report data only — schema definition în ADR 014 sau spec follow-up)  
**Sequencing:** Pasul 3 din 8-step plan post-handover

---

## TASK PROFILE-TYPING — Profile Typing Detection Layer
**Model:** Sonnet
**Type:** EXEC (engine module pure functions)
**Priority:** HIGH
**Status:** PENDING
**Created:** 2026-04-26
**Estimated:** 30-45 min real (Sonnet xhigh, ratio 0.25-0.35 — refactor MECANIC clear-scoped)

**Description:**

Implementează `src/engine/profileTyping.js` ca pure functions module conform ADR 013 §Profile typing + HANDOVER 2026-04-26-evening §Profile Typing Design. 4 profiles: Sprinter, Marathon, Yo-yo, Strategic.

Module pure inference + counter-markers logic + YO-YO_RISK preventive detection + confidence calculation. NO thresholds calibration (per profile) — that's AA v1.1 future task.

**SCOPE STRICT:** Engine module pure ONLY. NU atinge:
- `src/engine/autoAggressionDetection.js` (paralel module, can run independent)
- `src/engine/coachContext.js` (integration = future task)
- Onboarding UI / reconciliation prompt UI / friction modal (separate spec post ADR 014)
- profile-history storage (read/write helpers definite în ADR 014 sau onboarding UI spec — NOT here)

**Pre-flight verifications:**

```bash
# Verify CDL API + extension fields available
grep -n "export function" src/util/coachDecisionLog.js
grep -A 5 "outcome.autoAggression\|outcome.rest_marked" docs/decisions/011-coach-decision-log-architecture.md

# Verify CDL fixtures exists
ls tests/fixtures/cdlEntries.js

# Verify ADR 013 references profile typing section
grep -A 5 "Profile typing" docs/decisions/013-auto-aggression-detection.md | head -20

# Verify autoAggressionDetection module exists OR flag (paralel task — may not be done yet)
ls src/engine/autoAggressionDetection.js 2>/dev/null || echo "AA module NOT YET — OK, profileTyping is independent"

# Verify isoWeek utility (same dependency as AA)
grep -rn "isoWeek\|getISOWeek" src/ --include="*.js" | head -5
```

**GATE:** 
- ADR 011 schema additions absent → STOP
- CDL fixtures absent → STOP, run TASK CDL-FIXTURES first
- AA module absent → OK, profileTyping is INDEPENDENT (consume CDL signals directly, NOT via aggregateAutoAggression)
- isoWeek absent → flag, decision needed (use existing or import)

---

**Module spec — `src/engine/profileTyping.js`:**

```javascript
/**
 * Profile Typing — pure functions module.
 *
 * 4 profiles: Sprinter, Marathon, Yo-yo, Strategic.
 *
 * Hybrid approach (per ADR 013):
 *   - Self-report from onboarding (Q1-Q5 scoring)
 *   - Behavioral inference from CDL (4-6 weeks observation)
 *   - Reconciliation (silent or prompt) when self-report ≠ behavioral
 *
 * No side effects. Caller (onboarding UI / reconciliation prompt) decides actions.
 *
 * Reference: ADR 013 §Profile typing
 *            HANDOVER 2026-04-26-evening §Profile Typing Design COMPLET
 *            ADR 014 (when published — schema profile-history + reconciliation prompts UI)
 */
```

**Public API:**

```javascript
/**
 * Main entry — analyze profile from self-report + behavioral data.
 *
 * @param {object} opts
 * @param {object|null} opts.selfReport - { primary, secondary, confidence, scores, flags } from Q1-Q5 scoring, or null
 * @param {Array} opts.cdlEntries - CDL entries last 4-6 weeks (caller filters window)
 * @param {object} [opts.hyperfocusData] - optional, passed-through for amplifier
 * @returns {object} - profile result
 */
export function analyzeProfile({ selfReport, cdlEntries, hyperfocusData }) {
  // Returns:
  // {
  //   primary: 'Sprinter' | 'Marathon' | 'Yo-yo' | 'Strategic' | null,
  //   secondary: 'Sprinter' | ... | null,
  //   confidence: 'high' | 'medium' | 'low',
  //   source: 'self-report' | 'behavioral' | 'reconciled',
  //   selfReport: { ... } | null,        // pass-through input
  //   behavioral: { primary, confidence, signature, dataPoints } | null,
  //   reconciliation: 'match' | 'mismatch' | null,  // null if behavioral insufficient
  //   riskFlags: ['YO-YO_RISK'] | [],
  //   reasoning: string  // human-readable explanation for reconciliation prompt
  // }
}

/**
 * Behavioral inference from CDL only (no self-report).
 * Used when source='behavioral' or for reconciliation comparison.
 *
 * @param {Array} cdlEntries - last 4-6 weeks
 * @param {object} [hyperfocusData]
 * @returns {object} - { primary, confidence, signature, dataPoints, sessionCount }
 */
export function inferBehavioralProfile(cdlEntries, hyperfocusData) { ... }

/**
 * Detect YO-YO_RISK preventive (3-4 weeks signature).
 * Triggers BEFORE drop pattern manifests — diferentiator real SalaFull.
 *
 * @param {Array} cdlEntries
 * @returns {boolean}
 */
export function detectYoyoRisk(cdlEntries) { ... }

/**
 * Compute counter-markers per profile.
 * Used in confidence calculation + drill-down "Detalii" în reconciliation prompt.
 *
 * @param {string} profile - 'Sprinter' | 'Marathon' | 'Yo-yo' | 'Strategic'
 * @param {Array} cdlEntries
 * @returns {Array} - list of counter-marker descriptions matched
 */
export function computeCounterMarkers(profile, cdlEntries) { ... }

/**
 * Determine reconciliation action based on self-report vs behavioral.
 *
 * @param {object} selfReport
 * @param {object} behavioral
 * @returns {string} - 'match_silent' | 'match_first_prompt' | 'mismatch_high' | 'mismatch_lowmed' | 'insufficient' | 'stale'
 */
export function reconciliationAction(selfReport, behavioral) { ... }
```

**Internal helpers:**

```javascript
// Profile signature checks (return number of matched signature markers)

export function _matchSprinterSignature(cdlEntries, hyperfocusData) { ... }
// Volume creep frequency ≥2, frustration markers, hyperfocus, recovery debt med-high, calorie acceleration

export function _matchMarathonSignature(cdlEntries) { ... }
// Consistency ≥80%, volume creep zero/rare, recovery debt low, deviation low, rating stable

export function _matchYoyoSignature(cdlEntries, hyperfocusData) { ... }
// Volume initial agresiv, calorie acceleration rapid, ZERO rest_marked în primele săpt, frustration ABSENTE high commitment, hyperfocus PREZENT INTENS

export function _matchStrategicSignature(cdlEntries) { ... }
// Deviation conștientă cu reason logged, early-stops cu reason, response la suggested adjustment, low impulsivity

// Counter-marker checks (return array of strings describing counter-markers)

export function _counterMarkersSprinter(cdlEntries) { ... }
// Counter: consistency ridicată cu rest planificat

export function _counterMarkersMarathon(cdlEntries) { ... }
// Counter: volume creep frequent

export function _counterMarkersYoyo(cdlEntries) { ... }
// Counter: sustained intensity cu rhythm

export function _counterMarkersStrategic(cdlEntries) { ... }
// Counter: volume creep impulsiv fără reason logged

// Confidence calculation per HANDOVER

export function _computeConfidence(signatureMarkers, counterMarkers) { ... }
// HIGH: ≥3 signature markers AND zero counter-markers
// MEDIUM: 2 signature markers AND ≤1 counter-marker
// LOW: <2 signature markers OR ≥2 counter-markers

// Behavioral data assertion check

export function _hasInsufficientData(cdlEntries) { ... }
// <12 sessions in 6-week window → insufficient_data flag
// 0 sessions in 6-week window → stale_self_report flag
```

**Output structure (analyzeProfile):**

```javascript
{
  primary: 'Sprinter',
  secondary: 'Marathon' | null,
  confidence: 'high' | 'medium' | 'low',
  source: 'self-report' | 'behavioral' | 'reconciled',
  selfReport: { ... } | null,        // pass-through
  behavioral: {
    primary: 'Sprinter',
    confidence: 'high',
    signature: { Sprinter: 4, Marathon: 0, Yoyo: 1, Strategic: 0 },  // signature marker counts
    dataPoints: [
      'Volume creep: 4 sesiuni din 12',
      'Recovery debt: 3 săpt consecutiv',
      'Hyperfocus pattern: 8h+/zi 4 zile/săpt',
      // ...
    ],
    sessionCount: 16
  } | null,
  reconciliation: 'match' | 'mismatch' | null,
  riskFlags: ['YO-YO_RISK'] | [],
  reasoning: 'Pattern observat se aliniază cu Sprinter (volume creep + recovery debt). Self-report: Strategic. Mismatch HIGH confidence — reconciliation prompt recommended.'
}
```

**Reconciliation cases (per HANDOVER 2026-04-26-evening):**

| Self-report | Behavioral confidence | Action |
|---|---|---|
| Match (same primary) | HIGH | Prima reconciliation: 'match_first_prompt'. Subsequent: 'match_silent' (caller checks profileHistory) |
| Match | MED/LOW | 'match_silent' |
| Mismatch primary | HIGH | 'mismatch_high' |
| Mismatch | MED/LOW | 'mismatch_lowmed' |
| <12 sessions, week 6 | any | 'insufficient' |
| 0 sessions, week 6 | n/a | 'stale' |

**NOTE:** "first prompt" detection requires reading profileHistory (was prima reconciliation pentru acest user?). profileTyping module receives this as `opts.previousReconciliations` array (caller passes from profile-history storage). Module is pure — does NOT read storage directly.

Update API:

```javascript
analyzeProfile({ selfReport, cdlEntries, hyperfocusData, previousReconciliations = [] })
```

**Tests — `src/engine/__tests__/profileTyping.test.js`:**

Minim 18 tests, mandatory:

**Behavioral inference per profile (4 tests):**
1. `inferBehavioralProfile` returns Sprinter on Sprinter signature CDL fixture
2. `inferBehavioralProfile` returns Marathon on Marathon signature
3. `inferBehavioralProfile` returns Yo-yo on Yo-yo signature (post-drop case)
4. `inferBehavioralProfile` returns Strategic on Strategic signature

**Counter-markers (4 tests):**
5. Sprinter primary + consistency ridicată → counter-marker matched
6. Marathon primary + volume creep frequent → counter-marker matched
7. Yo-yo primary + sustained rhythm → counter-marker matched
8. Strategic primary + impulsive volume creep → counter-marker matched

**Confidence calculation (3 tests):**
9. HIGH confidence: 3+ signature markers + zero counter
10. MEDIUM: 2 signature + 1 counter
11. LOW: <2 signature OR 2+ counter

**YO-YO_RISK detection (2 tests):**
12. 3 weeks all-in pattern (volume aggressive + zero rest_marked + zero frustration) → YO-YO_RISK flag
13. 3 weeks consistent volume cu 2+ rest days → NO flag

**Reconciliation actions (4 tests):**
14. Self-report=Strategic, behavioral=Strategic HIGH, no previous → 'match_first_prompt'
15. Self-report=Strategic, behavioral=Strategic HIGH, 1 previous → 'match_silent'
16. Self-report=Strategic, behavioral=Sprinter HIGH → 'mismatch_high'
17. Self-report=Strategic, 8 sessions in 6 weeks → 'insufficient'

**Edge cases (2 tests):**
18. analyzeProfile cu selfReport=null + cdlEntries=clean → behavioral-only path, source='behavioral'
19. analyzeProfile cu cdlEntries=[] + selfReport populated → source='self-report', behavioral=null
20. analyzeProfile cu both null → returns null primary, low confidence

**Test structure:**

```javascript
import { describe, it, expect } from 'vitest';
import {
  analyzeProfile,
  inferBehavioralProfile,
  detectYoyoRisk,
  computeCounterMarkers,
  reconciliationAction,
  // internal helpers
} from '../profileTyping.js';
import {
  scenarioVolumeCreep,
  scenarioRecoveryDebt,
  scenarioClean,
  // ... fixtures
} from '../../../tests/fixtures/cdlEntries.js';

describe('profileTyping — Behavioral inference', () => {
  it('returns Sprinter on Sprinter signature CDL', () => {
    const entries = scenarioVolumeCreep({ count: 4, baseDate: '2026-03-15' });
    const result = inferBehavioralProfile(entries);
    expect(result.primary).toBe('Sprinter');
    expect(result.confidence).toBe('high');
  });
  // ... etc
});
```

**NOTE pe fixtures:** Profile Typing tests pot necesita fixtures suplimentare față de TASK CDL-FIXTURES (Sprinter signature, Marathon signature, etc.). Dacă fixtures lipsesc → adaugă în `tests/fixtures/cdlEntries.js` în acest task (extend CDL-FIXTURES, NU separate file). Bag în acceptance: "extension la CDL fixtures dacă necesar".

**Build + tests:**

- `npm run build` — zero errors
- `npm run test:run` — 18+ new tests pass, zero existing tests break
- Zero `console.log` in implementation

**Documentation in code:**

- File header: comment block referencing ADR 013 §Profile typing + HANDOVER 2026-04-26-evening
- JSDoc on public functions
- Inline comments at signature thresholds (with starting value + reconsider trigger reference)

**Acceptance:**

- `src/engine/profileTyping.js` exists with public API as specified
- `src/engine/__tests__/profileTyping.test.js` exists with 18+ tests, all pass
- ZERO modifications to other files (autoAggressionDetection.js, coachContext.js, coachDecisionLog.js, etc.)
- IF fixtures extension needed → updated in `tests/fixtures/cdlEntries.js`
- Build green
- Test suite green (no regressions)
- Commit: `feat(engine): TASK PROFILE-TYPING — profileTyping.js pure module + 18+ tests (ADR 013)`
- Push to main

**Dependencies:**
- ADR 011 schema additions pushed
- ADR 013 pushed (already DONE)
- TASK CDL-FIXTURES DONE
- AA module — NOT required (independent)
- ADR 014 — NOT required (schema profile-history defined later, profileTyping consumes only)

**Raport final în chat (format Daniel paste):**

```
[PROMPT 3 — TASK PROFILE-TYPING — model: sonnet]
Pre-flight:
- ADR 011 schema additions present: ✅/❌
- ADR 013 §Profile typing verified: ✅/❌
- CDL fixtures present + sufficient: ✅/❌ (extended? Y/N)
- isoWeek utility found at: <path> | NOT FOUND
Build: ✅/❌
Tests: XXX/YYY pass (was 465+ baseline, +18 new)
Commit: <hash>
Issues: NONE / desc
```

---

## NU FACE (anti-scope-creep enforcement)

- NU integra în `coachContext.js` (separate task — Profile Typing Integration)
- NU implementa Q1-Q5 onboarding scoring (separate task — Onboarding UI spec post-ADR 014)
- NU modifica autoAggressionDetection.js (paralel module independent)
- NU implementa thresholds calibration per profile (AA v1.1 future task — post 50+ users data)
- NU define profile-history schema (ADR 014 territory)
- NU adăuga storage layer (read/write profile-history) — caller responsibility
- NU implementa reconciliation prompt UI (separate task post-ADR 014)
- NU modifica friction modal logic (separate task)

STOP după push. Awaiting Daniel sign-off pentru next task (ADR 014 writing).

---

*Spec generated: 2026-04-26 night. Pasul 3 din 8-step sequencing post-handover.*
