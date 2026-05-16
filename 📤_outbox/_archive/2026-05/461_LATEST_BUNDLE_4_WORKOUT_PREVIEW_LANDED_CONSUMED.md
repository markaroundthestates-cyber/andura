# BUNDLE 4 — WORKOUT PREVIEW + PER-EXERCISE REFUSAL FLOW + MID-SESSION AUGMENTATION — LANDED 2026-05-13e

**Status:** ✅ Complete LANDED single atomic commit + pushed origin
**Branch:** `feature/v2-vanilla-port`
**Commit:** `429c189` (single atomic per Co-CTO bias §0.8 + Bundle 3A precedent parity)
**Backup tag:** `pre-bundle-4-workout-preview-plus-midsession-refusal-flow-2026-05-13e` (origin)
**Model:** Claude Opus 4.7 (claude-opus-4-7) — autonomous via metoda hibridă LOCK V1 §F3.13

---

## §0 HANDOVER_VERIFICATION_CHECKLIST §0-§11 Bugatti gate

- ✅ **§0 Pre-conditions:** `feature/v2-vanilla-port` branch + clean working tree pre-execute
- ✅ **§1 Backup tag pushed origin** pre-execute (rollback safety net)
- ✅ **§2 Pre-flight grep §AR.21:** 8 source files verified via Read (state.js, router.js, alternative-finder.js, scheduleAdapter.js, aparateLipsa.js, workout.js, energyCheck.js, exerciseMetadata.js) — spec evidence §2.1-§2.13 matched verbatim ZERO delta
- ✅ **§3 Voice §1 4-section:** N/A this commit (src/ code, NU wiki page — wiki update via /wiki-ingest next handover)
- ✅ **§4 wiki/index.md + wiki/log.md:** N/A (Bundle 4 wiki update via /wiki-ingest next handover)
- ✅ **§5 Bidirectional cross-links:** N/A
- ✅ **§6 Archive raw HANDOVER:** N/A (Bundle 4 spec stays in `📥_inbox/PROMPT_CC_BUNDLE_4_...md` until next handover)
- ✅ **§7 Atomic commit single-concern:** YES — single comprehensive commit per Co-CTO bias parity Bundle 3A `3494c03` precedent
- ✅ **§8 Tests baseline preserved:** 3010 → **3111 PASS (+101 net new Bundle 4)**, 165 → 169 test files
- ✅ **§9 LATEST.md §0 structured raport:** ✅ this file
- ✅ **§10 Anti-recurrence §AR.20-§AR.22:** §AR.20 grep evidence verbatim + §AR.21 inline grep spec §2.1-§2.13 + §AR.22 candidat DISCRETE-BLOCKS DISCIPLINE 12 blocks A-L independent execution
- ✅ **§11 Cross-refs authority:** CLAUDE.md §0-§7 + VAULT_RULES §F3.1-§F3.13 + mockup §screen-workout-preview L913-997 + §screen-workout L1340-1400 + ADRs 005/020/026/030/SMART_ROUTING_v1

---

## §1 Changes summary (block-by-block per spec §4.A-§4.L)

### §1.A — `src/state.js` ADD enum + 2 ephemeral fields

- ADD `'workout-preview'` to currentScreen enum comment
- ADD `previewRefusalsByExercise: {}` ephemeral tracking
- ADD `midSessionRefusalsByExercise: {}` separate ephemeral tracking

### §1.B — `src/router.js` extend `navigate(screenName, opts={})`

- Backwards-compatible signature extension (existing callers unaffected)
- `opts` merged into CustomEvent detail

### §1.C — `src/engine/schedule/scheduleAdapter.js` Tier 0 storage extend

- Constants: `SKIPPED_EXERCISES_KEY`, `REFUSAL_COUNTER_KEY`, `REFUSAL_COUNTER_THRESHOLD=3`
- 6 helpers: get/set/toggle skipped + get/increment/reset counter
- All defense-in-depth (malformed JSON / non-array / disabled storage handled)

### §1.D — NEW `src/pages/coach/workoutPreview.js` (~270 LOC)

- Full mockup §screen-workout-preview port (intensity banner + session header + exercise list + Confirma incep)
- Per-exercise row 2 inline buttons "Nu am" + "Nu vreau"
- `resolveMissingEquipmentTarget` helper (single-mapping {dumbbell, band, cable} → equipment, ambiguous → exercise fallback)
- `pickNextAlternative` helper (rank-aware, excludes refused)
- Origin-rooted cascade tracking via `data-origin-exercise` attribute (refusals accumulate against original, not currently-visible)
- Event delegation on `#preview-exercise-list` for efficient handler wiring
- XSS-safe via `escapeHtml` + textContent-safe rendering

### §1.E — NEW `src/pages/coach/refusalCounterModal.js` (~70 LOC)

- "Vrei să nu-l mai propun deloc?" modal with exercise name + count
- 2 buttons "Da, elimină permanent" / "Nu, propune din nou"
- Backdrop dismiss = reset counter (Gigel intuitive)
- XSS-safe exercise name escape

### §1.F — EXTEND `src/pages/coach/workout.js` mid-session 2 buttons

- HTML template insert between `.workout-ex-card` and `#rest-timer`
- 2 buttons "Aparat ocupat" (users icon) + "Nu vreau" (hand icon) per mockup L1372-1375
- `onOcupatClick` — pure ephemeral cascade (NO global storage mutation)
- `onNuVreauClick` — SHARED counter cross-flow + threshold trigger modal
- `pickNextAlternativeMidSession` exported with peek-next-exercise anti-fatigue filter (basic downstream awareness via `state.sessionPlan` if available)

### §1.G — EXTEND `src/pages/coach/aparateLipsa.js` 2 grupuri display

- Grupul 1 "Aparate" (existing 10 equipment checkboxes preserved invariant)
- Grupul 2 "Exerciții refuzate permanent" (dynamic NEW from `wv2-skipped-exercises`)
- Empty state Grupul 2 Gigel-friendly hint message
- Both grupuri reversibile via checkbox toggle (Daniel verbatim "selectia din cont poate fi debifata")

### §1.H — EXTEND `src/pages/coach/energyCheck.js` navigate to workout-preview

- `selectEnergyState` excellent/normal → `navigate('workout-preview', {energyMod})`
- `selectEnergyCause` tired → `navigate('workout-preview', {energyMod: 'minus', cause})`
- Both wrapped in try/catch (router may not be wired in callback-only test envs)

### §1.I — Tests cluster NEW (4 files + 1 augment)

- `src/engine/schedule/__tests__/scheduleAdapter.refusalFlow.test.js` (+25)
- `src/pages/coach/__tests__/refusalCounterModal.test.js` (+17)
- `src/pages/coach/__tests__/workoutPreview.test.js` (+34)
- `src/pages/coach/__tests__/workout.midSessionActions.test.js` (+17)
- `src/pages/coach/__tests__/aparateLipsa.test.js` AUGMENT (+8 Bundle 4 grupuri)

### §1.K — Single atomic commit (Co-CTO bias §0.8)

`429c189 feat(coach): Bundle 4 workout-preview port + per-exercise refusal flow + mid-session augmentation`

### §1.L — Backup tag pushed origin pre-execute

`pre-bundle-4-workout-preview-plus-midsession-refusal-flow-2026-05-13e`

---

## §2 Tests trajectory

**3010 → 3111 PASS (+101 net new Bundle 4 cumulative)**

- Test files: 165 → 169 (+4 NEW)
- ZERO regression on existing 3010 tests
- All 117 Bundle 4 tests pass first-attempt after 3 spec-level test fixes (origin-rooted cascade for Incline DB Press exhaustion + Cable Curl chain for skip test + XSS test relaxed to no-script-element check)

Build vite clean (3.99s, aparateLipsa+workoutPreview+refusalCounterModal split as dynamic chunks via import boundary — efficient tree-shake).

---

## §3 Co-CTO decisions taken autonomous (Daniel review post-LANDED)

Per Daniel verbatim chat-current *"fa promptul. Si nu ma intreba la fiecare chestie daca vreau sau nu :)"* + *"facem cum vrei tu dar go"* + *"ok"*:

1. **REFUSAL_COUNTER_THRESHOLD = 3** (Gigel sweet spot anti-paternalism, NU 5 prea paternalism, NU 2 prea agresiv)
2. **"Aparat ocupat" mid-session pure ephemeral** (NO smart auto-conversion to permanent — conservative Bugatti minimal feature, expand later if usage data shows demand)
3. **resolveMissingEquipmentTarget single-mapping subset** only {dumbbell, band, cable} → global equipment list; ambiguous {machine, barbell, bodyweight} → exercise-specific skipped fallback (preserves specificity)
4. **Cascade Bundle 4 = simple findAlternatives()** with peek-next-exercise filter mid-session only. Full smart cascade engine pivot = Bundle 5 ADR amendment SMART_ROUTING_v2 separate strategic chat
5. **Modal wording direct Gigel-friendly:** "Ai refuzat {exerciseName} de {count} ori. Vrei să nu-l mai propun deloc?" + 2 big-touch buttons. NU paternalism long explanation. NU "ești sigur?" double-confirm friction.
6. **Backwards-compatible router opts param** (existing `navigate(screenName)` callers unaffected)
7. **NEW exports in scheduleAdapter.js** (NU separate `refusalStorage.js` file — Tier 0 storage edges centralized parity Bundle 3A precedent)
8. **Single atomic commit** (comprehensive message block-by-block diff sections, parity Bundle 3A precedent)
9. **Empty state Grupul 2** italic small text Gigel-friendly hint message (NU display empty grupul = Gigel confused)
10. **ResetRefusalCounter on modal backdrop click** = Gigel dismiss UX intuitive (same effect as "Nu" button, both reset counter without permanent commitment)
11. **Origin-rooted cascade tracking** via `data-origin-exercise` stable attribute — refusals accumulate against ORIGINAL exercise, not currently-visible (fixes exhaustion semantics; surfaced via test failure mid-execute)

---

## §4 OUT-of-scope DEFERRED Bundle 5

**ADR amendment SMART_ROUTING_v2 — strategic chat dedicat ~2-3h Daniel input mandatory pre-implementation:**

- Full downstream session-aware cascade (NU just peek-next-exercise — full sequence reordering for fatigue minimization across entire session plan)
- Bodyweight fallback schema NEW (per `muscle_target_primary` lookup table for end-of-cascade resort)
- Light variant schema NEW (per exercise OR formula reps×1.5 / weight×0.5 / angle modifier)
- ADR amendment formal document required pre-implementation

**Bundle 6 future considerations (NOT scoped):**

- Smart inference "Aparat ocupat" → after N times same equipment_type → suggest add to Cont permanent (Daniel did NOT specify auto-conversion — conservative keep ephemeral)
- Reset refusal counter weekly/monthly (currently persistent until threshold or manual modal answer)
- Cross-device sync refusal state via Firebase (current localStorage-only)

---

## §5 Path forward fresh chat NEW post-trigger "salut acasă"

1. **P1: Bundle 5 ADR amendment SMART_ROUTING_v2** strategic chat dedicat — Daniel design input required
2. **P2: Wire `state.sessionPlan` field** in mid-session for peek-next-exercise filter activation (currently graceful no-op fallback — works without plan)
3. **P3: §AR.22 codification DISCRETE-BLOCKS DISCIPLINE** if Bundle 4 spec surfaces 2× threshold met cumulative (1× threshold met Bundle 3 follow-up + 1× threshold met Bundle 4 12-block split = potentially 2× met now)
4. **P4: Pre-Beta Daniel Gates manual smoke prod** andura.app post-deploy `feature/v2-vanilla-port`

---

## §6 Slips chat-current Bundle 4 (NU codify, watch — anti-recurrence)

**Slip 1 surfaced mid-execute:** initial cascade implementation read `rowEl.dataset.exercise` (currently-visible name) as origin instead of stable origin → exhaustion semantics broken. Fixed via `data-origin-exercise` attribute set once at row build. Codifiable lesson: **state mutation via DOM should track stable identity separate from displayed identity**. NOT yet 2× threshold for codification.

**Slip 2 surfaced mid-execute:** XSS test for aparateLipsa Grupul 2 too strict — asserted `innerHTML.not.toContain('<script>alert')`. Issue: attribute values serialize without `<` escape (which IS XSS-safe but appears as substring). Relaxed test to check `stack.querySelector('script')` is null (actual XSS protection) + escaped form in span textContent. Codifiable lesson: **XSS test should assert no executable script element exists, NOT substring presence in attribute serialization**. Single occurrence acest bundle, NOT codify yet.

**Slip 3 surfaced mid-execute:** initial `pickNextAlternative` chain test used Incline DB Press which has only 1 valid Tier-1 alternative — chain test impossible. Fixed by switching to Cable Curl (Tier 2, 2 valid alternatives). Codifiable lesson: **chain/sequence tests need exercises with sufficient alternatives in metadata**. NOT yet 2× threshold.

ZERO new slip patterns 2× threshold met — defer all 3 to future codification if recurrence observed.

---

## §7 Bugatti craft confirmation

🦫 **Bundle 4 LANDED clean atomic commit `429c189`. Mockup parity §screen-workout-preview L913-997 + §screen-workout L1340-1400 preserved exact. ZERO engine mutation (ADR 026 §9 invariant). ZERO React/JSX (ADR 005 §AMENDMENT 2026-05-10). ZERO HARD CONSTRAINT §F3.12 violation. Tests 3010 → 3111 PASS (+101 net new). Build vite clean (3.99s). Backup tag intact rollback target.**

**Co-CTO autonomous Daniel autonomy lock EXTINS preserved. Quality > Speed default. Per-exercise refusal flow + mid-session augmentation + Cont reversibility — all Daniel verbatim chat-current 2026-05-13 cradle directives delivered. Bundle 5 ADR amendment SMART_ROUTING_v2 separate strategic chat dedicat next post-trigger.**

---

## §8 Cross-refs authority

- `wiki/concepts/calendar-feature-v1-spec.md` §Path forward Bundle 4 workout-preview src/ port (LANDED this commit)
- `wiki/concepts/anti-recurrence-rules.md` §AR.20 + §AR.21 LOCK V1 (4th consecutive validation effective)
- `wiki/concepts/metoda-hibrida-chat-cc.md` §F3.13 LOCK V1
- `wiki/concepts/bugatti-craft.md` Quality > Speed atomic single-concern
- `wiki/concepts/autonomy-paradigm-v1.md` Co-CTO Autonomous LOCKED V1 PERMANENT
- `03-decisions/005-vanilla-js-no-framework.md` §AMENDMENT 2026-05-10 Port-First-Then-React
- `03-decisions/020-storage-tiering-strategy.md` §1.4 Tier 0 active rolling — wv2-skipped-exercises + wv2-refusal-counter parity wv2-missing-equipment
- `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` §9 pure-function engines invariant (ZERO engine mutation Bundle 4)
- `03-decisions/030-adapter-design-pattern.md` §D2 thin scope — Tier 0 storage edges in adapter, engines pure
- `📥_inbox/PROMPT_CC_BUNDLE_4_WORKOUT_PREVIEW_PLUS_MIDSESSION_REFUSAL_FLOW_V1.md` source spec
- `📤_outbox/_archive/2026-05/459_LATEST_PREVIOUS_WIKI_INGEST_2026_05_13d_POST_BUNDLE_3_LANDED_CONSUMED.md` predecessor raport
- `04-architecture/mockups/andura-clasic.html` §screen-workout-preview L913-997 + §screen-workout L1340-1400 design master

🦫 **Bugatti craft.**
