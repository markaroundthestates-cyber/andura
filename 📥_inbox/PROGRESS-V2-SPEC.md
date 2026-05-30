# PROGRESS V2 — build spec (locked with Daniel 2026-05-29/30)

> Source of truth for the Progress-tab redesign + body-composition/nutrition logic.
> Daniel approved building all of this autonomously. The old mockup is SUPERSEDED for
> Progress (it was a quick start-point, not the law). Update the mockup after.
> ALL new strings: `t()` keyed, English in en.json, Romanian NO-diacritics in ro.json,
> en==ro leaf counts. The AST scanner + en.json RO-token scan will fail CI on leaks.

## Locked decisions
1. **Mockup superseded for Progress** — redesign freely per this spec; refresh `interfata-noua/` after.
2. **Body fat method:** US Navy circumference (neck + waist + height; + hip for women) = DEFAULT (no tools). PLUS an OPTIONAL **skinfold Jackson-Pollock 3-site** advanced input (men: chest/abdomen/thigh skinfolds; women: triceps/suprailiac/thigh — caliper). Build skinfold NOW (Beta moat). Skinfold present → use it (more accurate); else Navy.
3. **Drop noise measurements** — chest/biceps/thigh CIRCUMFERENCES removed entirely. They measure muscle, not fat; feeding them into BF would be a lie; tracking them for vanity = noise. Keep only what feeds BF/health: neck, waist, hip(f), height, weight (+ the skinfold sites when skinfold mode on).
4. **Measurements live in PROFILE**, not a separate Progress tracker. Profile is the single entry point for body-composition inputs; they drive BF.
5. **Fatigue → kcal = minimal + real, or not at all.** Physiologically fatigue barely moves TDEE. The ONLY legit rule: sustained high fatigue + active deficit → ease the deficit toward maintenance (capped, modest), recovery-protective. If on build this proves marginal/noisy, DROP it (Daniel: "daca nu e aplicabil nu il baga"). Never fake a TDEE change.
6. **Nutrition = single editable panel.** Remove the bottom "Nutrition today" panel; the top "Target Today" panel becomes editable. Editing = **logging what you CONSUMED today** (intake), kcal + protein only (NO carbs/fat — not in app, not adding). Honest microcopy under it, e.g. EN "Noted — your target sharpens as you log more about yourself." / RO "Am notat. Tinta se ajusteaza pe masura ce loghezi." Next day reverts to Andura's auto recommendation.
   - **Engine wiring (verify, already exists):** logged intake feeds `nutritionObservations.buildNutritionObservations(weightLog, dailyLog)` → energy-balance TDEE (`intake − Δweight×7700/days`) → Bayesian engine → future target calibrates. CONFIRM the edit path writes to `nutritionStore.dailyLog` and that flows to the engine. If not wired, wire it — otherwise "am notat" is hollow. Microcopy must reflect it sharpens over a window (not guaranteed next-day from one log; there's a floor filter).

## Layout (top → bottom)
- **Target Today** (hero panel): kcal + protein (editable for today + microcopy) on the left; **Fatigue Today** moved into the right side (free space); **base calories** folded in small here (no standalone panel). Fatigue shown; its only functional link = the deficit-soften rule (#5).
- **Target Weight** — moved UP, just under Target Today, fast-visible (most users use it).
- **Body-model muscle map** (replaces the recovery circles) — realistic neutral front figure, Big-11 regions colored red→orange→yellow→green by recovery + glow (component built separately as `MuscleBodyMap`).
- **Body composition group** — Body Fat + Projection + Weight (7 days) grouped together.
- **Weight & measurements trend** (renamed from "Weight trend") — moved to the BOTTOM of the page. "Last measurement" removed as a standalone (fold under this trend if useful).

## Removals
- Standalone **Base calories** panel (fold tiny into Target Today).
- Standalone **Last measurement** (fold under trend or drop).
- Bottom **Nutrition today** panel (merged into Target Today).
- chest/biceps/thigh circumference inputs.

## Discipline
- i18n: en+ro both, RO no-diacritics, counts equal.
- Keep all engine/testids; reuse Pulse glass + tokens (`.pulse-card`, `--wash`); no new global.css unless necessary.
- a11y AA, tap-targets ≥44, reduced-motion respected (esp. the body-model glow animation).
- Tests for: BF from Navy inputs, skinfold path, fatigue deficit-soften rule (or its absence), nutrition single-panel edit → dailyLog → observation, layout presence.
- Build sequentially on Progres.tsx / SettingsProfile.tsx (one agent at a time) to avoid races; body-model component is a separate new file.
- NU push until the whole flawless gate passes.
