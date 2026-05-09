# LATEST — Themes Batch 2b-vi Luxury Istoric + Tab Nav + Zona Sensibilă

**Status:** ✅ Complete (Task 1 enriched, Task 2 user-confirmed full cleanup, Task 3 critical DOM bug fixed)
**Model:** Opus
**Date:** 2026-05-09 2235
**Backup tag:** `pre-themes-batch2b-vi-luxury-istoric-tabnav-zonasens-2026-05-09-2235` (pushed origin)
**Authority:** `00-index/CURRENT_STATE.md` §NOW Mid-flight Batch 2b items #8 + #9 + #10

---

## Task 1 — Istoric Placeholder Data Parity

### PHASE 1.1 — Audit findings
- **Luxury Istoric** (stage 21 line 1473+ pre-fix): title + 4 filter chips + 7 workout rows (3 Împins + 2 Tras + 2 Picioare). NO aggregate/summary data
- **Clasic Istoric** (line 775+): title + 3 stat cards (12 Zile / 68 Sesiuni / 14 Recorduri) + heatmap calendar Mai 2026 + 3 recent sessions detailed + 4 drill-downs (Greutate&BF, Nutriție, Recorduri Personale, Programe arhivă)
- **Living Body Istoric** (line 1093+): identical structure to Clasic (mirror)
- **Parity gap**: Luxury has more workout rows (7 vs 3) but lacks AGGREGATE data layer (stats/heatmap/drill-downs)
- **Filter chips functionality** already landed Batch 2b-v Task 4 ✅

### PHASE 1.2 — Implementation
Added (preserving Bugatti restraint, NOT full Clasic-feature copy which would be anti-aesthetic bloat):
- **Stats summary line** before filter chips: 3 numbers (12 Zile · streak / 68 Sesiuni / 14 Recorduri) using `num-display` Cormorant + `etched etched-silver` muted labels (matches Luxury aesthetic)
- **2 additional rows** for richer filter UX: 1 Picioare (Sâmbătă · 19 Apr) + 1 Tras (Joi · 17 Apr) — total 9 rows distributed 3+3+3 across filter chip categories (better demo for filterHistory single-select chip behavior)
- Token discipline: `var(--champagne)` accent on streak number, default white on others, `etched-silver` (silver-2 #8a877f passing 5.66:1 WCAG AA) labels — NO new tokens

---

## Task 2 — Tab Nav Root V2 SSOT

### PHASE 2.1 — Audit findings
- **TAB_LABELS array (line 2170)**: `['Antrenor', 'Progres', 'Istoric', 'Cont']` — V2 SSOT canonical ALREADY ✅
- **TABS array (line 2169)**: `[11, 23, 21, 25]` — stage-id mapping per V2 canonical
- **JS rewrite (line 2179-2185)**: `stages.forEach((s) => { ... s.querySelector('.nav').innerHTML = TAB_LABELS.map(...).join('') })` — overrides ALL static `.nav` blocks at runtime forcing V2 canonical
- **Static HTML** (7 nav blocks at lines 1189/1223/1358/1495/1568/1602/1637 pre-fix): drift labels `Azi / Antren. / Progres / Cont` — overridden at runtime but visible during FOUC <50ms

### Premise validation — discussed with user via AskUserQuestion (2026-05-09 ~22:38)
User chose **"Clean static HTML (28 edits)"** option to align static = runtime SSOT (eliminate FOUC + code clarity).

### PHASE 2.2 — Implementation
- All 7 static `.nav` blocks rewritten to match JS rewrite output exactly: 4 buttons with `data-tab-idx="0|1|2|3"` + V2 canonical labels (Antrenor/Progres/Istoric/Cont) + matching TAB_ICONS SVGs (sparkle/lightning/calendar/person, Lucide-style stroke 1.6, currentColor)
- 4 distinct edits per active-tab variant (1 with pos-1 active + 4 replace_all=true with pos-2 active + 1 with pos-3 + 1 with pos-4) → 7 blocks total
- `.active` class removed from static (added dynamically by `setActive()` line 2191-2193 via tabIdx match) — clean separation static structure / runtime state
- Verified: `>Azi<` count 0 / `>Antren.<` count 0 / `>Antrenor<` count 9 (7 nav + 2 elsewhere) / `>Istoric<` count 8 (7 nav + 1 history heading) / `data-tab-idx="0"` count 7

---

## Task 3 — Zona Sensibilă UI Nesting Deep DOM

### PHASE 3.1 — Audit findings + visual hierarchy mental walk

**5-step trace settings structure:**

1. **Outermost section** stage 25 Cont root (line 1614+): `.stage-wrap > .phone > .scroll > [direct-children]` — 3 levels deep. Clean.
2. **Subsection groups** stage 25: 4 logical sections grouped by `<div class="etched">SECTION</div>` headers — "Profil & date" / "Aspect" / "Privacy & legal" / "Sensibil"
3. **"Deconectare/Ștergere" placement** (line 1633): single row in "Sensibil" section, color `#c87878` muted red, arrow `→` indicating drill-down. Routes to stage 34 (settings-danger sub-page) via ROUTES[25]['deconectare'/'ștergere']: 34. Bugatti restraint compliant ✅
4. **Visual hierarchy fonts/spacing**: section headers `etched` 9px JetBrains Mono uppercase + 22px padding-top spacing between sections. Clean.
5. **Comparison Clasic+LB Cont stage**: similar structure (sections + rows + sub-page drill for destructive). Parity OK.

### CRITICAL BUG FOUND — stage 34 settings-danger lines 1844-1847

4 destructive cards opened with `<div class="row" style="...">` but CLOSED with `</button>` — **MISMATCHED HTML TAGS**. Browsers may auto-close divs prematurely or interpret as text content, corrupting DOM hierarchy and breaking layout.

```html
<!-- Pre-fix BROKEN: -->
<div class="row" style="border:0.5px solid rgba(200,120,120,0.2); ..."><span class="row-label">Reset antrenor</span>...</button>
```

### PHASE 3.2 — Implementation
- 4 mismatched cards fixed: `<div class="row">` → `<button class="row">` (matches existing `</button>` close)
- 3 cards used replace_all=true for shared opening pattern (alpha 0.2)
- 1 card (Șterg contul, line 1847) used unique edit for distinct opening (alpha 0.4 — final destructive emphasis)
- `<button>` is also semantically correct (clickable destructive action) + works with global click handler `e.target.closest('button, .chip')` for ROUTES text-match

### PHASE 3.3 — Verify
- Mismatched `<div class="row">...</button>` count: 0 ✅ (was 4)
- 4 cards now properly `<button class="row">...</button>` confirmed via grep at lines 1844-1847
- Other skins untouched: clasic + living-body + brain-coach all `git diff --stat` empty ✅

---

## PHASE 4 — Tests + Commit + Push

- **Tests:** 2731 PASS / 0 FAIL (148 files) — baseline preserved exactly (mockup-only edits, ZERO src/ changes)
- **Diff stat:** 39 insertions(+), 32 deletions(-) on `04-architecture/mockups/andura-luxury.html` — refactor heavy (28 nav button replacements + 4 tag fixes + 9 row stats/data adds)
- Commit SHA: `d8245a14acc2611d2c538b6ee4c1717c462d00c1`
- Push status: `pushed origin/main` (range `b422e10..d8245a1`) confirmed via `git log -1 --format='%H %s'`

---

## Issues (drift / push-back / ambiguity)

- **Task 2 PREMISE INVALIDATED at runtime — but accepted user-directed cleanup**: V2 canonical labels were already enforced via TAB_LABELS array + JS rewrite. Static HTML was dead code with FOUC <50ms visible drift. User chose to clean static for full alignment (preferred craft over minimal-diff).
- **Task 3 ROUTING GAP for "Șterg istoricul" + "Șterg contul"**: ROUTES[34] = `{ 'reset': 35, 'schimbă': 36, 'fază': 36, 'faza': 36 }` — only 2/4 destructive cards have valid routes. "Șterg istoricul" + "Șterg contul" click → no route match → silent fail. Out of Task 3 structural scope (would need new confirm-history-delete + confirm-account-delete sub-pages = scope creep). **Flagged for follow-up batch.**
- **Task 1 NOT FULL FEATURE PARITY with Clasic+LB**: Clasic+LB Istoric have stat-cards + calendar heatmap + drill-downs. Luxury added stats summary line + 2 more rows but NOT heatmap/drill-downs. Decision per Bugatti restraint: heatmap copy = anti-aesthetic bloat for Luxury Cormorant Garamond minimal aesthetic. Drill-downs = separate scope (would touch settings/history weight-timeline integration).
- **Bugatti aesthetic preserved strict** all 3 tasks: existing tokens only (`--champagne` / `--silver-*` / `--noir` / `#c87878` muted red / Cormorant Garamond), NO new hues, NO alarmist destructive UI.

---

## Next action

Batch 2b-vii: Andura Clasic Progres "Loghează greutate" toast → real drill-down weight log entry (kg + dată per Daniel directive "production-ready strict"). Single skin Clasic, single feature, LOW-MEDIU risk.

Optional follow-up: Add `'șterg istoricul': X, 'șterg contul': Y` ROUTES entries + 2 new confirm sub-page screens (confirm-history-delete + confirm-account-delete) for Luxury production-ready completeness. Estimated effort: 2 confirm screens ~30 lines each + ROUTES patch.
