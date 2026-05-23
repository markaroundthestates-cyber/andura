# Dead code aa.js followup investigation chat 5 — 2026-05-23

## Source claim

Per commit `818c652d` (test(engine-aa-reality): close coverage gap Top 5 #5):

> dead-code formIssue DECREASE branch lines 143-151 unreachable: HOLD branch
> fires first via suppressIncrease guard

Commit log explicit covers branch coverage delta 58% -> 82.35% — gap residual = exact dead branch.

## Verification

### Lines 141-151 content (formIssue DECREASE branch in `AA.check`)

```js
// Forma slaba repetata → scade
if (recovery.formIssue && logs.filter((l) => (l.notes||[]).includes('form')).length >= 2) {
  const newW = Math.max(1, Math.round((lastW - inc) * 2) / 2);
  DB.set('aa-cooldown-' + ex, Date.now());
  return {
    action: 'DECREASE',
    newKg: newW,
    reason: `⚠️ Forma slaba repetata → scad ${inc}kg pentru executie corecta`,
    color: 'var(--accent2)'
  };
}
```

### HOLD guard earlier (lines 115-122)

```js
// Somn prost / oboseala → tine greutatea, nu creste
if (!recovery.ok && recovery.suppressIncrease) {
  return {
    action: 'HOLD',
    newKg: lastW,
    reason: recovery.reason,
    color: recovery.color
  };
}
```

### `formIssue` source — ONLY assignment in `getRecoveryContext` (lines 60-69)

```js
// Forma slaba pe acelasi exercitiu → scade independent de RPE
if (formBad >= 2) {
  return {
    ok: false,
    suppressDecrease: false,
    suppressIncrease: true,
    formIssue: true,
    reason: `⚠️ Forma slaba repetata → nu cresti greutatea`,
    color: 'var(--accent2)'
  };
}
```

Grep verify `formIssue` apare in `aa.js` exact 2x: line 65 (single write) + line 142 (single read). ZERO alternative paths setting `formIssue` independent de `ok:false + suppressIncrease:true`.

### Caller path

`AA.check` chemat via `AA.applyTo` din 3 call sites:
- `src/pages/coach/logging.js:27`
- `src/pages/coach/renderIdle.js:292`
- `src/pages/coach/workout.js:52`

Toate trec exercise name -> `DP.recommend` -> `AA.applyTo(rec, ex)`. ZERO caller construieste `recovery` synthetic — singura sursa = `this.getRecoveryContext(ex)` intern. ZERO override extern.

### Logic trace

Pentru a executa lines 142-151, conditia line 142 cere `recovery.formIssue === true`.

Per single-write site (line 65), `formIssue: true` apare ONLY in tuple inseparabil:
```
{ ok: false, suppressDecrease: false, suppressIncrease: true, formIssue: true, ... }
```

Asadar `recovery.formIssue === true` IMPLICA mecanicistic:
- `recovery.ok === false`
- `recovery.suppressIncrease === true`

Guard line 115: `!recovery.ok && recovery.suppressIncrease` = `true && true` = `true` -> HOLD return early.

Control flow NU poate ajunge la line 142 cu `recovery.formIssue === true`. Lines 143-151 sunt unreachable.

### Test confirms

`aa.test.js:260-270` test name explicit: `"returns HOLD when formIssue triggers (suppressIncrease branch wins before DECREASE branch)"`. Inline comment documenteaza intentional:

```js
// Build: 2 sessions with form note → formIssue=true, suppressIncrease=true.
// The HOLD branch (line 115) fires before the formIssue+filter DECREASE branch (line 142).
// This documents the actual code path order in aa.js.
```

Coverage delta in commit 818c652d -> 82.35% branches (NU 100%) = exact dead branch nesecvent.

## Verdict

**DEAD-CODE-CONFIRMED.**

Lines 141-151 (block formIssue DECREASE) sunt structural unreachable. Singura sursa de `recovery.formIssue === true` seteaza simultan `suppressIncrease + !ok`, ceea ce guard line 115 prinde inainte. ZERO edge case alive — single-write site garanteaza tuple immutabil.

## Recommendation

Trei optiuni — Daniel CEO decide intent original (UX semantic):

### Option 1: Delete dead branch (atomic ~11 LOC)

Remove lines 141-151 plus blank line preceding comment. HOLD ramane semantic correct ("forma slaba -> tine greutatea, nu creste"). Coverage branches `aa.js` urca catre 100%.

**Pro:** Cleanup direct, branches coverage 100%, ZERO logica pierduta (HOLD execute exact ce intended).
**Con:** Daca intent original a fost "forma slaba 2+ sesiuni -> SCADE proactiv pentru executie", atunci HOLD branch este bug-ul iar DECREASE branch este intent.

### Option 2: Refactor — reorder guards pentru a face DECREASE reachable (atomic ~15 LOC)

Muta block formIssue DECREASE (line 141-151) INAINTE de HOLD guard (line 115). Sau: in `getRecoveryContext` line 60-68, separa `formIssue` ca standalone signal cu `ok: true` (deci HOLD nu mai prinde). Reflecta intent semantic dat de reason message: `"⚠️ Forma slaba repetata → scad ${inc}kg pentru executie corecta"` (scad, NU tine).

**Pro:** Activeaza DECREASE pentru forma slaba (intent literal din reason message); fitness-wise mai protectiv pentru user.
**Con:** Schimba behavior live — daca user are 2 sesiuni cu form note, recomandarea trece de la HOLD la DECREASE (regress real-world). Necesita Gigel test.

### Option 3: Keep cu explanatory comment (~3 LOC)

Adauga comment deasupra line 141 documentand intentional dead branch (defense-in-depth viitor refactor recovery shape). Coverage ramane 82.35% branches — accept.

**Pro:** ZERO risk regression, documenteaza pentru viitor.
**Con:** Linter dead-code rules eventual flag; cluttering codebase pentru "what-if".

## Effort + Risk

- Option 1: ~5 min, **risk LOW** (HOLD branch semantic = intent literal current; ZERO callers consume DECREASE-with-formIssue-only).
- Option 2: ~15 min impl + ~10 min Gigel mental walkthrough + test update line 260-270 (semantica HOLD->DECREASE), **risk MED** (live behavior shift pentru users cu 2 form sesiuni — needs UX call).
- Option 3: ~3 min, **risk LOW** (cosmetic).

## Daniel CEO decision needed: YES

Decizie binara semantic UX: cand user marcheaza 2 sesiuni cu `form` note pe acelasi exercise, ce face AA engine?

**A. HOLD** (current behavior live) — "tine greutatea, nu creste".
**B. DECREASE** (intent literal reason string line 148) — "scad ${inc}kg pentru executie corecta".

Decizie A -> Option 1 (delete dead code).
Decizie B -> Option 2 (refactor, activeaza DECREASE).
Decizie defer -> Option 3 (comment, decide later).

Co-CTO recommendation: **Option 1 (delete)**. Reasoning Bugatti: HOLD ramane fitness-safe (user nu impinge greutate cand forma slaba — exact intent protective). DECREASE proactiv pe forma slaba poate fi prematur (user poate fi obosit ziua aia, nu chronical weak); cooldown 4 zile + REDUCE_VOLUME via early-stop + forceDeload via fatigue acopera escalations real. Dead branch = artefact refactor incomplete cand RPE logic eliminata (commit aa71b2e8 "fix(FAZA1.7): AA engine — activate notes-only").

---

## Raport format lean

```
DEAD-CODE-AA-INVESTIGATION: src/engine/aa.js
LOC: 187 total / 11 dead (lines 141-151)
Verdict: DEAD-CODE-CONFIRMED
Recommended option: Option 1 (delete dead branch)
Effort: 5 min
```
