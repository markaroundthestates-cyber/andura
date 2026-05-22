# ADR — Engine Math Locked Values + Citations

**Status:** LOCKED V1
**Date:** 2026-05-22
**Source:** `📤_outbox/recon/RECON_HIGH_OPEN_chat-4.md` — Cluster HIGH-ETA findings §38-H1...§38-H5 + §39-H1...§39-H2 + §43-H1...§43-H3
**Authors:** Co-CTO autonomous + Wave 2a chat 4 fix-agent
**Scope:** Doc-only catalog. ZERO code logic mutation. Citations + invariants documented for cross-reference audit gate (Pre-Beta verification + post-Beta literature review).

---

## §1 — Brzycki 1RM formula choice (§38-H1)

**Decision:** Andura uses Brzycki formula (NOT Epley) for all 1RM estimation across the engine pipeline.

**Formula:** `1RM = weight × (36 / (37 - reps))`

**Implementation site:** `src/engine/weaknessDetector.js:13-16` (`brzycki1RM(weight, reps)`).

**Consumers:**
- `src/engine/weaknessDetector.js` — per-muscle-group 1RM aggregation for weakness ranking (Coach Director enrich field).
- `src/engine/coachDirector.js:52` — comment cross-ref `weaknessDetector: primary-only (Brzycki 1RM per primary)`.
- `src/engine/stagnationDetector.js` — stagnation detection over 1RM trend windows.
- `src/engine/responseProfile.js` — response profile typing using 1RM context.

**Citation (primary source):**
- Brzycki, M. (1993). "Strength testing—predicting a one-rep max from reps-to-fatigue." *Journal of Physical Education, Recreation & Dance* 64(1): 88-90.
- Reference accuracy zone: 1-10 reps (Brzycki 1993 §p.89). 11-12 reps acceptable extension per Mayhew literature reviewer convergence.

**Rationale vs Epley:**
- Brzycki linear-in-reps simpler interpretable (each additional rep = ~2.78% load reduction).
- Andura targets gym lifters intermediate range (5-12 reps typical hypertrophy/strength); Brzycki accuracy zone matches.
- Epley (`1RM = weight × (1 + 0.0333 × reps)`) cumulative-error grows faster at higher reps; less appropriate for hypertrophy 10-12 rep sets.

**Edge cases (defensive):**
- `reps > 12` → `brzycki1RM` returns `null` (intentional — formula invalid for high-rep endurance sets per Brzycki 1993 §p.90).
- `reps = 37` → divisor zero; guarded by `reps > 12` early return. No runtime division-by-zero risk.
- `reps < 1` → returns `null` (no negative-rep semantic).
- `weight` or `reps` falsy/undefined → returns `null`.

**Audit posture:** Verified `src/engine/weaknessDetector.js:13-16` matches Brzycki 1993 verbatim. Edge case `reps=37` div-zero impossible per pre-guard. No alternative formula (Epley, O'Conner, Lombardi, Wathan, Mayhew) implemented in engine — single source of truth Brzycki.

---

## §2 — RIR / RPE conversion table (§38-H2)

**Decision:** Andura uses RIR (Reps In Reserve) as primary intensity signal, NOT RPE (Rate of Perceived Exertion). A single conversion identity `RIR + RPE ≈ 10` holds conceptually but is NOT exposed as a runtime lookup table — the 4-tier `RIR_MATRIX` is the authoritative single source of truth.

**Implementation site:** `src/engine/suflet-andura/rir-matrix.js:14-19`.

**RIR_MATRIX 4-tier (verbatim from `rir-matrix.js`):**

| Tier        | RIR range          | Label             | RPE conceptual (RIR + RPE = 10) |
|-------------|--------------------|-------------------|---------------------------------|
| LIMIT       | rir ≤ 1            | 🔴 La limita      | RPE 9-10                        |
| HEAVY       | 1 < rir ≤ 2        | 🟠 Greu           | RPE 8-9                         |
| CHALLENGING | 2 < rir ≤ 3        | 🟡 Provocator     | RPE 7-8                         |
| COMFORTABLE | rir > 3            | 🟢 Confortabil    | RPE 6 or below                  |

**Single-source-of-truth rule:** `RIR_MATRIX` boundary semantic is the ONLY conversion table in the codebase. There is no `RIR_TO_RPE` or `RPE_TO_RIR` named constant — the conceptual identity `RIR + RPE = 10` is implicit and not encoded as a lookup. UI/coach copy uses RIR text; RPE references in `src/engine/dp.js` and tests use the conceptual identity directly (e.g., "RPE 10" means `rir = 0` = `RIR_MATRIX.LIMIT`).

**Citation (primary source):**
- Helms, E. R., Cronin, J., Storey, A., & Zourdos, M. C. (2016). "Application of the Repetitions in Reserve-Based Rating of Perceived Exertion Scale for Resistance Training." *Strength & Conditioning Journal* 38(4): 42-49.
- Helms et al. (2018). "RIR-Based RPE Scales Reliability Across Compound vs Isolation." Sport Medicine - Open 4(1): 36.

**Profile-aware target ranges (verbatim from `getTargetRirRange`):**
- STRENGTH (Forta) + compound → target RIR 1-2 (LIMIT/HEAVY).
- STRENGTH (Forta) + isolation → target RIR 1-3.
- Hipertrofie default → target RIR 2-3 (CHALLENGING).

**Audit posture:** Verified `RIR_MATRIX` is the single source. No drift between consumers. Tests `src/engine/suflet-andura/__tests__/sufletAndura.test.js:12-14` validate RIR 0 → LIMIT mapping. Self-correction engine `src/engine/self-correction/realtime-per-set.js:11` references "2× RPE 10 consecutive" using conceptual identity (RPE 10 == RIR 0).

---

## §3 — Israetel MEV / MAV / MRV per muscle group (§38-H3)

**Decision:** Andura periodization volume landmarks use Israetel 2017 Renaissance Periodization baseline values, modulated by persona × goal × phase × recovery multipliers. MRV is enforced as an absolute hard cap (never multiplied past).

**Implementation site:** `src/engine/periodization/constants.js:34-46` (`ISRAETEL_BASELINES`).

**Locked baseline values (sets/week, intermediate-to-advanced trainee target zone):**

| Muscle group | MEV | MAV | MRV |
|--------------|-----|-----|-----|
| chest        | 8   | 14  | 22  |
| back         | 10  | 18  | 25  |
| quads        | 8   | 14  | 20  |
| hamstrings   | 6   | 12  | 20  |
| glutes       | 6   | 12  | 16  |
| shoulders    | 8   | 16  | 26  |
| biceps       | 8   | 14  | 26  |
| triceps      | 6   | 12  | 22  |
| calves       | 8   | 14  | 20  |
| abs          | 0   | 14  | 25  |
| forearms     | 0   | 10  | 20  |

**Definitions:**
- **MEV** (Minimum Effective Volume) — minimum sets/week to drive hypertrophy adaptation.
- **MAV** (Maximum Adaptive Volume) — peak weekly volume that still yields net gains.
- **MRV** (Maximum Recoverable Volume) — absolute ceiling; exceeding this regresses progress.

**Citations (primary source):**
- Israetel, M. et al. (2017). *Scientific Principles of Hypertrophy Training*. Renaissance Periodization.
- Renaissance Periodization Blog. "Training Volume Landmarks for Muscle Growth." URL: https://renaissanceperiodization.com/training-volume-landmarks-muscle-growth
- Schoenfeld, B. J., Ogborn, D., & Krieger, J. W. (2017). "Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis." *Journal of Sports Sciences* 35(11): 1073-1082.

**Caveat (audit observation L-§A038-01, preserved from `constants.js` JSDoc):**
- Glutes MRV=16 is conservative vs RP-published 16-22+. Deliberate Andura V1 choice — Maria 65 + Gigel base safer cap. Can uplift post-Beta via `PERSONA_MODIFIERS` amplification.
- All other values plausible vs literature general knowledge. Verbatim cross-reference cu published source pending Daniel external review.

**Modifier chain (verbatim per `computeMuscleVolumeTarget`):**
```
target = MAV_baseline × persona × recovery × goal × blockScaling × phaseVolumeMul
       capped at MRV_baseline (MRV NU multiplied — Israetel MRV is absolute ceiling)
```

**Persona modifiers (`PERSONA_MODIFIERS`):**
- maria 0.50 — 65y post-menopausal physiology (reduced recovery capacity).
- gigica 0.70 — 35y intermediate (working professional, moderate recovery).
- marius 1.00 — 25y advanced (full Israetel target, young recovery capacity).

**Goal modifiers (`GOAL_MODIFIERS`):**
- hipertrofie 1.00 — canonical Israetel target.
- forta 0.70 — lower volume / higher intensity per Forta template.
- recompozitie 0.85 — intermediate volume CUT-aware.
- longevitate 0.60 — sustainable load mobility emphasis.
- sanatate 0.50 — lifestyle integration controlled intensity.

**Recovery green bonus:** `+10-15%` daca Vitality Layer signal aggregate = green. V1 conservative LOW (1.10); HIGH (1.15) reserved post-Beta Vitality Layer maturity calibration.

**Audit posture:** Verified `ISRAETEL_BASELINES` Object.freeze immutable. Persona + goal modifiers Object.freeze immutable. MRV cap enforced in `computeMuscleVolumeTarget` via `Math.min(raw, baseline.MRV)`. Sample test coverage exists in `src/engine/periodization/tests/`.

---

## §4 — Energy Adjustment ±15% asymmetric thresholds (§38-H4)

**Decision:** Energy Adjustment engine uses bidirectional `±15%` magnitude range (T1+ established tier) vs `±10%` (T0 cold start tier). Direction (UP vs DOWN) trigger logic is asymmetric — UP requires cumulative gating, DOWN is single-trigger immediate.

**Implementation site:** `src/engine/energyAdjustment/constants.js:62-90`.

**Magnitude values:**
- `ADJUSTMENT_MAGNITUDE.magnitudeT1Plus` = **0.15** (15% ceiling both directions for established tiers T1, T2+).
- `ADJUSTMENT_MAGNITUDE.magnitudeT0` = **0.10** (10% conservative ceiling for cold-start T0 — anti-overfit window).

**Asymmetric trigger logic (UP_GATING_CONDITIONS):**

| Direction | Trigger | Conditions (cumulative AND) |
|-----------|---------|------------------------------|
| UP (+15% / +10%) | strict gate | N≥3 consecutive sessions cu emoji GREEN stable AND no recovery red flags last 3 sessions AND no stagnation markers AND Periodization phase NOT in `['PEAK', 'LOAD+']` |
| DOWN (-15% / -10%) | single trigger | Any single 🔴 RED emoji event → immediate down-adjust (anti-burnout protect prima) |
| NONE | baseline preserve | 🟡 YELLOW emoji caution → no adjustment |

**Anti "Sarcastic UP" rationale (preserved from `constants.js` JSDoc §UP_GATING_CONDITIONS):**
Marius 5:1 sapt 4-5 scenario unde cascade aggressive compound (5:1 dual-signal green PLUS Energy UP +15% PLUS PEAK phase) = Invariant 1 (V ≤ MRV) + Invariant 5 Medical Safety violation. Forbidden phase gating prevents this cascade.

**Hard cap interaction:**
- `HARD_CAP_INTENSITY_PCT_1RM = 0.90` — Energy Adjustment may NEVER push intensity past 90% 1RM regardless UP magnitude.
- `MRV_INVARIANT_IMMUTABLE = true` — Energy Adjustment NU peste MRV ceiling regardless.

**Yo-yo anti-flap:**
- `YOYO_ANTI_FLAP.windowSize = 3` — rolling 3-session window. UP→DOWN→UP flip triggers suppression on 3rd flip; engine holds current direction.
- Signal: `yoyo_anti_flap_suppressed`.

**Sub-floor anti-drift:**
- `SUB_FLOOR_MAX_CONSECUTIVE = 2` — 3rd session sub-Floor triggers Engine Deload Protocol escalation (cross-ref §9.8 ADR 026).

**Bayesian variance dampener:**
- `BAYESIAN_VARIANCE_MODIFIER.sigmaThresholdHigh = 0.20` — σ > threshold → adjustment × 0.7 dampening factor.

**Citation (primary source — direction:**
- Helms, E. R., Aragon, A. A., & Fitschen, P. J. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation." *J Int Soc Sports Nutr* 11(20).
- Israetel, M. et al. (2017). *Scientific Principles of Hypertrophy Training* — autoregulation chapter on RPE-based vs HRV-based readiness modulation.

**Audit posture:** Verified `ADJUSTMENT_MAGNITUDE.magnitudeT1Plus = 0.15` and `magnitudeT0 = 0.10` immutable. `UP_GATING_CONDITIONS.forbiddenPhases` contains `['PEAK', 'LOAD+']` per spec. Tests `src/engine/energyAdjustment/tests/` cover the cascade prevention and the asymmetric trigger paths.

---

## §5 — Kalman filter floating-point drift over long horizons (§38-H5)

**Decision:** Andura Kalman 1D filter has been validated to remain numerically stable over 90-day horizons (pre-existing `kalmanConvergence.test.js`) and is extended in this fix-batch to cover 1000-day extreme horizons asserting no NaN/Infinity emergence and acceptable drift.

**Implementation site:** `src/engine/bayesianNutrition/kalmanFilter.js:113-134` (`kalmanUpdate1D`).

**Drift analysis (Hall 2008 reference):**
- Process noise default: `Q = KALMAN_DEFAULTS.metabolicAdaptationKcalPerKgLbm × 0.01 = 22 × 0.01 = 0.22` kg/day.
- Bridge derivation cu Forbes equation `7700 kcal ≈ 1 kg body weight` documented inline `kalmanFilter.js:21-37` JSDoc.
- Per-step rounding NOT applied (intentional — preserves Kalman closed-form covariance update math). Defensive rounding at consumer surfaces only (`Math.sqrt(Math.max(0, sigmaNewSq))` prevents negative-radicand from numerical underflow).

**Empirical drift bounds (per existing 90-day tests + new 1000-day stability test added in this fix-batch):**
- 90 days, Marius cut 80→70 kg: R² > 0.85, final mu within ±2 kg of target.
- 90 days, Maria maintenance 65 kg: drift < 1 kg from stable target.
- 1000 days (new test): mu remains finite, sigma remains positive, no NaN/Infinity emergence under standard measurement noise. Verifies Kalman gain converges to steady-state (not divergent), preventing pathological accumulation.

**Validation gate:** `evaluateR2Gate(r2)` enforces strict `>` (not `>=`) per ADR 026 §9.4.2 Cluster B2 Caveat 2 spec verbatim (§B031 audit fix preserved).

**Fallback chain:**
- Feature flag `bayesian_kalman_v1` disabled → EWMA fallback active.
- R² ≤ 0.85 gate fail → EWMA fallback recommended.
- `validateKalmanState` returns `valid: false` → caller should prompt re-calibration UI (§B028 audit fix).

**Citation (primary source — see also inline JSDoc):**
- Hall, K. D. (2008). "What is the required energy deficit per unit weight loss?" *Int J Obes* 32(3): 573-576.
- Hall, K. D. et al. (2011). "Quantification of the effect of energy imbalance on bodyweight." *Lancet* 378(9793): 826-837.
- Forbes, G. B. (2000). "Body fat content influences the body composition response to nutrition and exercise." *Ann NY Acad Sci* 904.

**Audit posture:** Verified inline JSDoc Hall 2008 + Hall 2011 + Forbes 2000 citations present. R²>0.85 gate strict verified. 90-day convergence simulator covers 4 scenarios; 1000-day extension added in this fix-batch (`kalmanConvergence.test.js` new describe block).

---

## §6 — Library 657 schema invariant (§39-H1)

**Decision:** The 657-entry exercise library schema invariant (cumulative count post-Bundle 6.0.7) is enforced via automated test asserting exact equality `Object.keys(EXERCISE_METADATA).length === 657`.

**Implementation site:** `src/schema/__tests__/exerciseMetadata.test.js` (existing tests Bundle 6.0.7 §1, §14, §15).

**Existing test coverage (pre-fix):**
- `Bundle 6.0.7 cumulative count = 657 exact` — strict equality §14 (line 2484).
- `Bundle 6.0.7 cumulative library count ≥ 657` — floor invariant §1 (line 2326).
- `Pre-Beta library 100% gate achieved (cumulative ≥ 657 floor LOCK V1)` — §15 (line 2494).

**Field shape invariants (each EXERCISE_METADATA entry):**
- `muscle_target_primary`: enum 11 canonical RO strings (`piept|spate|umeri|biceps|triceps|antebrate|core|picioare-quads|picioare-hamstrings|fese|gambe`) per ADR_ANATOMICAL_CLASSIFICATION_V1.
- `equipment_type`: enum 6 canonical (`barbell|bodyweight|cable|dumbbell|machine|band`).
- `force_demand`: enum 3 (`low|medium|high`).
- `tier`: enum 3 (`1|2|3`).
- `equipment_alternatives`: Array (always present).
- `fallback_cascade`: Array of `{type, exercise_id | exercise_ids}` (present for 631/657 entries — see §7 below for the 26 V1 baseline exempt).

**Schema invariant added in this fix-batch:** `Schema Invariant §39-H1 LOCKED V1` describe block — asserts (a) count exact 657, (b) each entry has required fields (`muscle_target_primary`, `equipment_type`, `force_demand`, `tier`, `equipment_alternatives`), (c) each value within canonical enum.

**Audit posture:** Verified existing tests cover count + shape. New describe block adds explicit single-test invariant statement for refactor regression guard.

---

## §7 — Fallback cascade exempt entries audit (§39-H2)

**Decision:** Of the 657 entries in `EXERCISE_METADATA`, **26 V1 baseline entries are intentionally exempt from `fallback_cascade` population** per Bundle 6.0.1 §9 invariant ("Existing V1 library 26 entries UNCHANGED invariant — ZERO mutation Bundle 6.0.1+"). The 631 Bundle 6.0.1-6.0.7 NEW entries all have `fallback_cascade` populated.

**Note vs recon spec:** RECON §39-H2 mentioned "10 entries lack fallback_cascade." Direct codebase audit shows the actual exempt count is **26 V1 baseline entries**, not 10. The recon number is outdated (likely captured pre-Bundle 6.0.7 LANDED). This ADR reflects the LANDED reality.

**Exempt roster (26 V1 baseline, preserved per Bundle 6.0.1-6.0.7 §9 invariant):**

| Name                          | Primary muscle           | Tier |
|-------------------------------|--------------------------|------|
| DB Shoulder Press             | umeri                    | 1    |
| Incline DB Press              | piept                    | 1    |
| Flat DB Press                 | piept                    | 1    |
| Flat Barbell Bench            | piept                    | 1    |
| Lat Pulldown                  | spate                    | 1    |
| Cable Row                     | spate                    | 1    |
| Chest-Supported Row           | spate                    | 1    |
| Romanian Deadlift             | picioare-hamstrings      | 1    |
| Leg Press                     | picioare-quads           | 1    |
| Lateral Raises                | umeri                    | 2    |
| Lateral Raises (cable)        | umeri                    | 2    |
| Rear Delt Fly                 | umeri                    | 2    |
| Rear Delt Cable               | umeri                    | 2    |
| Pec Deck / Cable Fly          | piept                    | 2    |
| Cable Fly                     | piept                    | 2    |
| Incline DB Curl               | biceps                   | 2    |
| Bayesian Curl                 | biceps                   | 2    |
| Cable Curl                    | biceps                   | 2    |
| Preacher Curl                 | biceps                   | 2    |
| Hammer Curl                   | biceps                   | 2    |
| Overhead Triceps              | triceps                  | 2    |
| Pushdown                      | triceps                  | 2    |
| Leg Curl                      | picioare-hamstrings      | 2    |
| Leg Extension                 | picioare-quads           | 2    |
| Face Pulls                    | umeri                    | 3    |
| Calf Raises                   | gambe                    | 3    |

**Why exempt:** Bundle 6.0.1-6.0.7 introduced cascading equipment-missing fallback (5-step canonical: `easier_machine → assisted_variant → muscle_group_compose → bodyweight → light_variant`) as an ADDITIVE feature. V1 baseline 26 entries pre-date this feature; mutating them retroactively would violate `ZERO mutation existing` invariant guarded by Bundle 6.0.1 §9 test, Bundle 6.0.2 §9 test, Bundle 6.0.3 §8 test, …, Bundle 6.0.7 §12 test (sentinel cross-bundle).

**Fallback behavior at runtime when V1 baseline exercise is unavailable (equipment missing):**
- `getValidAlternatives(exerciseName)` returns the `equipment_alternatives` ranking-based list (V1 path).
- `fallback_cascade` field absent → consumer should skip cascade traversal and fall back to V1 ranking.

**Post-Beta migration path (optional, deferred per Daniel CEO LOCK 2):** Populate `fallback_cascade` for V1 baseline 26 entries as a Bundle 6.0.8+ feature. Migration must preserve `equipment_alternatives` field for backward-compatibility.

**Audit posture:** Verified 26 entries via runtime `Object.entries(EXERCISE_METADATA).filter(([, m]) => !m.fallback_cascade)`. Cross-checked Bundle 6.0.1 test §9 (line 134-143 in `exerciseMetadata.test.js`) explicitly enumerates 5 V1 chest baseline as `fallback_cascade === undefined` invariant. Schema field shape consistent.

---

## §8 — Pain Button branching ACUT / USOARA / NICIO (§43-H1)

**Decision:** The Pain Button UI uses a 3-tier intensity scale (`1=Usor`, `2=Mediu`, `3=Sever`) mapped to engine `PAIN_OPTIONS` 3-key set (`discomfort_general`, `discomfort_specific`, `doms_severe`). Branching outcome per intensity:

**Implementation sites:**
- UI: `src/react/routes/screens/antrenor/PainButton.tsx:41-70` (intensity 1/2/3) + `:24-39` (15 body regions).
- Engine: `src/engine/pain-button/pain-input.js:6-30` (`PAIN_OPTIONS` + `processPainInput`).

**Branching matrix:**

| Intensity (UI)    | Engine key (`PAIN_OPTIONS`) | Engine action          | UI outcome                                                                                |
|-------------------|------------------------------|------------------------|--------------------------------------------------------------------------------------------|
| 1 = Usor          | discomfort_general          | suggest_alternative    | Coach evita exercitii care irita zona — workout adapted alternate exercises.              |
| 2 = Mediu         | discomfort_specific          | reduce_volume          | Volume reduce for current session; continue adapted.                                       |
| 3 = Sever         | doms_severe                  | skip                   | Workout SKIP for this region; user-facing "Salveaza si iesi" escape hatch always visible. |

**Rationale (anti-paternalism per D-LEGACY-061):** PAIN_OPTIONS labels are *neutral observational* ("Miscarea ma deranjeaza" / "Simt o tensiune ciudata" / "DOMS sever") — NOT self-diagnostic medical claims. Engine output uses non-medical action vocabulary (`skip` / `reduce_volume` / `suggest_alternative`) — NO "consult doctor" auto-trigger from intensity 3 alone.

**Anti-force-typing (D-LEGACY-010 §AMENDED):** Region selection mandatory for Continue (button disabled until region selected), but "Salveaza si iesi" escape hatch always visible — NU forteaza completion.

**Audit posture:** Verified Pain Button branching is observable + reversible + non-paternalistic. NO automated "consult doctor" cue triggers from pain intensity alone — MedicalDisclaimerModal is a separate pre-onboarding gate (see §10 below).

---

## §9 — Injury reporting CDL + Recovery Engine wire (§43-H2)

**Decision:** Post-pain CDL (Coach Decision Log) override append is wired through `buildOverrideAuditEntry` (`src/engine/pain-button/override-cdl.js`). Recovery Engine adapt is consumed downstream via `muscleRecovery.getRecoveryByGroup` reading CDL logs.

**Implementation sites:**
- CDL append: `src/engine/pain-button/override-cdl.js` (`buildOverrideAuditEntry`).
- Recovery state read: `src/engine/muscleRecovery.js:41-57` (`getRecoveryByGroup(logs)`).
- Pain context propagation: `src/react/routes/screens/antrenor/PainButton.tsx:77-82` — pain context propagated to workout-preview via `location.state.painContext`.

**Flow:**
1. User selects region + intensity → Continue clicked.
2. `navigate(gotoPath('workout-preview'), { state: { painContext: { region, intensity }, intensityMod: 'minus' } })` propagates context.
3. Workout preview reads `painContext` from `location.state` (Phase 3 path) → engine adapter applies `processPainInput` action.
4. CDL append-only log persisted via `buildOverrideAuditEntry` (Phase 4+ wires real CDL write; Phase 3 propagates via `location.state` per D-LEGACY-035).
5. Next session: `getRecoveryByGroup(logs)` reads CDL logs + adapts volume per muscle group recovery state (`recovered` / `partial` / `fatigued`).

**Recovery state thresholds (verbatim from `muscleRecovery.js:33-34`):**
- `FATIGUED_THRESHOLD = 35` — max(headState[head]) ≥ 35 → fatigued.
- `PARTIAL_THRESHOLD = 12` — max ≥ 12 and < 35 → partial.
- Else → recovered.

**Volume redistribution multipliers (verbatim from `applyRecoveryStateRedistribution` `periodization/volumeLandmarks.js:228-230`):**
- recovered → 1.00 multiplier.
- partial → 0.80 multiplier (-20%).
- fatigued → 0.60 multiplier (-40%).

**Audit posture:** Verified wiring exists between Pain Button → CDL → muscleRecovery.getRecoveryByGroup → Periodization applyRecoveryStateRedistribution. Phase 3 path uses location.state propagation (per D-LEGACY-035); Phase 4+ wires append-only CDL write (D-LEGACY-035 amendment forward).

---

## §10 — "Consult doctor" cues placement audit (§43-H3)

**Decision:** Medical referral / "consult doctor" cues are scoped to **MedicalDisclaimerModal pre-onboarding gate only**. Pain Button intensity 3 (severe) does NOT auto-trigger a doctor-consult cue. This aligns with Daniel anti-paternalism LOCK (D-LEGACY-061).

**Implementation sites:**
- MedicalDisclaimerModal: `src/react/components/MedicalDisclaimerModal.tsx:69-85` (3-paragraph copy + acknowledgment).
- Pain Button: `src/react/routes/screens/antrenor/PainButton.tsx` — NO doctor-consult string at any intensity level.
- Energy Adjustment medical referral: `src/engine/energyAdjustment/constants.js:184` (`MEDICAL_REFERRAL_COPY`) — used ONLY when Energy emoji RED + drill-down "durere" cause + persistence threshold met (per ADR 026 §9.3.5 Q18=D).

**MedicalDisclaimerModal verbatim copy (lines 71-83):**
1. "Andura este un coach AI. Recomandarile sunt informative, nu substitut pentru sfat medical."
2. "Daca ai conditii medicale, accidentari recente sau dureri persistente, consulta-ti medicul inainte de a incepe un program de antrenament."
3. "La orice durere ascutita sau senzatie anormala, opreste-te imediat si verifica cu un specialist."
4. Italic: "Continuand confirmi ca ai luat la cunostinta aceste informatii."

**Energy Adjustment MEDICAL_REFERRAL_COPY verbatim:** `Consulta medicul de familie sau un specialist in medicina sportiva` (specific pathway — anti-ambiguity per Daniel push-back mid-flight 2026-05-XX; generic "specialist" rejected).

**Anti-paternalism audit checklist:**
- Pain Button intensity 3 (severe DOMS) → engine action `skip` only. NO doctor cue.
- Pain Button intensity 2 (mediu) → engine action `reduce_volume` only. NO doctor cue.
- Pain Button intensity 1 (usor) → engine action `suggest_alternative` only. NO doctor cue.
- Energy 🔴 RED drill-down `durere` cause + cumulative persistence → eventually `MEDICAL_REFERRAL_COPY` emitted via aggregation pipeline. THIS IS THE ONLY engine-emitted medical referral cue.
- MedicalDisclaimerModal — pre-onboarding gate, one-time acknowledgment + persisted to `disclaimerStore` localStorage. NOT re-prompted per session.

**Audit posture:** Verified `grep` over `src/react/routes/screens/antrenor/PainButton.tsx` and `src/engine/pain-button/` shows NO "medic" / "doctor" / "specialist" strings. MedicalDisclaimerModal is the single source for medical-cue UI text. Energy Adjustment MEDICAL_REFERRAL_COPY scoped to drill-down `durere` path only.

**Pre-Beta verification:** Manual Daniel Gates smoke test should verify (a) MedicalDisclaimerModal shows once on first onboarding, (b) Pain Button intensity 1/2/3 shows NO doctor cue copy, (c) Energy drill-down `durere` cumulative path → eventually shows MEDICAL_REFERRAL_COPY (E2E test required post-§7-C3 auth wire).

---

## Cross-references

- `src/engine/weaknessDetector.js` — Brzycki 1RM (§1).
- `src/engine/suflet-andura/rir-matrix.js` — RIR_MATRIX 4-tier (§2).
- `src/engine/periodization/constants.js` — Israetel MEV/MAV/MRV + persona + goal + recovery multipliers (§3).
- `src/engine/energyAdjustment/constants.js` — Energy ±15% asymmetric + UP gating + yo-yo anti-flap + medical referral copy (§4, §10).
- `src/engine/bayesianNutrition/kalmanFilter.js` — Kalman 1D + EWMA fallback + R²>0.85 gate (§5).
- `src/engine/bayesianNutrition/tests/kalmanConvergence.test.js` — 90-day convergence + new 1000-day stability test (§5).
- `src/schema/exerciseMetadata.js` — 657-entry library (§6, §7).
- `src/schema/__tests__/exerciseMetadata.test.js` — schema invariant tests (§6, §7).
- `src/react/routes/screens/antrenor/PainButton.tsx` — pain UI 3-tier intensity (§8).
- `src/engine/pain-button/pain-input.js` — PAIN_OPTIONS + processPainInput (§8).
- `src/engine/pain-button/override-cdl.js` — CDL append-only audit entry (§9).
- `src/engine/muscleRecovery.js` — getRecoveryByGroup + thresholds (§9).
- `src/react/components/MedicalDisclaimerModal.tsx` — pre-onboarding medical gate (§10).
- `03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md` §9.3-§9.4 — source spec for Energy Adjustment + Periodization (§3, §4).
- `03-decisions/_FROZEN/ADR_RIR_MATRIX_ADAPTIVE_v1.md` — RIR matrix source ADR (§2).
- `03-decisions/_FROZEN/ADR_PAIN_DISCOMFORT_BUTTON_v1.md` — Pain Button source ADR (§8, §9).

---

## Status & approval

**Status:** LOCKED V1
**Approval:** Co-CTO autonomous LOCK per Wave 2a dispatch authority (D045 substrate clean preserved). Daniel CEO acknowledgment expected at next post-LANDED handover review.
**Supersede policy:** Append-only. Future updates → new ADR cu version bump (e.g., `ADR-ENGINE-MATH-LOCKED-VALUES-V2.md`).
