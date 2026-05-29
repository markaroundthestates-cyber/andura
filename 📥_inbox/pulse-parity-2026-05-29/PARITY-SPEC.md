# Pulse 1:1 Parity — shared spec for per-tab agents

**Goal (Daniel CEO, 2026-05-29):** the live app must match the hand-built mockup
`04-architecture/mockups/interfata-noua/` **1:1** on all 5 tabs. The first reskin
transferred palette+fonts+skeleton but left cards **flat/solid** and skipped the
glass depth + several mockup compositions. Close that gap — composition, spacing,
typography, glass depth, glow — per tab.

## What the foundation already gives you (LANDED commit, do NOT re-add)
`src/styles/global.css`:
- `.pulse-card` — glass fill (`--surface`) + backdrop-blur + hairline + depth
  shadow (`--shadow-card`) + top sheen (`::before`). Radius 22px.
- `.pulse-card-tight` — radius 14px (nested/stat tiles).
- `.pulse-card-glow` — adds a corner accent wash (`::after`); set the color with
  an inline `style={{ ['--wash']: 'var(--aqua)' }}` (defaults to `--deep`/aqua).
- Tokens: `--surface`/`--surface-2`/`--surface-solid`, `--bg-grad`,
  `--shadow-card`, `--glow`, `--grain-opacity`, `--volt`/`--aqua`/`--ember`/`--violet`.
- Pulse motion already ported: `.pulse-gradtext`, `.pulse-grad-bg`, `.pulse-shine`,
  `.animate-card-rise`, `.delay-0..600`, `.press-feedback`, aura/orb keyframes.
- Aurora background is ALREADY faithful (`components/pulse/AuroraBackground.tsx`) —
  do NOT touch it.
- Shared Pulse primitives exist: `components/pulse/{Ring,Sparkline,Kicker,Pill,
  ReadinessOrb,PulseMark}` — reuse them, don't reinvent.

## The core migration (every tab)
Replace flat card containers:
```
bg-paper2 border border-line rounded-3xl   (or rounded-2xl/xl, + optional surface-elevated)
```
with the glass card:
```
pulse-card            (hero/section cards, r22)
pulse-card-tight      (small stat tiles, r14)
```
Add `pulse-card-glow` + an inline `--wash` accent on the hero card(s) per the
mockup's `coach-glow`/radial washes. Keep `p-*`, `mb-*`, grid/flex layout classes.

## HARD INVARIANTS (do not break — pre-commit hook runs the full suite)
1. **Keep every `data-testid` verbatim.** Tests assert them.
2. **Keep every i18n key + `t()` call.** No hardcoded strings, no diacritics in UI.
3. **Zero engine/logic/store changes.** Visual/markup only. Same props, same data.
4. **Zero new global.css utilities** without flagging the manager — avoids races.
   Use the foundation classes + inline style. Per-screen `<style>` blocks OK if
   scoped (mockup pattern), but prefer foundation classes.
5. **Reduced-motion + a11y preserved** (aria, focus, contrast). New text on glass
   must stay AA (tokens already AA on `--surface`).
6. Run `npm run build` + `npm run typecheck` (or `tsc`) green before reporting.

## Reference = the mockup source (structural target) + Daniel's screenshots
- Coach/Workout: `04-architecture/mockups/interfata-noua/screens-antrenor.jsx`
  + `screens-workout.jsx`
- Progress/History/Account: `screens-tabs.jsx`
- Primitives: `ui.jsx` (Ring, ReadinessOrb, Sparkline, Kicker, Pill, Sheet, BottomNav)
- Design tokens / classes: `index.html` `<style>` block.

## Per-tab gap list (from Daniel's live-vs-mockup comparison)
- **Coach** (`routes/screens/antrenor/Antrenor.tsx` + `components/Antrenor/*`):
  ReadinessOrb hero is correct to hide at 0 sessions, BUT there is an **empty
  black block under Training schedule** that looks broken — find + fix/remove it.
  Card glass + the recommendation card glow wash. Schedule chips match mockup.
- **Progress** (`routes/screens/progres/Progres.tsx` + `components/Progres/*`):
  kcal hero card glass + aqua glow; Fatigue|BMR tiles `pulse-card-tight`; BodyFat
  tile; TREND sparkline card glass; recovery ring grid (already present) tile
  glass; goal selector + target-weight cards glass. Match mockup `screens-tabs.jsx`
  ProgresScreen.
- **History** (`routes/screens/istoric/Istoric.tsx` + `components/*`): 3 stat
  tiles top (streak/sessions/records) `pulse-card-tight` with colored icons;
  calendar card glass + colored day dots; "how sessions felt" bars card; session
  list cards glass with RIGHT/HARD/EASY `Pill`s. Match `screens-tabs` IstoricScreen.
- **Account** (`routes/screens/cont/*`): avatar gradient pebble + 12-day pill;
  **APPEARANCE card = accent-color picker (Volt/Aqua/Ember/Violet) + Dark/Light
  mode toggle** per mockup ContScreen. **Daniel dropped multi-palette "themes"
  deliberately** — REMOVE the old theme system: delete/retire `SettingsThemes`
  (4-palette preview screen) + its route + the Aspect→Themes row; the only
  appearance controls are the Pulse accent picker + Dark/Light. Wire the accent
  picker to swap `--accent`/`--brick` among `--volt/--aqua/--ember/--violet`
  (persist in settingsStore alongside `theme`). Keep `theme` dark/light wiring
  (themeSync) intact. Settings list rows glass. Logout & delete red. Update/remove
  any tests tied to SettingsThemes.
- **Workout** (`routes/screens/antrenor/*` workout flow + `components/Workout/*`):
  EnergyCheck/Preview/PostRpe/Summary + live workout (± dial, feel-card, PrFlash,
  rest overlay) glass cards + glow per `screens-workout.jsx`. Safety landmines
  (AaFriction LOCK9, wake-lock, refusal exhaustion) untouched.

## Reporting
Report back: files touched, testids/i18n preserved (confirm), build+typecheck
status, and a 1-line note on any mockup detail you could NOT match (so the manager
can verify visually). Do NOT push. Commit atomically inside your worktree.
