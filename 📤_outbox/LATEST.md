# LATEST — Themes Batch 2b-vii Clasic Loghează Greutate Real Drill-Down

**Status:** ✅ Complete
**Model:** Opus
**Date:** 2026-05-09 2253
**Backup tag:** `pre-themes-batch2b-vii-clasic-log-weight-2026-05-09-2253` (pushed origin)
**Authority:** `00-index/CURRENT_STATE.md` §NOW Mid-flight Batch 2b item #11 + Daniel directive 2026-05-09 "production-ready strict — Loghează greutate = real drill-down NU toast"

---

## PHASE 1 — Audit findings

- **"Loghează greutate" trigger button** line 1142 (Antrenor screen, "Alerte azi" / nutrition section): `<button class="btn-brick" onclick="showToast('Loghează greutate — drill input')" style="width:100%; margin-top:18px; ..."><i data-lucide="scale"></i> Loghează greutate</button>` — toast-only, no real drill-down
- **`showToast(msg)`** function exists line 2163 — reusable for save confirmation feedback
- **`goto(name, opts)`** function exists line 1922 — accepts string name without 'screen-' prefix
- **`back()`** function exists line 1969 — pops navStack OR fallback `goto('settings', {replace:true})`
- **5 confirm-* sub-pages** template (lines 1497-1643): pattern `<div class="screen paper-bg sub-page" id="screen-X" data-screen-label="...">` + `<div class="sub-header"><button class="back-btn" onclick="back()"><i data-lucide="arrow-left"></i></button><h2>...</h2></div>` + `<div class="phone-scroll" style="padding: 8px 24px 24px; overflow-y:auto; flex:1;">` body content
- **Form input pattern** existing line 514 (`onb-age-input`): inline-styled `type="number" min="X" max="Y" placeholder="..."` with `padding:18px 20px; border:1px solid #e7e0d0; border-radius:14px; font-size:28px; font-weight:600; text-align:center; background:white; color:#1a1815; font-family:'JetBrains Mono', monospace`
- **Action buttons existing**: `.btn-brick` (primary brick #c8412e), `.btn-ghost` (secondary transparent)
- **NO `topbar` / `form-group` / `form-label` / `form-input` classes** — Clasic uses inline styles + `sub-header` (NOT prompt's `topbar`). Adapted prompt template to Clasic conventions.
- **NO existing `screen-log-weight`** ✅ (anti-duplicate clean — no DRIFT)
- **Insertion point identified**: after confirm-delete (line 1643 `</div>` closing) before settings-export (line 1647 opening) — natural placement in sub-page cluster

---

## PHASE 2 — Implementation

### 2.1 Trigger button update (line 1141-1144)
- Before: `<button class="btn-brick" onclick="showToast('Loghează greutate — drill input')" ...>`
- After: `<button class="btn-brick" onclick="goto('log-weight')" ...>`
- Comment updated: "(real drill-down sub-page Batch 2b-vii — production-ready directive Daniel 2026-05-09)"
- Visual placement preserved (width:100%; margin-top:18px; flex centered with scale icon)

### 2.2 New screen-log-weight sub-page (line 1645-1664)

19 lines inserted after confirm-delete cluster, before settings-export. Structure:
- `<div class="screen paper-bg sub-page" id="screen-log-weight" data-screen-label="Antrenor › Loghează greutate" style="height:100%; flex-direction:column;">`
- `<div class="sub-header">` with back-btn + `<h2>Loghează greutate</h2>`
- `<div class="phone-scroll">` body with `display:flex; flex-direction:column; gap:18px;`
- 2 form fields:
  - **Greutate (kg) input**: `type="number" step="0.1" min="30" max="250" inputmode="decimal" placeholder="ex. 78.5"` styled per existing onb-age-input pattern (28px JetBrains Mono centered)
  - **Data input**: `type="date"` styled smaller (16px, 12px border-radius)
- Hint text: "Înregistrarea este salvată local. Vei vedea evoluția în Greutate &amp; BF."
- Spacer `flex:1;` + 2 action buttons: `.btn-brick` "Salvează" (onclick=saveWeightEntry()) + `.btn-ghost` "Anulează" (onclick=back())

### 2.3 CSS form styling — REUSED existing patterns (no new classes added)
Per PHASE 1 finding, Clasic uses inline styles for form inputs (line 514 onb-age-input). Reused that exact pattern for `weight-kg-input` (large 28px Mono centered). Date input slightly smaller pattern. NO new `.form-group/.form-label/.form-input` CSS classes added — follows Clasic convention strict.

### 2.4 saveWeightEntry handler (lines 2189-2208)

```js
function saveWeightEntry() {
  const kgInput = document.getElementById('weight-kg-input');
  const dateInput = document.getElementById('weight-date-input');
  const kg = parseFloat(kgInput && kgInput.value);
  const date = dateInput && dateInput.value;
  if (!kg || isNaN(kg) || kg < 30 || kg > 250) {
    showToast('Introdu o greutate validă (30–250 kg)');
    if (kgInput) kgInput.focus();
    return;
  }
  if (!date) {
    showToast('Selectează data înregistrării');
    if (dateInput) dateInput.focus();
    return;
  }
  showToast('Salvat: ' + kg + ' kg · ' + date);
  if (kgInput) kgInput.value = '';
  back();
}
window.saveWeightEntry = saveWeightEntry;
```

Validation: range 30–250 kg + required date. Both errors trigger toast + focus the offending input. Success toast confirms saved value + date, clears kg input (preserves date for repeat sessions same day), calls back() to return to Antrenor.

**Plug-and-play React migration ready**: future swap = `saveWeightEntry()` body becomes `useWeightLog().add(kg, date)` hook call (1-line). Persistence + trend recompute handled in React state/Firestore layer.

### 2.5 DOMContentLoaded date default (lines 2210-2215)
- Auto-fills `weight-date-input.value` = today's date (`new Date().toISOString().split('T')[0]`)
- Skips if already filled (idempotent)
- User only types kg; date pre-set to today (Bugatti F4 frictionless)

### 2.6 Cross-validation
- `screen-log-weight` count: **1** ✅
- `goto('log-weight')` trigger count: **1** ✅ (replaces removed showToast trigger)
- `saveWeightEntry` refs: **3** ✅ (function def + `window.saveWeightEntry =` + 1 onclick)
- Stale `showToast('Loghează greutate...)` count: **0** ✅ (cleanly removed)
- Other skins untouched: living-body + luxury + brain-coach all `git diff --stat` empty ✅

---

## PHASE 3 — Tests + Commit + Push

- **Tests:** 2731 PASS / 0 FAIL (148 files) — baseline preserved exactly (mockup-only edits, ZERO src/ changes)
- **Diff stat:** 54 insertions(+), 2 deletions(-) on `04-architecture/mockups/andura-clasic.html` — additive (new sub-page DOM 19 lines + JS handler 25 lines + DOMContentLoaded 6 lines + button onclick 2-line swap)
- Commit SHA: `fbe98a61d6b8187413f8b69a1cc5e2083c45af1a`
- Push status: `pushed origin/main` (range `0efa8e9..fbe98a6`) confirmed via `git log -1 --format='%H %s'`

---

## Issues (drift / push-back / ambiguity)

- **Prompt template adapted to Clasic conventions**: Prompt suggested `topbar/topbar-back/topbar-title/screen-body/form-group/form-label/form-input/form-hint/btn-secondary` classes but Clasic codebase uses `sub-header/back-btn/h2/phone-scroll/inline-styled inputs/small-text/.btn-ghost`. Used Clasic-canonical (anti-RE Gigel principle — match existing patterns, NU introduce new vocabulary).
- **Form CSS NOT abstracted into named classes**: Clasic uses inline styles on form inputs (e.g., `onb-age-input` line 514) — followed same pattern for `weight-kg-input`/`weight-date-input` to preserve consistency. Future refactor could promote to shared form-* classes if Clasic grows multiple form screens, but out of single-feature scope.
- **`showToast` reused for save confirmation**: not a "real persistence" since mockup-only; the toast acknowledgment is canonical Clasic feedback pattern. V2 React migration will replace with `useWeightLog().add()` + dispatch UI feedback through proper state management.
- **No new ROUTES entry needed**: Clasic uses `goto(name)` direct (NOT Luxury's text-match ROUTES table) — `goto('log-weight')` resolves to `screen-log-weight` automatically via Clasic's `getElementById('screen-' + name)` pattern (line 1932).
- **No format fatigue / no scope creep / no drift**: clean execution PHASE 1 audit ÎNAINTE PHASE 2 modify, all 4 other skins verified untouched.

---

## Next action

Batch 2b-viii: Luxury routing gap closure — ROUTES[34] add `'șterg istoricul': X` + `'șterg contul': Y` entries + 2 new confirm sub-pages (confirm-history-delete + confirm-account-delete) per Bugatti F4 production-ready directive (flagged in 2b-vi LATEST). Single skin Luxury, simplu structural, LOW risk. Estimated ~15-20 min CC.
