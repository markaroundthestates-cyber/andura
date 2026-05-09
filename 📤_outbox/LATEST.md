# LATEST — Themes Batch 2b-viii Luxury Routing Gap Closure

**Status:** ✅ Complete
**Model:** Opus
**Date:** 2026-05-09 2302
**Backup tag:** `pre-themes-batch2b-viii-luxury-routing-gap-closure-2026-05-09-2302` (pushed origin)
**Authority:** `00-index/CURRENT_STATE.md` §NOW Mid-flight Batch 2b item #10 closure + Daniel directive 2026-05-09 "100% compliant or no UX = no Beta" + Bugatti F4 frictionless Maria 65 (zero silent fail clicks) + 2b-vi LATEST flagged routing gap follow-up

---

## PHASE 1 — Audit findings

- **ROUTES[34] current** (line 2263 pre-fix): `{ 'reset': 35, 'schimbă': 36, 'fază': 36, 'faza': 36 }` — 4 destructive cards stage 34 but only 2 routed (reset + schimbă). 'Șterg istoricul' + 'Șterg contul' clicks → silent fail (Bugatti F4 FAIL).
- **Max stage-id existing = 45** (NOT 36 as prompt assumed) — 45 total stages, ROUTES 1-45 all populated. Prompt suggested IDs 37+38 already taken → **escalated to 46+47 sequential** (next available, no collision).
- **NO existing `confirm-history-delete` / `confirm-account-delete`** ✅ (anti-duplicate clean)
- **5 confirm-* template structure** (verified stage 35 line 1856-1872 confirm-reset-coach):
  ```html
  <div class="stage-wrap" data-stage-id="<N>" data-screen-id="confirm-<X>">
    <div class="phone">
      <div class="status-bar">...</div>
      <div class="scroll" style="display:flex; flex-direction:column;">
        <div class="sub-header"><button class="back-arrow">←</button>...sub-crumb...sub-title</div>
        <div class="confirm-block">
          <div class="splash-monogram" style="...border-color:#c87878; color:#c87878;">!</div>
          <div class="etched" style="...color:#c87878;">Ireversibil</div>
          <p class="lux-body" style="font-size:17px;">primary text...</p>
          <p class="lux-body" style="font-size:14px; color:var(--silver-2);">secondary text...</p>
        </div>
        <div class="action-bar">
          <button class="btn-noir" onclick="back()">Anulează</button>
          <button class="btn-danger">Confirm action</button>
        </div>
      </div>
    </div>
    <div class="stage-num">XXXV</div>
    <div class="stage-label">Confirm › X</div>
  </div>
  ```
- **NO `runConfirm()` function** in Luxury — destructive btn-danger has NO onclick, relies on ROUTES text-match (existing pattern: button text "Confirm reset" → ROUTES[35]['confirm']: 25 = settings root). Adapted prompt template (which suggested `onclick="runConfirm(...)"`) to Luxury convention strict.
- **Insertion point** identified: line 2127 (end stage 45 closing `</div>`) before line 2129 `<script>` — **append at end** preserves sequential `stages[N-1]` array index mapping (JS `setActive(id)` uses `stages[id-1]` so DOM order must match data-stage-id numerically).
- **Roman labels**: stage-num XLVI (46) + XLVII (47).

---

## PHASE 2 — Implementation

### 2.1 ROUTES[34] entries (line 2301)
- Before: `34: { 'reset': 35, 'schimbă': 36, 'fază': 36, 'faza': 36 },`
- After: `34: { 'reset': 35, 'schimbă': 36, 'fază': 36, 'faza': 36, 'șterg istoricul': 46, 'șterg contul': 47 },`

### 2.2 ROUTES[46] + ROUTES[47] entries (lines 2313-2314)
- `46: { 'confirm': 25, 'da': 25, 'șterg': 25 },`
- `47: { 'confirm': 25, 'da': 25, 'șterg': 25 },`
- Pattern: confirm sub-pages → on btn-danger click → ROUTES text-match 'confirm' → go(25) settings root (parallel to existing ROUTES[35] confirm-reset-coach pattern)

### 2.3 screen-confirm-history-delete sub-page (stage 46)
- Lines added ~22 after stage 45 (line 2128+): full template per existing confirm-* structure
- Title: "Șterg istoricul?" / sub-crumb "Confirm › Istoric"
- Primary text: "Toate sesiunile, statisticile și recordurile vor fi *șterse permanent*."
- Secondary text (`--silver-2`): "Programele și setările contului rămân intacte."
- Anulează (btn-noir + onclick=back()) + Confirm ștergere (btn-danger, no onclick — relies on ROUTES[46]['confirm']: 25)
- Stage-num XLVI / stage-label "Confirm › Istoric"

### 2.4 screen-confirm-account-delete sub-page (stage 47)
- Lines added ~22 sequential after stage 46
- Title: "Șterg contul?" / sub-crumb "Confirm › Cont"
- Primary text: "Contul, datele biometrice, istoricul și abonamentul vor fi *șterse permanent*. Nu pot fi recuperate."
- Secondary text (`--silver-2`): "Vei fi deconectat și redirecționat la ecranul inițial."
- Etched tag emphasis: "Ireversibil — definitiv" (slightly stronger than history's plain "Ireversibil" — final destructive nuclear)
- Same Anulează + Confirm ștergere pattern
- Stage-num XLVII / stage-label "Confirm › Cont"

### Bugatti restraint discipline preserved strict
- `#c87878` muted red on splash-monogram + etched + nowhere alarmist
- NO caps shouting / NO emergency icons (just `!` glyph in splash-monogram circle)
- Cormorant Garamond (lux-body class) preserved
- Action verb "Confirm ștergere" parallel existing "Confirm reset" / "Confirm" pattern
- NO new tokens / classes invented (anti-RE Gigel — template fidelity 1:1 match existing)

### Cross-validation
- 2 sub-pages count: history=1 / account=1 ✅
- ROUTES[34] entries: 6 keys total (reset + schimbă + fază + faza + șterg istoricul + șterg contul) ✅
- ROUTES[46] + ROUTES[47] entries: present ✅
- Stage-id sequence: 43 → 44 → 45 → 46 → 47 ✅ (no collision, no gap)
- Routing chain mental walk:
  1. Stage 34 (settings-danger) → click "Șterg istoricul" → ROUTES[34]['șterg istoricul']: 46 → confirm-history-delete ✅
  2. Stage 34 → click "Șterg contul" → ROUTES[34]['șterg contul']: 47 → confirm-account-delete ✅
  3. Stage 46/47 → click "Confirm ștergere" → ROUTES[46/47]['confirm']: 25 → settings root ✅
  4. Stage 46/47 → click "Anulează" → onclick=back() → navStack pop to stage 34 ✅
- Other skins untouched: clasic + living-body + brain-coach all `git diff --stat` empty ✅

---

## PHASE 3 — Tests + Commit + Push

- **Tests:** 2731 PASS / 0 FAIL (148 files) — baseline preserved exactly (mockup-only edits, ZERO src/ changes)
- **Diff stat:** 41 insertions(+), 1 deletion(-) on `04-architecture/mockups/andura-luxury.html` — ROUTES[34] line modified + 2 new ROUTES entries + 2 new sub-pages (~22 lines each)
- Commit SHA: `37185c2cff5f6e4e2405173d249eeba6d0077395`
- Push status: `pushed origin/main` (range `8971254..37185c2`) confirmed via `git log -1 --format='%H %s'`

---

## Issues (drift / push-back / ambiguity)

- **Stage-id assignment drift from prompt template**: Prompt suggested `<NEW_HISTORY_STAGE> = 37`, `<NEW_ACCOUNT_STAGE> = 38` but max existing stage-id is 45 (Luxury has 45 stages, more than other skins). Used 46+47 sequential. Documented in PHASE 1.
- **runConfirm() pattern absent in Luxury**: prompt template suggested `<button onclick="runConfirm('Istoric șters.')">Șterg istoricul</button>` but Luxury has NO `runConfirm()` function (verified via grep). Adapted to Luxury existing convention: btn-danger NO onclick + button text-match via ROUTES (parallel to existing confirm-reset-coach line 1867 pattern). Anti-RE Gigel principle: match existing patterns, NU introduce new vocabulary.
- **Button text "Confirm ștergere" not "Șterg istoricul/contul"**: prompt template suggested button text matches the destructive action ("Șterg istoricul") but existing pattern in Luxury uses verb form "Confirm reset" (line 1867). Used parallel "Confirm ștergere" — matches ROUTES[46/47]['confirm']: 25 exactly. Daniel can adjust wording if preferred different.
- **`runConfirm()` toast feedback semantically lost**: existing toast feedback ("Istoric șters." / "Cont șters.") not displayed because Luxury doesn't have toast pattern + runConfirm. Routing back to settings (25) provides implicit feedback (user lands back at danger menu, sees nothing changed in mockup since data is fake). V2 React migration would handle proper feedback via dispatch.
- **No format fatigue / no scope creep / no recurring slip**: clean execution PHASE 1 audit ÎNAINTE PHASE 2 modify. All 4 other skins verified untouched. ROUTES + sub-pages + stage-id all sequential clean.

---

## Themes Batch 2b SCOPE COMPLETE 🦫

**8 sub-batches LANDED sequential fail-stop** (2026-05-09):

| Batch | Description | Commit SHA |
|-------|-------------|------------|
| 2b-i | Auth Q6 cross-skin + Brain Coach blocker fix | `f5e9dc0` |
| 2b-ii | Splash auto-advance Clasic + Living Body | `2e71422` |
| 2b-iii | Living Body modal HALT (premise invalidated) + Body fatigue Q1 V2 prep wiring | `4c79fbc` |
| 2b-iv | Luxury onboarding 4 fixes deep CSS (slider/sex/antecedente/frecvență WCAG) | `1ca105a` |
| 2b-v | Luxury Cum e Azi flow 5 fixes multi-screen (energy/Anulează/disponibilitate/redirect/blocaj) | `56e2813` |
| 2b-vi | Luxury Istoric data parity + Tab Nav V2 SSOT + Zona Sensibilă DOM bug fix | `d8245a1` |
| 2b-vii | Clasic Loghează greutate real drill-down (production-ready directive) | `fbe98a6` |
| 2b-viii | Luxury routing gap closure (this batch) | `37185c2` |

**Tests 2731 PASS preserved** across all 8 batches. **Cumulative LOCKED V1 ~707-709 PRESERVED** unchanged (mockup polish meta-tooling NU additive product/architecture).

**Cross-skin coverage:**
- Clasic: 3 batches (2b-i, 2b-ii, 2b-vii)
- Living Body: 3 batches (2b-i, 2b-ii, 2b-iii)
- Luxury: 5 batches (2b-i, 2b-iv, 2b-v, 2b-vi, 2b-viii)
- Brain Coach: 1 batch (2b-i blocker fix only)

**Production-ready blockers cleared:**
- ✅ Auth flow cross-skin "Continuă fără cont" + risk text canonical (2b-i)
- ✅ Splash auto-advance pattern parity 3/4 skins (2b-ii)
- ✅ Body fatigue Q1 V2 prep wiring 7 grupes data-muscle (2b-iii)
- ✅ Luxury onboarding WCAG SC 1.4.11 + slider + sex/antecedente interactivity (2b-iv)
- ✅ Luxury Cum e Azi flow 5 silent-fail fixes (2b-v)
- ✅ Luxury Istoric data + Tab Nav V2 + critical DOM tag mismatch fix (2b-vi)
- ✅ Clasic real Loghează greutate drill-down (2b-vii)
- ✅ Luxury 2 silent-fail destructive routing fixes (2b-viii — this)

---

## Next action

**Daniel smoke test browser 4 mockups end-to-end** (validate flows match LATEST.md mental walks per batch).

**Claude chat handover preventive ~25-30% bandwidth threshold** (themes batch 2b complete → can be removed from KB context to free 13%).

**Optional follow-ups post-handover** (deferred):
- WCAG dedicated audit batch (`silver-3` 2.94:1 widely used Luxury muted text — flagged in 2b-iv LATEST)
- "Cum se face" feature batch (free-exercise-db Pareto subset bundled local + RO mapping + UI cross-skin per Daniel directive 2026-05-09)
- Engine Q1 aggregator 19 heads → 7 grupes Living Body V2 prep wiring (flagged in 2b-iii LATEST)
- Brain Coach theme picker DOM unification (item #12 — optional aesthetic, defer post-Beta?)
- Luxury Brain Coach Google + email auth buttons no onclick (out of scope 2b-i flag — currently rely on ROUTES[2] text-match)
- "Anulez reînnoirea" line 1709 abonament wording normalization (intentionally preserved 2b-v)
