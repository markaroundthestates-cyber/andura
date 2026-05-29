# SECTION 03 — Progress tab + body-comp + nutrition (CRITICAL — gate 95%)

> **Goal.** Every number rendered on the Progress tab is (a) *correct* against
> the engine that produces it, (b) *reactive* to the inputs that should move it
> (a logged weight, an edited profile weight, a logged session, a measured
> waist/neck), and (c) *honest* — never a fabricated value, never a stale frozen
> seed, always carrying its source/caveat where the math is an estimate. This is
> the tab where the body-fat split-source bug (Daniel, 2026-05-29) lived; it is
> also where the Bayesian nutrition posterior surfaces as the screen's HERO
> number, so a wrong or non-reactive kcal here is a credibility-killer.
>
> **Why this is CRITICAL.** Progress is the feedback loop of the whole product —
> a user logs, and the app must *visibly* change in response. If the kcal target
> doesn't move when the user logs a workout, if bf% stays frozen when the user
> drops 5 kg, if the trend chart lies — the user concludes the engine is fake and
> leaves. The CRITICAL gate (95%) plus the data-section dependency (§08) means a
> single non-reactive number here is a beta-blocker, not a polish item.
>
> **Scope of this file.** The Progress home (`Progres.tsx`, 6 zones) + every
> component it mounts (TDEEStrip, FatigueStrip, BMRStrip, BodyFatStrip, the
> Sparkline trend card, ProjectionStrip, HeatMapWeekly, MuscleRecoveryGrid,
> ObiectivGoalCard, ObiectivCard, NutritionInline) + the four sub-screens
> (LogWeight, BodyData, WeightLogList, WeightTimeline) + the wiring libs
> (`userTdee.ts`, `bayesianNutritionAggregate.ts`, `nutritionProjection.ts`,
> `progresStore.ts`). Per-element checks split into: value-correctness,
> reactivity, empty-state gating, honesty/caveat copy, i18n (cross-ref §09),
> glass/Pulse parity (cross-ref §11).
>
> **Run discipline (from 00-MASTER §HOW TO RUN).** One verdict per step. Evidence
> mandatory — a PASS with no `file:line` / computed value / screenshot / command
> output is INVALID and scored FAIL. Behavior + reactivity steps run against a
> SEEDED populated account (see §APPENDIX-SEED in the master run), never an empty
> one — an empty Progress tab hides every reactivity bug. Empty-state steps run
> against a fresh (T0) account specifically. BLOCKED only when an env dependency
> is genuinely missing — never to dodge a checkable item; >5% BLOCKED in this
> section fails the section regardless.
>
> **Canonical SoT note (pin this once, applies to all reactivity steps).** The
> single source for "current weight" is `getCurrentWeightKg()`
> (`src/react/lib/userTdee.ts:348-362`) = **max-by-date** over
> `progresStore.weightLog`, falling back to `onboardingStore.data.weight`. Two
> components on this tab read weight DIFFERENTLY: `BodyFatStrip.tsx:39` uses
> positional `weightLog[weightLog.length - 1]?.kg` (LAST array slot, not max-by-
> date), and `BMRStrip.tsx:63` does the same. This is a residual split-source.
> It MOSTLY reacts because `SettingsProfile.tsx:162` now upserts the edited
> profile weight into `weightLog` (by-date upsert), and `LogWeight` appends; so
> in the common forward-dated path `weightLog[last]` and `getCurrentWeightKg()`
> agree. They DIVERGE when a back-dated entry is appended (positional last ≠
> max-by-date). Verdict for that exact divergence is pinned PARTIAL in §03.018.

---

## 03.A — Progress home shell, zones, header, render order

### [03.001] Progress home renders with the documented zone skeleton
- **Check:** `Progres` mounts the 6 semantic zones in the documented top→bottom order: AZI → TENDINTA → ACTIUNI → RECUPERARE → OBIECTIV → LOG MANUAL.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:119-289`
- **Expected:** DOM order of `data-testid="progres-zone-azi"`, `progres-zone-tendinta`, `progres-zone-actiuni`, `progres-zone-recovery`, `progres-zone-obiectiv`, `progres-zone-log` is strictly this sequence.
- **Verify:** Playwright on seeded account → `page.locator('[data-testid^="progres-zone-"]')` → read the `data-testid` of each in document order → assert array equals `['progres-zone-azi','progres-zone-tendinta','progres-zone-actiuni','progres-zone-recovery','progres-zone-obiectiv','progres-zone-log']`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.002] kcal HERO leads the screen (TDEEStrip is first child of AZI zone)
- **Check:** The recommended kcal (TDEEStrip) is the first interactive/data element of zone 1, per the 2026-05-28 "kcal recomandate sus" reorder.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:131-144`
- **Expected:** Inside `progres-zone-azi`, `tdee-strip` appears before `fatigue-bmr-grid` which appears before `bodyfat-strip`.
- **Verify:** Playwright → within `progres-zone-azi`, assert `tdee-strip` precedes `fatigue-bmr-grid` precedes `bodyfat-strip` in document order.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.003] Heading + tagline render via i18n (no hardcode)
- **Check:** The `<h1>` heading is `t('tabs.progres.title')` and the subtitle is `t('tabs.progres.subtitle')`, not literals.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:123-124`
- **Expected:** EN renders "Progress" + a "Body composition…" tagline; RO renders the no-diacritics equivalent. Cross-ref §09 i18n.
- **Verify:** `grep -nE "Progres|compozit|Body comp" src/react/routes/screens/progres/Progres.tsx` returns no hardcoded user-facing literal in JSX text nodes; existing test `Progres.test.tsx:48-53` asserts heading text "Progress" + `/Body composition/i`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.004] Each zone has a localized mono eyebrow heading
- **Check:** Every zone renders a `ZoneHeading` with its testid + an i18n string (`progres.zone.*`).
- **Where:** `src/react/routes/screens/progres/Progres.tsx:76-85,132,151,186,259,269,285`
- **Expected:** 6 headings with testids `progres-zone-azi-heading`, `…-tendinta-heading`, `…-actiuni-heading`, `…-recovery-heading`, `…-obiectiv-heading`, `…-log-heading`, each text = `t('progres.zone.azi'|'tendinta'|'actiuni'|'recuperare'|'obiectiv'|'logManual')`.
- **Verify:** Playwright → 6 heading testids present + non-empty; confirm `progres.zone.*` keys exist in `src/i18n/en.json` + `src/i18n/ro.json` (`en.json:579` `"zone"` block present).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.005] alerts-banner precedes cta-log-weight (intra-zone order contract)
- **Check:** In zone ACTIUNI the AlertsBanner is rendered before the log-weight CTA (pinned test contract).
- **Where:** `src/react/routes/screens/progres/Progres.tsx:187-201`
- **Expected:** `alerts-banner` / `alerte-azi-label` precede `cta-log-weight` in document order (existing assertion referenced at Progres.test.tsx).
- **Verify:** Playwright on a seeded account that produces ≥1 alert → assert `alerts-banner` precedes `cta-log-weight`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.006] AlertsBanner consumes coach aggregate, hides when no alerts
- **Check:** `alerts` is sourced from `getCoachToday().alerts` and the `alerte-azi-label` only renders when `alerts.length > 0`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:92-103,187-192`
- **Expected:** Fresh account (no alerts) → no `alerte-azi-label`; seeded account with an alert condition → label + banner visible.
- **Verify:** Playwright T0 account → `alerte-azi-label` absent. Then seed an alert-producing state → label present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.007] Zones use staggered entrance animation (parity, not jank)
- **Check:** Each zone wrapper carries `animate-card-rise` with an increasing `delay-*` (0/75/150/225/300/375).
- **Where:** `src/react/routes/screens/progres/Progres.tsx:131,150,185,258,268,284`
- **Expected:** Staggered entrance; under `prefers-reduced-motion` the animation is suppressed (cross-ref §10 a11y reduced-motion).
- **Verify:** Read class list per zone; then with reduced-motion emulation on, confirm no sustained transform animation (computed `animation-name` none or instant).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.B — kcal HERO (TDEEStrip): correctness, reactivity, honesty

> The HERO number is the Bayesian-nutrition posterior surfaced through
> `getNutritionTargetTodayReal` → `getNutritionTargetsToday` (engineWrappers).
> Priority order is invariant: **manual log > engine-bn > baseline**
> (`bayesianNutritionAggregate.ts:33-64`). Source must be labeled honestly.

### [03.008] HERO kcal value equals the engine `kcalTarget`
- **Check:** The big HERO number equals `target.kcalTarget` from `getNutritionTargetTodayReal(todayIso(), ctx)`.
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:108-117,182-187`
- **Expected:** Rendered number (after `fmtNum` ro-RO space separator) equals the engine's `kcalTarget`. `'—'` only while `target===null` (pre-resolve).
- **Verify:** Playwright → read `tdee-strip` HERO text; in the same session call `window`-exposed or instrument `getNutritionTargetTodayReal(today, readBayesianNutritionContext())` → assert displayed integer (strip spaces) === engine `kcalTarget`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.009] Source badge labels the posterior honestly (engine-bn / manual / baseline)
- **Check:** `tdee-source` text = `sourceLabel(target.source)`, mapping `engine-bn`/`manual`/`baseline` to `progres.tdee.sources.*`.
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:42-46,189-198`
- **Expected:** Seeded engine-driven account → "engine"-flavored label; manual-logged day → "manual"; cold-start/throw → "baseline". Never silently mislabel a baseline 2640 as engine output.
- **Verify:** Playwright across 3 states (seeded engine, manual-logged, fresh) → assert the `tdee-source` text matches the expected `progres.tdee.sources.*` value each time.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.010] HERO kcal REACTS to a logged training session
- **Check:** Logging a workout this week raises the maintenance TDEE (and thus kcal target) because the activity term comes from real sessions, not a flat 1.55 multiplier.
- **Where:** `src/react/lib/userTdee.ts:189-200` (`computeMaintenanceTDEE`: `BMR×1.25 + sessions×300/7`) → consumed by engineWrappers → TDEEStrip.
- **Expected:** Seeded account with 0 logged sessions this week → note HERO kcal. Log 3 sessions (within `SESSIONS_WINDOW_DAYS=7`) → return to Progress → HERO kcal is HIGHER by ~`3×300/7 ≈ 129` kcal (subject to blend weight in `blendEffectiveSessions`; if `loggedWeeks=0` and a planned freq exists, the blend may damp the delta — record the actual delta).
- **Verify:** Playwright: seed sessions=0, read HERO. Seed/append 3 sessions with `ts` inside the 7-day window, reload Progress, read HERO. Assert delta > 0 and is consistent with the forward model (`computeMaintenanceTDEE`) × goal multiplier.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** If the blend (`blendWeightFromLoggedWeeks`, loggedWeeks→w) fully damps the change at cold-start, document whether the kcal still moves once `loggedWeeks≥1`. PARTIAL if it never visibly moves within a realistic window.

### [03.011] HERO kcal REACTS to a logged weight (per-user maintenance)
- **Check:** Logging a new weight changes BMR → maintenance TDEE → kcal target (weight is canonical via `getCurrentWeightKg`).
- **Where:** `src/react/lib/userTdee.ts:315-334` (reads `getCurrentWeightKg()`), Mifflin BMR `165-173`.
- **Expected:** Log a +10 kg weight → HERO kcal rises (`10×10=100` to BMR × 1.25 ≈ +125 kcal, plus phase multiplier). Log −10 kg → falls.
- **Verify:** Playwright on seeded account → read HERO → LogWeight a clearly different kg → return to Progress → assert HERO moved in the correct direction and magnitude is plausible vs Mifflin delta.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.012] Protein target = g/kg × current bodyweight (not a flat 180)
- **Check:** The protein sub-line equals `computeProteinTargetG(currentWeight)` = `round(weight × 1.8)`.
- **Where:** `src/react/lib/userTdee.ts:91,387-390` + `TDEEStrip.tsx:189-198` (`t('progres.tdee.withProtein', { g })`).
- **Expected:** Seeded 80 kg user → protein ≈ 144 g (80×1.8). Reacts to logged weight.
- **Verify:** Playwright → read protein sub-line; compute `round(currentWeight×1.8)` → assert equal. Then log a different weight → protein changes accordingly.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Note: when `source==='manual'`, protein echoes the logged value (`bayesianNutritionAggregate.ts:46-53`), not the g/kg formula — verify only on engine/baseline source.

### [03.013] "Today vs target" comparison appears only with a genuine logged intake
- **Check:** The current-vs-target view (`tdee-current-vs-target`) shows only when `loggedKcal != null && target != null && target.source !== 'manual'`.
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:98-126,172-181`
- **Expected:** No manual kcal logged → plain target view. Manual kcal logged on an engine/baseline target → comparison with signed delta (`+`/`-` via `deltaLabel`). When `source==='manual'` (full override) → comparison hidden (delta-0 meaningless).
- **Verify:** Playwright: (a) fresh day no log → `tdee-current-vs-target` absent; (b) log only kcal (partial) → comparison present with correct `loggedKcal - kcalTarget`; (c) log both kcal+protein (manual source) → comparison absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.014] Phase badge reads the SchimbaFaza override (B001), defaults Auto
- **Check:** `tdee-faza-badge` reflects `localStorage['phase-override']` mapped through `PHASE_KEY_MAP`, defaulting to Auto when absent/unknown.
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:52-82,136-157`
- **Expected:** No override → "Phase: Auto" (EN) / phase Auto (RO). Set override to CUT → "Phase: Cut". Unknown raw → Auto.
- **Verify:** Playwright → assert default badge = Auto; set `localStorage['phase-override']='CUT'` + reload → badge = Cut; set garbage → Auto.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Note the phase label is memoized once on mount (`useMemo([],…)` `TDEEStrip.tsx:102`) — a live phase change without a remount will NOT update the badge. Flag PARTIAL if a same-session phase change must remount Progress to reflect.

### [03.015] Mesocycle week derives from session count modulo 4, floors at 1
- **Check:** `tdee-mesocycle-week` = `computeWeekInMesocycle(sessionsHistory.length, 3)` = `(floor(count/3) % 4) + 1`.
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:60,89-93,103-106,158-160`
- **Expected:** 0 sessions → Week 1; 3 sessions → Week 2; 12 sessions → Week 1 (wrap). Never 0 or >4.
- **Verify:** Seed `sessionsHistory` of lengths {0,3,6,12} → assert week label = {1,2,3,1}.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Heuristic (freq fixed at 3) — acceptable per Karpathy SF; flag only if it shows an impossible value.

### [03.016] Healthy-floor support message appears for an underweight user (BUG #4 safety)
- **Check:** When the engine returns `healthyFloorClamped` (subponderal, BMI ≤ 18.5 → surplus not deficit), `tdee-healthy-floor-msg` renders the supportive medical-note copy.
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:215-228` + engine clamp `engineWrappers.ts:694,960`.
- **Expected:** Seeded underweight account (low BMI) → supportive message present (`role="status"`). Normal-BMI account → absent. Cross-ref §15 invariants (medical disclaimer / kcal floor) + §07 engines.
- **Verify:** Playwright: seed an underweight stat set (e.g. 45 kg / 175 cm) → assert `tdee-healthy-floor-msg` visible. Seed normal BMI → assert absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** ⚠️ The support message text is HARDCODED Romanian at `TDEEStrip.tsx:223-225` ("Esti sub greutatea sanatoasa — hai sa crestem treptat, sanatos…"), NOT via `t()`. This is an i18n leak + EN-default violation. Pre-fill verdict tendency: **FAIL on the i18n sub-check** (the gating logic is correct; the copy is not internationalized). Cross-ref §09. Fix: extract to `progres.tdee.healthyFloorMsg`.

### [03.017] HERO renders no count-up flash on async-resolved value
- **Check:** The HERO number does not tween from 0 on every load (count-up was deliberately dropped for the async value).
- **Where:** `src/react/components/Progres/TDEEStrip.tsx:13-19` (comment), `182-187` (plain render).
- **Expected:** On load, HERO shows `'—'` then the resolved integer directly — no visible 0→N animation.
- **Verify:** Playwright → capture HERO text at first paint + after resolve; assert it never displays a transient `0` or intermediate tween values.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.C — BodyFat (BodyFatStrip): source, two-tier, reactivity, caveat

### [03.018] bf% reactivity to a profile-weight edit — residual split-source (PRE-FILLED PARTIAL)
- **Check:** Editing weight in the profile updates the bf% shown on Progress.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:38-39` (positional `weightLog[weightLog.length-1]?.kg`) vs canonical `getCurrentWeightKg` max-by-date (`userTdee.ts:348-362`); profile-weight edit upserts weightLog at `SettingsProfile.tsx:162`.
- **Expected:** Changing profile weight recomputes the Deurenberg bf% from the new weight.
- **Verify:** Playwright on seeded account → note bf% on Progress → change weight in Cont › Profil → return to Progress → bf% changed. THEN the adversarial case: append a BACK-DATED weight entry (older `date`, newest array position) → positional `weightLog[last]` picks the back-dated kg while `getCurrentWeightKg` picks max-by-date → BodyFatStrip uses the WRONG weight.
- **Verdict:** ☐ PASS ☑ PARTIAL ☐ FAIL ☐ BLOCKED  *(pre-filled — confirm at audit time)*
- **Evidence:** `BodyFatStrip.tsx:39` reads `weightLog[weightLog.length - 1]?.kg ?? onboardingWeight`. Because `SettingsProfile.tsx:162` upserts the edited weight as TODAY's entry (by-date upsert, `progresStore.ts:132-142`), the forward path makes positional-last == max-by-date, so a normal profile edit DOES move bf%. It diverges only when a back-dated entry sits in the last array slot.
- **Notes:** Residual split-source (not the full 2026-05-29 bug, which was the frozen-onboarding read — that is fixed). Fix: replace `weightLog[weightLog.length-1]?.kg` with `getCurrentWeightKg()` in BodyFatStrip.tsx + BMRStrip.tsx for full canonical alignment. Behavior test in §08 harness should pin the back-dated case.

### [03.019] bf% reacts to a logged weight (forward-dated)
- **Check:** Logging a new (today/forward) weight moves the Deurenberg bf%.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:38-39,58-64`
- **Expected:** Log +8 kg → bf% rises (Deurenberg increases with BMI); log −8 kg → falls.
- **Verify:** Playwright → note bf% → LogWeight a higher kg (today) → return → bf% increased. Repeat lower → decreased.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.020] US-Navy tier wins when waist+neck are measured
- **Check:** When `latestBodyMeasurements` has both `waistCm` and `neckCm`, bf% uses `estimateBF_USNavy`; source label = `progres.bodyFat.sourceUsNavy`.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:44-66`
- **Expected:** Seeded account with waist+neck (and hip for female) → `bodyfat-source` shows the US-Navy label; value = engine `estimateBF_USNavy` output; the "estimat" caption (`bodyfat-cta`) is ABSENT (only shown when Deurenberg).
- **Verify:** Playwright: seed bodyData with neck+waist → assert source = US-Navy label + `bodyfat-cta` absent; cross-check displayed value against `estimateBF_USNavy({sex,height_cm,neck_cm,waist_cm[,hip_cm]})`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.021] Deurenberg fallback with high-BMI cap (estimat tier)
- **Check:** Without waist+neck, bf% falls to `estimateBfDeurenbergCapped`; the cap `min(raw, BMI×0.85)` applies at BMI ≥ 27 and toggles the "approx" caption.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:55-66,90-98`
- **Expected:** Normal BMI estimat → `progres.bodyFat.captionFromBmi` + nudge; capped (BMI ≥ 27) → `progres.bodyFat.captionApprox` + nudge; source label = `progres.bodyFat.sourceEstimated`.
- **Verify:** Playwright: seed normal-BMI no-measurements → caption = "from BMI" + source Estimated; seed BMI ≥ 27 → caption = "approx" (capped) + value ≤ BMI×0.85.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §07 (engine `estimateBfDeurenbergCapped` determinism) + §08 (bodyData SoT via `latestBodyMeasurements`).

### [03.022] bf% aggregates measurements per-field across the full bodyData history
- **Check:** A neck measured in Cont then a chest measured in Progres still yields US-Navy bf% (neck is not lost because the latest entry lacks it).
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:34` (`latestBodyMeasurements`) + `progresStore.ts:79-104`.
- **Expected:** Per-field latest-value aggregation: bf% uses the most recent neck AND the most recent waist even if they came from different entries.
- **Verify:** Playwright: add a bodyData entry with only neck (Cont path), then one with only waist+chest (Progres path) → assert US-Navy tier still active (source = US-Navy), value computed from both fields.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.023] bf% empty-state for a fresh user (no stats)
- **Check:** When stats are incomplete (no sex/weight/age/height → Deurenberg null AND no measurements) the strip shows `bodyfat-empty` hint, not a number.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:64,79-104`
- **Expected:** T0 pre-onboarding → `bodyfat-empty` (`progres.bodyFat.emptyHint`); `bodyfat-value` absent.
- **Verify:** Playwright on a wiped account with no onboarding stats → assert `bodyfat-empty` present, `bodyfat-value` absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.024] bf% value is plausibility-bounded (no absurd %)
- **Check:** Displayed bf% sits within the engine physiological band (US-Navy clamps 2–60; Deurenberg capped).
- **Where:** engine `usNavyBF.js` (2–60 band) + `bodyComposition.js` cap; surfaced `BodyFatStrip.tsx:64,81-82`.
- **Expected:** No bf% < 2 or > 60 reaches the screen across seeded extreme inputs.
- **Verify:** Seed extreme waist/neck (e.g. very large waist) → assert displayed bf ≤ 60; seed very lean → ≥ 2. Cross-ref §07.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.D — Fatigue tile (FatigueStrip)

### [03.025] Fatigue score renders on a 0–10 scale from the 0–100 engine signal
- **Check:** `fatigue.score` (0–100) is displayed as `round(score/10)` out of 10.
- **Where:** `src/react/components/Progres/FatigueStrip.tsx:62-64,82-85`
- **Expected:** Engine score 60 → "6/10"; 93 → "9/10".
- **Verify:** Playwright: seed a session history that drives a known `getFatigue().score` → assert displayed value = `round(score/10)`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.026] Fatigue verdict label + detail localize via the engine's semantic key
- **Check:** `fatigue-sub-label` + `fatigue-detail` resolve `coachEngine.fatigue.<KEY>.label/detail` from the engine's `key` (PEAK_FORM/NORMAL/MODERATE_FATIGUE/HIGH_FATIGUE/INSUFFICIENT_DATA), falling back to engine RO copy.
- **Where:** `src/react/components/Progres/FatigueStrip.tsx:42-59,86-96`
- **Expected:** Each of the 4 active states renders the matching localized label; EN/RO swap correctly. Cross-ref §09.
- **Verify:** Seed states for each key → assert label text matches the bundle entry; toggle locale → strings swap.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.027] Fatigue empty-state gating ("not enough data")
- **Check:** When `getFatigue()` returns null (insufficient data), `fatigue-empty` renders instead of a fabricated score.
- **Where:** `src/react/components/Progres/FatigueStrip.tsx:61-65,98-102`
- **Expected:** Fresh account / no recent sessions → `fatigue-empty` (`progres.fatigue.emptyHint`); no `/10` number shown.
- **Verify:** Playwright T0 → assert `fatigue-empty` present, no score node.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.028] Fatigue tile reacts to newly logged sessions
- **Check:** Logging hard sessions raises the fatigue score (engine reflects recent volume).
- **Where:** `getFatigue` (engineWrappers) consumed at `FatigueStrip.tsx:62`.
- **Expected:** Seed light history → low/empty; append heavy recent sessions → higher /10 score or a more-fatigued verdict.
- **Verify:** Playwright: read fatigue → append a fatigue-inducing session set → reload → assert score/verdict moved toward fatigue.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `getFatigue()` is read synchronously at render (no store subscription) — verify it picks up new sessions on a fresh mount/navigation, not necessarily live mid-screen.

---

## 03.E — BMR tile (BMRStrip)

### [03.029] BMR value equals Mifflin-St Jeor from current weight/height/age/sex
- **Check:** `bmr-value` = `computeMifflinStJeorBMR(sex, currentWeight, age, height)` rounded.
- **Where:** `src/react/components/Progres/BMRStrip.tsx:40-52,54-68,90-94`
- **Expected:** M: `10·kg + 6.25·cm − 5·age + 5`; F: `… − 161`. Seeded 80 kg / 180 cm / 30 y / M → `10·80 + 6.25·180 − 5·30 + 5 = 800 + 1125 − 150 + 5 = 1780`.
- **Verify:** Playwright → read `bmr-value` (strip ro-RO spaces) → assert equals the hand-computed Mifflin value for the seeded stats.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.030] BMR reacts to a logged weight
- **Check:** Logging a new weight recomputes BMR (weight read from `weightLog[last]`).
- **Where:** `src/react/components/Progres/BMRStrip.tsx:62-64`
- **Expected:** +10 kg → BMR + 100 (10·Δkg); the count-up animates to the new number.
- **Verify:** Playwright → note BMR → LogWeight +10 kg today → return → assert BMR rose by ~100.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Same positional `weightLog[last]` read as BodyFatStrip (§03.018) — back-dated-entry divergence applies here too. Note this in evidence if observed.

### [03.031] BMR uses sex-average height fallback only for pre-v3 users (height null)
- **Check:** When `height` is null, BMR uses 178 (M) / 165 (F); when present, uses the real height.
- **Where:** `src/react/components/Progres/BMRStrip.tsx:30-33,48`
- **Expected:** Height-null seeded male → fallback 178 used; height-present → real value used. No silent wrong value.
- **Verify:** Seed height null + male → assert BMR matches the 178-cm formula; seed height 190 → assert BMR uses 190.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.032] BMR empty-state gating
- **Check:** When sex/weight/age incomplete → `bmr-empty` hint, no number.
- **Where:** `src/react/components/Progres/BMRStrip.tsx:46,90-99`
- **Expected:** T0 / missing core stat → `bmr-empty` (`bodyComp.bmrStrip.emptyHint`); `bmr-value` absent.
- **Verify:** Playwright wiped account → assert `bmr-empty` present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.033] Fatigue|BMR 2-col grid layout (mockup parity)
- **Check:** Fatigue + BMR render side-by-side in a 2-col grid wrapper `fatigue-bmr-grid`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:137-140`
- **Expected:** `grid grid-cols-2 gap-2` with FatigueStrip + BMRStrip as the two cells. Cross-ref §11 parity (interfata-noua spacing).
- **Verify:** Playwright → `fatigue-bmr-grid` has 2 child cards rendered in a row at mobile width; computed `grid-template-columns` = 2 tracks.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.F — Trend sparkline + weight snapshot (Sparkline + HeatMapWeekly)

### [03.034] Sparkline trend card renders only with ≥2 weight points
- **Check:** `progres-trend-sparkline` renders only when `sparkData.length >= 2`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:109-117,157-173`
- **Expected:** <2 logged weights → no sparkline card (Sparkline self-guards to null too); ≥2 → smooth line via shared `Sparkline` primitive.
- **Verify:** Playwright: 1 weight → `progres-trend-sparkline` absent; ≥2 weights → present with a rendered line/path.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.035] Trend delta pill sign + color are correct
- **Check:** `trendDelta = (lastWeight.kg − firstWeight.kg).toFixed(1)`; pill prefix `+` for gain, none for loss/flat; color `var(--volt)` when ≤0 (loss/flat = good), `var(--ember)` when >0 (gain).
- **Where:** `src/react/routes/screens/progres/Progres.tsx:113-117,165-169`
- **Expected:** Seed first=80, last=78 → pill "-2 kg" volt; first=80, last=82 → "+2 kg" ember.
- **Verify:** Playwright two seeded logs each way → assert pill text + computed color token.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Semantics: delta uses FIRST vs LAST of the WHOLE `weightLog` (not last-7). HeatMapWeekly delta below uses last-7 first vs last — they can differ. Note any user-confusing mismatch.

### [03.036] Weight snapshot (HeatMapWeekly) latest value + bars from last-7 log
- **Check:** `weight-snapshot-latest` = latest of last-7; up to 7 bars rendered with heights scaled into 32–100%.
- **Where:** `src/react/components/Progres/HeatMapWeekly.tsx:46-66,89-97,118-138`
- **Expected:** Seed 7 weights → 7 `weight-bar-*` nodes, each `data-kg` matching its log; latest value = newest kg.
- **Verify:** Playwright → count `weight-bar-*` = min(7, logCount); assert each `data-kg` equals the seeded log; `weight-snapshot-latest` = last kg.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.037] Snapshot delta gated at ≥2 points, signed + colored, with day span
- **Check:** `weight-snapshot-delta` only when last-7 has ≥2 entries; arrow ↓/↑/=, color succ(loss)/brick(gain)/ink2(flat), label `/ Nz` uses calendar span `spanDays(first.date, last.date)`.
- **Where:** `src/react/components/Progres/HeatMapWeekly.tsx:63-76,99-108`
- **Expected:** 1 entry → no delta. 2 entries 3 calendar days apart, 80→78 → "↓ 2 kg / 3z" succ color.
- **Verify:** Playwright seeded → assert delta arrow/color/span. Confirm span uses `date` difference, not entry count.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.038] Implausible weight delta swaps to a neutral "verify value" note (fat-finger guard)
- **Check:** When |delta|/spanDays > 2 kg/day, the colored delta is replaced by `weight-snapshot-delta-implausible` neutral note (no green celebration of a typo).
- **Where:** `src/react/components/Progres/HeatMapWeekly.tsx:33,72-76,109-116`
- **Expected:** Seed 2 entries 1 day apart, 153→53 (typo) → `weight-snapshot-delta-implausible` shown, colored delta absent.
- **Verify:** Playwright seed the typo case → assert implausible note present + `weight-snapshot-delta` absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.039] Snapshot empty-state for <1 point
- **Check:** No weight entries → `weight-snapshot-empty` hint + latest shows "—".
- **Where:** `src/react/components/Progres/HeatMapWeekly.tsx:93-97,118,139-143`
- **Expected:** T0 → `weight-snapshot-empty` present; bars absent; latest = "—".
- **Verify:** Playwright wiped weightLog → assert empty hint + "—".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.040] Snapshot is non-interactive (mockup parity DRIFT-3)
- **Check:** The snapshot is a `<section>` of `<p>` nodes, NOT a button/link (drill lives on the sibling last-weight-card).
- **Where:** `src/react/components/Progres/HeatMapWeekly.tsx:78-150`
- **Expected:** No click handler / role=button on `weight-snapshot-7day`.
- **Verify:** Playwright → assert `weight-snapshot-7day` is not clickable (no cursor-pointer button semantics); clicking it does not navigate.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.G — Projection (ProjectionStrip)

### [03.041] Projection hidden during async load (no flash)
- **Check:** While `readNutritionProjection` is unresolved, the strip renders nothing.
- **Where:** `src/react/components/Progres/ProjectionStrip.tsx:28-48`
- **Expected:** No `projection-strip` / `projection-strip-empty` before `loaded`.
- **Verify:** Playwright → on first paint neither testid present; after resolve one appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.042] Projection empty-state when un-projectable
- **Check:** When `proj === null` (no intake / TDEE / weight) → `projection-strip-empty` hint (log a few days).
- **Where:** `src/react/components/Progres/ProjectionStrip.tsx:50-69` + `nutritionProjection.ts:84-92`.
- **Expected:** Seeded account with stats but zero logged intake → empty hint (because `avgRecentLoggedIntake` null → projectTrajectory null).
- **Verify:** Playwright: stats present, no nutrition log → assert `projection-strip-empty`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.043] Projected weight is correct vs the forward model
- **Check:** `projected = currentWeight + (avgIntake − tdeeEstimate)×horizon/7700`, clamped ±8 kg, rounded 1dp, horizon = 28 days.
- **Where:** `src/react/lib/nutritionProjection.ts:84-136` + strip render `ProjectionStrip.tsx:105-114`.
- **Expected:** Seed avgIntake=2000, tdee=2500, weight=80, 28d → balance −500 → Δ = −500×28/7700 ≈ −1.8 kg → projected ≈ 78.2 kg, direction loss.
- **Verify:** Seed a deterministic intake log + known TDEE estimate → assert `projection-line` weight ≈ hand-computed value (±0.1 rounding).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §07 (`projectTrajectory` pure-function determinism + clamp).

### [03.044] Maintenance trajectory shows the flat-line copy, not a delta
- **Check:** When |balance| < 75 kcal/day → `projection-maintain` ("you'll stay ~X kg"), not a loss/gain line.
- **Where:** `src/react/lib/nutritionProjection.ts:44,96-107` + `ProjectionStrip.tsx:73-91`.
- **Expected:** Seed intake ≈ TDEE (within 75 kcal) → maintain copy, projectedWeight = currentWeight.
- **Verify:** Playwright seed near-maintenance intake → assert `projection-maintain` present, `projection-line` absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.045] Projected bf% surfaces only when current bf% is derivable
- **Check:** `projection-line` includes the bf suffix only when `proj.projectedBfPct !== null` (FM:LBM split applied).
- **Where:** `src/react/lib/nutritionProjection.ts:116-127` + `ProjectionStrip.tsx:108-113`.
- **Expected:** With measurements → projected bf shown (loss uses 0.75 FM, gain 0.60 FM, clamped 2–60); without derivable bf → weight-only line.
- **Verify:** Seed with neck+waist → assert bf suffix present + value plausible; seed without → assert bf suffix absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.046] Projection reacts to newly logged intake
- **Check:** The strip recomputes when `dailyLog` changes (effect dep on `dailyLog`).
- **Where:** `src/react/components/Progres/ProjectionStrip.tsx:31-45`
- **Expected:** Logging a high-kcal day shifts the projection toward gain.
- **Verify:** Playwright → note projection → log several high-kcal days via NutritionInline → assert projection direction/weight shifts.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.047] Projection carries the honest "current rate, not a promise" disclaimer
- **Check:** `projection-disclaimer` italic copy renders on the loss/gain line.
- **Where:** `src/react/components/Progres/ProjectionStrip.tsx:116-118` (`bodyComp.projectionStrip.disclaimer`).
- **Expected:** Disclaimer present; localized EN/RO. Cross-ref §09 + §15 (honesty invariant).
- **Verify:** Playwright on a projecting account → assert `projection-disclaimer` present + via t().
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.H — Muscle recovery grid (MuscleRecoveryGrid, Big-11)

### [03.048] Grid self-hides for a fresh user (no sessions → engine empty)
- **Check:** When `getRecoveryByGroup` returns nothing (no logged sets), the component returns null (no dangling zone card).
- **Where:** `src/react/components/Progres/MuscleRecoveryGrid.tsx:103-122`
- **Expected:** T0 account → `muscle-recovery-grid` absent (the RECUPERARE zone heading is left above nothing — note whether that's acceptable parity).
- **Verify:** Playwright wiped sessions → assert `muscle-recovery-grid` absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The zone HEADING (`progres-zone-recovery-heading`) still renders even when the grid is null (Progres.tsx:258-260 always mounts the heading). Flag PARTIAL if a fresh user sees a lone "RECUPERARE" label over empty space.

### [03.049] One ring per recovered muscle group, colored by discrete state
- **Check:** Each group renders a `recovery-cell-<group>` with `data-recovery-state` ∈ {recovered, partial, fatigued} and ring color volt/aqua/ember respectively.
- **Where:** `src/react/components/Progres/MuscleRecoveryGrid.tsx:43-54,130-161`
- **Expected:** Seeded session history → cells with states matching `getRecoveryByGroup`; recovered→volt, partial→aqua, fatigued→ember; ring fill 100/60/30.
- **Verify:** Playwright seeded → for each cell assert `data-recovery-state` matches the engine output and the ring color token matches `STATE_COLOR[state]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Honesty check — the ring is a GLYPH for the discrete state, NOT a fabricated %; verify no numeric percentage is printed inside the ring (`MuscleRecoveryGrid.tsx:141-152`). Confirm. Cross-ref §07 (`getRecoveryByGroup` Big-11 invariant) + §15 (no-fabrication).

### [03.050] Recovery flattener emits weight+reps so groups aren't all "recovered"
- **Check:** The session→logs flattener emits `{ex, ts, w, reps}` (not just ex+ts), matching the engine's filter that drops weightless rows.
- **Where:** `src/react/components/Progres/MuscleRecoveryGrid.tsx:74-92`
- **Expected:** Seeded sessions with kg+reps produce non-trivial recovery states (some partial/fatigued), not a uniform "recovered" grid.
- **Verify:** Seed recent heavy sessions → assert at least one cell is partial/fatigued (proves weight reached the engine).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.051] Recovery group labels localize (coachEngine.muscleGroups), state lines localize
- **Check:** Group label resolves `coachEngine.muscleGroups.<group>` (fallback `GROUP_LABELS_RO_BIG11`); state line resolves `progres.recovery.state.<state>`.
- **Where:** `src/react/components/Progres/MuscleRecoveryGrid.tsx:94-101,153-158`
- **Expected:** EN "Chest"/RO "Pieptul"; state line localized. Cross-ref §09.
- **Verify:** Playwright toggle locale → labels + state lines swap; confirm keys exist in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.052] Recovery escalation from pain CDL is read defensively
- **Check:** A recent pain region escalates the mapped group's recovery state (pain-cdl read; throw → no escalation).
- **Where:** `src/react/components/Progres/MuscleRecoveryGrid.tsx:56-67,109` + `DB.get('pain-cdl')`.
- **Expected:** Seed a pain-cdl entry for a region → mapped group escalates toward fatigued.
- **Verify:** Seed `pain-cdl` localStorage → assert mapped cell state escalates vs the no-pain baseline.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §07/§08 (pain CDL source + engine consumption).

---

## 03.I — Goal selector (ObiectivGoalCard) + target weight & ETA (ObiectivCard)

### [03.053] Five goal options render with the canonical ids
- **Check:** Exactly 5 goal rows: auto, forta, masa, slabire, mentenanta (longevitate dropped post-D080).
- **Where:** `src/react/components/Progres/ObiectivGoalCard.tsx:46-52,87-128`
- **Expected:** `obiectiv-row-auto|forta|masa|slabire|mentenanta` present; no `obiectiv-row-longevitate`.
- **Verify:** Playwright → assert the 5 row testids exist + longevitate absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.054] Active goal shows aria-pressed + the "ales" badge; default Auto
- **Check:** The active goal has `aria-pressed="true"` + an `obiectiv-ales-<id>` badge; default is Auto when `goal` unset.
- **Where:** `src/react/components/Progres/ObiectivGoalCard.tsx:56-59,88-125`
- **Expected:** Fresh account → Auto active (badge + aria-pressed); others aria-pressed=false.
- **Verify:** Playwright wiped onboarding goal → assert auto row aria-pressed true + `obiectiv-ales-auto` present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.055] Same-goal tap is a no-op; different-goal tap routes to the confirm drill-down
- **Check:** Tapping the active goal does nothing; tapping a different goal navigates to `program-change-confirm` with `pendingGoal/pendingLabel/pendingSub/returnTo:'progres'`.
- **Where:** `src/react/components/Progres/ObiectivGoalCard.tsx:61-75`
- **Expected:** Active tap → stays on Progress; different tap → confirm screen carrying the state (D047 destructive drill-down).
- **Verify:** Playwright → tap active row → no nav; tap a different row → URL = program-change-confirm; confirm carried state via location.state.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §05 (confirm dialog) — the actual goal mutation + persistence is on the confirm screen, not here.

### [03.056] Goal tap targets meet the 44px minimum (Maria 65)
- **Check:** Each goal row is `min-h-[44px]` (WCAG 2.5.5).
- **Where:** `src/react/components/Progres/ObiectivGoalCard.tsx:101`
- **Expected:** Each row ≥ 44px tall. Cross-ref §10 a11y.
- **Verify:** Playwright → measure each `obiectiv-row-*` boundingBox height ≥ 44.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.057] Target weight input persists to progresStore.targetObiectiv
- **Check:** Typing a target weight calls `setTargetObiectiv({weightKg})` (coerced: finite>0 else null), persisted under `wv2-progres-store`.
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:44-65,88-100` + store `progresStore.ts:149-166,185-189`.
- **Expected:** Enter 75 → `targetObiectiv.weightKg === 75`; survives reload; enter "" → null.
- **Verify:** Playwright → type 75 → reload → input still 75 + `JSON.parse(localStorage['wv2-progres-store']).state.targetObiectiv.weightKg === 75`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §08 persistence.

### [03.058] Target month input persists (YYYY-MM) + clears on empty
- **Check:** Month input calls `setTargetObiectiv({month})`; store accepts `YYYY-MM` or `YYYY-MM-DD`, normalizes "" → null.
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:67-70,102-111` + `progresStore.ts:157-164`.
- **Expected:** Pick 2026-09 → persisted; clear → null.
- **Verify:** Playwright → set month, reload, assert persisted; clear → null.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.059] ETA projection computes from current weight + target + height
- **Check:** `computeTargetEta(target.weightKg, currentWeightKg, height)` produces an ETA line at a safe rate (0.5 kg/wk loss, 0.25 kg/wk gain).
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:23,50-52,148-155` + `lib/targetEta`.
- **Expected:** Seed current 80, target 75 → loss 5 kg at 0.5/wk ≈ 10 weeks → `obiectiv-eta` localized line; uses `getCurrentWeightKg` (canonical).
- **Verify:** Playwright seed weight + target → assert `obiectiv-eta` text reflects the computed horizon (localizeEta weeks/months).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §07 (`computeTargetEta` determinism).

### [03.060] ETA reacts to a logged weight change
- **Check:** Logging a weight closer to/further from target changes the ETA (currentWeight via getCurrentWeightKg).
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:50-52`
- **Expected:** Move current weight toward target → shorter ETA / at-target; away → longer.
- **Verify:** Playwright → set target, note ETA → LogWeight closer to target → assert ETA shortened or `obiectiv-at-target` appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.061] At-target state shows the success line
- **Check:** When current ≈ target, `obiectiv-at-target` (success) renders, no ETA.
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:140-147`
- **Expected:** Seed current == target → `obiectiv-at-target`; `obiectiv-eta` absent.
- **Verify:** Playwright seed equal → assert at-target present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.062] Sub-healthy target warning blocks the projection (BMI 18.5 floor)
- **Check:** A target below the BMI-18.5 floor → `obiectiv-warning` (role=alert), NO ETA projection toward it.
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:52,113-121` (eta.kind==='subhealthy').
- **Expected:** Seed height 180 → BMI-18.5 floor ≈ 60 kg; target 50 → `obiectiv-warning` with `minKg`; no ETA.
- **Verify:** Playwright seed sub-healthy target → assert warning present + `obiectiv-eta` absent. Cross-ref §15 (safety invariant).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.063] Unsafe-rate warning when deadline forces >1.5 kg/wk
- **Check:** When `evaluateTargetRate` returns `unsafe` (required rate > `MAX_SAFE_KG_PER_WEEK`) AND not sub-healthy → `obiectiv-rate-warning` with the safe deadline date.
- **Where:** `src/react/components/Progres/ObiectivCard.tsx:56,122-139` + `lib/targetSafety`.
- **Expected:** Seed current 110, target 62, month 1 month out → unsafe → warning shows required rate + safe date + cap.
- **Verify:** Playwright seed aggressive deadline → assert `obiectiv-rate-warning` with localized rate/direction/cap/safeDate. Cross-ref §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.J — Manual nutrition log (NutritionInline)

### [03.064] kcal + protein chips default to the engine auto target
- **Check:** Unedited chips show `engineTarget.kcalTarget` / `proteinTarget` (fallback baselines 2640/180 only pre-resolve), labeled "Auto from engine".
- **Where:** `src/react/components/NutritionInline.tsx:65-80,148-161,191-204`
- **Expected:** Seeded engine account → chips show the engine target (not 2640), source line = `autoFromEngine`.
- **Verify:** Playwright seeded → assert `nutri-kcal-val` = engine kcalTarget (post-resolve) + `nutri-kcal-source` = auto label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The 2640/180 baselines (`NutritionInline.tsx:33-34`) are the mockup-verbatim sync fallback before the async engine resolves — confirm they are transient, not the steady-state value on a seeded account.

### [03.065] Editing kcal saves a manual log + flips the source label
- **Check:** Pencil → input → Save calls `setDailyKcal(today, n)` (0–9999 validated); chip then shows the manual value + `manualLogged` label.
- **Where:** `src/react/components/NutritionInline.tsx:82-111,136-161`
- **Expected:** Enter 2200 → `nutri-kcal-val` = 2200, source = manual; persists in nutritionStore.
- **Verify:** Playwright → edit kcal to 2200 → Save → assert value + source=manual + persisted (reload).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.066] Editing protein saves a manual log + flips the source label
- **Check:** Protein pencil → input → Save calls `setDailyProtein(today, n)` (0–500 validated); chip shows value + `manualLogged`.
- **Where:** `src/react/components/NutritionInline.tsx:97-111,179-204`
- **Expected:** Enter 170 → `nutri-protein-val` = 170, source=manual.
- **Verify:** Playwright → edit protein → Save → assert value + source=manual + persisted.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.067] Out-of-range manual entries are rejected (no save)
- **Check:** kcal > 9999 or < 0, protein > 500 or < 0, or non-numeric → no store write.
- **Where:** `src/react/components/NutritionInline.tsx:90-103`
- **Expected:** Enter 99999 kcal → Save → value not committed (chip reverts to prior/auto).
- **Verify:** Playwright → enter out-of-range → Save → assert nutritionStore unchanged for today.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.068] Manual kcal log propagates to the TDEEStrip "today vs target"
- **Check:** A manual kcal log (kcal only) makes the HERO show the today-vs-target comparison (§03.013 cross-link), proving the two components share the nutritionStore SoT.
- **Where:** `NutritionInline.setDailyKcal` → `nutritionStore` → `TDEEStrip.tsx:100`.
- **Expected:** Log 2200 kcal in NutritionInline → scroll to HERO → comparison shows 2200 vs engine target.
- **Verify:** Playwright → log kcal in NutritionInline → assert TDEEStrip `tdee-current-vs-target` reflects the same number.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Note ordering: TDEEStrip reads `getDaily(today)?.kcal` via store subscription — verify it updates without a manual reload.

### [03.069] NutritionInline helper copy is internationalized + honest (no false CSV claim)
- **Check:** Section heading, chip labels, helpers, save CTA all via `bodyComp.nutritionInline.*`; footer no longer claims "CSV batch import" (U-08 removal).
- **Where:** `src/react/components/NutritionInline.tsx:115-224`
- **Expected:** All strings via t(); footer = `helperBottom` ("Auto target engine + manual log optional…"). Cross-ref §09.
- **Verify:** `grep -nE "CSV|import" src/react/components/NutritionInline.tsx` → no false-feature claim; confirm keys exist in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.K — Sub-screen: LogWeight

### [03.070] LogWeight validates kg range 30–250 + blocks empty
- **Check:** Save disabled unless `kg ∈ [30,250]` and date non-empty; out-of-range shows inline `weight-kg-error`.
- **Where:** `src/react/routes/screens/progres/LogWeight.tsx:36-52,101-110,155`
- **Expected:** Empty → disabled; 20 → error + disabled; 80 → enabled.
- **Verify:** Playwright → type 20 → assert error visible + Save disabled; type 80 → Save enabled.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.071] LogWeight blocks future dates (max = today)
- **Check:** Date input `max={todayIso()}` (U-15) — no future weigh-in.
- **Where:** `src/react/routes/screens/progres/LogWeight.tsx:130`
- **Expected:** Date picker cannot exceed today.
- **Verify:** Playwright → assert `weight-date-input` max attribute = today's ISO.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.072] Save appends/upserts to weightLog and returns to Progress
- **Check:** Valid Save calls `addWeightEntry({kg, date})` (upsert-by-date) then navigates to `progres`.
- **Where:** `src/react/routes/screens/progres/LogWeight.tsx:48-52` + store `progresStore.ts:132-142`.
- **Expected:** Two logs same date → one entry (latest wins); navigates back; new value shows in snapshot.
- **Verify:** Playwright → log 80 today → back on Progress, snapshot latest = 80 → log 81 today → still one entry, latest = 81.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §08 (upsert-by-date SoT) + §15 (never-delete — overwrite same-day is intended, not data loss).

### [03.073] LogWeight inline errors carry a11y wiring
- **Check:** kg input `aria-invalid` + `aria-describedby` link to `weight-kg-error` (role=alert); date likewise.
- **Where:** `src/react/routes/screens/progres/LogWeight.tsx:88-110,124-143`
- **Expected:** Out-of-range → aria-invalid true + described-by points to the live error. Cross-ref §10.
- **Verify:** Playwright/axe → assert aria wiring on error.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.L — Sub-screen: BodyData

### [03.074] Per-field physiological bounds enforced (no biceps 250cm)
- **Check:** Each field has its own min/max (waist 50–200, neck 25–60, chest 60–150, hips 60–200, biceps 20–60, thigh 30–90); out-of-range shows `bd-<field>-error`.
- **Where:** `src/react/routes/screens/progres/BodyData.tsx:46-53,77-85,136-169`
- **Expected:** Biceps 250 → error + Save blocked; biceps 35 → accepted.
- **Verify:** Playwright → enter biceps 250 → assert `bd-bicepsCm-error` + Save disabled; enter 35 → no error.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.075] Partial entry is valid (not all fields required)
- **Check:** Saving with only some fields filled works; only in-bounds numeric fields are persisted.
- **Where:** `src/react/routes/screens/progres/BodyData.tsx:87-111`
- **Expected:** Enter only waist + neck → Save enabled → entry persists those two; empties omitted.
- **Verify:** Playwright → fill waist + neck only → Save → assert bodyData entry has waistCm+neckCm, no others.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.076] Save with any out-of-range field is a no-op even if others are valid
- **Check:** `handleSave` aborts if `hasAnyError` (a single out-of-range field blocks the whole save).
- **Where:** `src/react/routes/screens/progres/BodyData.tsx:97-99,198`
- **Expected:** waist 100 (valid) + biceps 250 (invalid) → Save disabled / no write.
- **Verify:** Playwright → mixed valid+invalid → assert Save disabled + nothing persisted.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.077] BodyData entry feeds bf% (waist+neck → US-Navy on Progress)
- **Check:** A waist+neck entry saved here makes BodyFatStrip switch to the US-Navy tier on return.
- **Where:** BodyData save → `progresStore.bodyData` → `latestBodyMeasurements` → `BodyFatStrip.tsx:34,44-52`.
- **Expected:** Save waist+neck → Progress bf% source = US-Navy.
- **Verify:** Playwright → measure waist+neck → return → assert `bodyfat-source` = US-Navy label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** End-to-end reactivity proof linking BodyData → BodyFatStrip.

### [03.078] BodyData blocks future dates + carries field-error a11y
- **Check:** Date `max=today`; each field error has `aria-invalid` + `aria-describedby` (role=alert).
- **Where:** `src/react/routes/screens/progres/BodyData.tsx:149-150,160-168,187`
- **Expected:** No future date; errors wired for screen readers. Cross-ref §10.
- **Verify:** Playwright/axe → assert date max + aria wiring.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.M — Sub-screen: WeightLogList

### [03.079] List renders all entries reverse-chronological
- **Check:** Entries sorted by `ts` descending (newest first), each row `weight-log-row-<idx>` showing formatted date + kg(1dp).
- **Where:** `src/react/routes/screens/progres/WeightLogList.tsx:37-39,79-94`
- **Expected:** Seed 3 logs → 3 rows newest-first; kg shown `toFixed(1)`.
- **Verify:** Playwright → assert row order matches descending ts + kg formatting.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Note sort is by `ts` (save time), while canonical current weight is by `date` — a back-dated entry sorts by its save time here. Flag if list order is confusing for back-dated entries.

### [03.080] Date formats localize (RO no-diacritics months vs EN)
- **Check:** `formatDate` uses `MONTH_RO_SHORT` (noi, not nov) or `MONTH_EN_SHORT` per locale.
- **Where:** `src/react/routes/screens/progres/WeightLogList.tsx:18-33`
- **Expected:** "2026-05-21" → "21 mai" (RO) / "21 May" (EN). No diacritics in RO. Cross-ref §09.
- **Verify:** Playwright toggle locale → assert month label swaps + RO has no diacritics.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.081] Empty-state list (accent halo + two-line copy)
- **Check:** No entries → `weight-log-empty` with `emptyTitle` + `emptyBody`, not a flat sentence.
- **Where:** `src/react/routes/screens/progres/WeightLogList.tsx:54-77`
- **Expected:** T0 → empty state present; list `<ul>` absent.
- **Verify:** Playwright wiped → assert `weight-log-empty` present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.082] last-weight-card on Progress navigates to WeightLogList
- **Check:** Tapping `last-weight-card` routes to `weight-log-list`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:202-216`
- **Expected:** Card present only when a weigh-in exists; tap → list screen.
- **Verify:** Playwright seeded → tap `last-weight-card` → URL = weight-log-list.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.083] last-weigh-in card shows the latest kg + date
- **Check:** `last-weight-card` shows `lastWeight.kg kg` + `lastWeight.date`, where `lastWeight = weightLog[weightLog.length-1]`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:101,202-216`
- **Expected:** Matches the most recent (positional last) entry.
- **Verify:** Playwright seeded → assert card kg/date = last log entry.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Positional last again (not max-by-date) — same back-dated caveat as §03.018. Flag if the "last weigh-in" can show an older back-dated value.

---

## 03.N — Sub-screen: WeightTimeline

### [03.084] Range tabs (30/60/90/all) filter the log by ts cutoff
- **Check:** Selecting a range filters `weightLog` to entries within `days×MS_PER_DAY`; "all" shows everything.
- **Where:** `src/react/routes/screens/progres/WeightTimeline.tsx:26-31,75-80,121-138`
- **Expected:** Seed entries spanning >90 days → 30-tab shows only recent ones; all-tab shows all.
- **Verify:** Playwright → seed wide-span logs → assert filtered point count changes per tab.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.085] KPI card shows latest weight + range delta
- **Check:** KPI value = latest (desc) kg; delta = latest − earliest in range, signed.
- **Where:** `src/react/routes/screens/progres/WeightTimeline.tsx:87-92,149-172`
- **Expected:** Seed range with first 82 last 79 → value 79.0, delta −3.0 / range label.
- **Verify:** Playwright → assert `weight-timeline-kpi-value` + `weight-timeline-kpi-delta`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Delta uses earliest-in-range vs latest — confirm sign convention (loss colored brick) reads correctly.

### [03.086] SVG line chart plots filtered points, highlights the latest
- **Check:** Chart renders a polyline + circles from `buildChart`; last point has larger radius + white stroke.
- **Where:** `src/react/routes/screens/progres/WeightTimeline.tsx:42-68,194-227`
- **Expected:** ≥2 points → polyline + dots; last dot r=6 stroked; single point → just one dot (xRatio 0.5).
- **Verify:** Playwright → assert dot count = filtered count; last `weight-timeline-chart-dot-<n>` larger.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.087] Chart empty-state when range has no points
- **Check:** Filtered empty → `weight-timeline-chart-empty` (and KPI shows `weight-timeline-kpi-empty`).
- **Where:** `src/react/routes/screens/progres/WeightTimeline.tsx:149-152,186-192`
- **Expected:** 30-day tab with only older logs → chart empty message.
- **Verify:** Playwright → seed only old logs, select 30 → assert chart empty + KPI empty.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.088] Logs-recent CTA shows pluralized count + routes to WeightLogList
- **Check:** Footer CTA shows `entries_one/entries_other` count (total weightLog) + navigates to weight-log-list.
- **Where:** `src/react/routes/screens/progres/WeightTimeline.tsx:231-248`
- **Expected:** 1 entry → singular; N → plural; tap → list. Cross-ref §09 pluralization.
- **Verify:** Playwright → assert count label plural form + nav on tap.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.089] cta-weight-timeline on Progress routes here (only when a weigh-in exists)
- **Check:** `cta-weight-timeline` renders only when `lastWeight` exists and navigates to `weight-timeline`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:218-228`
- **Expected:** T0 → CTA absent; seeded → present + routes to timeline.
- **Verify:** Playwright → fresh: absent; seeded: tap → URL weight-timeline.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.O — Body measurements recap on Progress + CTAs

### [03.090] last-body-card shows the latest measurement fields present
- **Check:** When `lastBody` exists, `last-body-card` shows its date + only the measured fields (waist/chest/hips/biceps/thigh), each localized.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:238-250`
- **Expected:** Seed an entry with waist+chest only → card shows just those two with `progres.measurements.*` labels.
- **Verify:** Playwright seeded → assert `last-body-card` shows the correct subset + labels via t().
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `lastBody = bodyData[bodyData.length-1]` (positional) — note it shows the LAST-ENTERED entry's fields, which may differ from the per-field aggregate used by bf% (`latestBodyMeasurements`). Flag if confusing.

### [03.091] cta-body-data routes to BodyData (always present)
- **Check:** `cta-body-data` button navigates to `body-data`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:229-237`
- **Expected:** Always rendered; tap → body-data screen.
- **Verify:** Playwright → tap → URL body-data.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [03.092] cta-log-weight routes to LogWeight (always present)
- **Check:** Primary `cta-log-weight` navigates to `log-weight`.
- **Where:** `src/react/routes/screens/progres/Progres.tsx:193-201`
- **Expected:** Always rendered; tap → log-weight.
- **Verify:** Playwright → tap → URL log-weight (existing test Progres.test.tsx covers presence).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 03.P — Glass / Pulse parity (cross-ref §11) + persistence integrity

### [03.093] All Progress cards use the shared Pulse glass language
- **Check:** TDEEStrip / BodyFatStrip / FatigueStrip / BMRStrip / snapshot / projection / recovery / goal / target cards use `pulse-card` (+ `pulse-card-glow`/`pulse-card-tight`) — not bespoke ad-hoc surfaces.
- **Where:** TDEEStrip.tsx:131, BodyFatStrip.tsx:71, FatigueStrip.tsx:70, BMRStrip.tsx:73, HeatMapWeekly.tsx:81, ProjectionStrip.tsx:55/78/97, MuscleRecoveryGrid.tsx:126, ObiectivGoalCard.tsx:86, ObiectivCard.tsx:85, NutritionInline.tsx:118, trend card Progres.tsx:160.
- **Expected:** Consistent glass token surface across the tab; aqua wash on HERO + trend. Cross-ref §11 (rendered diff vs interfata-noua/).
- **Verify:** `grep -nE "pulse-card" src/react/components/Progres/*.tsx src/react/components/NutritionInline.tsx` → every card surface uses the token; screenshot-diff vs mockup for color/spacing deltas (PARTIAL on any delta).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Sub-screens (LogWeight/BodyData) still use raw `bg-paper2 border-lineStrong` tokens, not pulse-card — note as a parity gap if the mockup expects glass there too.

### [03.094] LogWeight / BodyData / sub-screen surfaces match the mockup palette
- **Check:** Inputs + buttons use palette tokens (brick primary, paper2 surfaces, lineStrong borders) consistently; no hardcoded hex.
- **Where:** LogWeight.tsx:99,132,157; BodyData.tsx:158,189,200.
- **Expected:** Token-driven; theme-aware. Cross-ref §11 + §09 (no hardcoded color = parity, but watch the hardcoded `(cm)` suffix at BodyData.tsx:144 — partial-i18n, cross-ref §09).
- **Verify:** Screenshot-diff sub-screens vs mockup; grep for hex literals.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** BodyData field labels append a literal `(cm)` outside `t()` (`BodyData.tsx:144`) — unit suffix is hardcoded. Likely PARTIAL on strict i18n; cross-ref §09.

### [03.095] progresStore persists weightLog + bodyData + targetObiectiv only (no actions)
- **Check:** `partialize` persists exactly the three data fields under `wv2-progres-store`, excluding action functions.
- **Where:** `src/react/stores/progresStore.ts:178-190`
- **Expected:** Reload → weightLog/bodyData/targetObiectiv survive; actions are not serialized. Cross-ref §08.
- **Verify:** Playwright → seed all three → reload → `JSON.parse(localStorage['wv2-progres-store']).state` has only those keys.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §08 persistence + §15 never-delete (weightLog/bodyData must survive reload).

### [03.096] No Progress number is ever fabricated for an empty state (honesty sweep)
- **Check:** Across every Progress element, an empty/insufficient input yields an explicit empty hint or "—", never a fake number.
- **Where:** TDEEStrip `—` (182-187), BodyFat empty (101-104), Fatigue empty (99-102), BMR empty (96-99), snapshot empty/`—` (93-97,140-143), projection empty (51-69), recovery null (122).
- **Expected:** Fresh T0 account → every strip shows its empty state; zero fabricated metric. Cross-ref §15 (no-fabrication invariant).
- **Verify:** Playwright on a fully wiped account → screenshot the whole tab → assert each component shows its empty/`—` state and no numeric metric appears anywhere except the engine-baseline kcal (which is correctly labeled baseline).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the section's single most important honesty gate — a fabricated number on a fresh account is an automatic section FAIL regardless of the rest.

---

## SECTION 03 SCORECARD (emit after running)

```
SECTION 03 — Progress + body-comp + nutrition
STEPS: 03.001 – 03.096  (96 atomic checks)
PASS  PART  FAIL  BLOCK   %      GATE   STATUS
--    --    --    --      --%    95%    ----   (CRITICAL — zero open FAIL allowed at gate)
```

> **Pre-filled findings to confirm (do not assume — re-verify):**
> - **03.016** — healthy-floor support message is HARDCODED Romanian (`TDEEStrip.tsx:223-225`), not via `t()`. Lean **FAIL** on the i18n sub-check (gating logic is correct). Cross-ref §09.
> - **03.018** — bf% reactivity is **PARTIAL**: profile-weight edit reacts (SettingsProfile upserts weightLog by-date), but `BodyFatStrip.tsx:39` + `BMRStrip.tsx:63` read positional `weightLog[last]` instead of canonical `getCurrentWeightKg()` max-by-date → diverges for back-dated entries. Residual split-source.
> - **03.094 / 03.095-adjacent** — `BodyData.tsx:144` appends a hardcoded `(cm)` unit suffix outside `t()`. Likely **PARTIAL** on strict i18n. Cross-ref §09.
> - **03.048** — RECUPERARE zone heading renders even when the grid is null (fresh user sees a lone heading over empty space). Possible **PARTIAL** parity.
>
> **CRITICAL-gate reminder:** any confirmed FAIL here (e.g. 03.016 i18n leak, or a non-reactive HERO/bf%) blocks Beta per 00-MASTER §SCORING — fix before proceeding past this section.
