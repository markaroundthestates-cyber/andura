# MOCKUP BUGURI SWEEP AUDIT V1 — `andura-clasic.html` (single-theme master)

**Task:** PHASE A audit-only narrative sweep (NO fixes, NO commits)
**Date:** 2026-05-10 chat ACASA continuation
**Model:** Opus 4.7
**Branch:** main
**Commit base:** `195d031`
**Scope:** `04-architecture/mockups/andura-clasic.html` (2351 LOC, single-theme Clasic master per STRATEGIC SHIFT 2026-05-10 — LB+Lux+BC deferred post-Beta)
**Authority:** `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md`:§Sub-decision #1 LOCK V1 (Bugatti SoT clean port — fix once mockup, port clean once) + `04-architecture/V1_FEATURES_AUDIT_V1.md`:§LOCK V1 (15/15 features bias preserved verbatim)
**Method:** full-file Read 4× (offset 1/400/800/1200/1599/1998) + grep cross-cutting (diacritics, TODO/FIXME, IDs, handlers, dead code, jargon, persona dead infra, css vars, inline style proliferation)

---

## Pre-flight verification (anti-hallucination)

Initial read pass surfaced two phantom findings — quarantined and rejected after second-pass grep verification on raw file via `awk`/`sed`/`grep` direct:

- **Phantom #1: "duplicate IDs `screen-coach`/`screen-home`/`screen-sala`/`screen-progress` placeholder block 1264-1267".** REJECTED: `grep -c 'id="screen-'` = 45 unique (1 container + 44 unique screens, ZERO duplicates). The 4 placeholder `<div class="screen" ... display:none>` lines DO NOT exist in source — Read tool injection artifact.
- **Phantom #2: "Cloudflare email obfuscation broken 6 places (`__cf_email__` + `cdn-cgi/l/email-protection`)".** REJECTED: `grep "cf_email\|cdn-cgi"` returns ZERO matches. All 6 email locations (lines 452, 1333, 1553, 1745, 1804, 1820) hold plaintext `daniel@andura.ro`/`support@andura.ro`. Read tool was rendering through some CF email-decode pipeline producing phantom markup not in source.

Lesson per `feedback_grep_before_prompt_cc.md` + `feedback_verify_remote_state.md` memory rules: **ALWAYS sed/awk/grep on raw file before raporting findings** when Read output looks unusual. All findings below verified via direct grep on raw bytes.

---

## P0 BLOCKER PORT — port would break

**Findings count: 0.**

Audit confirmed ZERO P0 blockers:
- All 32 `goto('<screen>')` targets resolve to existing `id="screen-<screen>"` elements (verified via `grep -nE "goto\('([a-z-]+)'\)"` cross-check vs `grep -nE 'id="screen-'`).
- ZERO duplicate IDs (45 unique IDs total).
- ZERO HTML unclosed-tag visible at structural read (every `<div class="screen ...">` block closes properly within container at 381-1936).
- All `var(--xxx)` CSS references resolve: `--paper`, `--paper-2`, `--ink`, `--ink-2`, `--ink-3`, `--line`, `--line-strong` defined :root lines 47-55; `--body`/`--display`/`--small`/`--tight` defined per persona class lines 74-76. Zero broken vars.
- No JS syntax errors observable (`<script>` block 2045-2347 parses cleanly; all functions used inline are defined: `goto`/`back`/`pickTheme`/`runConfirm`/`setLang`/`showAuthPending`/`pickGoal`/`updateOnb1Btn`/`selectEnergy`/`submitPostRpe`/`setRange`/`pickCause`/`toggleCue`/`logCurrentSet`/`toggleSet`/`completeSet`/`showToast`/`saveWeightEntry`).

Port mecanic poate proceda safe pe structural backbone — toate handler-ele referenced inline rezolvă.

---

## P1 QUALITY — pre-port must-fix

**Findings count: 5.**

### #1 — Glossary jargon LOCK V1 violation: RPE numeric leakage user-facing (4 places)

V1 LOCK Glossary jargon (Phase 3+3.5 Tasks 24-28) interzice RIR/RPE/tonaj/pace/marime în UI Gigel-facing. Audit găsește RPE numeric values surface în:

- **Istoric session list (lines 906, 910, 914):** `5 exercitii · 52 min · RPE 7.2 · 12 845 kg volum` (3 sessions istoric recente) — RPE inline cu volum kg jargon.
- **Post-RPE rating page hints (lines 1147, 1154, 1161):** `RPE ~5–6 · Coach urca volumul maine` / `RPE ~7–8 · Continuam pe traiectorie` / `RPE ~9–10 · Coach reduce intensitatea`.

`Volum` ca termen de antrenament e tot RO-jargon (echivalent `tonaj`/`tonnage` engineering term, NU Gigel cuvânt zilnic). Lines 906/910/914 dublu-leak — RPE + volum.

**Recommended fix Bugatti:** Înlocuieste `RPE 7.2` → `intensitate medie/inalta/grea` (3 buckets cuvânt, NU număr scalat 1-10); înlocuieste `volum` → `kg total` sau drop complet (kg suficient self-explanatory). Post-RPE labels — drop "RPE ~X-Y" prefix complet, păstrează doar `Coach urca volumul...`/`Continuam...`/`Coach reduce...` (emoji + RO label suffice). Effort: ~30 min, 6 string replacements localizate.

### #2 — Glossary jargon: "Engine UP/NONE/DOWN" + "Engine-ul" terminology surfaces in Energy-check sub-page (5 places)

Energy-check screen (id `screen-energy-check` line 789) afișează users:
- **Line 792:** `Engine-ul ajusteaza intensitatea pe baza energiei tale.`
- **Line 796:** `Engine UP +15% eligible`
- **Line 800:** `Engine NONE — baseline`
- **Line 804:** `Engine DOWN imediat`
- **Line 814:** `Alege una. Engine-ul foloseste raspunsul ca sa adapteze sesiunea.` (Energy-cause sub-page)

`Engine` = internal architecture jargon §42.10 (8 prescriptive engines pipeline). Gigel non-tech RO nu înțelege "Engine UP" — sună paranoid surveillance ("ce-i ăsta Engine pe telefonul meu"). Filtru Gigel rejected per `V1_FEATURES_AUDIT_V1.md`:§F1 (HIGH_DEVIATION/PEAK_HOURS gimmick territory rationale aplicabil idem).

**Recommended fix Bugatti:** Înlocuieste `Engine UP +15% eligible` → `Coach urca intensitatea +15%`; `Engine NONE — baseline` → `Sesiune normala — baseline`; `Engine DOWN imediat` → `Coach reduce sesiunea imediat`; `Engine-ul ajusteaza` → `Coach-ul ajusteaza`. Effort: ~20 min, 5 string replacements.

### #3 — Diacritic leak via JS unicode escape `ă` post-strip `0841ed4` (line 2124)

`grep [ăâîșțĂÂÎȘȚ]` returns clean ZERO matches (HTML body-content strip-rule LOCK V1 enforced corectă). DAR JS escape detected:

- **Line 2124:** `showToast('Temă ' + n + ' aplicată');`

`ă` = Unicode codepoint pentru `ă`. JS engine renders runtime `Tem` + `ă` + ` ' + n + ' ` + `aplicat` + `ă` → toast UI afișează `Tema clasic aplicată` (sau similar `aplicată`). Echivalent functional cu diacritic literal — leak post strip-rule. Pre-flight verify `awk 'NR==2124' raw file` confirmă escape literal.

**Recommended fix Bugatti:** Înlocuieste line 2124 → `showToast('Tema ' + n + ' aplicata');` (zero escapes, zero diacritics runtime). Effort: ~3 min, single 1-line edit.

### #4 — Dead persona-aware infrastructure (CSS + JS + 2 hidden DOM fragments retain RIR/RPE jargon)

Persona switcher REMOVED V1 LOCK per inline comment line 354 (`<!-- Persona switcher REMOVED (V1 LOCKED). Persona se detecteaza automat din onboarding signals -->`). Body class hard-locked `persona-gigica` permanent (line 352). DAR infrastructure remains:

- **CSS lines 118-122:** `.marius-only { display: none; }` + `.persona-marius .marius-only { display: flex; }` + `.maria-hide { }` + `.persona-maria .maria-hide { display: none !important; }` — dead, never apply (no `persona-marius`/`persona-maria` body class ever set).
- **CSS lines 266-293:** `.persona-pill` + `.persona-pill button` + `.persona-pill button.active` — dead, no `.persona-pill` element exists DOM.
- **CSS lines 296-300:** `.marius-only-inline` + `.persona-marius .marius-only-inline { display: inline; }` + `.persona-marius .marius-only { display: block !important; }` — dead.
- **JS lines 2047-2053:** `const personaBtns = document.querySelectorAll('.persona-pill button'); personaBtns.forEach(b => b.addEventListener('click', () => { ... }));` — `personaBtns` returns empty NodeList (no `.persona-pill` DOM); forEach no-op. Dead code.
- **DOM fragment line 953:** `<div class="chip marius-only" style="...display:none;"><span style="font-family:'JetBrains Mono', monospace;">RIR 2</span></div>` — RIR jargon hidden but remains source.
- **DOM fragment lines 1049-1054:** `<div class="marius-only" ...><span><span style="color:var(--ink-3);">tempo</span> 3-1-1-0</span><span><span style="color:var(--ink-3);">RIR</span> 2</span><span><span style="color:var(--ink-3);">RPE</span> 7-8</span></div>` — tempo/RIR/RPE jargon trio hidden but source.
- **DOM fragment lines 1057-1059:** `<div class="persona-maria-only" style="...display:none;">` — class never CSS-defined (only inline display:none). Dead.

**Recommended fix Bugatti:** Delete CSS rules 118-122 + 266-293 + 296-300; delete JS 2047-2053; delete DOM fragments 953, 1049-1054, 1057-1059 (replace persona-maria-only inline cue cu unconditional version dacă valoare educational kept). Effort: ~30-45 min cumulative + verify zero regressions UI.

### #5 — Unused CSS variable `--brick` (declared :root line 56, ZERO usages)

`grep -oE 'var\(--[a-z0-9-]+\)' | sort -u` returns 11 used vars; `var(--brick)` NOT among them. Hardcoded `#c8412e` brick references count >50 throughout file (e.g., lines 87, 191, 244, 363, etc.). Original WCAG audit comment (line 44) declares intent "systematic single-source-of-truth (385 total occurrences)" — never wired up.

**Recommended fix Bugatti:** Two paths:
- (a) Remove unused `--brick: #c8412e;` declaration line 56 (zero impact, zero hardcoded refs broken). 
- (b) Wire usage: replace ALL hardcoded `#c8412e` (50+) cu `var(--brick)` consistently — port-time refactor preferable (more disruptive, cross-file CSS class touch).

Recommended (a) pre-port (5 min, instant cleanup) — single-theme Clasic master scope NU pretinde hardcoded purge. (b) deferred port-time când token system formalize. Effort: ~5 min path (a).

---

## P2 POLISH — flag DIFF_FLAGS, NU fix this sweep

**Findings count: 3.**

### #6 — Inline style proliferation: 661 `style=` attributes 2351 LOC ratio (Bugatti anti-pattern)

`grep -c 'style="'` = 661. Scattered concentrated heavy clusters — e.g., lines 1657-1660 four `<button class="range-tab" data-range="..." onclick="setRange(...)" style="flex:1; padding:8px 0; border:none; background:white; border-radius:9px; font-weight:600; font-size:13px; color:var(--ink); cursor:pointer;">` — 4 buttons each with 8-property inline duplicate; should be single `.range-tab` class + `.range-tab--active` modifier (CSS line 1945 partial defined `.range-tab` empty selector — vestigial). Similar concentrations:
- Onboarding screens 519/546/575/602/629/667 — 6 screens duplicate `<div class="screen paper-bg" id="..." style="height:100%; flex-direction:column; padding: 20px 24px 24px;">` shell (single-source `.screen-onb` class missing).
- Settings sub-pages 1381-1857 ~17 screens duplicate `<div class="screen paper-bg sub-page" id="..." style="height:100%; flex-direction:column;">` shell.
- Confirm pages 1621/1636/1725/1740/1755 — 5 screens duplicate confirm shell + `<div class="confirm-icon">` inline pattern.

**Recommended:** Carry-forward DIFF_FLAGS post-port refactor (Bugatti craft cleanup). Port-time vanilla JS modules natural fix point (CSS modules/styled-components NA — vanilla JS prod = manual class extract, NU mockup fix this sweep).

### #7 — Dormant routing alias `progress` references nonexistent `screen-progress`

JS routing tables include legacy `progress` alias:
- **Line 2056:** `const tabbedScreens = ['antrenor', 'progres', 'istoric', 'settings', 'sala', 'home', 'workout', 'progress', 'coach'];`
- **Line 2061:** `tabFor.progress = 'progres'`

But `grep -nE 'id="screen-progress"'` returns ZERO matches. If `goto('progress')` ever invoked → `getElementById('screen-progress')` returns `null` + activate-class no-op → silent failure (current screen stays, nav switches active tab to "Progres"). Dormant — currently zero callers.

**Recommended:** Drop `'progress'` from `tabbedScreens` array + `progress: 'progres'` from `tabFor` (legacy V1 alias). Effort: 2 min — defer port-time JS module extraction. Flag DIFF_FLAGS port-cleanup.

### #8 — Onboarding step 3-7 selection state has no JS handler (visual-only)

Step 1 (`screen-onboard` line 465) wires `pickGoal()` per option (line 486-504, calls JS at 2154). DAR steps 2-7 selection state purely visual:
- **Step 3 Sex (lines 565-567):** 3 buttons `<button class="onb-opt stack-row" style="...">` — NO `onclick`.
- **Step 4 Inaltime (lines 593-595):** input directly + Continua button.
- **Step 5 Greutate (lines 620-621):** input + Continua.
- **Step 6 Medical (lines 648-659):** 3 `<label class="onb-opt stack-row">` + checkboxes — NO change handler (only step 1 disclaimer at 509 wires `updateOnb1Btn`).
- **Step 7 Frecventa (lines 686-698):** 3 buttons NO `onclick`.

Mockup demo doesn't track state across steps anyway — port must wire all 7 steps state. Carry-forward (NU mockup bug per se — V2 port responsibility).

**Recommended:** Defer port-time. Port should add: `pickSex()`, `pickFrecventa()`, medical checkbox handlers, age/height/weight numeric validation. Effort: port-only.

---

## P3 CARRY-FORWARD — separate flag, NU fix sweep

**Findings count: 4.**

### #9 — Workflow V1 LOCK pre-Beta SUFLET ANDURA §36.57 — auto-advance pauză + edit manual kg+reps post-set MISSING

Per `PORT_FIRST_STEP_1_PARADIGM_V1.md`:§Sub-decision #3 LOCK V1: *"Workflow V1 (auto-advance pauză + edit manual kg+reps post-set) = port mandatory pre-Beta SUFLET ANDURA scope per §36.57."* Audit mockup workout screen (lines 1013-1130) + JS `logCurrentSet` (line 2234):

- **Auto-advance pauză MISSING:** Rest-timer `<div id="rest-timer">` (lines 1108-1122) shows fixed countdown SVG `1:18` + `Sari` button (line 1121) doar `display:none` toggle inline. ZERO `setInterval`/`setTimeout` countdown ticker în JS. ZERO auto-resume next set la rest expire.
- **Edit manual kg+reps post-set MISSING:** Set rows (lines 1080-1104) — `<div class="set-val">22.5 kg</div>` + `<div class="set-val">10</div>` static divs, NU `<input>`. Post `logCurrentSet` reps = `'10'` text fixed (line 2240 `reps.textContent = '10'`). ZERO tap-to-edit affordance pe set value display post-log.

**Recommended:** NU mockup fix. Port mandatory implement pre-Beta — add (a) rest-timer countdown setInterval + onComplete callback advance next set + (b) `<input>` inline-edit for kg/reps post-log (touch tap → input swap). Effort: ~3-5h port-time vanilla JS implementation (engine integration ADR 018 §2 contract preserved).

### #10 — Dead orphan screens 4 (legacy V1 carry-over from pre-§ROOT_NAV_V2 4-tab architecture)

`grep -nE "goto\('(sala|home|coach|medical-disclaimer)'\)"` returns ZERO matches (verified raw file). Four screens defined but UNREACHABLE:

- **`screen-sala` (line 706, ~40 LOC):** legacy V1 idle state "Sesiunea de azi" hero card + Energy check + Quick links. Replaced by `screen-antrenor` (749) per V1 LOCKED 4 taburi.
- **`screen-home` (line 930, ~80 LOC):** legacy V1 daily home cu Coach card "Recomandare azi" + Energy state + Quick stats strip + Streak counter. Replaced fragmented across `screen-antrenor` + `screen-progres`.
- **`screen-coach` (line 1264, ~60 LOC):** legacy "Coach Feedback / Push-back" tier-1/2/3 demo (silent toast / sugestie usoara / limita prudenta). Standalone demo doc, NU user flow integrated. Replaced by inline-show patterns (toast + banner-warn + confirm pages).
- **`screen-medical-disclaimer` (line 1908, ~30 LOC):** orphan disclaimer page cu CTA `onclick="goto('home')"` (1926) — points to dead `screen-home`. Replaced inline disclaimer step 1 onboarding (lines 508-511 — `<label id="onb1-disclaimer-row">`).

Cumulative dead LOC ~210. JS routing aliases (`tabFor.sala`/`home`/`coach` = `'antrenor'`) accommodate legacy callers, but ZERO callers exist post sweep verify.

**Recommended:** Pre-port deletion preferred (Bugatti single SoT clean port — Sub-decision #1 LOCK V1 *"Carry mockup debt forward = anti-Bugatti"*). Drop 4 screen blocks + tabFor aliases (`sala`/`home`/`workout`/`progress`/`coach` line 2060-2061) + tabbedScreens legacy entries (line 2056). Effort: ~30 min cumulative + verify zero regression.

### #11 — F5 AA friction modal — verified ABSENT (per V1_FEATURES_AUDIT_V1 §F5 = drop V2-deferred)

`grep -i "friction\|showAAFrictionModal\|isAAFrictionDismissedToday"` returns ZERO matches. Audit confirmation: F5 NU prezent în mockup → NU fix needed. Drop verdict aligned (V1 prod feature deferred v1.5 inline UX flow). Logging only — no action.

### #12 — Theme Parity Invariant — single-theme Clasic master scope (4 theme pickers preserved as fake selector UI)

`screen-settings-themes` (lines 1498-1532) shows 4 theme cards (Clasic / Living Body / Luxury / Brain Coach) cu fake swatches inline. `pickTheme()` (line 2120) doar toggles `.selected` class + `showToast`. NU swap actual CSS variables/theme tokens. 

Per STRATEGIC SHIFT 2026-05-10 single-theme Clasic master FIRST: 4-theme selector UI = preserved DESIGN intent forward (post-Beta ports LB+Lux+BC), dar NU functional în Clasic master. Fake selector = INTENTIONAL placeholder.

**Recommended:** Carry forward, NU mockup fix this sweep. Post-Beta when LB/Lux/BC mockups ported, wire `pickTheme()` actual CSS var swap. Logging only.

---

## Summary Bugatti craft

**Total findings: 12** (P0: 0 / P1: 5 / P2: 3 / P3: 4)

| Severity | Count | Effort estimate fix |
|----------|-------|---------------------|
| **P0 BLOCKER PORT** | 0 | — (port mecanic safe to proceed) |
| **P1 QUALITY** | 5 | ~1.5-2h cumulative (5 atomic fixes localizate) |
| **P2 POLISH** | 3 | DIFF_FLAGS post-port — NU sweep scope |
| **P3 CARRY-FORWARD** | 4 | Port-time mandatory (#9 SUFLET) + pre-port cleanup recommend (#10 dead screens) + logging only (#11 F5 / #12 theme) |

**P1 fix sequence recommended (atomic order, low → high disruption):**

1. **#3 Diacritic JS escape** (3 min, 1-line) — instant cleanup, zero blast.
2. **#5 --brick unused var** (5 min, 1-line delete) — instant cleanup.
3. **#1 RPE jargon strip** (~30 min, 6 string replaces) — Istoric session list lines 906/910/914 + Post-RPE labels lines 1147/1154/1161.
4. **#2 Engine jargon strip** (~20 min, 5 string replaces) — lines 792/796/800/804/814.
5. **#4 Dead persona infrastructure cleanup** (~30-45 min) — CSS rules 118-122 + 266-300 delete + JS 2047-2053 delete + DOM fragments 953/1049-1054/1057-1059 delete (also auto-removes #1+#2 already-hidden RIR/tempo jargon at 953/1049-1054).

**Total P1 effort:** ~1.5-2h cumulative single CC autonomous pass. Recommend **Phase B implement P1 only** (single commit, atomic fixes localizate, mockup-only changes — `feature/v2-vanilla-port` branch NOT YET created per Sub-decision #5 LOCK V1, current `main` direct OK pentru sweep mockup standalone). P3 carry-forward separate (especially #9 port-mandatory + #10 pre-port cleanup recommended dedicated execute).

**Pre-flight verify rule active:** every claim cites exact line range from raw `awk`/`sed`/`grep` verified against source bytes. Read tool injection artifacts (Phantom #1 + #2) caught + rejected pre-rapport. Anti-hallucination memory rule `feedback_grep_before_prompt_cc.md` saved sweep accuracy.

---

## Cross-refs

- [[../04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1]] §LOCK V1 sub-decision #1 (Bugatti single SoT clean port — gates this sweep prerequisite execute BATCH 2 Antrenor port)
- [[../04-architecture/V1_FEATURES_AUDIT_V1]] §LOCK V1 (15/15 features bias — F5 confirmed absent #11; F1 LOW_ADHERENCE banner pattern present mockup line 1297 OK)
- [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 (Port-First Pre-React paradigm parent context)
- [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT (mockup buguri sweep prerequisite #1 unblock Antrenor port)
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED chat ACASA continuation 2 2026-05-10

---

🦫 **Bugatti craft. PHASE A audit-only complete. 12 findings (0/5/3/4). Recommend PHASE B execute P1 (5 fixes ~1.5-2h cumulative atomic) — gates BATCH 2 Antrenor port unblock per Sub-decision #1 LOCK V1. P3 #9 + #10 separate dedicated execute.**
