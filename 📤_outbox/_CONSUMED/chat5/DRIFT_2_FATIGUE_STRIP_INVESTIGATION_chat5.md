# DRIFT-2 FatigueStrip Paradigm Investigation chat 5

**Date:** 2026-05-23
**Investigator:** subagent Opus read-only worktree-isolated
**Source:** gsd-ui-auditor chat 5 finding surfacing meta-paradigm question (DECISIONS_CHAT5_DRAFT.md §P9 + CHANGELOG_chat5_overnight.md §297)
**Scope:** Read-only — ZERO src/ touched, ZERO git commits, ZERO push.

---

## §1 Mockup baseline

**Location:** `04-architecture/mockups/andura-clasic.html` lines 1716-1728 (Progres screen, sub TDEE strip).

**Visual paradigm (verbatim mockup HTML):**
```html
<!-- F3 fatigue + F9 BMR single-line strip (V1 LOCKED — single number, NU
     visual bar/gradient). Two key state numbers visible la o privire. -->
<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
  <div style="background:white; border:1px solid var(--line); border-radius:14px; padding:14px;">
    <div class="small-text" style="...">Oboseala azi</div>
    <div style="font-size:24px; font-weight:700; ...font-family:'JetBrains Mono', monospace;">6<span>/10</span></div>
    <div class="small-text">Recuperare buna</div>
  </div>
  <div style="...">  <!-- Calorii baza BMR strip side-by-side -->
    <div>Calorii baza</div>
    <div>1 850 <span>kcal/zi</span></div>
    <div>Repaus complet</div>
  </div>
</div>
```

**Key invariants LOCKED V1 (mockup author comment):**
1. **0-10 scale** (NU 0-100) — intuitive Gigel-friendly
2. **Single number** (NU visual bar/gradient/progress meter)
3. **2-col grid** with BMR Calorii baza side-by-side
4. **JetBrains Mono** font on value (metric snapshot semantics)
5. **Sub-label below value** (NU inline lipit)
6. **Screen:** Progres only (NU Antrenor — Antrenor has Deload card variant mockup L772-778 cu separate trigger 3-week cumulative fatigue, NU FatigueStrip)

---

## §2 React implementation

**Files:**
- `src/react/components/Progres/FatigueStrip.tsx` (65 LOC)
- `src/react/components/Progres/BMRStrip.tsx` (79 LOC, side-by-side companion)
- `src/react/routes/screens/progres/Progres.tsx` lines 53-59 (2-col grid wrapper)
- `src/react/__tests__/components/Progres/FatigueStrip.test.tsx` (97 LOC, 7 tests)

**Render shape (current FatigueStrip):**
```tsx
<section data-testid="fatigue-strip" className="bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-4">
  <Activity className="w-6 h-6 text-brick" />  {/* lucide-react icon */}
  <p>Oboseala azi</p>                                {/* uppercase tracking-wide */}
  <p className="text-xl font-bold font-mono">{scoreOutOfTen}<span>/10</span></p>
  <p data-testid="fatigue-sub-label">{fatigue.label}</p>  {/* engine label */}
  {fatigue.detail && <p data-testid="fatigue-detail">{fatigue.detail}</p>}
</section>
```

**Position in Progres screen:** Inside `<div className="grid grid-cols-2 gap-2">` with sibling `<BMRStrip />` — 2-col layout matches mockup.

**Empty state:** "Logheaza 2+ sesiuni pentru o estimare." (fatigue.score=null path).

---

## §3 Engine wiring

**Adapter:** `src/react/lib/engineWrappers.ts` lines 186-218 `getFatigue()` — wraps `src/engine/fatigue.js` `calculateFatigueScore()` with try/catch + Sentry capture.

**Data source:** `DB.get('logs')` (last 4 sessions, non-baseline) + `DB.get('wellbeing')` (sleep last 4 days).

**Engine output shape (locked §36.58):**
- `score`: 0-100 (engine internal scale)
- `key`: PEAK_FORM | NORMAL | MODERATE_FATIGUE | HIGH_FATIGUE
- `label`: Romanian verbatim ("Suntem in forma buna" / "Pe drum bun" / "Pas mai conservator" / "Azi mergem mai bland")
- `detail`: Romanian explainer 1 sentence
- `recommend`: push | normal | reduce | deload

**Display conversion:** `Math.round(score / 10)` → 0-10 display scale per §F-pass2-fatiguestrip-01.

---

## §4 Divergences identified

**Status update vs gsd-ui-auditor chat 5 surface:** All 3 sub-findings (01/02/03) flagged in `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass2-progres-components.md` are **ALREADY LANDED** chat 5 overnight per code comments + git log:

| Finding | Severity | LANDED? | Commit/Source |
|---------|----------|---------|---------------|
| §F-pass2-fatiguestrip-01 (0-100 vs 0-10 scale) | HIGH-EPSILON | YES | `321d1a06` HIGH-EPSILON 7 closed |
| §F-pass2-fatiguestrip-02 (BMR 2-col side-by-side MISSING) | HIGH-EPSILON | YES | `321d1a06` BMRStrip created + grid wrapper |
| §F-pass2-fatiguestrip-03 (sub-label inline vs separate line) | MED | YES | `c08db445` value standalone + label below |

**Residual divergences (minor, vs mockup verbatim):**

1. **Background color:** Mockup `background:white`; React `bg-paper2` (paper2 token = subtle off-white in dark mode aware). Tradeoff: token consistency vs literal mockup match.
2. **Border radius:** Mockup `border-radius:14px`; React `rounded-2xl` = 16px Tailwind. ~2px difference, optical equivalent.
3. **Icon presence:** Mockup has **NO icon** in fatigue card (label-only structure). React has `<Activity />` lucide icon left of label. Adds visual weight, divergence vs mockup minimalism.
4. **Label color:** Mockup `var(--ink-3)` uppercase + `var(--ink)` value; React `text-ink2`/`text-ink` — equivalent.
5. **Mono font value:** Both mockup + React use mono (JetBrains via Tailwind config). Parity.
6. **Sub-label semantics:** Mockup descriptive copy ("Recuperare buna"); React engine `label` ("Pe drum bun" / "Pas mai conservator"). Engine-driven NOT verbatim mockup but Romanian human-friendly per LOCK V1.

**Parity verdict post chat 5 fixes:** **~85%** (up from 45% baseline pre-Wave 11 fixes). Residual = icon presence + minor token/literal pixel deltas.

---

## §5 Why drift occurred (hypothesis)

**Git archaeology:** Only 3 commits touched FatigueStrip.tsx — `c5aef59e` (initial Phase 6 task_22), `321d1a06` (overnight Wave HIGH-EPSILON sweep), `c08db445` (Wave 11 sub-label).

**Hypothesis:**
- **Initial drift (`c5aef59e`)**: Phase 6 build prioritized engine wiring (real data via getFatigue) over verbatim mockup parity. Common pattern — engine wire first, polish later. 0-100 raw scale exposed because mockup parity didn't gate.
- **Icon added:** Generic React-component "needs visual" instinct from build — Activity icon visually consistent with other strip components (TDEEStrip likely has Scale icon, BMRStrip has Flame). Cross-component design system pull, NOT mockup-driven.
- **BMR missing initially:** F9 BMR strip in mockup wasn't tracked as separate task at Phase 6 — became visible only post Wave C parity audit chat 5.

**Intent classification:** **Accidental drift during build**, NOT intentional pre-Beta improvement. No design rationale documented for the 6 divergences. Wave 11 fixes already closed 3 HIGH/MED.

---

## §6 Options for Daniel CEO

### Option A: Restore mockup paradigm full literal (icon removal + token literal match)

**Scope:**
- Remove `<Activity />` icon — mockup has zero icon in fatigue card
- Switch `bg-paper2` → `bg-white` (literal mockup)
- Switch `rounded-2xl` → `rounded-[14px]` (literal 14px)
- Apply same to BMRStrip (Flame icon removal + tokens) for grid consistency

**Pros:**
- Mockup DESIGN MASTER verbatim parity 95%+ ("Bugatti craft" filter)
- Eliminates "cross-component instinct" creep — mockup is sole source
- Cleaner visual hierarchy (label + value pure, NU decorative icon)

**Cons:**
- BMRStrip + FatigueStrip lose cross-strip icon consistency vs TDEEStrip (which has icons per mockup elsewhere)
- ~30min dev + 2 component edits + test updates
- Dark mode tokens differ slightly from `bg-white` — needs verify dark theme parity

**Effort:** ~30-45min dev (2 files + tests).

---

### Option B: Accept drift, update mockup to match prod (mockup catches up)

**Scope:**
- Update `andura-clasic.html` L1717-1727 to add `<Activity />` + `<Flame />` icons inline
- Keep mockup invariants (single number, 2-col, mono font) BUT add icons as new spec
- Document amendment in DECISIONS as "design evolution post-build"

**Pros:**
- Zero React refactor risk pre-Beta
- Acknowledges design system pull is legitimate cross-strip consistency
- Mockup becomes "fresh source" reflecting current state — no parity drift accumulating

**Cons:**
- Sets precedent "mockup catches up to code" — erodes DESIGN MASTER authority (D015 strategy LOCK V1)
- Risk of cascading "well, code drifted so update mockup" pattern over 6+ months horizon
- Other "minor" drifts may accumulate without scrutiny
- Quality long-horizon filter ("petrecem de 10 ori mai mult timp acum sa il facem bine") suggests against shortcut

**Effort:** ~15min mockup edit + 1 commit + DECISIONS append.

---

### Option C: Custom hybrid (icon stays + literal tokens match)

**Scope:**
- KEEP `<Activity />` + `<Flame />` icons (design system consistency win)
- ALIGN tokens: `bg-paper2` (already abstracted, retain) BUT verify literal 14px radius
- Sub-label keep engine-driven (LOCK V1 engine wording §36.58 — no override to mockup literal "Recuperare buna" because engine selects from 4 states intelligently)
- Document compromise in DECISIONS as conscious paradigm-V1.1 update

**Pros:**
- Pragmatic — preserves cross-strip visual consistency (icon) but minimizes residual drift
- Engine-driven label is BETTER than mockup static "Recuperare buna" (4-state dynamic context)
- Surgical scope — only border-radius literal verify

**Cons:**
- Half-measure — neither full mockup parity nor clean drift accept
- Requires DECISIONS entry documenting "icons OK divergence, others not"
- Sets nuanced precedent — future audits need to know "which divergences are blessed"

**Effort:** ~15-20min code + DECISIONS entry.

---

### Co-CTO recommendation: **Option A** (restore mockup paradigm full literal)

**Rationale:**
1. **Bugatti craft filter** (Andura PROJECT_VISION) — peak craft, zero compromise. Mockup DESIGN MASTER (D015 LOCK V1) authority preserved.
2. **Quality long-horizon** (feedback_quality_long_horizon LOCK V1) — Daniel verbatim "prefer sa petrecem de 10 ori mai mult timp acum sa il facem bine decat peste 6 luni sa nu il mai gasim". 30min now > "minor" tech debt accumulating.
3. **Mockup parity audit gate** — if we accept icon drift here, every audit becomes "well, mockup vs prod" relativistic. Hard line = mockup wins by default unless explicit DECISIONS amendment.
4. **Effort low** — ~30-45min including tests, well-scoped, reversible (Option A → C trivial later if Daniel changes mind).
5. **Engine label semantics preserved** — Option A doesn't touch engine wiring; only visual chrome (icon + tokens). Engine LOCK V1 §36.58 untouched.

**Counter-consideration:** If Daniel WANTS cross-strip icon system as a brand element (TDEEStrip + FatigueStrip + BMRStrip all iconed), then Option C is correct — but that's a NEW design decision Daniel needs to LOCK with mockup amendment.

**Confidence:** MED — depends on whether Daniel views icons as design system feature (Option C) or accidental cross-pollination (Option A). Browse mockup direct (open `andura-clasic.html` Progres section L1716+) settles it in 30 seconds.

---

## §7 References

- `04-architecture/mockups/andura-clasic.html` L1716-1728 (mockup baseline)
- `src/react/components/Progres/FatigueStrip.tsx` (current React)
- `src/react/components/Progres/BMRStrip.tsx` (side-by-side companion)
- `src/react/routes/screens/progres/Progres.tsx` L53-59 (grid wrapper)
- `src/engine/fatigue.js` L62-92 (engine labels LOCK V1 §36.58)
- `src/react/lib/engineWrappers.ts` L186-218 (`getFatigue()` adapter)
- `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass2-progres-components.md` (chat 5 audit 3 sub-findings)
- `📤_outbox/DECISIONS_CHAT5_DRAFT.md` §P9 (DRIFT-02 surface)
- Commits: `c5aef59e` (initial) + `321d1a06` (Wave HIGH-EPSILON 7) + `c08db445` (Wave 11 sub-label)
