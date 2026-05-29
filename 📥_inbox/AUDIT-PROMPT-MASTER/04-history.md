# SECTION 04 — History (Istoric) tab + calendar + sessions + PR wall (gate 95%)

> **Goal.** Every past session and every derived statistic on the History tab
> renders *correctly from real data* — never fabricated, never frozen, never
> mis-coloured. A user who finished 12 sessions must see 12 sessions, a streak
> that matches their real cadence, a calendar painted by the *actual* per-session
> rating, a 90-day "how it felt" strip whose bars and counts come from real
> ratings, and a PR wall listing the real PR sets. The two sub-screens
> (`IstoricDetail`, `PrWall`) must drill down into the same real data with zero
> drift. This is the *memory* of the product: if it lies, the user stops trusting
> the engine that wrote the memory.
>
> **Why this matters (and where the known bugs live).** History surfaced two of
> the exact bug classes this whole audit exists to catch: (1) the
> "days-of-the-week wrong colour" parity miss Daniel found in smoke 2026-05-29 —
> weekday header letters render `text-ink3` grey instead of the mockup's
> `var(--aqua)` (cross-ref §11.503); and (2) the Recovery legend dot rendered in
> olive-brown `heatRecovery` instead of the mockup's `var(--violet)`
> (cross-ref §11.505). Both are *colour-token-inheritance* misses, not data bugs —
> but they are exactly the kind of "looks fine, summarised, passed" item past
> audits glossed. This section checks them explicitly, plus the harder data-wiring
> question: does each number trace to a real value in `workoutStore.sessionsHistory`?
>
> **Scope of this file.** The History home (`Istoric.tsx` — 3 stat tiles +
> CalendarHeatmap + RatingsStrip90Day + inline PR-wall preview + VirtualSessionList +
> empty state) + the two sub-screens (`IstoricDetail.tsx`, `PrWall.tsx`) + the four
> dedicated components (`CalendarHeatmap`, `RatingsStrip90Day`, `VirtualSessionList`,
> and `Calendar7Day` — note: `Calendar7Day` is mounted on the **Coach** tab, not
> History; it is checked here only for the cross-tab calendar-token consistency the
> prompt asks for, and otherwise belongs to §02) + the wiring libs
> (`prHistoryAggregate.ts`, `useSessionsByDate.ts`, `sessionRating.ts`, and the
> `workoutStore.sessionsHistory` source-of-truth). Per-element checks split into:
> value-correctness, derivation-honesty, empty-state gating, i18n (cross-ref §09),
> parity (cross-ref §11), data-wiring (cross-ref §08 — `sessionsHistory` persist).
>
> **Run discipline (from 00-MASTER §HOW TO RUN).** One verdict per step. Evidence
> mandatory — a PASS with no `file:line` / computed value / screenshot / command
> output is INVALID and scored FAIL. Behaviour + value-correctness steps run
> against a SEEDED populated account (see §APPENDIX-SEED in the master run) with a
> KNOWN session set: at least one session with a per-exercise `exercises`
> breakdown containing a `usor`-majority session, a `greu`-majority session, a
> `potrivit`-majority session, a legacy session with NO `exercises` field, a
> multi-session same-day pair, at least one set flagged `isPR`, and a session
> dated in the current calendar month + one ≥ 32 days old. Empty-state steps run
> against a fresh (T0) account with `sessionsHistory: []` specifically. BLOCKED
> only when an env dependency is genuinely missing — never to dodge a checkable
> item; >5% BLOCKED in this section fails the section regardless.
>
> **Canonical data SoT (pin this once, applies to all value steps).** The single
> source for everything on this tab is `useWorkoutStore().sessionsHistory`
> (`workoutStore.ts:284`), a `LastSessionSummary[]` capped newest-tail at
> `SESSIONS_HISTORY_MAX=500` (`workoutStore.ts:546`). `streak` is a *separate*
> persisted scalar (`workoutStore.ts:285`), NOT recomputed from the list — the
> History "Day streak" tile reads `getStreakStats().currentStreak` =
> `state.streak`, so a streak that disagrees with the calendar is a real
> split-source to flag. All ratings are DERIVED from `exercises[*].sets[*].rating`
> via `deriveSessionRating` (`sessionRating.ts:15`); PRs are DERIVED from
> `exercises[*].sets[*].isPR`. Legacy sessions (no `exercises` field) deliberately
> render no rating chip / no trophy / no PR row (honest absence, NOT fabricated).

---

## 04.A — History home shell, header, stat-tile trio (Istoric.tsx)

### [04.001] History home mounts with the documented top→bottom skeleton
- **Check:** `Istoric` renders, in order: `<h1>` heading → `istoric-stats-grid` (3 tiles) → `calendar-heatmap` → `ratings-strip-90day` → conditional `istoric-pr-wall` → sessions Kicker → (`istoric-empty` | `istoric-list`).
- **Where:** `src/react/routes/screens/istoric/Istoric.tsx:53-175`
- **Expected:** DOM document order is exactly heading, stats-grid, calendar, ratings strip, (pr-wall if any PRs), sessions heading, list-or-empty.
- **Verify:** Playwright on seeded account at `/app/istoric` → read the document order of `[data-testid="istoric-stats-grid"]`, `calendar-heatmap`, `ratings-strip-90day`, `istoric-list` → assert the sequence matches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.002] Root section testid + scroll container
- **Check:** Root `<section>` carries `data-testid="istoric-home"` and `p-6 bg-paper min-h-screen`.
- **Where:** `src/react/routes/screens/istoric/Istoric.tsx:54-57`
- **Expected:** Single `istoric-home` node; min-height fills the viewport so a short list does not collapse the page.
- **Verify:** Playwright → `page.locator('[data-testid="istoric-home"]')` count == 1; computed `min-height` ≥ viewport height.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.003] Page heading renders via i18n (no hardcode)
- **Check:** The `<h1>` is `t('tabs.istoric.title')`, not a literal.
- **Where:** `src/react/routes/screens/istoric/Istoric.tsx:59`
- **Expected:** EN renders "History"; RO renders the no-diacritics equivalent ("Istoric"). Cross-ref §09.
- **Verify:** `grep -nE ">History<|>Istoric<" src/react/routes/screens/istoric/Istoric.tsx` returns no hardcoded JSX text node; confirm `tabs.istoric.title` exists in `src/i18n/en.json` + `ro.json`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.004] Heading uses the Pulse display font + size
- **Check:** Heading is `font-display text-[30px] font-bold text-ink`, matching mockup `screens-tabs.jsx:189` (`display, fontSize:30, fontWeight:700`).
- **Where:** `src/react/routes/screens/istoric/Istoric.tsx:59` vs mockup `screens-tabs.jsx:189`
- **Expected:** 30px Space Grotesk display wordmark, ink colour. Cross-ref §11.
- **Verify:** Computed `font-size` == 30px, `font-family` resolves to the display stack; screenshot-diff heading vs mockup.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.005] Stat-tile grid is exactly 3 columns
- **Check:** `istoric-stats-grid` is `grid grid-cols-3 gap-2.5` holding exactly three `HistStat` tiles.
- **Where:** `src/react/routes/screens/istoric/Istoric.tsx:65-93`
- **Expected:** 3 child tiles (`stats-streak`, `stats-total`, `stats-pr`); no 4th tile, no wrap. Mockup `screens-tabs.jsx:191-205` shows the same trio (streak/sessions/records).
- **Verify:** Playwright → within `istoric-stats-grid`, count direct tile children == 3; computed `grid-template-columns` has 3 tracks.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.006] Tile 1 — "Day streak" value reads `getStreakStats().currentStreak`
- **Check:** `stats-streak` renders the real persisted streak, not a hardcoded number.
- **Where:** `Istoric.tsx:50` (`stats = getStreakStats()`), `:72-73`; source `prHistoryAggregate.ts:81` (`currentStreak: state.streak`), `workoutStore.ts:285`.
- **Expected:** Value == `workoutStore.getState().streak`. The mockup's literal "12" (`screens-tabs.jsx:193`) is mockup-only; live MUST be the store scalar.
- **Verify:** Playwright on seeded account → set a known `streak` value via store → read `[data-testid="stats-streak"]` text == that value (count-up settles to it; `useCountUp` snaps under reduced-motion / tests).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Streak is a stored scalar, NOT recomputed from `sessionsHistory` — flag any divergence between this tile and the calendar's logged-day pattern as a split-source (cross-ref §08).

### [04.007] Tile 2 — "Total sessions" value reads `sessionsHistory.length`
- **Check:** `stats-total` == count of all sessions in history.
- **Where:** `Istoric.tsx:80-81`; source `prHistoryAggregate.ts:84` (`totalSessions: sessions.length`).
- **Expected:** Value == `sessionsHistory.length` (capped at 500 by `SESSIONS_HISTORY_MAX`).
- **Verify:** Playwright → seed N sessions → `[data-testid="stats-total"]` settles to N. Edge: seed > 500 → tile shows 500 (cap), and note the cap is silent (cross-ref §08 + §15 never-delete: cap drops OLDEST tail, not newest).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.008] Tile 3 — "Records" value reads the real PR count
- **Check:** `stats-pr` == total `isPR` set count across all sessions' breakdowns.
- **Where:** `Istoric.tsx:88-89`; source `prHistoryAggregate.ts:72-80` (`prCount` = Σ sets where `isPR`).
- **Expected:** Value == number of `exercises[*].sets[*].isPR === true` across `sessionsHistory`. Legacy sessions (no `exercises`) contribute 0.
- **Verify:** Playwright → seed sessions with K known PR sets → `[data-testid="stats-pr"]` settles to K. Cross-check K equals `getPRHistoryAll().length` (both count per-set `isPR`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Confirm `stats-pr` (Σ isPR via `getStreakStats`) and the inline PR-wall row count (`getPRHistoryAll().length`) AGREE — both derive from the same `isPR` flag; a mismatch is a wiring bug.

### [04.009] Stat-tile labels render via i18n (no hardcode)
- **Check:** The three tile labels use `istoric.landing.statDaysStreak` / `statTotalSessions` / `statRecords`.
- **Where:** `Istoric.tsx:73,81,89`
- **Expected:** EN "Day streak" / "Sessions" / "Records"; RO no-diacritics equivalents. Cross-ref §09.
- **Verify:** `grep -nE "Day streak|Sessions|Records" src/react/routes/screens/istoric/Istoric.tsx` → zero hardcoded labels; confirm the three keys exist in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.010] Each tile uses Pulse glass surface + colored icon + radial wash
- **Check:** Each `HistStat` is a `pulse-card pulse-card-tight` with a colored Lucide icon (streak=volt/Flame, sessions=aqua/History, records=ember/Trophy) and a radial accent wash.
- **Where:** `Istoric.tsx:69-92,198-209` (HistStat); mockup `screens-tabs.jsx:193-205` (`hist-stat`, per-tile accent).
- **Expected:** Flame icon `var(--volt)`, History icon `var(--aqua)`, Trophy icon `var(--ember)`; radial wash uses each tile's accent. Cross-ref §11.
- **Verify:** Playwright → computed `color` of each tile icon == volt/aqua/ember tokens; class includes `pulse-card`; screenshot-diff vs mockup `hist-stat` tiles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.011] Tile hero number is tabular-nums display font with count-up
- **Check:** The big number is `font-display text-2xl font-bold text-ink tabular-nums`, animated via `useCountUp`, snapping to final under reduced-motion.
- **Where:** `Istoric.tsx:197,210-212`
- **Expected:** Renders the final integer; tabular-nums prevents digit jitter during count-up. In tests / reduced-motion the value is the final number immediately (no transient 0).
- **Verify:** Playwright with `prefers-reduced-motion: reduce` → tile number == final value on first paint (no 0→N animation). Confirm `tabular-nums` class present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** If `useCountUp` ever shows a fabricated transient number on an empty account, flag it — empty must show 0 (cross-ref §15 no-fabrication).

### [04.012] Tile entrance stagger (delay-0 / delay-75 / delay-150)
- **Check:** The three tiles carry `animate-card-rise` with staggered delays (`delay-0`, `delay-75`, `delay-150`).
- **Where:** `Istoric.tsx:75,83,91,200`
- **Expected:** Visible staggered rise on mount; collapses under reduced-motion. Cross-ref §10 reduced-motion + §14 motion budget.
- **Verify:** Inspect classes; with reduced-motion the rise is suppressed (no transform animation), tiles still visible.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.013] Fresh-account stat tiles all render 0 (no fabrication)
- **Check:** On a T0 account (`sessionsHistory: []`, `streak: 0`), all three tiles show 0.
- **Where:** `Istoric.tsx:72,80,88` + `prHistoryAggregate.ts:66-87`.
- **Expected:** streak 0, total 0, records 0 — never a placeholder seed number. Cross-ref §15.
- **Verify:** Playwright on wiped account → each of `stats-streak`/`stats-total`/`stats-pr` reads `0`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A fabricated non-zero on a fresh account is an automatic honesty FAIL.

---

## 04.B — Calendar heatmap: month nav (CalendarHeatmap.tsx)

### [04.014] Calendar renders inside a Pulse glass card with aria-label
- **Check:** `calendar-heatmap` section is a `pulse-card p-4 mb-4` with `aria-label={t('calendar.heatmap.ariaLabel')}`.
- **Where:** `CalendarHeatmap.tsx:121-126`
- **Expected:** Single glass card; aria-label present and localized. Cross-ref §10 + §11.
- **Verify:** Playwright → `[data-testid="calendar-heatmap"]` present, has non-empty `aria-label`, class includes `pulse-card`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.015] Month label shows the CURRENT month + year on mount
- **Check:** `cal-month-label` initial text == `t('months.full.<currentMonth>') + ' ' + currentYear`.
- **Where:** `CalendarHeatmap.tsx:84-86,119,128-130`
- **Expected:** Defaults to `today.getFullYear()` + `today.getMonth()`; renders e.g. "May 2026" (EN) / localized full month (RO).
- **Verify:** Playwright → `[data-testid="cal-month-label"]` text matches the current month name + year for the test clock.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.016] Prev-month chevron decrements month (with year wrap)
- **Check:** Tapping `cal-prev` moves to the previous month; January→December rolls year back.
- **Where:** `CalendarHeatmap.tsx:90-97,132-141`
- **Expected:** `navMonth(-1)`: `m<0 → m=11, y--`. From "January 2026" → "December 2025".
- **Verify:** Playwright → click `cal-prev` → `cal-month-label` is the previous month; repeat across a January boundary → year decrements.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.017] Next-month chevron increments month (with year wrap)
- **Check:** Tapping `cal-next` moves to the next month; December→January rolls year forward.
- **Where:** `CalendarHeatmap.tsx:90-97,142-151`
- **Expected:** `navMonth(1)`: `m>11 → m=0, y++`. From "December 2025" → "January 2026".
- **Verify:** Playwright → click `cal-next` across a December boundary → month is January, year +1.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.018] Chevron buttons have localized aria-labels
- **Check:** `cal-prev`/`cal-next` carry `aria-label={t('calendar.heatmap.prevMonth')}` / `nextMonth`.
- **Where:** `CalendarHeatmap.tsx:135,145`
- **Expected:** Non-empty localized aria-labels; chevron icons are `aria-hidden`. Cross-ref §10.
- **Verify:** Playwright → both buttons expose a non-empty accessible name; icons `aria-hidden="true"`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.019] Month change announces via aria-live region
- **Check:** `cal-month-announce` is an `aria-live="polite" aria-atomic="true" sr-only` region that updates with the month.
- **Where:** `CalendarHeatmap.tsx:242-249`
- **Expected:** Region text = `t('calendar.heatmap.monthAnnounce', { month, year })`, updates on nav. Cross-ref §10.
- **Verify:** Playwright → click `cal-next` → `cal-month-announce` text changes to the new month/year; element is visually hidden (`sr-only`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.020] Sessions re-bucket when navigating to a month that has sessions
- **Check:** Navigating to a month containing seeded sessions repaints the dots for those days.
- **Where:** `CalendarHeatmap.tsx:87,110-117` + `useSessionsByDate.ts:26-40` (memoized on year/month0).
- **Expected:** `useSessionsByDate(calY, calM)` re-keys on month change; dots appear only on days with sessions in the displayed month.
- **Verify:** Playwright → seed a session 2 months ago → nav back 2 months → that day's cell shows a dot; the current month (no session) shows none on that date.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 04.C — Calendar heatmap: weekday header + day cells + dots + today + future

### [04.021] Weekday header row has 7 Monday-first letters
- **Check:** Header renders 7 cells from `calendar.heatmap.dayLabels.0..6`, Monday-first.
- **Where:** `CalendarHeatmap.tsx:155-164,39-41`
- **Expected:** EN "M T W T F S S"; RO localized. Cross-ref §09.
- **Verify:** Playwright → 7 header cells; first label == `dayLabels.0` (Monday). Confirm keys exist in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.022] ⚠️ Weekday header letters render in AQUA, not grey — DANIEL SMOKE 2026-05-29
- **Check:** The weekday header letters use the mockup `.cal-wd` AQUA colour, NOT `text-ink3` grey.
- **Where:** live `CalendarHeatmap.tsx:155-164` (`text-[10px] text-ink3`) vs mockup `screens-tabs.jsx:208,283` (`.cal-wd { color: var(--aqua); }`).
- **Expected:** computed `color` of a weekday letter == `var(--aqua)` (#4fd6e8). **LIVE IS `text-ink3` (#82889e grey) — MISMATCH.** This is the exact "days of the week wrong colour" issue Daniel reported.
- **Verify:** Playwright → computed `color` of a header letter at `CalendarHeatmap.tsx:159`; assert == aqua, NOT ink-3 grey. Cross-ref §11.503 (canonical pre-filled FAIL).
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — Daniel smoke 2026-05-29, confirm don't assume)*
- **Evidence:** `CalendarHeatmap.tsx:159` applies `text-ink3` to the weekday labels; mockup `screens-tabs.jsx:283` `.cal-wd { color: var(--aqua); }`. Colour delta grey vs aqua.
- **Notes:** Fix: change the weekday header label class from `text-ink3` to an aqua token (e.g. `text-deep` or inline `var(--aqua)`). Verify the aqua clears AA on the card surface (§10). Root cause is the token-inheritance class (cross-ref §11.901). Re-run before passing the section.

### [04.023] Grid is 7 columns with Monday-first leading offset
- **Check:** `cal-grid` is `grid-cols-7`; the 1st-of-month is offset by `(getDay()+6)%7` leading empty cells.
- **Where:** `CalendarHeatmap.tsx:99-109,166-171`
- **Expected:** A month whose 1st falls on Wednesday shows 2 leading empty cells (Mon,Tue) then day 1 in column 3.
- **Verify:** Playwright on a test clock where the 1st is a known weekday → count `cal-cell-empty-*` leading cells == expected Monday-first offset; first `cal-cell-1` sits in the correct column.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.024] Day count matches the displayed month
- **Check:** Number of `cal-cell-<n>` cells == days in the displayed month.
- **Where:** `CalendarHeatmap.tsx:103,110-117`
- **Expected:** 28/29/30/31 cells per month; February leap-year shows 29.
- **Verify:** Playwright → nav to Feb 2024 (leap) → 29 day cells; nav to Apr → 30; Jan → 31.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.025] Leading empty cells are aria-hidden + carry no data
- **Check:** Offset cells render `cal-cell-empty-<idx>` with `aria-hidden="true"` and no day number/dot.
- **Where:** `CalendarHeatmap.tsx:172-181`
- **Expected:** Empty cells are decorative, excluded from the a11y tree. Cross-ref §10.
- **Verify:** Playwright → leading empty cells have `aria-hidden="true"`, no text, no dot.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.026] Logged day shows a glowing dot keyed to the session rating tier
- **Check:** A day with a session shows a dot colored by tier: l1(usor)=volt, l2(potrivit/null)=aqua, l3(greu)=ember.
- **Where:** `CalendarHeatmap.tsx:76-81,184,190,230-236`
- **Expected:** Easy-majority day → volt dot; potrivit-majority → aqua; greu-majority → ember. Tier comes from `aggregateDayRating(deriveSessionRating(...))` — REAL data.
- **Verify:** Playwright → seed an easy session on day X, hard on day Y, fair on day Z → computed `background` of the dot at `cal-cell-X` == volt, Y == ember, Z == aqua. Cross-ref §11.504.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Dots are decorative (`aria-hidden`); rating is conveyed in the cell aria-label (04.034). Tokens only — no raw hex (cross-ref §11.902).

### [04.027] Rest/free day shows NO dot (honest absence)
- **Check:** A day with no session renders no dot (`tierDotColor` returns null for `zi-libera`).
- **Where:** `CalendarHeatmap.tsx:80,183-184,230`
- **Expected:** Days without a session show only the day number on the surface, no glowing dot.
- **Verify:** Playwright → a day with zero sessions → `cal-cell-<n>` has no `.rounded-full` dot child.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.028] Multi-session same-day aggregates by severity-first
- **Check:** Two sessions on the same day combine: greu > potrivit > usor wins the dot color.
- **Where:** `CalendarHeatmap.tsx:64-69,113-114` (`aggregateDayRating`) + `useSessionsByDate.ts:31-37` (array per day, not last-write-wins).
- **Expected:** An easy AM + hard PM on the same day → ember (greu) dot. The two sessions are NOT collapsed to one in storage.
- **Verify:** Playwright → seed AM(usor) + PM(greu) on the same date → that cell's dot == ember.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Marius AM+PM case — `useSessionsByDate` deliberately keeps an array per day (`:34-36`) to avoid last-write-wins masking.

### [04.029] Legacy session (no exercises) still paints a cell as present
- **Check:** A logged session with NO `exercises` breakdown still marks the day (tier falls back to l2/aqua), not blank.
- **Where:** `CalendarHeatmap.tsx:55-59,113-116,184` + `sessionRating.ts:20-21` (null when no rated sets).
- **Expected:** `hasSession` true → `ratingToTierClass(null)` → 'l2' → aqua dot. The day is shown as trained even without per-set ratings.
- **Verify:** Playwright → seed a session with no `exercises` field on day X → cell X shows an aqua dot (l2 fallback), `data-tier="l2"`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Honest: it shows "trained" (true) but not a fabricated intensity — fallback aqua is the documented placeholder (spec §2.2).

### [04.030] `data-tier` / `data-date` attributes expose the real tier + ISO date
- **Check:** Each day cell carries `data-tier` (l1/l2/l3/zi-libera) + `data-date` (YYYY-MM-DD) for test truth-source.
- **Where:** `CalendarHeatmap.tsx:220-221`
- **Expected:** `data-tier` matches the derived tier; `data-date` matches the local-date key.
- **Verify:** Playwright → for a seeded greu day, `cal-cell-<n>` has `data-tier="l3"` and `data-date` == that day's `YYYY-MM-DD`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Local-date keying (`useSessionsByDate.ts:18-24`) avoids the UTC midnight-shift bug — verify a late-night session keys to the local day, not UTC.

### [04.031] Today cell gets the accent ring + bold accent number
- **Check:** The cell whose key == today shows `ring-2 ring-brick ring-inset` + `text-brick font-bold` number + `data-today="true"`.
- **Where:** `CalendarHeatmap.tsx:191,197-202,222`
- **Expected:** Exactly one cell flagged today; ring + bold accent number. Mockup `screens-tabs.jsx:289-290` `.is-today` uses `var(--accent)` outline + accent num.
- **Verify:** Playwright → exactly one `[data-today="true"]`; its number is bold + accent-colored; ring present. Cross-ref §11.506.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Live uses `ring-brick` (inset ring) vs mockup `outline var(--accent)` — both accent-token; confirm the visual reads as the accent and not a divergent token.

### [04.032] Future cells are inert: transparent bg + dimmed number + aria-disabled
- **Check:** Cells dated after today are transparent (`cellBg` undefined), number `text-ink3 opacity-50`, `data-future="true"`, `aria-disabled="true"`, NO dot, NO hover lift.
- **Where:** `CalendarHeatmap.tsx:192,196-197,208,223,225`
- **Expected:** Future days look empty + non-interactive; mockup `screens-tabs.jsx:287-288` `.is-future` transparent + dimmed.
- **Verify:** Playwright on a month with future days → a future `cal-cell` has `aria-disabled="true"`, dimmed number, no dot, no `hover:scale` class.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Future-day comparison is string-based on the ISO key (`cell.key > todayKey`) — valid because keys are zero-padded YYYY-MM-DD.

### [04.033] Past/rest cells sit on the nested glass surface
- **Check:** Non-future cells get `background: var(--surface-2)` so the month reads as a filled grid; future cells transparent.
- **Where:** `CalendarHeatmap.tsx:196,227`
- **Expected:** Past + today + rest days on `--surface-2`; matches mockup `.cal-day` surface (`screens-tabs.jsx:284`). Cross-ref §11.
- **Verify:** Playwright → a past rest cell computed `background` == `--surface-2`; a future cell `background` transparent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.034] Day-cell aria-label is localized + describes date + rating + suffix
- **Check:** Each cell `aria-label` = "`<day> <monthGenitive> <year>, <ratingWord><suffix>`" via i18n, with today/future suffix.
- **Where:** `CalendarHeatmap.tsx:209-214,224,45-51,35-37`
- **Expected:** e.g. EN "7 May 2026, hard session"; today appends `todaySuffix`, future appends `futureSuffix`. RO localized. Cross-ref §09 + §10.
- **Verify:** Playwright → a greu day cell aria-label contains the localized hard-session word; today cell aria-label contains the today suffix; future cell contains the future suffix.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `monthGenitive` uses `months.fullGenitive.*` — confirm the RO genitive keys exist (cross-ref §09).

### [04.035] Logged-day hover lift only on past sessions
- **Check:** `transition-transform hover:scale-110` applies ONLY to cells that have a session AND are not future.
- **Where:** `CalendarHeatmap.tsx:208`
- **Expected:** Empty/future/rest cells do not lift (no false affordance). Reduced-motion collapses the transform. Cross-ref §10 + §14.
- **Verify:** Inspect class on a logged past cell (has `hover:scale-110`) vs an empty cell (no hover class).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 04.D — Calendar legend (5 items)

### [04.036] Legend renders 5 items in mockup order
- **Check:** `cal-legend` shows Easy → Normal → Hard → Recovery → Rest, in that order.
- **Where:** `CalendarHeatmap.tsx:256-298`; mockup `screens-tabs.jsx:223-230`.
- **Expected:** Five labeled dots, order matches the mockup. Cross-ref §11.505.
- **Verify:** Playwright → 5 legend items in `cal-legend`; label order == easy/normal/hard/recovery/rest.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.037] Legend Easy/Normal/Hard dots use volt/aqua/ember glow
- **Check:** Easy dot = `var(--volt)`, Normal = `var(--aqua)`, Hard = `var(--ember)`, each with a matching box-shadow glow.
- **Where:** `CalendarHeatmap.tsx:260-283`
- **Expected:** The 3 active-tier legend dots key off the same tokens as the cell dots (04.026). Cross-ref §11.
- **Verify:** Playwright → computed `background` of each of the first 3 legend dots == volt/aqua/ember respectively.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.038] ⚠️ Legend Recovery dot is VIOLET, not olive-brown — DANIEL SMOKE 2026-05-29
- **Check:** The Recovery legend dot uses `var(--violet)` (#a98bff), matching the mockup `stateColor.recovery`.
- **Where:** live `CalendarHeatmap.tsx:286-287` (`bg-heatRecovery border border-heatRecoveryBorder`) vs mockup `screens-tabs.jsx:176,226` (`recovery: var(--violet)`).
- **Expected:** Recovery dot == violet. **LIVE IS olive-brown `heatRecovery` — MISMATCH.** Cross-ref §11.505 (pre-filled FAIL).
- **Verify:** Playwright → computed `background` of the Recovery legend dot; assert == violet `#a98bff`, NOT the olive-brown heatRecovery token.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — Daniel smoke 2026-05-29, confirm don't assume)*
- **Evidence:** `CalendarHeatmap.tsx:286-287` Recovery dot = `bg-heatRecovery border border-heatRecoveryBorder` (olive-brown); mockup `screens-tabs.jsx:226` Recovery = `var(--violet)`.
- **Notes:** Fix: Recovery legend dot → `var(--violet)` glow. Same token-inheritance root cause as 04.022 (cross-ref §11.901). Tie-in: cell-dot map has no recovery tier yet (data-availability — `deriveSessionRating` returns only usor/potrivit/greu); flag whether recovery should paint once deload tracking lands (cross-ref §11.504).

### [04.039] Legend Rest dot uses surface-2 + line border (no glow)
- **Check:** The Rest dot is `bg-paper2 border border-lineStrong` — neutral, no accent glow.
- **Where:** `CalendarHeatmap.tsx:293`
- **Expected:** Rest = neutral surface + border, distinct from the glowing session dots. Cross-ref §11.
- **Verify:** Playwright → Rest legend dot has a border + neutral background, no box-shadow glow.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.040] Legend dot SHAPE — circle vs mockup rounded-square 3px
- **Check:** Legend dots are `rounded-full` circles vs mockup `.leg-dot { border-radius: 3px }` rounded-squares.
- **Where:** live `CalendarHeatmap.tsx:262,270,278,286,293` (`rounded-full`) vs mockup `screens-tabs.jsx:294` (`.leg-dot{border-radius:3px}`).
- **Expected:** Mockup uses 3px rounded-square legend dots; live uses circles. Cross-ref §11.505.
- **Verify:** Playwright → computed `border-radius` of a legend dot == 9999px (full) vs mockup 3px.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — Daniel smoke 2026-05-29, dot shape)*
- **Evidence:** Live legend dots `rounded-full`; mockup `.leg-dot{border-radius:3px}`. Shape delta circle vs rounded-square.
- **Notes:** Fix: legend dot shape → rounded-square 3px to match `.leg-dot`. Low-severity parity but explicitly flagged in §11.505.

### [04.041] Legend labels render via i18n
- **Check:** The 5 labels use `calendar.heatmap.legend.{easy,normal,hard,recovery,rest}`.
- **Where:** `CalendarHeatmap.tsx:266,274,282,289,296`
- **Expected:** EN english words; RO no-diacritics. Cross-ref §09. (Keys confirmed present in en.json `:964-965`.)
- **Verify:** `grep -nE ">Easy<|>Hard<|>Recovery<|>Rest<" src/react/components/Istoric/CalendarHeatmap.tsx` → zero hardcoded labels; keys exist in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 04.E — "How sessions felt" 90-day strip (RatingsStrip90Day.tsx)

### [04.042] Strip renders as a labeled Pulse card with heading + window
- **Check:** `ratings-strip-90day` is a `pulse-card` with a localized heading (`istoric.ratingsStrip.heading`) + a "90d" window label.
- **Where:** `RatingsStrip90Day.tsx:135-145`
- **Expected:** Aria-label localized; heading + window from i18n. Cross-ref §09 + §11.
- **Verify:** Playwright → `[data-testid="ratings-strip-90day"]` present + non-empty `aria-label`; heading + window text localized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.043] Strip has exactly 13 week-bucket columns
- **Check:** `rh-strip` holds 13 columns (`rh-col-0..12`), oldest→newest left→right.
- **Where:** `RatingsStrip90Day.tsx:39,67,147-166` + `computeBuckets`.
- **Expected:** WEEKS=13; bucket = `floor((now-ts)/7d)` clamp 0..12, reversed so col0=oldest, col12=newest.
- **Verify:** Playwright → count `[data-testid^="rh-col-"]` == 13; a session from this week lands in `rh-col-12`, a ~12-week-old one in `rh-col-0`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.044] Each session in-window becomes one colored cell in its week column
- **Check:** Every session within the 90-day window adds one `rh-cell-<col>-<i>` stacked in its week column.
- **Where:** `RatingsStrip90Day.tsx:70-84,148-165`
- **Expected:** A week with 3 sessions shows 3 cells stacked (`flex-col-reverse`); cells outside [now-90d, now] are excluded.
- **Verify:** Playwright → seed 3 sessions in one week + 1 session 100 days ago → that week's column has 3 cells; the 100-day-old one contributes no cell.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Window boundary: `session.ts < windowStart || > now` is skipped (`:71`) — verify a session exactly at the boundary and a future-dated session are handled (future excluded).

### [04.045] Cell colour maps rating → usor/greu/potrivit/unrated tokens
- **Check:** `ratingBgClass`: usor→`bg-ratingUsor`, greu→`bg-brick`, potrivit→`bg-lineStrong`, null→`bg-line` (unrated).
- **Where:** `RatingsStrip90Day.tsx:50-56,157`
- **Expected:** Each cell's `data-rating` + bg class match the derived rating; unrated (legacy/no-rated-sets) gets the distinct lighter `bg-line`.
- **Verify:** Playwright → seed one of each rating → assert the matching cell `data-rating` (`usor`/`greu`/`potrivit`/`unrated`) + computed background class.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** MED-A-2 fix (`:42-48`): unrated is a SEPARATE bucket from potrivit — verify a legacy session paints `bg-line` (unrated), NOT `bg-lineStrong` (potrivit). Inflating potrivit with unrated would mislead the user + downstream engines.

### [04.046] Aggregate counts (Easy/Right/Hard) reflect real rated sessions
- **Check:** The 3 count numbers (`count-usor`/`count-potrivit`/`count-greu`) equal the real per-rating session counts in the window.
- **Where:** `RatingsStrip90Day.tsx:80-83,169-192` + `computeBuckets` counts.
- **Expected:** counts.usor/potrivit/greu == number of in-window sessions whose derived rating is each value. Unrated sessions are NOT counted in any of the three.
- **Verify:** Playwright → seed 2 easy + 1 hard + 3 fair + 1 unrated (all in-window) → `count-usor`==2, `count-greu`==1, `count-potrivit`==3 (unrated excluded).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Count-up snaps to final under reduced-motion (`useCountUp`) — read the settled value.

### [04.047] Count numbers use the state-token colors (volt/aqua/ember)
- **Check:** Easy count = volt, Right count = aqua, Hard count = ember.
- **Where:** `RatingsStrip90Day.tsx:172,180,188` (`color="var(--volt|aqua|ember)"`)
- **Expected:** Hero count numbers colored by state. Cross-ref §11.
- **Verify:** Playwright → computed `color` of `count-usor`==volt, `count-potrivit`==aqua, `count-greu`==ember.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.048] Each count has a felt-bar scaled to the busiest count
- **Check:** The decorative bar under each count is `value/maxCount * 100%` wide; `maxCount = max(usor,potrivit,greu,1)`.
- **Where:** `RatingsStrip90Day.tsx:108-125,133`
- **Expected:** The largest count's bar is full-width; bars are `aria-hidden` (decorative — meaning carried by number+label).
- **Verify:** Playwright → with counts 2/3/1, the potrivit bar (max=3) is ~100%, usor ~66%, greu ~33%; bars `aria-hidden`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Div-by-zero guard: `max>0 ? ... : 0` (`:109`) — empty account → 0% bars (not NaN).

### [04.049] Count labels + group aria-labels render via i18n with localized pluralization
- **Check:** Labels use `istoric.ratingsStrip.{easy,right,hard}`; group aria-labels interpolate a locale-aware session count (`pluralRo` for RO, `sessions_one/other` for EN).
- **Where:** `RatingsStrip90Day.tsx:29-36,170,175,178,183,186,191` + `Kicker`
- **Expected:** RO uses pluralRo "de" rule (1 sesiune / 2 sesiuni / 20 de sesiuni); EN singular/plural. Cross-ref §09 + §10.
- **Verify:** Playwright RO → group aria-label for a count of 20 contains "20 de sesiuni"; EN → "20 sessions". For count 1 → "1 sesiune" / "1 session".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.050] Footer copy shows the honest total of RATED sessions
- **Check:** `ratings-footer` shows `counts.total` (rated only — excludes unrated), via `footerLead` + bolded count + `footerCountSuffix`.
- **Where:** `RatingsStrip90Day.tsx:80-83,195-201`
- **Expected:** total == usor+potrivit+greu (NOT including unrated). The bolded number is the honest count of sessions the user actually rated.
- **Verify:** Playwright → seed 3 rated + 2 unrated in-window → footer bold number == 3 (NOT 5).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the honesty pin for the strip — a footer of 5 when only 3 were rated would be the exact MED-A-2 class bug.

### [04.051] Empty/insufficient data → strip degrades honestly (no fabricated bars)
- **Check:** On a fresh account, the strip shows 0 counts, empty columns, 0% bars, footer total 0 — no fake activity.
- **Where:** `RatingsStrip90Day.tsx:130-204` with empty `sessionsHistory`.
- **Expected:** All counts 0, no `rh-cell-*` painted, footer total 0. Cross-ref §15.
- **Verify:** Playwright on T0 account → `count-usor`/`potrivit`/`greu` all 0; `rh-strip` has no cells; footer total 0.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The strip has no dedicated "empty card" — confirm a 0/0/0 strip still reads sensibly (not visually broken) on a fresh account; flag as PARTIAL if it looks like an error rather than "nothing yet".

---

## 04.F — Session list (VirtualSessionList.tsx)

### [04.052] List renders reverse-chrono (newest session first)
- **Check:** `Istoric` sorts `sessionsHistory` by `b.ts - a.ts` before passing to the list.
- **Where:** `Istoric.tsx:47,168-173`
- **Expected:** The most recent session is the first card; oldest last.
- **Verify:** Playwright → seed 3 sessions with known timestamps → `istoric-session-0` is the newest, `istoric-session-2` the oldest.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.053] List is a labeled role=list with one card per session
- **Check:** `istoric-list` is `role="list"` with `aria-label={t('istoric.virtualList.ariaLabel')}` and one `<li>` per visible session.
- **Where:** `VirtualSessionList.tsx:216-223`
- **Expected:** One card per session (modulo virtualization windowing). Cross-ref §10.
- **Verify:** Playwright with < 30 sessions → number of `istoric-session-*` cards == session count; list has a localized aria-label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.054] Under threshold (≤30) the list renders ALL rows (no windowing)
- **Check:** When `sorted.length <= VIRTUALIZE_THRESHOLD` (30), every row renders; no spacer pads.
- **Where:** `VirtualSessionList.tsx:57,175,178-180,211-214`
- **Expected:** No `istoric-list-pad-top`/`-pad-bottom`; all cards present (this is what keeps jsdom tests green — no real layout).
- **Verify:** Playwright with 10 sessions → 10 cards, zero pad elements.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.055] Over threshold (>30) windowing renders a visible subset + spacers
- **Check:** With > 30 sessions, only the visible window + overscan render, bracketed by `istoric-list-pad-top`/`-pad-bottom` spacers that preserve scroll height.
- **Where:** `VirtualSessionList.tsx:175,177-209,211-248`
- **Expected:** Fewer than N cards in the DOM at once; pad spacers sized `start*ROW_HEIGHT` / `(N-end)*ROW_HEIGHT`; total scrollable height == N*ROW_HEIGHT.
- **Verify:** Playwright (real browser, NOT jsdom) → seed 60 sessions → assert rendered cards < 60 + both pad spacers present; scroll down → a later card mounts + earlier ones unmount; the drilled-down index stays correct.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Window-scroll model (page scroll, not internal container) — verify on the real Layout where `main` is `flex-1` with no inner overflow.

### [04.056] Card title renders the real session title
- **Check:** Each card shows `session.title` in the display font, truncated.
- **Where:** `VirtualSessionList.tsx:110-112`
- **Expected:** Title == the persisted `LastSessionSummary.title`; long titles truncate (no overflow).
- **Verify:** Playwright → seed a session with a known title → `istoric-session-0` shows that exact title.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.057] Card date eyebrow renders localized weekday · day month
- **Check:** The mono date line == `formatDate(session.ts)` = "`<weekday> · <day> <month>`" via `weekdays.relativeShort` + `months.short`.
- **Where:** `Istoric.tsx:31-38,122` + card `:122`
- **Expected:** EN "Mon · 7 May"; RO "luni · 7 mai" (lower-case, no-diacritics per D-LEGACY-064). Cross-ref §09.
- **Verify:** Playwright → seed a session on a known date → card date matches the localized weekday + day + short month; RO has no diacritics.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `formatDate` deliberately avoids `Intl.DateTimeFormat` (ICU emits RO diacritics) — verify no "marți/sâmbătă" diacritics leak (cross-ref §09 no-diacritics scanner).

### [04.058] Card meta row shows numeric min · sets · kg when present
- **Check:** When numeric fields exist, the meta row shows `durationMin` min, `sets` sets, `volumeKg` kg, each via i18n unit label.
- **Where:** `VirtualSessionList.tsx:93-96,134-154`
- **Expected:** Bold mono numbers + localized `cardMinutes`/`cardSets`/`cardKg` labels. Volume formatted `toLocaleString('en-US')`.
- **Verify:** Playwright → seed a session with durationMin=52, sets=5, volumeKg=12450 → card shows "52 min · 5 sets · 12,450 kg" (localized labels).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Volume uses `en-US` grouping (comma) here vs IstoricDetail's `formatKg` (space-grouped RO style, `:61-63`) — note the cross-screen thousands-separator INCONSISTENCY (card "12,450 kg" vs detail "12 450 kg"). Likely PARTIAL on cross-screen numeric consistency.

### [04.059] Legacy session (no numeric fields) falls back to the meta string
- **Check:** A session with no `durationMin`/`sets`/`volumeKg` shows the legacy `session.meta` string instead of the numeric row.
- **Where:** `VirtualSessionList.tsx:93-96,134,155-156`
- **Expected:** `hasNumeric` false → render `<p>{session.meta}</p>`. No empty numeric row, no fabricated 0s.
- **Verify:** Playwright → seed a legacy session (only title+meta+ts) → card shows the meta string, no numeric badges.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.060] Rating Pill (Easy/Right/Hard) is derived + colored by token
- **Check:** A card with a derivable rating shows a `Pill` labeled Easy/Right/Hard, colored volt/aqua/ember; no chip when rating is null.
- **Where:** `VirtualSessionList.tsx:63-67,88-89,124-132`
- **Expected:** usor→Easy/volt, potrivit→Right/aqua, greu→Hard/ember. Legacy (null) → no Pill, ChevronRight shown instead.
- **Verify:** Playwright → seed an easy / hard / fair / legacy session → cards show the matching Pill (label + color) for the first three; the legacy card shows a chevron, no Pill.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Reuses `istoric.ratingsStrip.{easy,right,hard}` keys — chip label honesty: derived from real sets, NOT fabricated (header comment `:18-21`).

### [04.061] Trophy badge shows ONLY when a session has a real PR set
- **Check:** A card shows a Trophy (`istoric-session-<i>-pr`) iff any set in any exercise has `isPR === true`.
- **Where:** `VirtualSessionList.tsx:69-73,113-120`
- **Expected:** PR session → trophy with `aria-label={t('istoric.landing.prBadgeAria')}`; non-PR + legacy → no trophy.
- **Verify:** Playwright → seed a session with a PR set vs one without → only the PR card shows `istoric-session-0-pr`; trophy has a localized aria-label.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** PR source is the real `isPR` flag (header `:69-73`), NOT the mockup's `ex.id==='bench'` shortcut — verify no hardcoded exercise-name PR.

### [04.062] Card uses Pulse glass surface + press feedback + hover lift
- **Check:** Each card button is `pulse-card pulse-card-tight ... press-feedback transition-transform hover:scale-[1.01]`.
- **Where:** `VirtualSessionList.tsx:105`
- **Expected:** Consistent glass surface + tactile feedback; reduced-motion collapses the lift. Cross-ref §10 + §11.
- **Verify:** Inspect class; screenshot-diff a card vs mockup session card.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.063] Tapping a card navigates to its IstoricDetail by ORIGINAL index
- **Check:** Tapping a card calls `onSelect(originalIdx)` → navigate `/app/istoric/<originalIdx>`, where originalIdx is the index in unsorted `sessionsHistory`.
- **Where:** `VirtualSessionList.tsx:100-102,227-238` (`originalIdx = sessionsHistory.findIndex(s => s.ts === session.ts)`) + `Istoric.tsx:172`.
- **Expected:** The detail screen opens the SAME session that was tapped (sorted-display index mapped back to storage index).
- **Verify:** Playwright → tap the 2nd card (newest-1) → URL `/app/istoric/<n>` → detail title matches the tapped card's title.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** ⚠️ `findIndex(s => s.ts === session.ts)` keys on timestamp. Two sessions with an IDENTICAL `ts` (e.g. seeded duplicates or a same-ms finish) would both map to the FIRST match → tapping the 2nd opens the 1st. Seed a same-`ts` pair and verify; flag as a latent FAIL if it mis-navigates.

### [04.064] Card carries data-session-idx == original index for test truth
- **Check:** Each card button has `data-session-idx={originalIdx}` matching the navigate target.
- **Where:** `VirtualSessionList.tsx:103`
- **Expected:** `data-session-idx` == the index used in navigation.
- **Verify:** Playwright → read `data-session-idx` of a card → equals the `/app/istoric/<n>` it navigates to.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 04.G — History empty state (0 sessions)

### [04.065] Zero sessions → empty card replaces the list
- **Check:** When `sorted.length === 0`, the `istoric-empty` block renders instead of `istoric-list`.
- **Where:** `Istoric.tsx:139-174`
- **Expected:** Empty card shown; no list, no session cards.
- **Verify:** Playwright on T0 account → `istoric-empty` present, `istoric-list` absent.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.066] Empty state shows accent halo icon + localized title + body
- **Check:** Empty card has a brick radial-halo History icon + `emptyTitle` heading + `emptyBody` copy, both via i18n.
- **Where:** `Istoric.tsx:144-163`
- **Expected:** Localized title + body (EN/RO); icon `aria-hidden`; `animate-card-rise` mount. Cross-ref §09 + §10.
- **Verify:** Playwright on T0 → title == `istoric.landing.emptyTitle`, body == `emptyBody` (localized); `grep` confirms no hardcoded copy.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.067] Empty state — calendar + ratings strip + stats still render (0 values)
- **Check:** On a fresh account, the calendar (current month, no dots) + ratings strip (0 counts) + 3 stat tiles (0) still render above the empty session card.
- **Where:** `Istoric.tsx:95-99` (always mounted) + 04.013 + 04.051.
- **Expected:** The page is not blank — only the SESSION LIST shows the empty card; calendar/strip/tiles render their own zero states.
- **Verify:** Playwright on T0 → `calendar-heatmap` + `ratings-strip-90day` + `istoric-stats-grid` all present; only `istoric-empty` for the list.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Inline PR-wall (`istoric-pr-wall`) is correctly HIDDEN at 0 PRs (`Istoric.tsx:103`) — verify it does NOT render on empty.

---

## 04.H — Inline PR-wall preview (Istoric home)

### [04.068] Inline PR-wall section renders ONLY when PRs exist
- **Check:** The `istoric-pr-wall` section appears iff `getPRHistoryAll().length > 0`.
- **Where:** `Istoric.tsx:51,103-134`
- **Expected:** Hidden on accounts with no PR sets; shown when >= 1 PR exists.
- **Verify:** Playwright -> T0/no-PR account -> `istoric-pr-wall` absent; seed a PR session -> it appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.069] Inline PR-wall heading shows the real PR count
- **Check:** Heading == `t('istoric.landing.recordsHeading', { n: prHistory.length })` with the trophy ember icon.
- **Where:** `Istoric.tsx:106-109`
- **Expected:** EN "Records (N)" / RO "Recorduri (N)" where N == number of PR rows. Trophy icon `var(--ember)`, `aria-hidden`.
- **Verify:** Playwright -> seed 4 PR sets -> heading reads "Records (4)" (localized); N matches the row count.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** N here MUST equal the `stats-pr` tile (04.008) — both count per-set `isPR`.

### [04.070] Inline PR rows list every PR newest-first with exercise + summary
- **Check:** Each `pr-row-<idx>` shows the exercise name + `recordSummary` ({kg} kg x {reps} (~{oneRM} kg 1RM)).
- **Where:** `Istoric.tsx:119-132` + source `prHistoryAggregate.ts:40-63`.
- **Expected:** Rows sorted by `sessionTs` desc; oneRM is the PER-SET Epley estimate (`kg*(1+reps/30)`), NOT the exercise peak.
- **Verify:** Playwright -> seed a known PR set (e.g. 100kg x 5) -> row shows "100 kg x 5 (~117 kg 1RM)" (localized template); rows newest-first.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** MED-CODE-19 fix (`prHistoryAggregate.ts:13-22,34-37`): oneRM is the SET's own Epley estimate, not `ex.peakOneRM` — verify a multi-set exercise shows the actual set 1RM, not the inflated exercise peak.

### [04.071] "See all" link navigates to the standalone PR Wall screen
- **Check:** `istoric-pr-wall-see-all` navigates to `gotoPath('pr-wall')` -> `/app/istoric/pr-wall`.
- **Where:** `Istoric.tsx:110-117` + router `router.tsx:190`.
- **Expected:** Tap -> PrWall screen mounts (route ordered before `:sessionId` so 'pr-wall' is not captured as a param — `router.tsx:188-191`).
- **Verify:** Playwright -> tap "See all" -> URL `/app/istoric/pr-wall` -> `pr-wall` screen present (NOT IstoricDetail).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Route ordering is load-bearing (Karpathy SC) — verify 'pr-wall' does NOT match the `:sessionId` param route.

### [04.072] Inline PR rows use Pulse glass + i18n "See all" label
- **Check:** Rows are `pulse-card pulse-card-tight`; the link text is `t('istoric.landing.seeAll')`.
- **Where:** `Istoric.tsx:114,116,124`
- **Expected:** Glass rows; localized link (EN "See all" / RO "Vezi toate"). Cross-ref §09 + §11.
- **Verify:** Inspect class + `grep` confirms no hardcoded "See all"/"Vezi toate"; keys exist in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

---

## 04.I — IstoricDetail sub-screen (per-session breakdown)

### [04.073] Valid sessionId renders the detail screen
- **Check:** `/app/istoric/<validIdx>` renders `istoric-detail` for `sessionsHistory[idx]`.
- **Where:** `IstoricDetail.tsx:65-74,99-103`
- **Expected:** idx finite, 0 <= idx < length -> session resolved; screen mounts.
- **Verify:** Playwright -> navigate from a card -> `istoric-detail` present with the tapped session.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.074] Invalid/out-of-range sessionId shows the missing state
- **Check:** A non-finite or out-of-range idx renders `istoric-detail-missing` with a localized message + back button.
- **Where:** `IstoricDetail.tsx:70-97`
- **Expected:** e.g. `/app/istoric/999` (no such session) -> missing card with `istoric.detail.missing` + `backToHistory` button.
- **Verify:** Playwright -> navigate to an out-of-range index -> `istoric-detail-missing` present; tap back -> `/app/istoric`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Reload-on-detail risk: if reloaded directly on `/app/istoric/2` and the store rehydrates, the idx must still resolve — verify persistence (cross-ref §08) keeps the index valid post-reload.

### [04.075] Detail header — back button localized aria + display-font title
- **Check:** Header has `istoric-detail-back` with `aria-label={t('istoric.detail.backAria')}` + an `<h1>` = `session.title` in display font.
- **Where:** `IstoricDetail.tsx:104-115`
- **Expected:** Back arrow icon `aria-hidden`; title is the real session title. Cross-ref §10.
- **Verify:** Playwright -> back button has localized aria-label; h1 == session title; tap back -> `/app/istoric`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.076] Detail session card shows date . time + meta
- **Check:** A `pulse-card` shows the localized `formatDate(ts) . formatTime(ts)` + the `session.meta` string, under an aqua "session" kicker.
- **Where:** `IstoricDetail.tsx:117-128,27-33,52-57`
- **Expected:** `istoric-detail-date` == "`<weekday> . <day> <month> . HH:MM`"; `istoric-detail-meta` == `session.meta`. Time zero-padded 24h.
- **Verify:** Playwright -> seed a session at a known datetime -> date line matches localized format + "HH:MM"; meta line == the stored meta.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Date format mirrors the list `formatDate` (cross-screen consistency) — verify no diacritics in RO (cross-ref §09).

### [04.077] Detail stat tiles (sets / minutes / tonnage) are PULSE cards — bare-tile fix
- **Check:** When numeric fields exist, the 3 stat tiles (`detail-sets`/`detail-duration`/`detail-volume`) are `pulse-card pulse-card-tight`, NOT bare flat tiles.
- **Where:** `IstoricDetail.tsx:130-154`
- **Expected:** Each tile is a glass pulse-card with a mono uppercase eyebrow + display-font tabular number. (This is the "bare-tile fix" the prompt references.) Cross-ref §11.
- **Verify:** Playwright -> seed numeric session -> each detail stat tile has class `pulse-card`; screenshot-diff vs mockup detail tiles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Confirm the bare-tile regression did not recur — flat tiles here would be a parity FAIL.

### [04.078] Detail stat values match the session's real numerics
- **Check:** `detail-sets`==`session.sets`, `detail-duration`==`session.durationMin`, `detail-volume`==`formatKg(session.volumeKg)`.
- **Where:** `IstoricDetail.tsx:135-152,61-63`
- **Expected:** Values equal the persisted fields; volume formatted with space thousands separator (RO style, "12 450").
- **Verify:** Playwright -> seed sets=5/min=52/vol=12450 -> tiles show 5 / 52 / "12 450".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Detail volume "12 450" (space, `formatKg` `:61-63`) vs the LIST card "12,450" (comma, `VirtualSessionList.tsx:150` `en-US`). Cross-screen separator INCONSISTENCY — flag PARTIAL (cross-ref 04.058).

### [04.079] Stat-tile grid hidden when no numeric fields (legacy session)
- **Check:** The stats grid renders only when at least one of sets/durationMin/volumeKg is defined.
- **Where:** `IstoricDetail.tsx:130`
- **Expected:** A legacy session (no numerics) shows no stat tiles, no fabricated 0s.
- **Verify:** Playwright -> open a legacy session detail -> no `istoric-detail-stats-grid`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.080] Per-exercise breakdown renders when exercises[] present
- **Check:** When `session.exercises.length > 0`, `istoric-detail-breakdown` lists one `detail-ex-<id>` card per exercise.
- **Where:** `IstoricDetail.tsx:159-208`
- **Expected:** One card per exercise with name + 1RM + volume + a per-set table.
- **Verify:** Playwright -> seed a session with 2 exercises -> 2 `detail-ex-*` cards under the breakdown heading.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.081] Exercise card header — name + peak 1RM
- **Check:** Each exercise card shows `ex.exerciseName` + `detail-ex-1rm` = `exerciseOneRm` with `formatKg(ex.peakOneRM)`.
- **Where:** `IstoricDetail.tsx:170-175`
- **Expected:** 1RM == the exercise-level peak Epley estimate, formatted. Localized template.
- **Verify:** Playwright -> seed an exercise with known peakOneRM -> card shows the formatted 1RM via the localized template.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** This is the EXERCISE peak (correct here); contrast with the per-SET 1RM in PR rows (04.070) — different scopes, both intentional.

### [04.082] Exercise volume + sets-count line is locale-pluralized
- **Check:** `detail-ex-volume` shows `exerciseVolumeSets` with `formatKg(ex.totalVolume)` + `formatSetsLabel(ex.sets.length)` (RO pluralRo / EN one/other).
- **Where:** `IstoricDetail.tsx:176-181,37-42`
- **Expected:** RO "3 seturi" / "1 set" / "21 de seturi" via pluralRo; EN "3 sets" / "1 set". Cross-ref §09.
- **Verify:** Playwright RO -> an exercise with 21 sets -> "21 de seturi"; with 1 set -> "1 set". EN -> "21 sets" / "1 set".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.083] Per-set table renders each set with kg / reps / rating
- **Check:** The table has localized headers (set/kg/reps/rating) + one row per set with `idx+1`, kg, reps, localized rating label.
- **Where:** `IstoricDetail.tsx:182-205,44-50`
- **Expected:** `detail-set-<exId>-<idx>` per set; rating via `ratingLabel` (localized usor/potrivit/greu, unknown surfaced verbatim).
- **Verify:** Playwright -> seed an exercise with 3 sets -> 3 rows; kg/reps match the seeded sets; rating column localized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.084] PR set rows are highlighted + flagged "PR"
- **Check:** A set with `isPR` renders `text-succ font-semibold` and appends " PR" to the set number.
- **Where:** `IstoricDetail.tsx:196-198`
- **Expected:** PR set rows visually distinct (success color) + " PR" suffix; non-PR rows plain ink.
- **Verify:** Playwright -> seed a PR set -> its row has the success color + "PR" text; non-PR rows plain.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The " PR" literal is appended outside `t()` (`:198`) — borderline, but a fixed acronym (matches the trophy convention). Note if the §09 scanner flags it.

### [04.085] Legacy session (no exercises) shows the localized fallback note
- **Check:** When `exercises` is absent/empty, `istoric-detail-legacy` shows `t('istoric.detail.legacyFallback')` instead of a breakdown.
- **Where:** `IstoricDetail.tsx:159,209-216`
- **Expected:** A localized italic note explaining no per-exercise data for legacy sessions; no empty table.
- **Verify:** Playwright -> open a legacy session -> `istoric-detail-legacy` present with localized copy; no breakdown table.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Honest: no fabricated sets for sessions predating breakdown persistence.

### [04.086] Detail breakdown values trace to the SAME session as calendar/list
- **Check:** The exercises + sets + ratings shown match the source `LastSessionSummary.exercises` exactly (no recompute drift).
- **Where:** `IstoricDetail.tsx:68,159-205` reading `sessionsHistory[idx].exercises`.
- **Expected:** Sets kg/reps/rating/isPR rendered verbatim from storage; totalVolume/peakOneRM are the persisted aggregates.
- **Verify:** Playwright -> compare a detail card's set values against the seeded `exercises[*].sets[*]` for that session -> exact match.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-consistency: the calendar dot tier (04.026) for this session's day should agree with the breakdown's `deriveSessionRating` — verify they tell the same story.

---

## 04.J — PrWall standalone sub-screen (/app/istoric/pr-wall)

### [04.087] PrWall mounts with SubHeader + back to History
- **Check:** `pr-wall` renders a `SubHeader` titled `istoric.prWallScreen.title` with a `pr-wall-back` that returns to `/app/istoric`.
- **Where:** `PrWall.tsx:43-49` + router `router.tsx:190`.
- **Expected:** Localized title; back navigates to History home.
- **Verify:** Playwright -> open pr-wall -> SubHeader title localized; tap `pr-wall-back` -> `/app/istoric`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.088] PrWall description copy is localized
- **Check:** The intro paragraph uses `t('istoric.prWallScreen.description')`.
- **Where:** `PrWall.tsx:52-54`
- **Expected:** Localized; no hardcode. Cross-ref §09.
- **Verify:** `grep` confirms no literal; key in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.089] PrWall — 3 stat tiles: Total / This month / Exercises
- **Check:** `pr-wall-stats` shows total PR count, this-month count, distinct-exercise count in 3 pulse tiles.
- **Where:** `PrWall.tsx:34-41,56-75`
- **Expected:** `pr-wall-stat-total`==prList.length; `pr-wall-stat-month`==PRs in current month/year; `pr-wall-stat-exercises`==distinct exerciseId count.
- **Verify:** Playwright -> seed PRs across 2 exercises, 2 this month + 1 last month -> total=3, month=2, exercises=2.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `pr-wall-stat-total` MUST equal the inline PR-wall count + the History `stats-pr` tile — all from `getPRHistoryAll().length` / Σ isPR. Flag any divergence.

### [04.090] PrWall stat labels localized
- **Check:** Labels use `prWallScreen.statTotal` / `statMonth` / `statExercises`.
- **Where:** `PrWall.tsx:61,67,73`
- **Expected:** Localized; no hardcode. Cross-ref §09.
- **Verify:** `grep` confirms no literal labels; keys in both bundles.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Stat numbers use `font-mono` here (`:58,64,70`) vs the History tiles' `font-display tabular-nums` — minor cross-screen typographic inconsistency; note if §11 flags it.

### [04.091] PrWall lists every PR row newest-first with award icon + name + line
- **Check:** Each `pr-wall-row-<idx>` shows an Award icon + exercise name + `rowLine` ({kg} kg x {reps} . {date}).
- **Where:** `PrWall.tsx:99-124,22-28` + source `getPRHistoryAll()`.
- **Expected:** Rows sorted newest-first by sessionTs; date via `formatPrDate` (localized `prDate.format` with `months.short`).
- **Verify:** Playwright -> seed PRs -> rows show name + localized "{kg} kg x {reps} . {date}"; newest first; date no-diacritics in RO.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `formatPrDate` uses `months.short` + `prDate.format` (`PrWall.tsx:22-28`) — verify RO month abbreviations are lower-case no-diacritics (cross-ref §09).

### [04.092] PrWall row values trace to the real PR set
- **Check:** Each row's kg/reps match the source set; the same PR appears in the inline preview + detail.
- **Where:** `PrWall.tsx:113-117` reading `PRRecord` fields from `prHistoryAggregate.ts:48-60`.
- **Expected:** Row kg==set.kg, reps==set.reps for the PR set; consistent across inline-preview/PrWall/detail.
- **Verify:** Playwright -> seed a 100kg x 5 PR -> it shows identically in the inline preview row, PrWall row, and the detail per-set table (with PR highlight).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-surface PR consistency is the integrity pin for PRs.

### [04.093] PrWall row uses Pulse glass + award badge + chevron
- **Check:** Each row is `pulse-card pulse-card-tight` with an Award badge tile + name + line + a trailing ChevronRight (drill-down deferred post-Beta).
- **Where:** `PrWall.tsx:101-121`
- **Expected:** Glass row; chevron is `aria-hidden` and currently NON-interactive (V1 read-only per header `:8-10`). Cross-ref §11.
- **Verify:** Playwright -> row has `pulse-card`; chevron present + `aria-hidden`; tapping the row does nothing (no nav) in V1.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** The trailing ChevronRight on a non-interactive row is a false affordance (suggests drill-down that does not exist in V1). Flag PARTIAL on affordance honesty — either make it interactive or drop the chevron until drill-down lands.

### [04.094] PrWall empty state (0 PRs) — accent halo + localized title/body
- **Check:** When `prList.length === 0`, `pr-wall-empty` shows an Award halo icon + `emptyTitle` + `emptyBody`.
- **Where:** `PrWall.tsx:77-98`
- **Expected:** Localized empty card; stat tiles still show 0/0/0 above it (not hidden). Cross-ref §09 + §15.
- **Verify:** Playwright on no-PR account -> `pr-wall-empty` present, `pr-wall-list` absent, stats all 0.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A fresh account deep-linking to pr-wall must not crash — `getPRHistoryAll` returns [] -> empty state.

---

## 04.K — Calendar7Day cross-tab note (Coach-tab schedule strip)

### [04.095] Calendar7Day is a COACH-tab component, not History (scope note)
- **Check:** `Calendar7Day` is mounted on the Coach (Antrenor) tab via `scheduleStore`, NOT on the History tab.
- **Where:** `src/react/components/Calendar7Day.tsx:37-44` (reads `useScheduleStore`); NOT imported by `Istoric.tsx`.
- **Expected:** The History tab's only calendar is `CalendarHeatmap`. `Calendar7Day` belongs to §02 (Coach). Checked here ONLY for cross-tab token consistency.
- **Verify:** `grep -n "Calendar7Day" src/react/routes/screens/istoric/*.tsx` -> zero matches (not on History); `grep -rn "Calendar7Day" src/react/routes/screens/antrenor/` -> mounted on Coach.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Full Calendar7Day behaviour (edit toggle, save, Monday reset, training/rest tokens) is audited in §02 — do not double-score here. This step only pins the scope boundary.

### [04.096] Cross-tab calendar token consistency (today marker + day labels)
- **Check:** Both calendars treat "today" with an accent marker and use Monday-first day labels from i18n.
- **Where:** `CalendarHeatmap.tsx:191,202` (today = brick ring) + `Calendar7Day.tsx:68,135-138` (today = aqua outline); day labels via i18n (`calendar.heatmap.dayLabels.*` / `calendar.day7.dayLabels.*`).
- **Expected:** Document the divergence: History today = brick accent ring; Coach 7-day today = aqua outline. Flag whether intentional. Cross-ref §11.
- **Verify:** Playwright -> History today cell ring color (brick) vs Coach 7-day today outline color (aqua) -> note the divergence; both day-label sets Monday-first + localized.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Likely PARTIAL: two different "today" accent colors across the two calendars is a minor cross-tab inconsistency. Surface it; Daniel decides if intended (different semantics — heatmap vs schedule).

---

## 04.L — Data wiring + persistence integrity (cross-ref §08)

### [04.097] Every History number derives from sessionsHistory (single SoT)
- **Check:** Stats, calendar dots, ratings strip, PR rows all read from `useWorkoutStore().sessionsHistory` (plus the `streak` scalar) — no second source.
- **Where:** `Istoric.tsx:42,50-51`; `prHistoryAggregate.ts:41,67`; `useSessionsByDate.ts:27`; `RatingsStrip90Day.tsx:131`.
- **Expected:** One source of truth; the only non-list value is `streak` (a stored scalar, 04.006).
- **Verify:** `grep -n "sessionsHistory\|getState().streak" src/react/routes/screens/istoric/*.tsx src/react/components/Istoric/*.tsx src/react/lib/prHistoryAggregate.ts` -> all reads target the store; no parallel cache.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** `streak` is the documented exception — NOT recomputed from the calendar's logged days, so a streak/calendar mismatch is a real (intended-but-flaggable) split (cross-ref §08).

### [04.098] sessionsHistory + streak survive reload (persisted)
- **Check:** `workoutStore.partialize` persists `sessionsHistory` + `streak` + `lastStreakDate` so History survives a reload.
- **Where:** `workoutStore.ts:648-656` (partialize) + persist `name`.
- **Expected:** After logging a session, reload -> History still shows that session + stats. Cross-ref §08 + §15 never-delete.
- **Verify:** Playwright -> seed sessions -> reload -> History list + stats unchanged; `JSON.parse(localStorage[<workout key>]).state` contains `sessionsHistory` + `streak`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** A History tab that empties on reload = a never-delete invariant FAIL (cross-ref §15).

### [04.099] 500-session cap drops OLDEST, keeps newest (never-delete-recent)
- **Check:** `sessionsHistory` cap is newest-tail `slice(-SESSIONS_HISTORY_MAX)` (500) — appends drop the OLDEST, never the newest.
- **Where:** `workoutStore.ts:182-188,546` (`SESSIONS_HISTORY_MAX`).
- **Expected:** At 501 sessions, the oldest is dropped; the just-finished session always retained. The 90-day consumers are unaffected (window << 500).
- **Verify:** Behaviour/unit: append 501 sessions -> length 500, newest present, oldest gone. Cross-ref §08 + §15.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cap is silent (no user notice) — acceptable since 500 ~ 1.4 years daily; document for §15.

### [04.100] Local-date keying avoids UTC midnight cell-shift
- **Check:** `localKey` uses `getFullYear/Month/Date` (local), NOT `toISOString` (UTC), so a late-night session keys to the local calendar day.
- **Where:** `useSessionsByDate.ts:18-24`
- **Expected:** A session logged at 23:30 local maps to that local day's cell, not the next UTC day.
- **Verify:** Unit/behaviour with a TZ offset -> a 23:30-local ts produces the correct local `YYYY-MM-DD` key.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Calendar dots + detail dates must agree on the same local day — verify no off-by-one across midnight.

---

## 04.M — Parity meta + harness (cross-ref §11)

### [04.101] No History element inherits a generic token where the mockup names a colour
- **Check:** No reskinned History element falls back to a muted default (`text-ink3`, olive `heatRecovery`) where the mockup specifies a distinct colour.
- **Where:** systemic — root cause of 04.022 (weekday `text-ink3` vs aqua) + 04.038 (Recovery `heatRecovery` vs violet). Cross-ref §11.901.
- **Expected:** Every element whose mockup CSS sets an explicit colour has the live element keyed to the SAME token.
- **Verify:** Screenshot-diff each History screen vs `interfata-noua/` `screens-tabs.jsx#IstoricScreen` (rendered) at near-zero diff ratio -> coloured-region deltas surface the misses.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(pre-filled — at least 2 confirmed: 04.022, 04.038)*
- **Evidence:** Confirmed instances: weekday letters `text-ink3` (`CalendarHeatmap.tsx:159`), Recovery dot `heatRecovery` (`:286-287`). Both inherit a generic/muted token instead of the mockup's explicit aqua/violet.
- **Notes:** META-CHECK that explains the bug class Daniel found. Treat any new instance as FAIL. Fix pattern: key off the same Pulse token the mockup uses.

### [04.102] History components use Pulse tokens only — zero raw hex
- **Check:** History/Calendar/Ratings/list components reference Pulse tokens (`var(--volt)`, `text-brick`, etc.), not raw hex.
- **Where:** `Istoric.tsx`, `CalendarHeatmap.tsx`, `RatingsStrip90Day.tsx`, `VirtualSessionList.tsx`, `IstoricDetail.tsx`, `PrWall.tsx`.
- **Expected:** No raw `#rrggbb` literals (except documented/WCAG-pinned). Cross-ref §11.902. (Dot colors use `var(--volt|aqua|ember)` + `color-mix`.)
- **Verify:** `grep -nE "#[0-9a-fA-F]{3,6}" src/react/routes/screens/istoric/*.tsx src/react/components/Istoric/*.tsx` -> zero user-facing raw hex.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** _(fill if deviation)_

### [04.103] All History strings pass the i18n no-hardcode + no-diacritics scan
- **Check:** Every user-facing string in the History surface is via `t()`, and RO strings carry no diacritics.
- **Where:** all six files + the date/plural helpers.
- **Expected:** i18n scanner (cross-ref §09) returns zero hardcoded user-facing literals; no-diacritics scan clean on RO output. (Known borderline: " PR" suffix `IstoricDetail.tsx:198` — fixed acronym.)
- **Verify:** Run the §09 string scanner against the History file set; run the no-diacritics check on rendered RO strings.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Cross-ref §09 — the History tab is a known clean zone except the borderline " PR" acronym; confirm the scanner agrees.

### [04.104] Existing History tests pass + encode the real behaviour (not the bugs)
- **Check:** The dedicated test files pass AND assert the correct (not the buggy) colors/values.
- **Where:** `src/react/__tests__/screens/istoric/Istoric.test.tsx`, `PrWall.test.tsx`; `__tests__/components/Istoric/{CalendarHeatmap,RatingsStrip90Day,VirtualSessionList}.test.tsx`.
- **Expected:** `npx vitest run` green for these files; verify no test asserts `text-ink3` weekday or `heatRecovery` Recovery as CORRECT (a test that pins a known-wrong color encodes the bug — per 00-MASTER caution).
- **Verify:** `npx vitest run src/react/__tests__/screens/istoric src/react/__tests__/components/Istoric` -> all pass; inspect for any assertion that locks in the 04.022/04.038 mismatches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** _(fill at audit time)_
- **Notes:** Green tests are necessary, not sufficient — the parity FAILs (04.022/04.038) are NOT caught by jsdom unit tests (no computed-color), which is exactly why §11 screenshot-diff is required.

---

## SECTION 04 SCORECARD (emit after running)

```
SECTION 04 — History (Istoric) + calendar + sessions + PR wall
STEPS: 04.001 - 04.104  (104 atomic checks)
PASS  PART  FAIL  BLOCK   %      GATE   STATUS
--    --    --    --      --%    95%    ----
```

> **Pre-filled findings to confirm (do NOT assume — re-verify each):**
> - **04.022** — weekday header letters render `text-ink3` grey vs mockup `var(--aqua)`. **FAIL** (canonical "days of the week wrong colour" — Daniel smoke 2026-05-29). Cross-ref §11.503 + §11.901.
> - **04.038** — Recovery legend dot `heatRecovery` olive-brown vs mockup `var(--violet)`. **FAIL**. Cross-ref §11.505.
> - **04.040** — legend dot shape `rounded-full` circle vs mockup `.leg-dot` 3px rounded-square. **FAIL** (shape parity). Cross-ref §11.505.
> - **04.101** — META: token-inheritance bug class (root cause of the above). **FAIL** until 04.022/04.038 fixed. Cross-ref §11.901.
>
> **Pre-flagged PARTIALs (documented deviations — record, don't silently pass):**
> - **04.058 / 04.078** — cross-screen thousands-separator inconsistency: list card "12,450 kg" (`en-US` comma) vs IstoricDetail "12 450" (`formatKg` space). Likely PARTIAL.
> - **04.063** — `findIndex(s => s.ts === session.ts)` mis-navigates if two sessions share an identical `ts`. Latent — seed a same-`ts` pair and confirm; FAIL if it opens the wrong session.
> - **04.093** — PrWall row trailing ChevronRight is a false affordance (drill-down deferred post-Beta). PARTIAL on affordance honesty.
> - **04.096** — cross-tab "today" marker color divergence (History brick ring vs Coach 7-day aqua outline). PARTIAL — surface for Daniel; may be intentional.
> - **04.051** — 90-day strip has no dedicated empty card; verify a 0/0/0 strip reads as "nothing yet" not "broken". PARTIAL if it looks like an error.
>
> **Honesty pins (automatic section FAIL if violated):**
> - Any fabricated non-zero stat/dot/count/PR on a FRESH (T0) account (04.013 / 04.027 / 04.051 / 04.094) — no fake memory.
> - `sessionsHistory` emptying on reload (04.098) — never-delete invariant (cross-ref §15).
>
> **GATE reminder:** Section gate is 95% (non-critical). The pre-filled parity FAILs (04.022/04.038/04.040/04.101) are the dominant deductions — fixing the single token-inheritance root cause (§11.901) clears all four at once. Data-wiring + honesty steps are expected PASS on a correctly seeded account; a data FAIL here would be far more serious than the colour parity misses.
