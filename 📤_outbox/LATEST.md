# LATEST — Themes Batch 2b-i Auth Cross-Skin + BC Blocker Fix

**Status:** ✅ Complete
**Model:** Opus
**Date:** 2026-05-09 2100
**Backup tag:** `pre-themes-batch2b-i-auth-cross-skin-2026-05-09-2100` (pushed origin)
**Authority:** HANDOVER_AUTH_FLOW §56.1.1 + §56.3.1 (auth-banner-soft post-T0 canonical) + Bugatti F4 frictionless Maria 65 + Daniel directive "100% compliant or no UX = no Beta"

---

## PHASE 1 — Pre-flight grep & audit findings

### Andura Clasic (`04-architecture/mockups/andura-clasic.html`)
- `screen-auth` container: line 387 `<div class="screen paper-bg" id="screen-auth">`
- `screen-onboard` container: line 435 `<div class="screen paper-bg" id="screen-onboard">`
- Routes pattern: `goto(name)` function (defined line 1908)
- Auth buttons: Email link form + "Continuă cu Google" btn-ghost line 410-413 with `onclick="goto('onboard')"`
- Insertion point identified: AFTER Google btn closing `</button>` (line 413), BEFORE `</div>` of `auth-form` (was line 414)
- CSS tokens: NO `:root` declared — hardcoded hex throughout (`#1a1815`, `#3a342d`, `#8a8278`, `#c8412e`, `#e7e0d0`, `#f3ede1`)

### Andura Living Body (`04-architecture/mockups/andura-living-body.html`)
- `screen-auth` container: line 527 `<div class="screen paper-bg" id="screen-auth">`
- `screen-onboard` container: line 575
- Routes pattern: `goto(name)` function
- Auth buttons: Email + "Continuă cu Google" btn-ghost line 550-553 with `onclick="goto('onboard')"`
- Insertion point: AFTER Google btn `</button>` (line 553), BEFORE `</div>` of `auth-form` (was line 554)
- CSS tokens: NO `:root` — hardcoded LB palette (`#f0eadb`, `#b8b0a0`, `#8b8470`, `#d4a574`, `rgba(212,165,116,0.15)`)

### Andura Luxury (`04-architecture/mockups/andura-luxury.html`)
- Auth structure DIVERGENT: `<div class="stage-wrap" data-stage-id="2" data-screen-id="auth">` line 889 (stage-based showcase, NU classic screen container)
- Routing pattern DIVERGENT: `go(id)` function (line 2150) + `ROUTES[id]` map (line 2165) text-match — buttons static, click handler matches button text against `routes[k]` keys
- ROUTES[2] (auth → onboard) line 2167 had: `'autentificare': 3, 'continuă cu google': 3, 'începe': 3, 'linkul': 3, 'cere acces': 3`
- Insertion point: AFTER Google btn-noir line 906, BEFORE "Membru nou? · Cere acces" footer (line 907)
- CSS tokens: `:root` declared lines 11-30 — `--champagne #c9a663`, `--silver-2 #8a877f`, `--silver-3 #5a5851`, `--noir`, `--line`, `--line-strong`, `--hair`

### Andura Brain Coach (`04-architecture/mockups/andura-brain-coach.html`)
- `screen-splash` line 1864 `<div class="screen active" id="screen-splash">`
- `screen-auth` line 1887 `<div class="screen" id="screen-auth">`
- `screen-onboard` line 1919
- Routes pattern: `goto(name, opts)` function (line 4696)
- setTimeout splash→auth: lines 4759-4762 `setTimeout(() => { ... if (cur && cur.id === 'screen-splash') goto('auth', {replace: true}); }, 1500);` — CONFIRMED 1.5s flow
- **BLOCKER CONFIRMED**: existing Google btn (line 1903) + email btn (line 1907) have NO `onclick` handlers — user lands on auth post-1.5s with no escape path
- Insertion point: AFTER email btn `</button>` (line 1909), BEFORE footnote div (line 1911)
- CSS tokens: `:root` declared lines 10-27 — `--ink-2`, `--ink-3`, `--line`, `--bg-3`, `--think #8b6dff`, `--calm #5dd6e6`

### Continue criteria PHASE 1 → PHASE 2: ALL PASS
- ✅ 4 mockups have auth screens discoverable
- ✅ Routing pattern documented per skin (3× `goto(name)`, 1× `ROUTES[id]` text-match for Luxury)
- ✅ Insertion points identified
- ✅ Brain Coach setTimeout splash→auth flow traced + skip path target `screen-onboard` confirmed

---

## PHASE 2 — Implementation modifications

### Andura Clasic
- Lines 414-426 (~13 inserted): subtle separator (`sau`) + `auth-skip-btn` ghost-style + risk-note paragraph
- Inline styles: `border:1px solid #e7e0d0; color:#8a8278; border-radius:12px; padding:14px 16px` + risk-note `font-size:12.5px; color:#8a8278`
- Routes: `onclick="goto('onboard')"` (uses existing `goto` function)

### Andura Living Body
- Lines 554-566 (~13 inserted): subtle separator + `auth-skip-btn` + risk-note
- Inline styles: `border:1px solid rgba(212,165,116,0.20); color:#b8b0a0` + risk-note `color:#8b8470`
- Routes: `onclick="goto('onboard')"`

### Andura Luxury
- Lines 907-910 (~5 inserted): `auth-skip-btn btn-noir btn-block` + italic etched-style risk-note
- Inline styles: `background:transparent; border:1px solid var(--line-strong); color:var(--silver-2)` + risk-note `color:var(--silver-3); font-style:italic; text-align:center`
- Routes: ROUTES[2] line 2167 added `'fără cont': 3` key (text-match handler routes button text containing "fără cont" → stage 3 onboard)

### Andura Brain Coach
- Lines 1910-1917 (~8 inserted): `auth-skip-btn` + risk-note centered
- Inline styles: `border:1px solid var(--line); color:var(--ink-3); border-radius:12px; padding:13px 16px` + risk-note `color:var(--ink-3); text-align:center`
- Routes: `onclick="goto('onboard')"` (uses existing `goto` function from line 4696)
- **Blocker fix verified**: setTimeout 1.5s splash→auth pattern PRESERVED unchanged (lines 4759-4762 untouched). Click "Continuă fără cont" now triggers `goto('onboard')` direct → `screen-onboard` activated (`<100ms` synchronous DOM `classList.toggle`)

---

## PHASE 3 — Verify

- **Tests:** 2731 PASS / 0 FAIL (148 files) — baseline preserved exactly (mockup-only edits, ZERO src/ changes)
- **CTA grep `Continuă fără cont`:** clasic=1 / living-body=1 / luxury=1 / brain-coach=1 ✅ (4/4)
- **Risk text grep `Datele se salvează doar pe acest dispozitiv`:** clasic=1 / living-body=1 / luxury=1 / brain-coach=1 ✅ (4/4)
- **Skip handler grep `skip-auth|auth-skip-btn`:** clasic=1 / living-body=1 / luxury=1 / brain-coach=1 ✅ (4/4)
- **DOM structure validation:** No broken HTML / unclosed tags. Diff stat: `41 insertions(+), 1 deletion(-)` across 4 files (Luxury -1/+1 from ROUTES[2] line update; rest pure additive)
- **Brain Coach blocker flow trace (manual code-path):** splash active default → setTimeout 1500ms fires → `goto('auth', {replace:true})` activates `screen-auth` → user clicks "Continuă fără cont" (line 1910) → `onclick="goto('onboard')"` → `screen-onboard` (line 1919) activated synchronously via DOM `classList` toggle (sub-100ms)

---

## Commits + Push

- Commit SHA: `(populated post-commit below)`
- Push status: `(populated post-push below)`

---

## Issues (drift / push-back / ambiguity)

- **Luxury skin divergent routing:** stage-based `data-stage-id` + `ROUTES[id]` text-match pattern (NU `goto(name)`). Adapted by adding `'fără cont': 3` key to ROUTES[2] — handler matches button text substring (case-insensitive). NU breaks existing keys (no overlap with `'continuă cu google'` / `'autentificare'` / `'cere acces'` / `'începe'` / `'linkul'`).
- **Clasic + Living Body NO `:root` CSS variables:** prompt assumed token names like `--color-text-muted` / `--lb-text-secondary` not present. Adapted with hardcoded hex matching existing inline patterns elsewhere in same skin (consistent with mockup style).
- **Brain Coach existing Google + email buttons still have NO `onclick`:** out of scope per prompt §2.2 ("PRESERVE setTimeout pattern, ADAUGĂ skip path"). Skip button provides the escape route as specified. Touch existing auth buttons → separate batch.
- **No format fatigue / no scope creep / no recurring slip:** clean execution PHASE 1 audit ÎNAINTE PHASE 2 modify (anti-recurrence §0 honored post `238a66c` + `2b96116` slip-uri).

---

## Next action

Batch 2b-ii: Onboarding splash auto-advance Clasic + Living Body cross-skin alignment cu Brain Coach 1.5s pattern. Prompt CC tactical urmează chat curent OR next chat.
