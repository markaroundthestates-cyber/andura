# SECTION 02 — Coach (Antrenor) home tab

> **Weight 7% · Gate 95% · not CRITICAL.** This is the app's landing screen — the
> first surface every user sees on every cold start. The bar here is: every
> element renders, every element reacts to real engine state (no fabricated
> numbers, no stale baseline), it matches the hand-built mockup, and it is
> i18n-clean (EN + RO, no diacritics). The "honest empty state" discipline is
> load-bearing — Daniel CEO LOCKED 2026-05-29 that the ReadinessOrb is ALWAYS
> present, but it MUST show "—" (never a made-up score) when there is no data.
>
> **Run discipline (from 00-MASTER):** one verdict per step, evidence mandatory,
> no silent BLOCKED. Behavior/parity steps run against BOTH a SEEDED populated
> account (history present → engine signals fire) AND a fresh zero-session
> account (the empty/honesty path) — many of these checks only differ between
> those two. Parity steps diff the LIVE rendered screen vs the hand-built mockup
> `04-architecture/mockups/interfata-noua/screens-antrenor.jsx` (rendered, not
> the code). Color/spacing/typography deltas = `PARTIAL` minimum.
>
> **Surface map (every element this section enumerates, top → bottom of the
> vertical stack in `Antrenor.tsx`):**
> - Header block (mono date eyebrow + "Coach" display title + PulseMark + serif subtitle)
> - `antrenor-error-banner` (getCoachToday promise reject, role=alert)
> - `ResumeSessionCard` (conditional — pausedSnapshot)
> - `ReactivateCard` (conditional — lastSession > 14 zile + not dismissed)
> - `PatternsBanner` (V1: STAGNATION + LOW_ADHERENCE ≥3 sessions)
> - `AlertsBanner` (proactive 3-tier urgent/warn/info)
> - **ReadinessOrb HERO** (`readiness-hero` — always present; with-data vs empty)
>   + `ReadinessVerdict` (role=status) + "primed for a PR" Pill
> - `StatsGrid` compact (streak + fatigue only — readiness moved to orb)
> - `PRNotificationBanner` (conditional — prHit)
> - `CoachTodayCard` (workout day) OR `CoachRestCard` (rest day) — engine-routed
> - `Calendar7Day` (7-day schedule strip + edit pencil + save)
> - `PRWallRecent` (top-3 PRs)
> - (removed 2026-05-28: bottom "Incepe antrenament" CTA + ObiectivSelector)
>
> **Engine wiring spine:** `getCoachToday()` in
> `src/react/lib/coachDirectorAggregate.ts` is the single async aggregate that
> feeds the whole tab (`readiness, fatigue, plannedWorkout, isRestDay,
> patternsBanner, prWallRecent, alerts, restReason, source`). Every "reacts to
> engine state" step traces back to one of its fields.

---

## 02.A — HEADER BLOCK

### [02.001] Antrenor section renders + carries its testid + aria-label
- **Check:** The Coach home root `<section>` mounts with `data-testid="antrenor-home"`, `aria-label={t('antrenor.ariaLabel')}`, and the persona class wrapper `persona-{persona}`.
- **Where:** `Antrenor.tsx:145-150`.
- **Expected:** Exactly one `[data-testid="antrenor-home"]`; aria-label resolves to "Antrenor home" (EN) / "Antrenor home" (RO — same key text); class contains `persona-<one of marius|gigel|maria>`.
- **Verify:** Playwright (seeded): navigate to `/` Coach tab → `expect(page.getByTestId('antrenor-home')).toHaveCount(1)`; read `aria-label` non-empty; assert `className` matches `/persona-\w+/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.002] Header date eyebrow renders locale-formatted, no diacritics
- **Check:** The mono date line (`antrenor-header-date`) renders `weekday, D month · HH:MM` from the i18n `weekdays.full.*` / `months.short.*` maps, NOT `Intl.DateTimeFormat` (which would emit RO diacritics like "Marți"/"Sâmbătă").
- **Where:** `Antrenor.tsx:65-73` (`formatHeaderDate`), rendered L154-160; testid L157.
- **Expected:** RO renders e.g. "Joi, 7 mai · 18:30" diacritic-free; the separator is `t('antrenor.header.dateSeparator')` = "·"; manual lookup (comment L62-63 confirms ICU avoided on purpose).
- **Verify:** Playwright RO locale: read `[data-testid="antrenor-header-date"]` text → assert it matches `/^[A-Za-zĂÂÎȘȚăâîșț ]+, \d+ \w+ · \d{2}:\d{2}$/` AND contains zero of `ăâîșțĂÂÎȘȚ` (regex `/[ăâîșțĂÂÎȘȚ]/` → no match). `grep -n "Intl.DateTimeFormat" Antrenor.tsx` → empty.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.003] Header title is the i18n "Coach" display string
- **Check:** The `<h1>` shows `t('tabs.antrenor.title')` in the display font, not a hardcoded "Coach"/"Antrenor" literal.
- **Where:** `Antrenor.tsx:162-164`.
- **Expected:** EN → "Coach"; RO → "Antrenor" (per `tabs.antrenor.title`); `font-display text-3xl font-bold`.
- **Verify:** `grep -n ">Coach<\|>Antrenor<" Antrenor.tsx` → zero hardcoded; Playwright reads h1 text == resolved key value per locale.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.004] PulseMark animates in the header, reduced-motion safe
- **Check:** The `PulseMark` (size 34) renders to the right of the title and its motion respects the global reduced-motion / `--motion` scalar.
- **Where:** `Antrenor.tsx:165` (`<PulseMark size={34} />`); mockup `floaty` wrapper screens-antrenor.jsx:15.
- **Expected:** PulseMark visible top-right of h1; with `prefers-reduced-motion: reduce` set, no looping transform animation runs (decoration, aria-hidden internals).
- **Verify:** Playwright: PulseMark element present in header flex row; emulate reduced-motion → `browser_evaluate` computed `animation-name` on its animated layer is `none`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.005] Header serif subtitle is i18n
- **Check:** The italic serif subtitle renders `t('antrenor.subtitle')`.
- **Where:** `Antrenor.tsx:167-169`; key `antrenor.subtitle` ro.json:171.
- **Expected:** RO → "Cine te ghideaza in sala." (no diacritics); EN → its EN counterpart; `font-serif italic`.
- **Verify:** `grep -nE "ghideaza|Your guide" Antrenor.tsx` → zero literals in JSX; Playwright reads text == key value.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.006] Header card-rise mount animation
- **Check:** Header block has `animate-card-rise` so it settles on mount; collapses under reduced-motion.
- **Where:** `Antrenor.tsx:154`.
- **Expected:** Animation present; reduced-motion → snap (no transform delay).
- **Verify:** Playwright: assert class `animate-card-rise` on header div; reduced-motion → computed animation none/snapped.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.B — getCoachToday AGGREGATE WIRING + ERROR BANNER

### [02.010] getCoachToday is consumed once on mount, cancellable
- **Check:** `Antrenor` calls `getCoachToday()` in a `useEffect` with a `cancelled` guard so a fast unmount does not set state on a dead component.
- **Where:** `Antrenor.tsx:110-122`.
- **Expected:** Effect deps `[]` (mount-once); resolves → `setCoach(c)`; cleanup flips `cancelled = true`.
- **Verify:** `grep -n "cancelled" Antrenor.tsx` → guard present in `.then` and cleanup; code-read confirms `useState<CoachTodayOutput | null>(null)` initial.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.011] Pre-resolve render is safe (coach === null defaults)
- **Check:** Before the aggregate resolves, every consumer reads a null-safe default (`coach?.field ?? fallback`) — no crash, no flash of undefined.
- **Where:** `Antrenor.tsx:124-125, 211-212, 268, 273, 284` (`?? null` / `?? []`).
- **Expected:** With a deliberately delayed `getCoachToday`, the tab still renders header + orb (empty mode) + a card; no thrown error in console.
- **Verify:** Playwright: throttle/stub the promise to resolve after 1s → during the gap, `antrenor-home` present, `readiness-orb[data-empty="true"]` shown, zero console errors.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.012] getCoachToday rejection surfaces the role=alert error banner
- **Check:** If the `getCoachToday()` promise REJECTS past the wrapper safe-catch, `antrenor-error-banner` (role=alert, aria-live=assertive) appears with `t('antrenor.errorBanner')`, and the baseline content (orb empty + a card) STILL renders so Gigel can proceed.
- **Where:** `Antrenor.tsx:111,118-120,178-193`.
- **Expected:** Banner shows "Nu am putut incarca recomandarile coach-ului. Poti incepe sesiunea oricum." (RO); fallback CoachRestCard/CoachTodayCard still present below.
- **Verify:** Playwright: stub `getCoachToday` to reject → `[data-testid="antrenor-error-banner"]` visible, `role="alert"`; a start affordance still reachable. `grep -n "errorBanner" Antrenor.tsx i18n/*.json` → key present both locales.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.013] source flag derivation (engine vs baseline) is correct
- **Check:** `getCoachToday` returns `source:'engine'` when ANY composer yields a signal, else `'baseline'` (T0 fresh).
- **Where:** `coachDirectorAggregate.ts:76-94`.
- **Expected:** Seeded account → `source==='engine'`; fresh zero-data account → `source==='baseline'`.
- **Verify:** Vitest unit on `getCoachToday`: mock all wrappers null/empty → `source==='baseline'`; mock one (e.g. readiness non-null) → `'engine'`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.014] aggregate awaits the async planned workout (isRestDay)
- **Check:** `isRestDay` is derived from the AWAITED `getTodayWorkout()` (rest day ⇔ planned workout null), not a sync guess.
- **Where:** `coachDirectorAggregate.ts:65-66`.
- **Expected:** `plannedWorkout === null → isRestDay === true`; the await is present (no unhandled promise).
- **Verify:** Vitest: mock `getTodayWorkout` → null ⇒ isRestDay true + restReason fetched; non-null ⇒ isRestDay false + restReason null (L75).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.C — READINESS ORB HERO (always-present, honest empty state)

### [02.020] Readiness hero container always renders (Daniel LOCK)
- **Check:** The `readiness-hero` card is ALWAYS present on Coach home regardless of data — it is the living hero (Daniel CEO LOCKED 2026-05-29).
- **Where:** `Antrenor.tsx:223-256` (no conditional wrapper around the hero div); comment L214-222.
- **Expected:** `[data-testid="readiness-hero"]` count == 1 on BOTH a seeded account and a fresh zero-session account.
- **Verify:** Playwright twice (seeded + fresh): `expect(getByTestId('readiness-hero')).toHaveCount(1)` in both.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.021] Orb WITH data shows the real engine score
- **Check:** On a seeded account where readiness is known, the orb center shows the real `readiness.score` (count-up to that integer), and the ring fill matches the score percentage.
- **Where:** `Antrenor.tsx:228-232` (`score={readiness ? readiness.score : null}`); `ReadinessOrb.tsx:55-56,82-90`.
- **Expected:** `readiness-orb-score` text == the engine score (rounded int, 0-100); `data-empty="false"`; ring `pct` == score clamped 0-100.
- **Verify:** Playwright seeded: read engine score via `browser_evaluate(getCoachToday)` → assert `[data-testid="readiness-orb-score"]` text equals it (after count-up settles); `[data-testid="readiness-orb"][data-empty="false"]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.022] Orb NO data shows honest em-dash, NEVER a fabricated number
- **Check:** On a fresh zero-session account (engine refuses a verdict), the orb shows "—" (em-dash), ring at 0, `data-empty="true"`, dimmed (opacity 0.7), and the readiness microcopy line replaces the verdict — with NO fabricated score and NO PR pill.
- **Where:** `Antrenor.tsx:229,247-254`; `ReadinessOrb.tsx:51,56,69,89` (`isEmpty` → '—', pct 0, opacity 0.7).
- **Expected:** `readiness-orb-score` text == "—"; `[data-testid="readiness-orb"][data-empty="true"][data-can-pr="false"]`; `readiness-empty-microcopy` visible == `t('antrenor.readinessEmpty')`; NO `ReadinessVerdict`, NO primed-for-PR Pill.
- **Verify:** Playwright fresh account: assert orb score == "—"; `data-empty="true"`; `[data-testid="readiness-empty-microcopy"]` visible; `[role="status"]` verdict absent; the "Pregatit de PR" pill absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.023] Orb breathes — orbBreath/orbSpin/orbPulseRing animations are live
- **Check:** The decorative orb layers (`orb-core`, `orb-aura`, `orb-aura2`, `orb-pulse`, `orb-pulse.p2`) each carry the looping keyframe animations (orbBreath / orbSpin / orbSpinRev / orbPulseRing) with the `var(--motion)` divisor.
- **Where:** `ReadinessOrb.tsx:108-136` (scoped `<style>`).
- **Expected:** computed `animation-name` on `.orb-core` == `orbBreath`; `.orb-aura` == `orbSpin`; `.orb-aura2` == `orbSpinRev`; `.orb-pulse` == `orbPulseRing`. The orb breathes in BOTH with-data and empty modes (living hero).
- **Verify:** Playwright (motion ON): `browser_evaluate(getComputedStyle('.orb-core').animationName)` → "orbBreath"; repeat for the others; confirm non-`none` on the empty-state orb too.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.024] Orb collapses under prefers-reduced-motion AND data-calm
- **Check:** With `prefers-reduced-motion: reduce` OR `[data-calm="1"]` on an ancestor, every orb layer animation is `none !important`, and the count-up snaps to the final value (no animated tween).
- **Where:** `ReadinessOrb.tsx:137-147` (calm + media-query hard stops); `useCountUp` reduced-motion snap.
- **Expected:** reduced-motion → all 4 layers `animation: none`; score renders final integer immediately.
- **Verify:** Playwright: emulate reduced-motion → `getComputedStyle('.orb-core').animationName === 'none'` (and the other layers); score text equals final int with no intermediate frames. Repeat by setting `data-calm="1"` on `<html>`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.025] Orb uses the REAL useCountUp hook (not mockup window shim)
- **Check:** The center number animates via the project `useCountUp` hook (reduced-motion safe, SSR/test snap) — not the mockup's `window.useCountUp`.
- **Where:** `ReadinessOrb.tsx:28,55`.
- **Expected:** Import is `../../hooks/useCountUp`; in Vitest/jsdom the value renders synchronously (rAF not flushed) so unit assertions on the score are stable.
- **Verify:** `grep -n "useCountUp" ReadinessOrb.tsx` → from hooks dir; Vitest render of `<ReadinessOrb score={73}/>` → `readiness-orb-score` text "73" synchronously.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.026] Orb center label is i18n via prop (no English leak)
- **Check:** The orb center label is passed as `label={t('stats.readiness')}` from `Antrenor.tsx` — the component never hardcodes an English "readiness".
- **Where:** `Antrenor.tsx:230`; `ReadinessOrb.tsx:91-104` (label is a prop, rendered only when truthy).
- **Expected:** `[data-testid="readiness-orb-label"]` text == `t('stats.readiness')` per locale (RO no diacritics); `grep` finds no hardcoded "readiness" string in `ReadinessOrb.tsx` JSX.
- **Verify:** Playwright per locale: label text == resolved key; `grep -nE ">readiness<|'readiness'" ReadinessOrb.tsx` → only the prop default/comment, never JSX literal.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.027] Orb ring uses the Pulse gradient (volt→aqua), token-only
- **Check:** The ring is the real Pulse `Ring` with `gradId="pulse"`, size 150, stroke 11 — token colors, no raw hex.
- **Where:** `ReadinessOrb.tsx:29,82`.
- **Expected:** Ring renders the pulse gradient stops; no inline hex in the orb (colors via `var(--aqua)`/`var(--volt)`/color-mix).
- **Verify:** `grep -nE "#[0-9a-fA-F]{3,6}" ReadinessOrb.tsx` → zero raw hex; visual: ring stroke shows the volt→aqua ramp.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.028] Orb decoration layers are aria-hidden; score+label are real text
- **Check:** Every animated/decorative layer carries `aria-hidden="true"`; only the score and label are exposed to AT.
- **Where:** `ReadinessOrb.tsx:77-81` (5 aria-hidden spans).
- **Expected:** Screen-reader tree exposes the number + label, not the auras/pulses.
- **Verify:** Playwright accessibility snapshot of the hero → orb decoration not in a11y tree; score+label present. `grep -c 'aria-hidden="true"' ReadinessOrb.tsx` ≥ 5.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.D — READINESS VERDICT (role=status) + PR PILL

### [02.030] ReadinessVerdict renders only when readiness is non-null
- **Check:** `ReadinessVerdict` returns `null` when `readiness` is null; the hero then falls to the empty microcopy branch instead.
- **Where:** `ReadinessVerdict.tsx:15`; `Antrenor.tsx:235-254`.
- **Expected:** No-data path → no `[role="status"]` verdict line; with-data path → verdict present.
- **Verify:** Playwright fresh → verdict absent; seeded → verdict present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.031] ReadinessVerdict is role=status + aria-live=polite
- **Check:** The verdict container has `role="status"`, `aria-live="polite"`, and `aria-label={t('readinessVerdictWidget.ariaLabel')}` so AT announces the readiness politely.
- **Where:** `ReadinessVerdict.tsx:30-36`.
- **Expected:** role/aria-live/aria-label all present.
- **Verify:** Playwright seeded: `[role="status"]` inside hero with the resolved aria-label; assert `aria-live="polite"`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.032] Verdict label resolves via engine semantic key (EN+RO)
- **Check:** The verdict label resolves `coachEngine.readiness.labels.<key>` from the engine's semantic `key` (so EN says "Normal session"/"PR day" etc.), falling back to the engine RO `label` only when the key is missing.
- **Where:** `ReadinessVerdict.tsx:21-29`.
- **Expected:** EN locale → English label; RO → no-diacritics label; never the raw enum key shown to the user.
- **Verify:** Vitest: render with `readiness.key='PR_DAY'` (or actual enum) → text == EN/RO key value; render with `key` undefined + `label='X'` → text == 'X'.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.033] Verdict shows the score "(NN/100)" with canPR suffix only when canPR
- **Check:** The verdict prints `({score}/100[canPrSuffix])` — the canPR suffix (`coachEngine.readiness.canPrSuffix`) appears ONLY when `readiness.canPR` is true.
- **Where:** `ReadinessVerdict.tsx:44-47`.
- **Expected:** canPR true → suffix appended; canPR false → no suffix; score is the real engine integer.
- **Verify:** Vitest: render canPR=true → text contains the suffix; canPR=false → absent; score matches input.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.034] Verdict label color is the engine-provided color
- **Check:** The bold label is styled `color: readiness.color` (engine-driven semantic color, not a hardcoded value).
- **Where:** `ReadinessVerdict.tsx:38-40`.
- **Expected:** The displayed color equals the engine's `readiness.color` for that verdict tier.
- **Verify:** Playwright seeded: computed color of the label span == `getCoachToday().readiness.color` (normalize to rgb).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.035] "Primed for a PR" pill shows ONLY when canPR + never in empty state
- **Check:** The volt-solid Pill with a `Zap` icon + `t('antrenor.primedForPr')` renders only when `readiness && readiness.canPR`; it is impossible in the no-data branch (which has no readiness).
- **Where:** `Antrenor.tsx:240-245`.
- **Expected:** canPR true → pill "Pregatit de PR" (RO) / "Primed for a PR" (EN) visible; canPR false → absent; empty account → absent (no fabricated PR cue).
- **Verify:** Playwright: seed canPR=true readiness → pill visible; seed canPR=false → absent; fresh → absent. `grep -nE "Pregatit de PR|Primed" Antrenor.tsx` → only the `t()` key, no literal.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.036] PR pill Zap icon is aria-hidden (decorative)
- **Check:** The `Zap` glyph in the pill is `aria-hidden="true"` so the pill announces only its text.
- **Where:** `Antrenor.tsx:242`.
- **Expected:** icon aria-hidden; pill text is the readable label.
- **Verify:** Code-read + Playwright a11y snapshot: pill exposes text only.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.037] Hero Kicker label is i18n
- **Check:** The hero `Kicker` ("TODAY'S VERDICT" in mockup) renders `t('readinessVerdictWidget.ariaLabel')` (or its kicker key) — not a hardcoded English caps string.
- **Where:** `Antrenor.tsx:234`.
- **Expected:** Kicker text resolves via `t()`; RO no diacritics.
- **Verify:** `grep -nE "TODAY|VERDICT" Antrenor.tsx` → no literal; Playwright kicker text == resolved key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.E — STATS GRID (compact: streak + fatigue)

### [02.040] StatsGrid renders in COMPACT 2-cell mode on Coach home
- **Check:** On the Antrenor tab `StatsGrid` is passed `compact` → it renders a 2-col grid (streak + fatigue) and DROPS the readiness tile (which now lives in the orb hero, no duplication).
- **Where:** `Antrenor.tsx:261`; `StatsGrid.tsx:55,76,102-112`.
- **Expected:** `grid-cols-2`; tiles `stats-streak` + `stats-fatigue` present; `stats-readiness` ABSENT on this screen.
- **Verify:** Playwright Coach tab: `[data-testid="stats-readiness"]` count == 0; streak + fatigue tiles present; grid has 2 columns (computed `grid-template-columns` has 2 tracks).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.041] Streak tile shows the real workoutStore streak + correct plural unit
- **Check:** `stats-streak` shows `workoutStore.streak` (count-up) with unit `stats.streakUnit_one` at 1 else `stats.streakUnit_other`.
- **Where:** `Antrenor.tsx:84,261`; `StatsGrid.tsx:59-65,80-92`.
- **Expected:** streak==1 → "zi"/"day"; streak!=1 → "zile"/"days"; number == store streak.
- **Verify:** Playwright: seed streak=1 → `stats-streak-label`=="zi"(RO); seed streak=5 → number "5" + label "zile". `browser_evaluate` workoutStore.streak matches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.042] Streak flame animates only when streak ≥ 1
- **Check:** The flame icon flickers (`animate-flame`) when streak ≥ 1, and is static at streak 0 (empty state reads calm, not nagging).
- **Where:** `StatsGrid.tsx:91`.
- **Expected:** streak≥1 → icon class includes `animate-flame`; streak==0 → no anim class.
- **Verify:** Playwright: streak=0 → no `animate-flame`; streak=3 → present. Reduced-motion collapses it (global cap).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.043] Fatigue tile shows engine fatigue score + localized label, '-' when null
- **Check:** `stats-fatigue` shows `fatigue.score` (count-up) + `localizedFatigueLabel(fatigue)`; when `fatigue` is null shows '-' and the `stats.naFallback` sublabel.
- **Where:** `Antrenor.tsx:125,261`; `StatsGrid.tsx:20-31,66,93-101`.
- **Expected:** seeded → real score + label resolved via `coachEngine.fatigue.<key>.label`; fresh → value '-'.
- **Verify:** Playwright seeded: fatigue number == `getCoachToday().fatigue.score`; fresh: `stats-fatigue` text '-'. Vitest: `localizedFatigueLabel(null)` == `t('stats.naFallback')`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.044] Fatigue label resolves INSUFFICIENT_DATA key correctly
- **Check:** When the engine emits `key==='INSUFFICIENT_DATA'`, the label resolves `coachEngine.fatigue.insufficient.label` (special-cased path), not the generic `fatigue.<key>` lookup.
- **Where:** `StatsGrid.tsx:22-28`.
- **Expected:** INSUFFICIENT_DATA → the "insufficient" copy; any other key → `coachEngine.fatigue.<key>.label`; unknown key → engine RO `label` fallback.
- **Verify:** Vitest: `localizedFatigueLabel({key:'INSUFFICIENT_DATA',...})` → insufficient copy; `{key:'FRESH',...}` → its key value; `{key:'ZZZ',label:'X'}` → 'X'.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.045] StatTiles use token accents + are glass cards (no raw hex)
- **Check:** Each tile is a `pulse-card pulse-card-tight` glass surface with an `aria-hidden` accent icon + ambient-drift wash via `color-mix(var(--token))` — no raw hex.
- **Where:** `StatsGrid.tsx:144-166`.
- **Expected:** `pulse-card` classes present; accent uses `var(--brick)`/`var(--olive)` via color-mix; wash `animate-ambient-drift`.
- **Verify:** `grep -nE "#[0-9a-fA-F]{3,6}" StatsGrid.tsx` → zero raw hex; computed background shows the glass surface (cross-ref §11 glass parity).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.046] StatsGrid region has an aria-label
- **Check:** The grid wrapper has `role="region"` + `aria-label={t('stats.ariaLabel')}`.
- **Where:** `StatsGrid.tsx:74-79`.
- **Expected:** region + resolved aria-label.
- **Verify:** Playwright a11y: region present with non-empty aria-label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.F — COACH TODAY CARD (workout day)

### [02.050] CoachTodayCard renders on a workout day (engine-routed)
- **Check:** When `coach.isRestDay === false` (or, pre-aggregate, `schedContext==='workout'`), `CoachTodayCard` renders instead of `CoachRestCard`.
- **Where:** `Antrenor.tsx:135,267-275`.
- **Expected:** workout day → CoachTodayCard region (`coachToday.ariaLabel`) present, CoachRestCard absent.
- **Verify:** Playwright seeded workout day: `[aria-label="Coach-ul recomanda azi"]` region present; rest-card absent. Vitest: `showWorkoutCard` true when `coach.isRestDay===false`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.051] Workout title prefers the real plan title, falls back honestly
- **Check:** The title shows `workout.workoutTitle` unless it is the engine RO sentinel "Antrenament azi" / `coachToday.engineFallbackTitle` — in which case the locale-aware `coachToday.fallbackTitle` fires (prevents RO sentinel leaking under EN locale).
- **Where:** `CoachTodayCard.tsx:78-84`.
- **Expected:** real title shown when present; sentinel → "Antrenamentul de azi" (RO) / EN fallback; no raw "Antrenament azi" under EN.
- **Verify:** Vitest: workout.workoutTitle='Push A' → "Push A"; ='Antrenament azi' under EN → EN fallback, not the RO sentinel. Playwright EN smoke confirms (the 2026-05-28 leak guard).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.052] Coach quote is engine-driven (recovered group), honest fallback
- **Check:** The italic quote (`coach-today-quote`) is engine-driven via `getCoachTodayQuote()` → `coachToday.recoveredQuote` with the REAL recovered group + days-since label; when the engine returns null (T0/no qualifying group) it falls to a NON-CLAIM generic line via `coachPick('preview', undefined, 0)` — NEVER a hardcoded muscle-group claim.
- **Where:** `CoachTodayCard.tsx:109-130,173-179`.
- **Expected:** seeded with a recovered group → quote names that real group + a real day label; T0 → generic non-claim line; never the old hardcoded "Pectoralii recupereaza din marti".
- **Verify:** Playwright seeded → quote text matches the engine's recoveredLabel; T0 → generic line. `grep -nE "Pectoralii recupereaza din marti|spatele e gata" CoachTodayCard.tsx` → zero (hardcoded claim removed).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.053] Quote recomputes on session-finish / day rollover (not mount-locked)
- **Check:** The quote `useMemo` deps are `[sessionsHistory, todayDate]` so it recomputes when the user finishes a workout mid-day (history append) or the day rolls over — not locked at mount.
- **Where:** `CoachTodayCard.tsx:107-130` (MED-CODE-20 comment).
- **Expected:** appending a session to `sessionsHistory` changes the recovery state → quote updates without remount.
- **Verify:** RTL: render → mutate workoutStore.sessionsHistory (trigger selector) → assert quote text changes; confirm deps array literally `[sessionsHistory, todayDate]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.054] Lagging-weakness signal line renders only when engine emits one
- **Check:** The dashed `coach-today-lagging` ember line renders only when `getLaggingSignal()` returns non-null (balanced training / T0 → absent).
- **Where:** `CoachTodayCard.tsx:136-142,180-191`.
- **Expected:** lagging signal present → ember italic line; null → no line; optional-chained call tolerates partial mocks.
- **Verify:** Vitest: mock `getLaggingSignal` → "X" → `coach-today-lagging` present with "X"; mock null → absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.055] Meta row: duration is honest (~min), not fabricated
- **Check:** The Clock meta shows `coachToday.durationLabel` with `workout.estimatedDuration` (default 48 only when no plan).
- **Where:** `CoachTodayCard.tsx:85,193-196`.
- **Expected:** seeded → real estimatedDuration; "~ {min} min"; default 48 only on null plan.
- **Verify:** Vitest: estimatedDuration=52 → "~ 52 min"; undefined → "~ 48 min".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.056] Meta row: exercise count uses correct singular/plural
- **Check:** The Layers meta uses `coachToday.exercisesCount_one` at 1 else `..._other`, with `workout.exerciseCount` (default 5).
- **Where:** `CoachTodayCard.tsx:86,197-200`.
- **Expected:** count==1 → "{n} exercitiu"; else "{n} exercitii"; real count when plan present.
- **Verify:** Vitest: exerciseCount=1 → singular; =6 → plural; undefined → 5 plural.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.057] Meta row: intensity is the HONEST label, NOT a fabricated "+15%"
- **Check:** The Dumbbell meta (`coach-today-intensity`) shows `coachToday.intensity.<plus|normal|minus>` from the engine's truthful `intensityMod` — NOT the mockup's hardcoded "+15%".
- **Where:** `CoachTodayCard.tsx:88-92,201-204`; mockup screens-antrenor.jsx:50 had "+15%".
- **Expected:** intensityMod 'plus' → "Intensitate mai mare"; 'normal' → "Incarcare standard"; 'minus' → "Incarcare mai usoara"; default 'normal' when no plan. NO literal "+15%" / "%" rendered.
- **Verify:** Playwright: `[data-testid="coach-today-intensity"]` text is one of the 3 labels, never "+15%". `grep -nE "\\+15%|15%" CoachTodayCard.tsx` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.058] Start CTA = volt→aqua gradient, fires haptic + onStart
- **Check:** The Start button has the signature Pulse gradient (`pulse-grad-bg pulse-shine`) + Ripple, and on click fires `haptic(12)` then `onStart()` (→ Antrenor `handleStart` → energy-check).
- **Where:** `CoachTodayCard.tsx:209-221`; `Antrenor.tsx:137-139,268`.
- **Expected:** button shows the gradient fill; click navigates to energy-check (cross-ref §06.001); haptic invoked.
- **Verify:** Playwright: tap Start → URL == energy-check route + `[data-testid="energy-check"]`. Computed background-image of the button shows the volt→aqua gradient (not flat). `grep -n "pulse-grad-bg" CoachTodayCard.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.059] Start CTA label + ArrowRight icon i18n + aria-hidden
- **Check:** Button text == `t('coachToday.startCta')` ("Incepe sesiunea"); `ArrowRight` icon aria-hidden.
- **Where:** `CoachTodayCard.tsx:219-220`.
- **Expected:** i18n label, no hardcoded "Start session"; icon decorative.
- **Verify:** `grep -nE "Incepe sesiunea|Start session" CoachTodayCard.tsx` → only the `t()` key; Playwright button text == resolved key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.060] Override link "Vrei altceva azi?" navigates to schedule-override
- **Check:** The `coach-today-override` link fires `handleOverride()` → `navigate(gotoPath('schedule-override'))`.
- **Where:** `CoachTodayCard.tsx:144-146,222-231`.
- **Expected:** tap → schedule-override route; label `coachToday.overrideCta`.
- **Verify:** Playwright: tap `[data-testid="coach-today-override"]` → schedule-override route reached.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.061] Card is glass + volt glow wash, decorative corner aria-hidden
- **Check:** Card is `pulse-card pulse-card-glow` with `--wash:var(--volt)` and a volt radial glow corner (`coach-today-gradient`, aria-hidden, pointer-events-none), overflow-hidden.
- **Where:** `CoachTodayCard.tsx:148-166`.
- **Expected:** glass surface + glow; corner decoration aria-hidden; token-only (no raw hex). Cross-ref §11 glass parity.
- **Verify:** `grep -nE "#[0-9a-fA-F]{3,6}" CoachTodayCard.tsx` → zero raw hex (colors via var/color-mix); `[data-testid="coach-today-gradient"][aria-hidden="true"]` present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.062] Card kicker + region aria-label i18n
- **Check:** Kicker == `t('coachToday.kicker')`; region `aria-label={t('coachToday.ariaLabel')}`.
- **Where:** `CoachTodayCard.tsx:151,168`.
- **Expected:** both via `t()`; no hardcoded "COACH RECOMMENDS TODAY".
- **Verify:** `grep -nE "COACH RECOMMENDS|recomanda azi" CoachTodayCard.tsx` → only via key; Playwright kicker text == resolved.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.G — COACH REST CARD (rest day)

### [02.070] CoachRestCard renders on a rest day (engine-routed)
- **Check:** When `coach.isRestDay === true` (or fallback `schedContext!=='workout'`), `CoachRestCard` renders instead of CoachTodayCard.
- **Where:** `Antrenor.tsx:267,269-275`.
- **Expected:** rest day → rest-card region (`coachRest.ariaLabel`) present, today-card absent.
- **Verify:** Playwright seeded rest day: rest-card present, `coach-today-quote` absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.071] Rest coach line is engine-driven, honest non-claim fallback
- **Check:** `composeCoachLine(restReason)` builds from real `fatiguedGroups` + `readinessScore`; when restReason is null (T0 fresh) it returns the GENERIC non-claim `coachRest.genericLine` — NEVER the old hardcoded "Pectoralii si picioarele inca recupereaza · readiness 32/100" fake number.
- **Where:** `CoachRestCard.tsx:41-55,63,80-82`; `coachDirectorAggregate.ts:75`.
- **Expected:** with groups → "{groups} inca recupereaza[· readiness N/100]"; empty groups → "Muschii recupereaza"; null → generic line; no fabricated readiness number at T0.
- **Verify:** Vitest: `composeCoachLine(null)` == `t('coachRest.genericLine')`; with `{fatiguedGroups:['piept'],readinessScore:40}` → contains "piept" + "readiness 40/100"; `{fatiguedGroups:[],readinessScore:null}` → "Muschii recupereaza." `grep -nE "readiness 32/100|Pectoralii si picioarele" CoachRestCard.tsx` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.072] Rest groups join uses i18n " si " joiner (no diacritics)
- **Check:** Multiple fatigued groups are joined with `t('coachRest.andJoiner')` (" si ") — not a hardcoded "&" or "și".
- **Where:** `CoachRestCard.tsx:49`.
- **Expected:** ["piept","spate"] → "piept si spate"; no "&", no diacritic "și".
- **Verify:** Vitest: two groups → joined by " si "; `grep -nE " & |și" CoachRestCard.tsx` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.073] Rest duration label dynamic, default 15
- **Check:** `coach-rest-duration` shows `coachRest.durationLabel` with `durationMinutes` (default 15 mockup-verbatim when caller omits).
- **Where:** `CoachRestCard.tsx:30-32,61,84-86`.
- **Expected:** default → "~ 15 min mobilitate"; passed 20 → "~ 20 min mobilitate".
- **Verify:** Vitest: default props → "15"; durationMinutes=20 → "20".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.074] Rest "Sesiune usoara" button fires onLightSession → energy-check
- **Check:** The bordered light-session button text == `t('coachRest.lightSessionCta')` ("Sesiune usoara mobilitate") and onClick → `onLightSession` (Antrenor `handleStart` → energy-check).
- **Where:** `CoachRestCard.tsx:89-95`; `Antrenor.tsx:271`.
- **Expected:** label i18n; tap navigates to energy-check.
- **Verify:** Playwright rest day: tap light-session button → energy-check route. `grep -nE "Sesiune usoara|Light session" CoachRestCard.tsx` → only via key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.075] Rest "Vreau totusi antrenament" override fires onOverride → energy-check
- **Check:** The underline override link text == `t('coachRest.overrideCta')` ("Vreau totusi antrenament") and onClick → `onOverride` (also energy-check).
- **Where:** `CoachRestCard.tsx:96-104`; `Antrenor.tsx:272`.
- **Expected:** label i18n; tap navigates to energy-check.
- **Verify:** Playwright rest day: tap override link → energy-check route. `grep -nE "Vreau totusi" CoachRestCard.tsx` → only via key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.076] Rest card kicker/title/optional are i18n + glass aqua wash
- **Check:** Kicker (`coachRest.kicker`), title (`coachRest.title`), optional tag (`coachRest.optional`) all via `t()`; card is `pulse-card pulse-card-glow` with `--wash:var(--aqua)`.
- **Where:** `CoachRestCard.tsx:64-87`.
- **Expected:** all strings via key; glass aqua surface; region aria-label `coachRest.ariaLabel`.
- **Verify:** `grep -nE "Zi de recuperare|recovery day" CoachRestCard.tsx` → only via key; computed glass surface present (cross-ref §11).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.H — SCHEDULE (Calendar7Day)

### [02.080] Calendar renders 7 day pills with Monday-first labels
- **Check:** `calendar-7day` renders exactly 7 `calendar-day-{0..6}` pills, labels from `calendar.day7.dayLabels.*` (EN Mon..Sun / RO L..D), Monday-first.
- **Where:** `Calendar7Day.tsx:33-35,102-144`.
- **Expected:** 7 pills; label[0] == Monday label per locale; each pill has `data-day` + `data-kind`.
- **Verify:** Playwright: `[data-testid^="calendar-day-"]` count == 7; idx0 label == `calendar.day7.dayLabels.0`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.081] Active (training) pills are accent-filled, rest pills neutral
- **Check:** A `training` pill is filled `var(--accent)` with `--on-accent` text + volt glow box-shadow; a `rest` pill is the neutral `var(--surface-2)` elevated surface.
- **Where:** `Calendar7Day.tsx:126-139` + `data-kind`.
- **Expected:** `[data-kind="training"]` → accent fill + glow; `[data-kind="rest"]` → surface-2, no glow; token-only (no raw hex).
- **Verify:** Playwright: computed background of a training pill == accent (rgb of `--accent`); rest pill == surface-2. `grep -nE "#[0-9a-fA-F]{3,6}" Calendar7Day.tsx` → zero raw hex.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.082] Today pill is ringed (aqua outline)
- **Check:** The pill whose index == `(getDay()+6)%7` (Monday-first today) gets `data-today="true"` + an aqua outline (2px, offset 2).
- **Where:** `Calendar7Day.tsx:68,115,135-138`.
- **Expected:** exactly one pill has `data-today="true"` + a computed outline using `var(--aqua)`.
- **Verify:** Playwright: `[data-today="true"]` count == 1, index matches today; computed `outline-width` ~2px aqua-derived.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.083] Pills are disabled (locked) until edit mode
- **Check:** Each pill is `disabled` when `!editMode` (locked default — taps do nothing); `toggleDay` no-ops while locked.
- **Where:** `Calendar7Day.tsx:110-112`; `scheduleStore.ts:59-62` (`if (!s.editMode) return s`).
- **Expected:** out of edit mode → pills disabled, tapping does not flip `data-kind`.
- **Verify:** Playwright: not editing → tap a pill → `data-kind` unchanged + button `disabled`. Vitest: `toggleDay(0)` while editMode false → state unchanged.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.084] Pencil toggles edit mode; pencil↔check icon swap + aria-label
- **Check:** `calendar-edit-toggle` shows a Pencil when not editing (aria `editAriaEdit`) and a Check when editing (aria `editAriaSave`); tapping enters edit mode, tapping again saves.
- **Where:** `Calendar7Day.tsx:54-64,83-100`.
- **Expected:** tap pencil → `data-edit-mode="true"` + Check icon + save aria-label; tap check → saves + exits.
- **Verify:** Playwright: tap pencil → `[data-testid="calendar-7day"][data-edit-mode="true"]`, aria-label == `calendar.day7.editAriaSave`; tap again → `data-edit-mode="false"`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.085] In edit mode pills become toggleable + flip kind
- **Check:** In edit mode, tapping a pill calls `toggleDay(idx)` flipping training↔rest (`data-kind` updates live).
- **Where:** `Calendar7Day.tsx:108-118`; `scheduleStore.ts:59-78`.
- **Expected:** edit on → tap a rest pill → it becomes training (`data-kind="training"`).
- **Verify:** Playwright: enter edit → tap a rest pill → `data-kind` flips to training; tap again → back to rest.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.086] Edit hint + Save button appear only in edit mode
- **Check:** `calendar-edit-hint` (`calendar.day7.editHint`) + the volt→aqua `calendar-save` button render only while editing.
- **Where:** `Calendar7Day.tsx:146-167`.
- **Expected:** not editing → both absent; editing → both present; save button gradient fill.
- **Verify:** Playwright: not editing → `calendar-edit-hint`/`calendar-save` count 0; editing → count 1 each.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.087] Save persists schedule to the engine via commitCalendarEdit (shape-bridged)
- **Check:** `saveWeekly` transforms the `DayKind[]` to `{day:DAY_KEY, active:boolean}[]` (canon keys L/M/M2/J/V/S/D) and calls `scheduleAdapter.commitCalendarEdit` (the SUBSTRATE-ZETA shape bridge — passing raw DayKind[] silently no-op'd rest overrides).
- **Where:** `scheduleStore.ts:79-145` (esp. 117-121 DAY_KEYS + dayConfigs + commit).
- **Expected:** after Save, `commitCalendarEdit` receives `[{day:'L',active:true},...]`; engine picks up the override on next pipeline run; editMode→false (optimistic).
- **Verify:** Vitest: spy `commitCalendarEdit` → called with `{day,active}` objects (not bare strings); active reflects training days. Playwright: edit a day → Save → reload Coach tab → the edited day persists (`wv2-schedule-store` localStorage days updated).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.088] editMode is NOT persisted; days + weekStart ARE
- **Check:** `partialize` persists only `weekStartISO` + `days` (editMode is session-scope — user returns out of edit mode after navigating away mid-edit).
- **Where:** `scheduleStore.ts:159-162`.
- **Expected:** localStorage `wv2-schedule-store` has days + weekStartISO, no editMode; reopening the tab mid-edit → not in edit mode.
- **Verify:** Playwright: enter edit mode → navigate away + back → `data-edit-mode="false"`. Inspect `localStorage['wv2-schedule-store']` → no `editMode` key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.089] Monday auto-reset on new week
- **Check:** On mount, if the stored `weekStartISO` !== current Monday ISO, `resetWeekly` resets to DEFAULT_WEEK for the new week (ephemeral Calendar V1).
- **Where:** `Calendar7Day.tsx:47-52`; `scheduleStore.ts:146-151`.
- **Expected:** stale prior-week store → days reset to the 4-training default + new weekStartISO.
- **Verify:** Vitest: seed `weekStartISO` = last week → mount effect → days == DEFAULT_WEEK + weekStartISO == current Monday.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.090] Calendar title + day aria-labels + pencil aria are i18n
- **Check:** Title (`calendar.day7.title`), per-pill aria `"{label} - {training|rest}"` via `kindTraining`/`kindRest`, pencil aria via `editAriaEdit`/`editAriaSave`, save CTA `saveCta` — all via `t()`.
- **Where:** `Calendar7Day.tsx:77-79,87,117,154-164`.
- **Expected:** no hardcoded "Program de antrenament"/"Save"/day-kind strings; RO no diacritics.
- **Verify:** `grep -nE "Program de|Training|Rest day|>Save<" Calendar7Day.tsx` → only via key; Playwright pill aria-label resolves per locale.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.I — CONDITIONAL BANNERS + CARDS

### [02.100] ResumeSessionCard renders only with a paused snapshot
- **Check:** `ResumeSessionCard` renders iff `pausedSnap !== null` (derived from `getCurrentMode` 'paused'); it sits at the top of the stack.
- **Where:** `Antrenor.tsx:88-89,195-201`; `ResumeSessionCard.tsx`.
- **Expected:** no paused session → card absent; paused → `resume-session-card` present above everything else.
- **Verify:** Playwright: seed `workoutStore.pausedSnapshot` → `[data-testid="resume-session-card"]` present, first in flow; clear it → absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.101] ResumeSessionCard shows snapshot title + meta line + resume/discard
- **Check:** Card shows `snapshot.title`, the meta line (`resumeSession.metaLine` with exIdx+1 + minutesAgo, min 1), and the two buttons (resume → `onResume`, discard → `onDiscard`) with `stopPropagation` (card body itself resumes on click).
- **Where:** `ResumeSessionCard.tsx:24-83`.
- **Expected:** title + "Oprit la ex {n} · acum {min} min"; Resume + Renunt buttons work; minutesAgo ≥ 1.
- **Verify:** Playwright: seed snapshot (exIdx=2, sessionStart 10min ago) → meta shows "ex 3 · acum 10 min"; tap Resume → resumeSession fires (session resumes); tap Renunt → discardSession.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.102] ResumeSessionCard glass + brick accent + aria, i18n
- **Check:** Card is `pulse-card` with a 1.5px `--brick` border + brick glow corner (aria-hidden), role=region aria-label `resumeSession.title`; strings via `t()`; no raw hex.
- **Where:** `ResumeSessionCard.tsx:27-46,54-58,68,77`.
- **Expected:** glass surface + brick accent; PlayCircle icon aria-hidden; `grep` no raw hex; labels i18n.
- **Verify:** `grep -nE "#[0-9a-fA-F]{3,6}|Reia sesiunea|Resume" ResumeSessionCard.tsx` → no raw hex, no literal strings (only `t()` keys).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.103] ReactivateCard renders only when inactive > 14 days + not dismissed + no paused
- **Check:** `showReactivate` = `lastSession !== null && now - lastSession.ts > 14d && !reactivateDismissed && pausedSnap === null`.
- **Where:** `Antrenor.tsx:57,127-131,203-209`.
- **Expected:** lastSession 20d ago + not dismissed + no paused → card shows; dismissed OR <14d OR paused present → absent.
- **Verify:** Playwright: seed lastSession 20d ago → `ReactivateCard` present; dismiss → absent (and stays absent on reload — `reactivateDismissed` persisted); seed paused snapshot → reactivate suppressed.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.104] ReactivateCard body shows days-ago; FINDING: bold-{days} markup dropped
- **Check:** `reactivate.body` interpolates `{days}` (= floor(daysAgo)). The mockup emphasized the day count (bold `{days}`); the React i18n string renders it as plain inline text — the bold emphasis was DROPPED in the port (`"N-am vorbit de {days} zile. Fara presiune..."` — no `<strong>` / markup).
- **Where:** `ReactivateCard.tsx:25,41-43`; ro.json:893 (plain `{days}`).
- **Expected (mockup parity):** the day number visually emphasized (bold) vs the surrounding sentence; the React port loses it (flat text).
- **Verify:** Playwright: render ReactivateCard → the `{days}` value is NOT wrapped in a bold/strong element (computed font-weight of the number == the sentence weight). Compare to mockup `reactivate-card` where the count is emphasized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(authoring finding 2026-05-29 — bold-{days} emphasis dropped in port)*
- **Evidence:** `ro.json:893` body is a single flat string with no markup around `{days}`; React renders it as one text node (no `<strong>`). Mockup emphasized the count.
- **Notes:** Fix options: (a) split the body into pre/`<strong>{days}</strong>`/post via interpolation components, or (b) accept flat text as an intentional simplification (then mark this PARTIAL on parity §11, PASS on function). Surface tradeoff — not a functional break, purely emphasis parity.

### [02.105] ReactivateCard start + dismiss buttons wired
- **Check:** Start button (`reactivate.startCta`) → `onStart` (handleReactivateStart → energy-check); Dismiss (`reactivate.dismissCta`) → `onDismiss` (coachStore.dismissReactivate, persisted).
- **Where:** `ReactivateCard.tsx:44-59`; `Antrenor.tsx:96,141-143,207`.
- **Expected:** Start → energy-check; Dismiss → card disappears + stays gone after reload.
- **Verify:** Playwright: tap Start → energy-check; tap "Mai tarziu" → card gone; reload → still gone (dismissed flag persisted in coachStore).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.106] PatternsBanner renders only when banners present (V1: 2 patterns)
- **Check:** `PatternsBanner` returns null when `banners.length === 0`; renders the V1 set (STAGNATION + LOW_ADHERENCE) from `coach.patternsBanner` with per-banner `data-pattern-id` + `data-severity` + role=status.
- **Where:** `Antrenor.tsx:211`; `PatternsBanner.tsx:14-42`; `engineWrappers.ts:1098-1140`.
- **Expected:** no patterns → nothing rendered; STAGNATION/LOW_ADHERENCE present → banner(s) with engine RO copy.
- **Verify:** Vitest: `<PatternsBanner banners={[]}/>` → null; with one banner → `[data-pattern-id]` present, role=status, text == engine text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.107] STAGNATION banner fires at ≥ 2-week threshold
- **Check:** The STAGNATION pattern appears when `detectGlobalStagnation().maxStagnationWeeks >= STAGNATION_WEEKS_THRESHOLD` (=2).
- **Where:** `engineWrappers.ts:1083,1101-1118`.
- **Expected:** seed a stagnated lift ≥2 weeks → STAGNATION banner present; <2 weeks → absent.
- **Verify:** Vitest: mock stagnation detector `maxStagnationWeeks=3` → `getPatternsBanner()` includes `{id:'STAGNATION'}`; `=1` → excluded.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.108] LOW_ADHERENCE banner gated on ≥ 3 sessions (Gigel-friendly)
- **Check:** LOW_ADHERENCE fires only when `sessionCount >= LOW_ADHERENCE_MIN_SESSIONS_GATE` (=3) AND adherence score < 50 — a fresh user with 0-2 sessions NEVER sees an adherence-low banner.
- **Where:** `engineWrappers.ts:1085-1086,1120-1140`.
- **Expected:** 0-2 sessions → no LOW_ADHERENCE even if score low; ≥3 sessions + score<50 → banner.
- **Verify:** Vitest: 2 sessions + low adherence → no banner; 4 sessions + adherence 40 → `{id:'LOW_ADHERENCE'}` present; 4 sessions + adherence 80 → absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.109] PatternsBanner severity styling (warn vs info) + icon
- **Check:** `severity==='warn'` → neutral-status bg/border + AlertCircle icon; else → surface-2/line + Info icon; icons aria-hidden.
- **Where:** `PatternsBanner.tsx:26-37`.
- **Expected:** warn banner uses status-neutral tokens + AlertCircle; info uses surface-2 + Info; token-only.
- **Verify:** Playwright/RTL: warn banner computed bg == `--status-neutral-bg`; icon AlertCircle present aria-hidden. No raw hex.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.110] AlertsBanner renders only when alerts present (3-tier severity)
- **Check:** `AlertsBanner` returns null on empty; renders `coach.alerts` with per-alert `data-alert-id` + `data-severity`; `urgent` → role=alert + aria-live=assertive, else role=status + polite.
- **Where:** `Antrenor.tsx:212`; `AlertsBanner.tsx:14-44`.
- **Expected:** no alerts → nothing; urgent alert → role=alert; warn/info → role=status.
- **Verify:** Vitest: `[]` → null; urgent alert → `[role="alert"][aria-live="assertive"]`; info → `[role="status"][aria-live="polite"]`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.111] AlertsBanner severity styling (urgent/warn/info) + icon
- **Check:** urgent → danger bg/border + AlertTriangle; warn → neutral bg/border + AlertTriangle; info → surface-2/line + Info; icons aria-hidden; engine emits the RO copy (no diacritics).
- **Where:** `AlertsBanner.tsx:26-39`.
- **Expected:** urgent computed bg == `--status-danger-bg`; warn == `--status-neutral-bg`; info == `--surface-2`; token-only.
- **Verify:** RTL: each severity → correct bg token + icon; `grep -nE "#[0-9a-fA-F]{3,6}" AlertsBanner.tsx` → zero.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.112] PRNotificationBanner renders only when prHit true
- **Check:** `PRNotificationBanner` returns null when `prHit === false`; when true shows the celebratory volt→aqua gradient banner (`animate-pop-in`) with role=status + aria-label `prNotification.ariaLabel` + title/body i18n.
- **Where:** `Antrenor.tsx:85,262`; `PRNotificationBanner.tsx:15-40`.
- **Expected:** prHit false → absent; prHit true → banner with `prNotification.title` + `prNotification.body`; gradient fill; pop-in animation (reduced-motion snaps).
- **Verify:** Playwright: seed `workoutStore.prHit=true` → banner present role=status; false → absent. `grep` strings via `t()` only.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.113] PRWallRecent renders only with records, top-3, i18n
- **Check:** `PRWallRecent` returns null on empty; renders top-3 PR records (`pr-record-{idx}`) with exercise name + `istoric.landing.recordSummary` (kg/reps/1RM); Trophy icon volt aria-hidden; heading `istoric.prWall.title`.
- **Where:** `Antrenor.tsx:284`; `PRWallRecent.tsx:15-39`; aggregate slice `coachDirectorAggregate.ts:69-73` (top 3 reverse-chrono).
- **Expected:** no PRs → absent; with PRs → ≤3 records, most-recent first, real kg/reps/1RM values.
- **Verify:** Playwright seeded with ≥4 PRs → exactly 3 `pr-record-*` shown, newest first; values match `getPRHistoryAll()` top-3. Empty → section absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.J — EMPTY-STATE (0 sessions) + REMOVED-ELEMENT GUARDS

### [02.120] Fresh account (0 sessions): nothing broken, no empty black block
- **Check:** On a brand-new account with zero sessions, the Coach tab renders cleanly — header + orb (empty "—" mode) + a card (rest or workout per schedule) + calendar — with NO empty black/blank block (the old pre-glass bug where a null region left a void).
- **Where:** whole `Antrenor.tsx` stack with `coach` baseline; orb empty `ReadinessOrb.tsx:51`.
- **Expected:** all conditional banners that need data are simply absent (return null) — not rendered as empty containers; the orb hero + a coach card + calendar always anchor the screen so it never looks broken/void.
- **Verify:** Playwright fresh (cleared IndexedDB/localStorage): screenshot the Coach tab → no blank black rectangle; orb shows "—"; a CoachRestCard or CoachTodayCard present; PatternsBanner/AlertsBanner/PRNotification/PRWall/Resume/Reactivate all absent (count 0). Zero console errors.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.121] Empty-state never fabricates numbers anywhere on the tab
- **Check:** On 0-session account, NO surface shows an invented number: orb "—" (not a score), no readiness verdict, no PR pill, fatigue tile '-', no fake readiness in the rest line, no PR banner/wall.
- **Where:** orb L51/89, verdict L235 (null), pill L240 guard, StatsGrid fatigue L95, CoachRestCard genericLine L42-44.
- **Expected:** every numeric surface that lacks real data shows an honest placeholder, never a fabricated figure (the audit's whole reason-to-exist).
- **Verify:** Playwright fresh: assert orb score "—", fatigue "-", no "/100" verdict, no "readiness NN/100" in the rest card, no PR banner.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.122] Removed bottom "Incepe antrenament" CTA stays removed
- **Check:** The orphan bottom-of-screen "Incepe antrenament" duplicate CTA (removed 2026-05-28) is NOT present — each card owns its own start affordance.
- **Where:** `Antrenor.tsx:286-291` (removal comment); no such button below PRWallRecent.
- **Expected:** no standalone "Incepe antrenament" button after PRWallRecent.
- **Verify:** `grep -nE "Incepe antrenament" Antrenor.tsx` → only inside the removal comment, not JSX. Playwright: no button with that label below the PR wall.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.123] ObiectivSelector relocated off Coach (now on Progress)
- **Check:** The goal/Obiectiv selector is NOT on the Coach tab (relocated 2026-05-28 to Progres > ObiectivGoalCard per Daniel verbatim).
- **Where:** `Antrenor.tsx:279-282` (relocation comment); no ObiectivSelector import/render.
- **Expected:** Coach tab has no Obiectiv picker; it lives on Progress (cross-ref §03).
- **Verify:** `grep -nE "Obiectiv|ObiectivSelector" Antrenor.tsx` → only the comment; Playwright Coach tab → no goal selector.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.124] Vertical stack order matches the spec/mockup
- **Check:** The rendered top→bottom order is: header → (error banner) → (resume) → (reactivate) → patterns → alerts → readiness-hero → stats-grid → (PR notif) → coach card → calendar → PR wall.
- **Where:** `Antrenor.tsx:154-291`.
- **Expected:** DOM order matches; the orb hero sits above the stats strip; the coach card sits below the strip; calendar below the card.
- **Verify:** Playwright: read DOM order of the testids → matches the list; orb-hero before stats-streak before coach card before calendar-7day before pr-wall-recent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.K — MOCKUP PARITY + i18n CROSS-REFS (Coach tab)

### [02.130] Coach tab parity vs interfata-noua mockup (rendered diff)
- **Check:** The LIVE Coach tab matches the hand-built mockup `screens-antrenor.jsx` (rendered) on layout, palette (volt/aqua/ember), fonts (Space Grotesk display / Manrope body / Space Mono mono), spacing, and the phone bezel.
- **Where:** mockup `04-architecture/mockups/interfata-noua/screens-antrenor.jsx` vs live `andura.app` Coach tab. Cross-ref §11 parity.
- **Expected:** orb hero geometry, coach-card glow, sched-pill styling, kickers, serif italic quotes all match within parity tolerance; deltas → PARTIAL.
- **Verify:** screenshot-diff the rendered mockup vs the live seeded Coach tab at the same viewport; record any color/spacing/typography delta. (Deeper per-pixel checks owned by §11.)
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.131] Coach tab i18n completeness (EN+RO, zero diacritics)
- **Check:** Every user-facing string on the Coach tab + its components resolves via `t()` with both `en.json` + `ro.json` keys present; RO strings carry no diacritics. (Deep enumeration owned by §09; this is the Coach-scoped gate.)
- **Where:** `antrenor.*`, `coachToday.*`, `coachRest.*`, `stats.*`, `calendar.day7.*`, `prNotification.*`, `reactivate.*`, `resumeSession.*`, `readinessVerdictWidget.*`, `coachEngine.readiness.*`, `coachEngine.fatigue.*` in both bundles.
- **Expected:** no hardcoded user-facing literal in any Antrenor component; key parity EN↔RO; RO diacritic-free.
- **Verify:** the i18n scanner (`noHardcodedStrings.test.ts`) passes for `routes/screens/antrenor/Antrenor.tsx` + `components/Antrenor/*` + `Calendar7Day.tsx` + `components/pulse/ReadinessOrb.tsx`; key-parity test green for the namespaces above; diacritics scanner clean on RO Coach keys. Cross-ref §09.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.132] Glass parity across all Coach surfaces
- **Check:** Every Coach card uses the shared `pulse-card`/`pulse-card-glow`/`pulse-card-tight` glass system (consistent blur/border/shadow), token colors only — no one-off card style or raw hex. (Deep glass checks owned by §11.)
- **Where:** all Antrenor components + Calendar7Day + ReadinessOrb hero wrapper (`Antrenor.tsx:224`).
- **Expected:** consistent glass surface treatment across hero, coach card, rest card, stats tiles, calendar, banners, PR wall, resume/reactivate.
- **Verify:** `grep -rnE "#[0-9a-fA-F]{3,6}" src/react/components/Antrenor src/react/components/Calendar7Day.tsx src/react/components/pulse/ReadinessOrb.tsx` → zero raw hex (token/color-mix only); visual: uniform glass. Cross-ref §11.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 02.L — INVARIANTS (Coach tab)

### [02.IV.001] INVARIANT: ReadinessOrb is ALWAYS present (Daniel CEO LOCK 2026-05-29)
- **Check:** The orb hero never disappears — neither with data, without data, nor on aggregate error.
- **Where:** `Antrenor.tsx:223-256` (unconditional).
- **Expected:** `readiness-hero` count == 1 in every state (seeded, fresh, error).
- **Verify:** 02.020 + 02.012 + 02.022 all confirm presence across states.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.IV.002] INVARIANT: no fabricated numbers (honesty)
- **Check:** No Coach surface ever invents a readiness/fatigue/intensity/recovery number when the engine has none.
- **Where:** orb empty, verdict null, fatigue '-', intensity honest label, rest generic line.
- **Expected:** every empty path shows an honest placeholder; the old hardcoded claims/numbers are gone.
- **Verify:** 02.022 + 02.052 + 02.057 + 02.071 + 02.121 all green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.IV.003] INVARIANT: Start always reaches energy-check (never skips safety entry)
- **Check:** Every start affordance on Coach (today-card Start, rest light-session, rest override, reactivate Start) routes to `energy-check` — never directly to `workout`.
- **Where:** `Antrenor.tsx:137-143,268,271-272`; cross-ref §06.001.
- **Expected:** no path on the Coach tab navigates straight to the LIVE workout route.
- **Verify:** 02.058 + 02.074 + 02.075 + 02.105 reach energy-check; `grep -n "gotoPath('workout')" Antrenor.tsx` → empty.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [02.IV.004] INVARIANT: single source of truth = getCoachToday aggregate
- **Check:** The whole tab's engine state comes from ONE `getCoachToday()` call (no component independently re-queries the engine for the same field, avoiding split source-of-truth).
- **Where:** `Antrenor.tsx:110-125` → props down to every component (`coach?.field`).
- **Expected:** readiness/fatigue/plannedWorkout/isRestDay/banners/alerts/PRs/restReason all flow from the one aggregate; components receive them as props (CoachTodayCard's quote/lagging are the only intentional in-component engine reads, memoized + signal-deped).
- **Verify:** code-read: no second `getReadiness`/`getFatigue` call in Antrenor children for the same data; 02.013/02.014 aggregate correctness green.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## SECTION 02 SCORE (fill at audit time)

```
02 Coach tab         PASS  PART  FAIL  BLOCK   %     GATE   STATUS
                     --    --    --    --      --%   95%    ----
```

**Known open finding at authoring (2026-05-29):**
- `02.104` — ReactivateCard bold-`{days}` emphasis dropped in the port (mockup
  emphasized the day count; React renders flat text). Non-functional — counts
  against PARTIAL on parity, not a behavior break. Confirm whether Daniel wants
  the emphasis restored or accepts the flat simplification (surface tradeoff).
