# Pass 4 — LOW + NIT polish backlog (§2.4)

**Pass:** §2.4 polish micro-divergences sweep
**Scope:** Aggregate LOW + NIT findings cross-screen — token drift, spacing, font-weight, color shade, icon size, alignment
**Audit date:** 2026-05-20 (resume from checkpoint)

---

## §P4.1 Spacing micro-divergences

### F-pass4-spacing-01 — Padding rhythm divergences (multi-screen)

- **Severity:** LOW
- **Sample observations:**
  - Splash mockup `padding: 48px 28px 32px` (asymmetric) vs prod `p-6` (24px symmetric)
  - Antrenor mockup `padding: 16px 20px 24px` vs prod `p-4` (16px symmetric)
  - WorkoutPreview mockup `padding: 8px 20px 24px` (sub-header tight top) vs prod `p-6`
  - Cont mockup `padding: 16px 20px 24px` vs prod `p-6`
- **Pattern:** Mockup uses 4-value asymmetric (top horizontal bottom), prod often `p-N` symmetric. Mockup top usually tighter, bottom looser for thumb-reach.
- **Fix:** Surgical Tailwind utilities (pt-X px-Y pb-Z) per screen
- **Beta blocker?** NO (Wave 3)

### F-pass4-spacing-02 — Margin-bottom rhythm 4/8 grid

- **Severity:** NIT
- **Sample:** Mockup uses 6/8/10/12/14/18/22 px margins (4-grid + extras); prod uses Tailwind defaults (mb-2 = 8px, mb-3 = 12px, mb-4 = 16px, mb-6 = 24px) — finer granularity in mockup
- **Fix:** Use Tailwind arbitrary values where mockup specifies non-Tailwind defaults
- **Beta blocker?** NO (Wave 4)

### F-pass4-spacing-03 — Gap-between elements inconsistent

- **Severity:** NIT
- **Sample:** Mockup `gap:12px` between buttons vs prod `gap-3` (12px ✓) — usually OK; some `gap:14px` mockup specific (Antrenor today chips line 748 `gap:14px`) vs prod `gap-3.5` (14px ✓)
- **Pattern:** Generally aligned; rare mismatches
- **Beta blocker?** NO

---

## §P4.2 Border-radius drift

### F-pass4-radius-01 — Border-radius inconsistency 12 vs 14 vs 16 vs 18 vs 22

- **Severity:** LOW
- **Mockup vocabulary:**
  - Cards: 14px (alert), 16px (settings cards), 18px (coach today/rest), 22px (logo Splash)
  - Buttons: 8px (small), 10px (medium), 12px (default), 999px (pill)
- **Prod vocabulary:**
  - Tailwind: rounded-lg (8), rounded-xl (12), rounded-2xl (16), rounded-3xl (24), rounded-full (999)
  - Custom: rounded-md (6 default Tailwind)
- **Sample divergences:**
  - Splash logo: 22px mockup vs rounded-3xl (24px) prod
  - Coach Today card: 18px mockup vs rounded-2xl (16px) prod
  - Settings cards: 14-16px mockup vs rounded-xl (12px) prod
- **Fix:** Surgical arbitrary values `rounded-[22px]` / `rounded-[18px]` etc.
- **Beta blocker?** NO (Wave 3)

---

## §P4.3 Font weight subtle drift

### F-pass4-fontweight-01 — Title font-weight 700 vs prod font-semibold (600)

- **Severity:** LOW
- **Pattern observed across screens:**
  - Mockup h1/h2 titles: `font-weight:700` (font-bold)
  - Prod h1: `font-semibold` (600) in many screens (Antrenor / Progres / Istoric / Cont indexes)
- **Sample:**
  - Antrenor mockup `font-weight:700` vs prod `font-semibold` (line 734 vs 101)
  - Cont mockup `font-weight:700` vs prod `font-semibold` (line 1841 vs 92)
- **Fix:** Surgical (`font-bold` not `font-semibold`)
- **Beta blocker?** NO (Wave 3) — but visible weight diminishment

### F-pass4-fontweight-02 — Body text font-weight 500 vs 400 default

- **Severity:** NIT
- **Pattern:** Mockup uses `font-weight:500` for emphasized body text (button labels, info-row labels); prod defaults `font-medium` (500) or plain `text-sm` (400)
- **Beta blocker?** NO

---

## §P4.4 Color shade micro-drift

### F-pass4-color-01 — Brick color consistency

- **Severity:** NIT
- **Mockup:** `#c8412e` brick used consistently across CSS (e.g., 70+ references în mockup)
- **Prod:** `bg-brick` Tailwind utility — needs verify mapping în tailwind.config.js to `#c8412e` exact
- **Verify:** Check tailwind.config.js brick token value
- **Beta blocker?** NO (assuming token = mockup hex)

### F-pass4-color-02 — Ink hierarchy 3-tier (ink / ink-2 / ink-3)

- **Severity:** NIT
- **Mockup CSS tokens:** `--ink: #1a1611` / `--ink-2: #3a3530` / `--ink-3: #7a6f5e`
- **Prod Tailwind:** `text-ink` / `text-ink2` / Tailwind doesn't typically have ink3
- **Check:** Tailwind config verify all 3 tokens defined
- **Beta blocker?** NO

### F-pass4-color-03 — Paper backgrounds 2-tier (paper / paper-2)

- **Severity:** NIT
- **Mockup:** `--paper: #f6f0df` (main cream) / `--paper-2: #ede4ce` (alt cream)
- **Prod:** `bg-paper` + `bg-paper2` Tailwind — verify mapping
- **Beta blocker?** NO

### F-pass4-color-04 — Calendar week tokens cross-checked

- **Severity:** OK (positive verify)
- **Mockup:** Training day `#3d7a4a` (verde inchis LOCKED) / Edit-mode training `#d4e6cb` (verde deschis)
- **Prod:** Calendar7Day.tsx line 96-107 — exact hex values preserved
- **Compliance:** ✓

### F-pass4-color-05 — Coach quote color `#e8d9b8` (cream tan)

- **Severity:** NIT
- **Mockup:** Coach quote subtle cream tan `#e8d9b8` (ink card context)
- **Prod:** CoachTodayCard uses `style={{ color: '#e8d9b8' }}` inline — matches mockup
- **Compliance:** ✓ preserved

---

## §P4.5 Icon size minor

### F-pass4-iconsize-01 — Lucide icon sizes 14/16/18/20/24 mockup vs Tailwind defaults

- **Severity:** NIT
- **Pattern:**
  - Mockup uses `style="width:14px; height:14px"` for chip icons (clock + layers in Antrenor today)
  - Prod uses Tailwind `w-3.5 h-3.5` (14px ✓) or `w-4 h-4` (16px default Lucide-react)
- **Sample divergence:** Mockup Antrenor "clock" 14px vs prod w-4 h-4 (16px)
- **Fix:** Surgical class swap (`w-3.5` for 14px)
- **Beta blocker?** NO (Wave 4)

### F-pass4-iconsize-02 — Back button arrow size

- **Severity:** NIT
- **Mockup:** Back-btn arrow `<i data-lucide="arrow-left">` no explicit size (default)
- **Prod:** `ArrowLeft className="w-5 h-5"` (20px)
- **Beta blocker?** NO

---

## §P4.6 Text alignment subtle

### F-pass4-textalign-01 — Calendar week title centering

- **Severity:** LOW
- **Mockup:** "Program de antrenament" CENTRAT per Daniel reglaj 2026-05-12
- **Prod:** Calendar7Day title "Saptamana" `text-left` (default flex layout)
- **Mockup ref:** `andura-clasic.html:836`
- **Prod ref:** `Calendar7Day.tsx:59-61`
- **Fix:** Surgical (`text-center` + adjust flex)
- **Beta blocker?** YES (Daniel reglaj contradiction — escalated to HIGH în Pass 2 P1 finding F-pass2-calendar-01)

### F-pass4-textalign-02 — Empty state center alignment

- **Severity:** NIT
- **Pattern:** Empty state messages should be center-aligned with icon + text
- **Prod:** Istoric empty state ✓ `text-center` (line 96-103)
- **Compliance:** ✓

---

## §P4.7 Animation timing curves (deferred — no Pass 4 visual)

### F-pass4-animation-01 — Page transition curves not audited (Pass 5 visual needed)

- **Severity:** TBD
- **Mockup:** Page-enter / page-exit CSS animations defined în mockup (line ~190+ CSS block)
- **Prod:** React Router transitions — TBD (no audit Pass 4 without runtime observation)
- **Beta blocker?** NO (Wave 4 — animation polish post-MVP)

---

## §P4.8 Other minor token / pattern observations

### F-pass4-other-01 — Romanian no-diacritics LOCK V1 compliance

- **Severity:** OK (positive cross-screen)
- **Mockup D-LEGACY-064:** ZERO diacritics rule
- **Prod compliance:** Pass 1 + Pass 2 sample didn't find diacritic violations în prod text. Generally compliant.
- **Beta blocker?** N/A — compliance

### F-pass4-other-02 — Lucide icon name consistency

- **Severity:** OK (positive)
- **Sample:** Both mockup + prod use Lucide icon library — name conventions matched (arrow-left / chevron-right / pencil / check etc.)
- **Compliance:** ✓ — minor exceptions where prod uses MonitorCog / SlidersHorizontal where mockup uses sliders / monitor — semantic equivalents
- **Beta blocker?** NO

---

## Pass 4 polish summary

**~22 LOW + NIT findings aggregate** (mostly token drift micro-divergences):
- Spacing: ~5 findings (asymmetric padding mockup vs symmetric prod)
- Border-radius: ~3 findings (12/14/16/18 mockup vocabulary vs Tailwind defaults)
- Font-weight: ~2 findings (700 mockup vs 600 prod titles)
- Color shade: ~5 findings (3 OK compliance + 2 minor verify)
- Icon size: ~2 findings (14px mockup vs 16px default Lucide-react)
- Text alignment: ~2 findings (1 escalated HIGH — Calendar title)
- Animation: 1 deferred
- Other: 2 positive compliance findings

**Pass 4 cumulative parity impact:** Marginal (~2-3% if all polish applied). Won't move overall ~36% mockup parity significantly.

**Wave 3 polish effort estimate:** ~4-6h cross-screen surgical Tailwind class adjustments (~1 LOC change × ~40 locations).

**Karpathy attribution:** ALL ~22 findings = Surgical Changes (no architecture, no engine wire — purely token/class adjustments).
