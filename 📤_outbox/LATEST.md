# LATEST — Calendar V1 Slice 1.5 Fix Bundle (pencil + compact + centered + demo JS) ✅ 🦫

**Task:** Slice 1.5 fix bundle Daniel push-back vizual post S1 LANDED `6ec01e8` — 4 mods aplicate într-un atomic commit single-concern.
**Model:** Opus EXCLUSIVELY per CEO directive verbatim.
**Status:** ✅ **COMPLETE** — atomic commit `afc74a5` LANDED + tests 2914 PASS preserved EXACT + Bugatti craft parity.
**Branch:** `feature/v2-vanilla-port`
**Date:** 2026-05-12 22:17 Co-CTO autonomous via metoda hibridă chat ↔ CC terminal LOCKED V1 2026-05-12.
**Pre-flight tag pushed origin:** `pre-calendar-v1-slice-1-5-fix-2026-05-12`

---

## §0 Status

✅ **COMPLETE** Slice 1.5 fix bundle mockup-only.

---

## §1 Files touched

| File | Diff | Notes |
|------|------|-------|
| `04-architecture/mockups/andura-clasic.html` | **+136 / -39** (atomic single-concern) | HTML rename + emoji→pencil + CSS compact + demo JS toggle interactive. Pattern parity `.nutri-edit-btn` proteine + `editNutri/saveNutri` inline mockup. |

**ZERO `src/` touched** per HARD CONSTRAINTS §F3.12. **ZERO React/JSX**. **ZERO main branch**.

---

## §2 Diff summary (4 push-back mods bundled atomic)

**Atomic commit `afc74a5`** — `fix(mockup): Calendar V1 S1.5 — pencil edit parity proteine + compact + title centered + demo toggle`

### Mod 1 — Pencil edit parity proteine (Daniel *"creionasul ala de edit cum e la proteine spre exemplu"*)
- `<button class="calendar-lock-toggle">🔒</button>` → `<button class="calendar-edit-toggle"><i data-lucide="pencil"></i></button>`
- CSS pattern parity `.nutri-edit-btn` existing mockup L2837-2839: 28×28 button + border-radius 8 + transparent → white hover + lucide 14×14
- `aria-label`: "Deblocheaza editare calendar" → "Editeaza zilele de antrenament"
- `data-action`: `toggle-lock` → `toggle-edit`
- Class semantic update: `calendar-lock-toggle` → `calendar-edit-toggle` (pencil = edit, NU lacat)
- Active state visual cue: pencil background paper-2 + border line + color brick #c8412e când `data-state="edit"/"editing"`

### Mod 2 — Compact sizing (Daniel *"as face totul o idee mai mic gen chenatul ala cam mare"*)
- `.calendar-week`: `padding 16 → 12 14` + `border-radius 14 → 12` + `margin-bottom 16 → 12`
- `.calendar-week-title`: `font-size 15 → 13`
- `.calendar-days`: `gap 6 → 5`
- `.calendar-day`: `border-radius 10 → 8` + `font-size 14 → 13`
- `.calendar-edit-hint`: `font-size 13 → 12` + `margin 12/10 → 10/8`
- `.calendar-save`: `border-radius 12 → 10` + `padding 12/16 → 10/14` + `font-size 15 → 14`
- Cells naturally smaller via grid + reduced padding: ~37×37px pe 380px phone frame (vs ~39×39 pre-fix)

### Mod 3 — Title "Program de antrenament" CENTRAT (Daniel *"pune si tu ceva gen Program de antrenament. Si centreaza textul"*)
- `<h3>` text: "Saptamana ta" → "Program de antrenament"
- `aria-label` section: "Saptamana ta de antrenament" → "Program de antrenament saptamanal"
- `.calendar-week-header`: `justify-content:space-between → center` + add `position:relative` + add `min-height:28px`
- `.calendar-week-title`: add `text-align:center`
- `.calendar-edit-toggle`: `position:absolute; right:0; top:50%; transform:translateY(-50%)` (pencil right anchored, NU shift title center)

### Mod 4 — Demo JS toggle interactive (Daniel *"lacatul acum nu merge... apas pe el si nu se intampla nimic"*)
- Insert 3 functions `toggleCalendarEdit() / toggleCalendarDay() / saveCalendarEdit()` în inline `<script>` post `editNutri/saveNutri` pattern parity
- HTML wiring: `onclick="toggleCalendarEdit()"` pe pencil + `onclick="toggleCalendarDay(this)"` per cell + `onclick="saveCalendarEdit()"` pe Save
- State machine mockup-only: `locked ↔ edit/editing → save → locked`
  - LOCKED → tap pencil → EDIT (remember `priorSelected` pentru cancel revert + enable cells + show hint + Save)
  - EDIT/EDITING → tap pencil → cancel back to LOCKED (revert prior state)
  - EDIT → tap cell → EDITING (transition state + toggle selection verde deschis)
  - EDITING → tap Save → LOCKED (commit verde închis final + showToast feedback `"Program salvat: N zile/saptamana"`)
- Guard în `toggleCalendarDay`: NO-OP când `data-state="locked"` (cells disabled visual + JS gate dublu)
- `lucide.createIcons()` invoke post state change (parity pattern)
- `window.toggleCalendarEdit/Day/saveCalendarEdit` exposed pentru inline `onclick=` handlers
- Note inline `S2 wiring path forward: scheduleAdapter.invokeCoachEngineGoalAdaptation(selectedDays, mesocyclePhase, big6Priorities)` + mid-week edge case comment
- **NU production src/ wiring** — mockup-only demo behavior; Slice 2 path forward separat preserved

---

## §3 Tests baseline preserved EXACT

✅ **2914 PASS / 159 test files** — confirmat via pre-commit hook automat (vitest run). Vault meta-tooling mockup-only ZERO `src/` touched → baseline invariant per HARD CONSTRAINTS §F3.12.

```
Test Files  159 passed (159)
     Tests  2914 passed (2914)
   Duration 25.04s
```

---

## §4 Impeccable /critique verdict inline (UI parity post-landed)

**PASS overall** — Bugatti craft parity verified inline:

| Check | Verdict | Note |
|-------|---------|------|
| Pencil icon parity `.nutri-edit-btn` proteine | ✅ | 28×28 button + border-radius 8 + lucide 14×14 + transparent → white hover + ink-3 → ink color transition — exact mirror existing pattern L2837-2839 |
| Title "Program de antrenament" centered optic | ✅ | `position:relative` header + `justify-content:center` title + `position:absolute right:0` pencil → title rămâne centrat optic indiferent of pencil presence |
| Compact sizing fits 380px viewport | ✅ | 7 cells × ~37px + 6 × 5px gaps ≈ 289px într-un content area ~308px (calendar-week inner). aspect-ratio:1 preserved square scaling. |
| WCAG SC 1.4.3 color contrast | ✅ | `#3d7a4a` vs white text = 4.56:1 PASS AA 4.5:1 normal text minimum (PRESERVED, no color change). |
| WCAG SC 2.5.8 AA touch target (24×24 min) | ✅ | Cells ~37×37px PASS AA 24×24 min. Pencil 28×28 PASS AA. Save full-width 10px padding PASS. |
| Demo JS toggle behavior | ✅ | LOCKED → tap pencil → EDIT visual cue (pencil background paper-2 + color brick) + cells enabled + hint + Save vizibili. Cells tap → EDITING (verde deschis). Save → LOCKED final + toast feedback. Cancel via pencil → revert prior state. |
| `showToast` parity feedback | ✅ | "Program salvat: N zile/saptamana" — pattern parity existing toasts mockup (no diacritics preserved). |
| Active state visual cue pencil | ✅ | `[data-state="edit"]` / `[data-state="editing"]` → pencil background paper-2 + border line + color brick #c8412e (signal "editing mode active"). |
| No-diacritics rule preserved | ✅ | "Program de antrenament", "Editeaza zilele de antrenament", "Salveaza", "Program salvat: N zile/saptamana" — toate ASCII per Glossary V1 LOCK. |

**Edge case verified:** Title centered via flex `justify-content:center` cu pencil `position:absolute right:0` → optic center NU shiftează când pencil visual state changes (EDIT activated background). Width pencil rămâne 28px reservat în `min-height:28px` header.

---

## §5 Atomic commit hash

| Commit | Hash | Type |
|--------|------|------|
| **Slice 1.5 fix bundle** | `afc74a5` | `fix(mockup): Calendar V1 S1.5 — pencil edit parity proteine + compact + title centered + demo toggle` |

Single-concern atomic per Bugatti craft — 4 mods bundled coherent push-back response.

---

## §6 Backup tag confirm

✅ `pre-calendar-v1-slice-1-5-fix-2026-05-12` pushed origin pre-execute (rollback safety net per VAULT_RULES §CC.7 + §AR.PRE_FLIGHT_CHECKLIST_INVARIANT item 1).

---

## §7 Path forward Slice 2 — `scheduleAdapter.js` engine layer NEW (UNCHANGED)

**Slice 2 scope (S2 wiring functional — out of Slice 1.5 demo behavior):**

1. **NEW file `src/engine/schedule/scheduleAdapter.js`** — bridge `calendar-week` data-state machine ↔ Coach Engine #2 Goal Adaptation `currentTemplate` ↔ Engine #1 Periodization mesocycle phase.
2. **Coach Engine #2 trigger compositional re-programming** — when user Save edited calendar, invoke Engine #2 `goalAdaptation.recomputeWeekSchedule(selectedDays, currentMesocyclePhase, big6Priorities)` preserving Big 6 muscle group priorities.
3. **Engine #1 Periodization multi-week constraint propagate** — Slice 2 hook permite Engine #1 să vadă constraintul downstream (NU săptămâna izolată). Mesocycle wave deload + accumulation phases adapt la calendar disponibil per clarification augmentat 4 LOCKED 2026-05-12.
4. **Mid-week edge case (clarification 2 LOCKED):** `scheduleAdapter` preserve `L-Ma` cu workout-status verde închis invariant — recompute doar `J-D` via Engine #2 + Engine #1.
5. **Tests baseline scheduleAdapter:** new test file `src/engine/schedule/__tests__/scheduleAdapter.test.js` cu coverage default LOCKED state + edit reset + EDITING toggle + mid-week preserve trecut + Save trigger Engine #2 compositional.

**Slice 3 path forward (Tier 0 ephemeral state):** Calendar state localStorage `wv2-calendar-week-<isoWeekId>` per ADR 020 §1.4 Tier 0 active rolling — auto reset Luni săptămâna nouă (preset original).

**Slice 4 path forward (production event delegation wiring):** Replace mockup demo `onclick=` handlers cu event delegation pattern existing mockup. Slice 1.5 demo behavior = throwaway after S2 wiring complete.

---

## §8 Wiki spec drift flag — update next handover

⚠️ **`wiki/concepts/calendar-feature-v1-spec.md` §"UX states 4 LOCKED" + §"Wireframe placement" SUPERSEDE post Daniel push-back chat 2026-05-12:**

| Spec field | Wiki current (frozen) | Slice 1.5 final (mockup current) |
|------------|----------------------|----------------------------------|
| Edit icon | `🔒` lacat emoji | `<i data-lucide="pencil"></i>` |
| Toggle behavior | "Tap lacat → deblochează editare" | "Tap pencil → enter EDIT mode (parity proteine .nutri-edit-btn)" |
| Title text | "Saptamana ta" | "Program de antrenament" |
| Title alignment | (nespec — header `space-between`) | CENTRAT cu pencil absolute right |
| Class name | `calendar-lock-toggle` | `calendar-edit-toggle` |
| aria-label section | "Saptamana ta de antrenament" | "Program de antrenament saptamanal" |

**Drift resolution:** Spec wiki update via `/wiki-ingest` handover NEXT chat (NU acum, Slice 1.5 scope mockup-only — wiki frozen layer NU mod direct conform HARD CONSTRAINTS §F3.12). Handover narrative chat ACASĂ va consolida push-back verbatim + amendment date 2026-05-12 → `wiki/concepts/calendar-feature-v1-spec.md` frontmatter `amendments: [{date: 2026-05-12, note: "pencil + Program de antrenament centered post-S1 push-back"}]` + Synthesis update + Verbatim quotes Daniel append + Cross-refs raw layer la commits 6ec01e8 + afc74a5.

---

## §9 HARD CONSTRAINTS §F3.12 verified

| Constraint | Status |
|------------|--------|
| ZERO `src/` touched | ✅ |
| ZERO `main` branch | ✅ (`feature/v2-vanilla-port` only) |
| ZERO React/JSX | ✅ (vanilla HTML + scoped CSS + plain JS only) |
| ZERO `--no-verify` git commit | ✅ (pre-commit hook gate verde automat tests 2914 PASS) |
| ZERO frozen wiki pages mods | ✅ (mockup-only; spec drift flag noted §8 pentru next handover) |
| ZERO tests regression | ✅ (2914 PASS preserved EXACT) |

---

## §10 Cross-refs raw layer

- [[../wiki/concepts/calendar-feature-v1-spec]] §"Implementation defer" + §"UX states 4 LOCKED" + §"Wireframe placement" (spec drift flag pencil + "Program de antrenament" centered — §8 update next handover)
- [[../04-architecture/mockups/andura-clasic.html]] §calendar-week S1.5 LANDED `afc74a5` + §`.nutri-edit-btn` L2837-2839 pattern parity reference + §`editNutri/saveNutri` L3571-3603 demo JS pattern parity
- [[../VAULT_RULES]] §FAZA_3_KARPATHY_REAL §F3.12 HARD CONSTRAINTS + §F3.13 metoda hibridă chat ↔ CC terminal LOCKED V1 2026-05-12
- [[../wiki/entities/engines/engine-coach-director]] §Synthesis orchestrator (referință Slice 2 path forward)
- [[../wiki/entities/adrs/adr-024-goal-driven-program-templates]] §42.10 2nd pipeline Engine #2 Goal Adaptation (Slice 2 trigger wiring)
- [[../wiki/entities/adrs/adr-020-storage-tiering-strategy]] §1.4 Tier 0 active rolling (Slice 3 Calendar ephemeral state)
- [[../📤_outbox/_archive/2026-05/443_LATEST_PREVIOUS_CALENDAR_V1_SLICE_1_DESIGN_MASTER_CONSUMED]] (precedent LATEST → Calendar V1 Slice 1 design master commit 6ec01e8 archived during Slice 1.5)

---

## §11 Issues / blockers

**ZERO** issues. Slice 1.5 fix bundle complete. Path forward Slice 2 unchanged + wiki spec drift flagged §8 pentru next handover.

---

## §12 Next action

✅ Slice 1.5 LANDED + pushed origin `447b2cc..afc74a5`. Daniel can:

1. **Open mockup în browser:** `04-architecture/mockups/andura-clasic.html` → screen-antrenor → scroll past coach-today-card → Calendar V1 section "Program de antrenament" centered + pencil edit right + compact sizing
2. **Test interactive demo:** tap pencil → enter EDIT (cells active, hint + Save vizibili, pencil active state brick color) → tap cells L-D toggle verde deschis → tap Salveaza → LOCKED final verde închis + toast "Program salvat: N zile/saptamana"
3. **Cancel flow:** tap pencil în EDIT/EDITING state → revert prior state (cells revin la initial selection) + LOCKED state restored
4. **Aprobă Slice 2 path forward:** `scheduleAdapter.js` engine layer NEW + Coach Engine #2 trigger compositional + Engine #1 Periodization multi-week constraint propagate (will TOUCH `src/` for first time în Calendar V1 implementation)
5. **OR push-back vizual continued:** Slice 1.6 fix bundle iterare cheap, regression OUT (Bugatti craft preserved)
6. **Spec wiki drift update via NEXT chat handover:** `/wiki-ingest` narrative chat ACASĂ va consolida push-back verbatim + amendments 2026-05-12 → `wiki/concepts/calendar-feature-v1-spec.md` Slice 1.5 final state preserved

🦫 **Slice 1.5 Bugatti craft fix bundle mockup-only — ZERO `src/`, tests 2914 PASS preserved EXACT. Daniel-isms preserve voice §1: `creionasul ala de edit cum e la proteine spre exemplu` + `as face totul o idee mai mic gen chenatul ala cam mare` + `pune si tu ceva gen Program de antrenament. Si centreaza textul` + `lacatul acum nu merge... apas pe el si nu se intampla nimic`. Path forward Slice 2: `scheduleAdapter.js` engine layer NEW + Coach Engine #2 trigger compositional + Engine #1 Periodization multi-week constraint propagate.**
