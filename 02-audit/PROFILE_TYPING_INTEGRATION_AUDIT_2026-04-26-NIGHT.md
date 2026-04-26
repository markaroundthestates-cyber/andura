# Profile Typing Integration Audit — 2026-04-26 NIGHT

**Scope:** profileTyping.js integration în coachContext.js + onboarding + reconciliation flow  
**Status:** CRITICAL GAPS — module complet neintegrat în production

---

## Executive Summary

`profileTyping.js` este un modul pur, bine testat (42 tests, toate pass), dar ZERO production integration.  
Niciuna din funcțiile publice (`analyzeProfile`, `inferBehavioralProfile`, `reconciliationAction`, `detectYoyoRisk`)  
nu este importată sau apelată din production code. Onboarding existent (src/onboarding.js) colectează  
**doar greutăți baseline** — zero Q1-Q5, zero profile scoring, zero `profile-history` storage.

---

## Integration Points — Starea Actuală

### 1. Onboarding Q1-Q5 — inexistent

**Expected (per ADR 014):**
```
showOnboarding()
  → Q1-Q5 display + scoring logic
  → selfReport = { primary, secondary, confidence, scores, flags }
  → DB.set('profile-history', [{ type: 'onboarding', selfReport, ... }])
```

**Actual:**
```
showOnboarding() → INIT_EXERCISES baseline weights only
  // NO Q1-Q5
  // NO selfReport scoring
  // NO profile-history write
```

ADR 014 specifies anti-bias questionnaire (Q1-Q3 indirect scenarios + Q4 forced-choice + Q5 post-session 3).  
Niciun element din Q1-Q5 nu există în `src/onboarding.js`.

### 2. profile-history storage — key inexistentă

**Expected (per ADR 014):**  
`profile-history` LocalStorage key cu Array de events: onboarding, reconciliation, profile_change, etc.

**Actual:**  
`grep -rn "profile-history" src/` → zero results în production code.  
`dataRegistry.js` nu conține `profile-history` în `USER_DATA_KEYS`, `SYNC_KEYS`, sau orice altă categorie.

**Impact:**
- `profileTyping.js` functions care acceptă `previousReconciliations` vor primi always `[]`
- Firebase sync nu include `profile-history` → date pierdute la login nou device
- dataCleanup fullReset behavior pentru `profile-history` = undefined (nici preserve, nici wipe)

### 3. analyzeProfile → coachContext — inexistent

**Expected:**
```
buildCoachContext()
  → selfReport = DB.get('profile-history').last onboarding event
  → recentCDL = readAllActive(last 4-6 weeks)
  → ctx.userProfile = analyzeProfile({ selfReport, cdlEntries: recentCDL })
```

**Actual:** `coachContext.js` nu importă nimic din `profileTyping.js`.  
`buildCoachContext()` nu returnează `ctx.userProfile`.  
CoachDirector nu are acces la profile pentru calibrare thresholds.

### 4. detectYoyoRisk → ctx integrare — inexistent

**Expected:** `ctx.riskFlags` include `'YO-YO_RISK'` dacă `detectYoyoRisk(recentCDL)` returnează true.

**Actual:** `detectYoyoRisk` never called. Preventive intervention impossibilă.

### 5. Reconciliation trigger — inexistent

**Expected (per ADR 014 §4):**
- Week 4 elapsed AND ≥12 sessions → reconciliation prompt display
- `reconciliationAction(selfReport, behavioral, previousReconciliations)` → determines case (1-6)

**Actual:** Niciun timer, niciun trigger, niciun reconciliation UI component.  
`reconciliationAction` never called din production.

### 6. Friction modal HIGH tier — inexistent

**Expected (per ADR 014 §5):**  
AA detection tier=HIGH + user override → friction modal cu typing confirmation.

**Actual:** Zero friction modal în production code.  
Nici AA detection tier nu ajunge în context (AA integration gap, per AA audit).

---

## Storage Gap — profile-history

| Item | Status |
|---|---|
| `profile-history` key în dataRegistry.js | ABSENT |
| `profile-history` în SYNC_KEYS | ABSENT |
| `profile-history` în USER_DATA_KEYS | ABSENT |
| `src/onboarding.js` write la `profile-history` | ABSENT |
| Read helpers pentru `profile-history` | ABSENT |

**Risk:** Dacă `profile-history` este creată fără registry entry, aceasta va fi:
- NU sync-uită pe Firebase (date pierdute cross-device)
- NU wipe-uită la fullReset (stale data după reset)
- NU inclusă în auto-backup

---

## Test vs Production Gap

Tests acoperă corect logica internă (42 tests, 0 failures):
- Signature matchers per profil
- Confidence computation
- Insufficient data detection
- Yo-yo risk detection
- reconciliationAction logic (5 cazuri)

**Dar:** Niciun test validează că:
- Onboarding UI triggers Q1-Q5 scoring
- selfReport este scris în `profile-history`
- `coachContext` include `ctx.userProfile`
- Reconciliation este triggerat la corectul moment

Gap-ul de integrare este complet invisible din test suite actual.

---

## Reconciliation Logic — Contradicție Cu onboarding.js

`profileTyping.js:reconciliationAction` verifică `previousReconciliations.length`:
```javascript
if (behConf === 'high' && previousReconciliations.length === 0) return 'match_first_prompt';
```

Dar `previousReconciliations` vine din `profile-history` key care **nu există**.  
Primul call va primi `[]` → `match_first_prompt` triggerat chiar dacă user nu a completat niciodată Q1-Q5.

→ `reconciliationAction` presupune `profile-history` pre-populată de onboarding,  
dar onboarding nu face niciun write la `profile-history`.

---

## Spec Recomandat — Pași de Integrare

### Step 1: dataRegistry.js — adaugă profile-history

```javascript
USER_DATA_KEYS: [...existingKeys, 'profile-history'],
SYNC_KEYS: [...existingKeys, 'profile-history'],
```

**Note:** Per ADR 014: NU în PRESERVE_ON_RESET_KEYS (wipe la fullReset semantic).

### Step 2: Onboarding Q1-Q5 component

Separate component (per ADR 014 Implementation Notes §1).  
Adaugă post-baseline-weights flow:
1. Q1-Q3 scenarios (indirect behavioral)
2. Q4 forced-choice trade-off
3. Score Q1-Q4 → { primary, secondary, confidence, scores, flags }
4. Write `profile-history` onboarding event

```javascript
// src/onboarding/profileOnboarding.js (new file, separate spec)
import { scoreQ1Q4 } from './copy.js';  // scoring logic separate
const profileHistory = DB.get('profile-history') || [];
profileHistory.push({
  timestamp: Date.now(),
  type: 'onboarding',
  selfReport: scoreQ1Q4(answers),
  behavioral: null,
  userChoice: null,
  fromProfile: null,
  toProfile: null,
});
DB.set('profile-history', profileHistory);
```

### Step 3: src/onboarding/copy.js — wording consts

Per ADR 014 mandatory implementation note:  
Q1-Q5 strings ca consts export-abile (hot-swap post user-test).

### Step 4: analyzeProfile → coachContext

```javascript
// în buildCoachContext():
import { analyzeProfile } from './profileTyping.js';
import * as coachDecisionLog from '../util/coachDecisionLog.js';

const profileHistory = DB.get('profile-history') ?? [];
const selfReportEvent = [...profileHistory].reverse()
  .find(e => e.type === 'onboarding' || e.type === 'profile_change');
const selfReport = selfReportEvent?.selfReport ?? null;

const recentCDL = coachDecisionLog.readAllActive(e => {
  const d = new Date(e.date);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 42); // 6 weeks
  return d >= cutoff;
});
const previousReconciliations = profileHistory.filter(
  e => e.type === 'reconciliation_prompt' || e.type === 'profile_change'
);

return {
  ...existingContext,
  userProfile: analyzeProfile({ selfReport, cdlEntries: recentCDL, previousReconciliations }),
};
```

### Step 5: Reconciliation trigger

Session-independent trigger check (nu la fiecare buildCoachContext):
- Post app-load, dacă reconciliation conditions met → display prompt
- `reconciliationAction` determină case (1-6)
- Write result în `profile-history`

### Step 6: Q5 — post-sesiunea 3

After 3rd executed session → display Q5 modal.  
Update `profile-history` cu Q5 refinement.

### Step 7: Friction modal HIGH tier (post AA integration)

Dependent pe AA integration completă (Steps 1-4 din AA audit).

---

## Estimare Efort

| Step | Efort | Risc |
|---|---|---|
| Step 1 (dataRegistry) | 15min | LOW |
| Step 2 (Q1-Q5 component) | 4-6h | MEDIUM |
| Step 3 (copy.js wording) | 1-2h | LOW |
| Step 4 (coachContext integration) | 1h | LOW |
| Step 5 (reconciliation trigger) | 3-4h | MEDIUM |
| Step 6 (Q5 post-session) | 1h | LOW |
| Step 7 (friction modal) | 3-5h | HIGH |

**Total (fără friction modal):** ~12-15h  
**User test Q1-Q5 wording:** 3-5 useri non-developers, 2-4 săpt timeline (per ADR 014 §Trade-offs)

---

## Dependențe

Profile Typing integration depinde de AA integration (AA audit Steps 1-4) pentru:
- `detectYoyoRisk` are acces la CDL entries cu `autoAggression` populated
- Friction modal trigger corect necesită AA tier în context

Recomandare: AA integration (write-side + coachContext) ÎNAINTE de Profile Typing integration.

---

## Recomandare

Prioritate NEXT SPRINT:
1. **Step 1** (dataRegistry) — 15min, zero risc
2. **Step 4** (coachContext) — poate fi implementat cu selfReport=null (behavioral-only mode)
3. **Steps 2-3** (Q1-Q5 + copy.js) — user test înainte de implementare

ADR 014 este complet și acceptat — implementarea este delayed față de plan.  
profileTyping.js module este production-ready. Gap = integration layer missing.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
