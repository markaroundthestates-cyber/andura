# SYNC_KEYS vs dataRegistry Drift Audit — 2026-04-26 NIGHT

**Scope:** Comparație SYNC_KEYS în src/firebase.js vs categorizare în src/util/dataRegistry.js  
**Status:** DRIFT IDENTIFICAT — 4 categorii de probleme

---

## SYNC_KEYS (firebase.js) — 34 keys

```
weights, kcals, prots, waters, wellbeing, logs, session-burns, session-ratings,
muted, notif-enabled, suppl-list, early-stops, pr-records, phase-log, closed-days,
step-streaks, steps-today, bf-override, phase-override, current-kcal, phase-change-date,
readiness, unavailable-equipment, peak-hours, session-start-hours, auto-recommendations,
applied-recommendations, applied-patterns, session-draft, workout-skips,
coach-decisions, coach-decisions-aggregate, coach-decisions-archive, cdl-patterns
```

---

## Drift Category 1: SYNC_KEYS dar ABSENT din dataRegistry

Aceste keys sunt sincronizate pe Firebase dar NU apar în nicio categorie din dataRegistry.js.  
Reset behavior = **undefined** (nici wipe, nici preserve la resetTestData/fullReset).

| Key | Source module | Reset behavior actual | Problema |
|---|---|---|---|
| `coach-decisions` | coachDecisionLog.js STORAGE_KEYS.TIER_1 | Unknown | Nicio categorie în registry |
| `coach-decisions-aggregate` | coachDecisionLog.js STORAGE_KEYS.TIER_2 | Unknown | Nicio categorie în registry |
| `coach-decisions-archive` | coachDecisionLog.js STORAGE_KEYS.TIER_3 | Unknown | Nicio categorie în registry |
| `cdl-patterns` | patternLearning.js (inferred) | Unknown | Nicio categorie în registry |

**Impact:** dataCleanup.js resetTestData și fullReset NU știu să trateze aceste keys.  
CDL entries pot supraviețui unui fullReset (dacă nu există cod explicit care le șterge).  
Verificat: grep `coach-decisions` în dataCleanup.js = zero results.

---

## Drift Category 2: SYNC_KEYS dar în TEST_RESIDUE_KEYS

Aceste keys sunt sincronizate pe Firebase DAR sunt în TEST_RESIDUE_KEYS (șterse de resetTestData).  
**Contradicție:** dacă user face resetTestData, datele sunt șterse local DAR rămân pe Firebase.  
La next syncFromFirebase → datele revin (stale sync după intentional reset).

| Key | Severitate | Nota |
|---|---|---|
| `session-ratings` | MEDIUM | Rating sesiuni — user data semantics, nu test residue |
| `early-stops` | MEDIUM | Pattern data — borderline user vs transient |
| `step-streaks` | LOW | Steps data — ok as transient |
| `steps-today` | LOW | Daily value — ok as transient |
| `unavailable-equipment` | MEDIUM | User preference — ar trebui USER_DATA_KEYS |
| `peak-hours` | LOW | Analytics derived — ok as transient |
| `session-start-hours` | LOW | Analytics derived — ok as transient |
| `auto-recommendations` | MEDIUM | Generated recommendations — derived but important |
| `applied-recommendations` | MEDIUM | User state — ar putea fi USER_DATA_KEYS |
| `applied-patterns` | HIGH | CDL-backed pattern state — resetTestData îl șterge dar Firebase îl restaurează |
| `session-draft` | LOW | Session draft — transient, ok să fie în TEST_RESIDUE |

**Highest risk:** `applied-patterns` este CDL-backed (patternLearning.js scrie pe baza CDL).  
Dacă resetTestData îl șterge dar Firebase sync îl restaurează, coach va folosi patterns dintr-un  
reset context, contradicting user's intent of "fresh start".

---

## Drift Category 3: dataRegistry USER_DATA_KEYS dar ABSENT din SYNC_KEYS

Aceste keys sunt considerate "user data" (supraviețuiesc resetTestData) DAR nu sunt backup-ate pe Firebase.

| Key | Nota |
|---|---|
| `onboarding-done` | **RISC:** Pe device nou, user trece prin onboarding din nou (pierde flag) |
| `onboarding-completed` | Similar `onboarding-done` |
| `last-recalibration` | Derived, low risk |
| `sf.userConfig` | **RISC HIGH:** Configurație utilizator (bio, targetKg, etc.) NU este sync-uită pe Firebase |

**`sf.userConfig` este cel mai serios:** getUserConfig() citește din `sf.userConfig`.  
Pe device nou, user config (bio, targetKg, equipment preferences) este pierdut.  
Coach Director rulează cu fallback config în loc de datele reale ale userului.

---

## Drift Category 4: Keys în SYNC_KEYS dar semantică ambiguă

| Key | Problema |
|---|---|
| `prots` | Prezentă în SYNC_KEYS și USER_DATA_KEYS — OK, dar lipsă din USER_DATA_KEYS check manual (ok după verificare) |
| `waters` | Prezentă în SYNC_KEYS și USER_DATA_KEYS — OK |

---

## Tabel Complet — SYNC_KEYS vs dataRegistry status

| Key | SYNC_KEYS | USER_DATA | TEST_RESIDUE | Verdict |
|---|---|---|---|---|
| weights | ✓ | ✓ | — | OK |
| kcals | ✓ | ✓ | — | OK |
| prots | ✓ | ✓ | — | OK |
| waters | ✓ | ✓ | — | OK |
| wellbeing | ✓ | ✓ | — | OK |
| logs | ✓ | ✓ | — | OK |
| session-burns | ✓ | ✓ | — | OK |
| session-ratings | ✓ | — | ✓ | DRIFT: TEST_RESIDUE + SYNCED |
| muted | ✓ | ✓ | — | OK |
| notif-enabled | ✓ | ✓ | — | OK |
| suppl-list | ✓ | ✓ | — | OK |
| early-stops | ✓ | — | ✓ | DRIFT: TEST_RESIDUE + SYNCED |
| pr-records | ✓ | ✓ | — | OK |
| phase-log | ✓ | ✓ | — | OK |
| closed-days | ✓ | ✓ | — | OK |
| step-streaks | ✓ | — | ✓ | LOW: ok as transient |
| steps-today | ✓ | — | ✓ | LOW: ok as transient |
| bf-override | ✓ | ✓ | — | OK |
| phase-override | ✓ | ✓ | — | OK |
| current-kcal | ✓ | ✓ | — | OK |
| phase-change-date | ✓ | ✓ | — | OK |
| readiness | ✓ | ✓ | — | OK |
| unavailable-equipment | ✓ | — | ✓ | DRIFT: preference ca TEST_RESIDUE |
| peak-hours | ✓ | — | ✓ | LOW: analytics |
| session-start-hours | ✓ | — | ✓ | LOW: analytics |
| auto-recommendations | ✓ | — | ✓ | MEDIUM: generated state |
| applied-recommendations | ✓ | — | ✓ | MEDIUM: user state |
| applied-patterns | ✓ | — | ✓ | HIGH: CDL-backed, reset conflict |
| session-draft | ✓ | — | ✓ | LOW: transient ok |
| workout-skips | ✓ | ✓ | — | OK |
| coach-decisions | ✓ | — | — | CRITICAL: absent din registry |
| coach-decisions-aggregate | ✓ | — | — | CRITICAL: absent din registry |
| coach-decisions-archive | ✓ | — | — | CRITICAL: absent din registry |
| cdl-patterns | ✓ | — | — | CRITICAL: absent din registry |
| onboarding-done | — | ✓ | — | MISSING din SYNC |
| sf.userConfig | — | ✓ | — | HIGH RISK: config pierdut cross-device |

---

## Recomandări

### Prioritate 1 (CRITICAL — CDL keys lipsesc din registry)

Adaugă în `dataRegistry.js`:
```javascript
// CDL keys — separate from USER_DATA (behavioral data, NOT session logs)
export const CDL_KEYS = [
  'coach-decisions',
  'coach-decisions-aggregate',
  'coach-decisions-archive',
  'cdl-patterns',
];
```

Definește reset behavior explicit: fullReset = wipe CDL + patterns (fresh start semantic).  
resetTestData = preserve (CDL-backed, NU test residue).

### Prioritate 2 (HIGH — sf.userConfig lipsă din SYNC)

Adaugă `sf.userConfig` la SYNC_KEYS în firebase.js pentru backup cross-device.  
SAU documentează explicit că user config NU este sync-uit (intentional pentru privacy).

### Prioritate 3 (MEDIUM — applied-patterns conflict)

Reconsideră `applied-patterns` categoria:
- Dacă SYNC-uit → mutare din TEST_RESIDUE_KEYS → USER_DATA_KEYS sau CDL_KEYS
- Dacă TEST_RESIDUE (intentional) → scoate din SYNC_KEYS

### Prioritate 4 (MEDIUM — onboarding-done lipsă din SYNC)

Adaugă `onboarding-done` și `onboarding-completed` la SYNC_KEYS.  
Altfel, user pe device nou trece prin onboarding din nou chiar cu all data synced.

---

## Statistici

- Total SYNC_KEYS: 34
- SYNC + USER_DATA (OK): 18
- SYNC + TEST_RESIDUE (conflict): 11
- SYNC + ABSENT din registry (CRITICAL): 4 (CDL keys + cdl-patterns)
- USER_DATA dar absent SYNC: 4 (`onboarding-done`, `onboarding-completed`, `last-recalibration`, `sf.userConfig`)

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
