# PROMPT_CC_SPRINT4X_BATCH_04_SELF_CORRECTION_CHAT_C

**Model:** Opus
**Order:** 04
**Dependencies:** None (strict disjunct — modifies src/engine/self-correction/, src/engine/smart-routing/, src/engine/composite-signal/, src/engine/pain-button/ — all NEW dirs, separat de Phase B + Suflet Andura)
**Scope:** Self-Correction §36.28-§36.35 + Chat C features (Smart-Routing §36.37 + Pain Button §36.38 + Composite Signal §36.41)

**Note:** Consolidat 2 batches originale (Self-Correction + Chat C) într-unul singur — au touch-points logic legate (Profile Validation §36.34 declanșează prin Bias Detection care trigger PROMPT_PROFILE_VALIDATION_PLACEHOLDER deja integrat în Batch 02). Disjunct vs alte batches prin module dirs separate.

---

## TASK 1 — Self-Correction §36.28-§36.35

### Module structure

```
src/engine/self-correction/
├── realtime-per-set.js       # §36.28 — recalibration silent mid-session
├── profile-validation.js     # §36.34 — drift detection + PROMPT trigger
├── goal-shift-calibration.js # §36.35 — RESET streak + 2 sesiuni calibrare
└── index.js
```

### Realtime Per-Set §36.28

Silent recalibration mid-session pe per-set normalization (per §36.48 Chat C). Trigger conditions:
- 2× RPE 10 consecutive → IN_SESSION_DOWN (wording integrat Batch 02)
- 2× Easy + reps maxime → IN_SESSION_UP (wording integrat Batch 02)

NU expune scor numeric, NU paternalism — voice plural collaborative.

### Profile Validation §36.34

Bias Detection (Batch 03) trigger PROMPT_PROFILE_VALIDATION_PLACEHOLDER post rolling-window analysis. ADR_MODE_DETECTION_UI EXT-4: rolling 8 sessions + cooldown 3×8. Profile Reset PRESERVE behavior history (NU reset complet) per Q12 LOCKED.

### Goal Shift Calibration §36.35

User schimbă obiectiv (CUT → BULK, Forță → Tonifiere) → RESET streak counter + primele 2 sesiuni = calibration window (NU OUTLIER active, NU bias adjustments). GOAL_SHIFT_CALIBRATION_PLACEHOLDER (Batch 02) afișat ca card cu counter `Sesiunea ${current}/2`.

---

## TASK 2 — Smart-Routing §36.37 (Chat C)

### Module structure

```
src/engine/smart-routing/
├── equipment-detection.js    # "Aparat ocupat" trigger
├── alternative-finder.js     # Tier 1 forță vs Tier 2 hipertrofie filter
└── index.js
```

### Logic

Când user marchează "Aparat ocupat" pe exercițiu:
- Citește `tier` + `equipment_alternatives` din schema (Batch 03)
- Pentru Tier 1 forță: alternative DOAR cu `force_demand: 'high'` (NU substituție lateral raise pentru bench press)
- Pentru Tier 2 hipertrofie: flexibility mai mare, accept alternatives cu același `muscle_target_primary`
- Returnează listă alternative ranked by similarity

### Anti-paternalism filter

NU bloca user — oferă opțiuni, user alege. Default: skip exercise dacă zero alternatives valide (NU forțezi substituție inferior).

---

## TASK 3 — Pain Button §36.38 (Chat C)

### Module structure

```
src/engine/pain-button/
├── pain-input.js             # User reports "înțepătură" / "DOMS severă" / "tensiune ciudată"
├── override-cdl.js           # user_override_pain_redflag flag
└── index.js
```

### Wording

NU "self-diagnostic medical" (anti-paternalism + Gigel test risk). Opțiuni neutre:
- "Mișcarea mă deranjează" (general)
- "Simt o tensiune ciudată" (specific)
- "DOMS sever" (technical, optional)

Output: engine ajustează plan (skip exercise / reduce volum / suggest alternative) FĂRĂ medical claim.

### Override CDL

User poate override hard-block dacă engine flag-ează red. Buton `[Continuă pe propria răspundere]` per F2 SUFLET "AI-ul informează, nu impune". Logged ca `user_override_pain_redflag: true` pentru audit, NU blocking.

### V1 vs V2 scope

- V1: Pain button → adjust plan + log override
- V2 (deferred post-launch): trend analysis pe pain reports + auto-recommendation deload preventiv

---

## TASK 4 — Composite Signal Layer §36.41 (Chat C)

### Module structure

```
src/engine/composite-signal/
├── trigger-3-metrici.js      # Performance Drop + Rest Time + RIR Mismatch
├── lifecycle.js              # detection → cooldown → resolution
└── index.js
```

### Logic

Triggered când 3 metrici simultan abnormal (NU fiecare individual = false positive prevention):
- Performance Drop (>15% volume reduction vs rolling avg 3 sesiuni)
- Rest Time excessive (>1.5x normal pe exercițiu)
- RIR Mismatch (declared RIR 2 dar reps actual = max attempt failure)

Output: Composite Signal flag → CASCADE_DEFENSE arbitration (Batch 03) decide action (deload preventiv vs continue cu monitoring).

### Lifecycle

- Detection → flag set
- Cooldown 3 sesiuni post-flag (NU re-trigger imediat)
- Resolution: 2 sesiuni clean → flag cleared

---

## VERIFICATION

```bash
# Modules created
ls -la src/engine/self-correction/ src/engine/smart-routing/ src/engine/pain-button/ src/engine/composite-signal/

# Cross-refs Batch 02 + Batch 03
grep -rn "PROMPT_PROFILE_VALIDATION_PLACEHOLDER\|GOAL_SHIFT_CALIBRATION_PLACEHOLDER" src/engine/self-correction/
grep -rn "equipment_alternatives\|force_demand" src/engine/smart-routing/
grep -rn "CASCADE_DEFENSE\|cascade-defense" src/engine/composite-signal/

# Tests pass
npm test -- self-correction/ smart-routing/ pain-button/ composite-signal/
```

---

## COMMIT + PUSH

```bash
git add src/engine/self-correction/ src/engine/smart-routing/ src/engine/pain-button/ src/engine/composite-signal/ tests/
git commit -m "self-correction + chat-c: §36.28-§36.35 + §36.37 + §36.38 + §36.41 implemented"
git push
```

---

## RAPORT — `📤_outbox/LATEST.md`

Move existing LATEST → archive cu next NN.

**Format raport:**
- Task, Model, Status
- Pre-flight: dirs creation, dependencies Batch 02 + Batch 03 verified
- Modificări: 4 module groups + tests + line counts
- Cross-refs: PLACEHOLDER strings consumed correctly + schema fields used + cascade-defense integration
- Build + Tests: total + new tests + pass/fail
- Commits: hash
- Pushed: Yes/No
- Issues: detail orice ambiguity §36.37/§36.38/§36.41 spec
- Next action: BATCH_05 final (sequential auto-trigger)
