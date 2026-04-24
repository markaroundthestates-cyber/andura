# QA Manual — 24 apr 2026, 22:30

**See also:** [[INDEX_MASTER]] | [[FINDINGS_MASTER]] | [[FAZA_2_FINAL_REPORT]] | [[ENGINE_ARCHITECTURE]]

**Context:** User real (Daniel) testing app live pe production după FAZA 1+2 deploy.
**Environment:** GitHub Pages — https://markaroundthestates-cyber.github.io/salafull/
**Session count la momentul QA:** ~4 sesiuni (cold_start / initial tier)

---

## Bug-uri descoperite

### BUG #1 — Director cache invalidation loop (CRITICAL) → C10c
**Symptom:** Console log `[Cache] Director session invalidated` se repetă 12+ ori pe page load.
**Impact:** Performance hit real, buildSession rulat de multe ori redundant, UX lent la render idle coach.
**Suspect:** `renderCoachIdle` apelează `coachDirector.buildSession()` la fiecare render; fiecare apel invalidează cache prin COACH_RELEVANT_KEYS write side-effect sau prin reactive listeners.
**Related audit findings:** H6 coach (debounce pattern needed); H11c (cache keys — fix aplicat în FAZA 2, dar posibil insuficient).
**Root cause candidate:** lifecycle management — `buildSession` re-triggerează listeners care re-triggerează `buildSession`.

---

### BUG #2 — Pattern learning false positives pe cold_start (HIGH) → H30c
**Symptom:** Coach UI afișează:
- "Marți are 88% skip rate"
- "Miercuri are 100% skip rate"
- "Joi are 100% skip rate"

User **nu a skip-uit nimic** — fresh deploy, ~4 sesiuni reale.
**Impact:** Sesiune "scurtată automat" pe baza date false; recomandări incorecte de la prima zi.
**Suspect:** Pattern engine rulează chiar dacă calibration tier = COLD_START / INITIAL. Threshold gates din [[009-calibration-tiers]] nu sunt aplicate corect în `patternLearning.js` la momentul apelului din director.
**Related:** C1g (calibration stuck — fix-ul din FAZA 1.5 a fost aplicat, dar posibil că detectCalibrationLevel nu primește `ctx.allLogs` corect).
**Notă:** Fix din FAZA 2 (C3c idempotency) nu acoperă asta — e o problemă de tier-gating, nu de deduplication.

---

### BUG #3 — Full Reset nu curăță complet (HIGH) → H31c
**Symptom:** User dă "Rerun Onboarding" / Full Reset, dar pattern-urile "skip rate" persistă după reset.
**Suspect:** Keys neacoperite de reset flow:
- `'applied-patterns'` (889 bytes — confirmată în localStorage după reset)
- `'director-cache'`
- alte pattern-specific keys generate dinamic de patternLearning.js
**Impact:** User nu poate obține un reset real al stării engine-ului. `applied-patterns` supraviețuiește și re-alimentează false positives din BUG #2.
**Related:** C5c endSession auto-delete (FAZA 2 fix) — acoperă session keys, nu pattern keys.

---

## Observații suspecte (need investigation)

### OBS #1 — Protein target 242g (origin necunoscut)
**Expected:** 180g (din `src/config/user.js` → `USER_DEFAULTS.targets.protein`)
**Actual UI:** "Proteină medie ultimele 3 zile: 187g. Țintă: **242g**"
**Unde se calculează 242?** Needs grep: `grep -rn "242\|protein.*target\|targetProtein" src/`
**Hypothesis:** Valoarea 242 poate fi calculată dinamic (ex: body_weight × 2.0 cu weight din onboarding) în loc să se citească din config static. De verificat în `src/engine/` sau `src/pages/coach/`.

### OBS #2 — Kcal est. 495 pentru sesiune 72 min
UI afișează "495 KCAL EST." pentru sesiune 72 min cu Leg Press + Romanian Deadlift.
**Plauzibil?** Pentru un bărbat ~80kg, 72 min legs = ~400-600 kcal → în range acceptabil.
**Recomandare:** Verifică formula din `src/engine/` — dacă e `sets × reps × weight × factor`, factor-ul ar trebui să fie ~0.035–0.04 per kg per rep.
**Verdict:** Probabil OK, dar de documentat formula pt transparență.

### OBS #3 — Streak "1" după Full Reset
**Expected după reset:** 0 sau start fresh.
**Actual:** Streak arată "1".
**Suspect:** Streak se calculează din localStorage keys care supraviețuiesc resetului (similar BUG #3). Sau streak-ul de "1" vine din sesiunea de onboarding contorizată ca sesiune reală.

---

## localStorage state după QA (observat în DevTools)

| Key | Size | Status |
|-----|------|--------|
| `backup-1777060749296` | ~2-3KB | ✅ logBackup.js funcționează corect |
| `applied-patterns` | **889 bytes** | 🔴 Persistă după Full Reset — BUG #3 |
| `director-cache` | ? | 🟡 De verificat supraviețuiește resetului |
| `sal_sessions` | ? | ✅ Curățat de C5c (FAZA 2) |

---

## Verdict pentru Audit Opus (Task #25)

Aceste bug-uri **nu sunt random**. Există două root cause candidate arhitecturale:

### Root Cause #1 — Lifecycle management breakdown
BUG #1 (cache invalidation loop) + BUG #2 (pattern false positives) au posibil aceeași origine: `buildSession` se apelează recursiv sau în cascadă prin reactive listeners, iar `patternLearning.analyzeAndApplyPatterns()` rulează la fiecare ciclu fără tier-gating efectiv.

### Root Cause #2 — Reset specification gap
BUG #3 + OBS #3 indică că **"Full Reset" nu are o specificație completă** a ce keys trebuie șterse. Fiecare engine (patternLearning, coachDirector, stagnationDetector) scrie propriile keys în localStorage fără un registry central.

**Audit Opus Nuclear (Task #25) trebuie să trateze aceste ca ROOT CAUSE candidates, nu simptome izolate.**

Întrebările pentru Opus:
1. Care e lista completă de localStorage keys scrise de fiecare engine?
2. Există un registry central sau fiecare engine e responsible pentru propriul cleanup?
3. Cum trebuie să arate un "Full Reset" complet și verificabil?
4. Cache invalidation loop — e architectural (reactive design) sau bug de implementare?
