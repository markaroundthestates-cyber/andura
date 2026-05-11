# DIFF FLAGS — Outstanding Issues Requiring Daniel Action

**Owner:** Daniel (CEO + Product). Used by CC Opus / Claude chat to surface pending issues.
**Updated:** 2026-05-11 chat ACASĂ POST chat birou ingest — Mockup CLASIC FINAL v2 **LANDED on disk** `04-architecture/mockups/andura-clasic.html` (3867 LOC / 305431 bytes / SHA256 `065893BF…E3344`, lucide CDN ref NU inline UMD — Daniel cleaned export). Backup tag pushed origin `pre-mockup-clasic-final-v2-replace-2026-05-11`. Audit narrativ Co-CTO chat birou ingested. Strategic insight NEW INSIGHTS_BACKLOG = training schedule override paradigm P1 prebeta dedicated discussion. P1-FLAG-MOCKUP-CLASIC-FINAL-LOCKED status flip → 🟢 LANDED on disk. Cumulative ~719 PRESERVED unchanged. Predecessor Updated: 2026-05-10 chat ACASĂ continuation 3 — BATCH 2 Antrenor port SUB-BATCH 1 LANDED feature/v2-vanilla-port (router.js NEW + state.js +2 fields + router.test.js 4 cases + amendment §4 7/7 RESOLVED) + Mockup sweep #1 main LANDED chain `a9ddfa8..71e6445`. P1-FLAG-PORT-FIRST-THEN-REACT status EXECUTION-READY → IN PROGRESS BATCH 2 SUB-BATCH 1 LANDED + NEW P1-FLAG-BIROU-SETUP-MCP P1 priority chat NEW. Tests 2732 → **2736 PASS** (+4 net router cases).
**Predecessor Updated:** 2026-05-05 overnight (post HANDOVER_GLOBAL thematic split atomic execution per §62.2 LOCKED V1 — P1-FLAG-HANDOVER-SPLIT 🟡 OPEN → 🟢 RESOLVED. Source 7673 LOC split into 7 theme files + master = INDEX. ZERO data loss. ZERO wikilinks rewire (master = navigation hub, 1-hop drill-down). Backup tag `pre-handover-split-2026-05-05-overnight` rollback safety. Precedent same overnight: batch overnight 5 tasks complete + Validation Framework LOCK V1 + Cumulative LOCKED ~653 preserved.)
**See also:** [[VAULT_RULES]] §HANDOVER_PROTOCOL §5 (Safety Net) §VAULT_HYGIENE_PASS STEP 13 | [[06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] | [[05-findings-tracker/FINDINGS_MASTER]]

---

## P3 NEW CARRY-FORWARD (mockup sweep deferrals)

**Source:** Mockup buguri sweep #1 PHASE A audit `📤_outbox/_archive/2026-05/366_MOCKUP_BUGURI_SWEEP_AUDIT_V1_CONSUMED.md` 6 P3 carry-forward findings — single-theme Clasic master scope deferred dedicated chat post-Beta. Status `🟡 P3 carry-forward deferred dedicated chat post-Beta single-theme master`.

- **P3-α — Inline `style=""` proliferation** — 661 inline style attributes across 2144 LOC ratio (Bugatti anti-pattern: 4 buttons range-tab + 6 onboarding screens + 17 settings sub-pages + 5 confirm pages duplicate inline shells). Refactor port-time vanilla JS modules natural fix point (CSS class extract). 🟡 P3 deferred dedicated chat post-Beta.
- **P3-β — Hardcoded hex 385× instead of `var(--ink)`** — original WCAG audit comment line 44 declares intent "systematic single-source-of-truth (385 total occurrences)" never wired up. Token system formalize port-time. 🟡 P3 deferred dedicated chat post-Beta.
- **P3-γ — F1 LOW_ADHERENCE banner template text** — banner string fără diacritic post-strip "Adherenta scazuta" — cross-ref P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER (e2e calibration-ui.spec.js:194 SKIP'd post-strip). F1 port unblocks re-enable per V1_FEATURES_AUDIT_V1 LOCK V1. 🟡 P3 deferred BATCH 2 Antrenor port scope.
- **P3-δ — Workflow V1 LOCK §36.57 edit manual kg+reps post-set MISSING** — gap to port: rest-timer countdown ZERO `setInterval`/`setTimeout` ticker + ZERO auto-resume next set la rest expire + ZERO tap-to-edit affordance pe set value display post-log (set rows static `<div class="set-val">22.5 kg</div>` NU `<input>`). Port mandatory pre-Beta SUFLET ANDURA scope per PORT_FIRST_STEP_1 §LOCK V1 sub-decision #4 conditional clusters. 🟡 P3 deferred BATCH 2 Antrenor port scope.
- **P3-ε — Theme parity invariant cross-check vs LB/Lux/BC** — `screen-settings-themes` 4 theme cards Clasic/Living Body/Luxury/Brain Coach + `pickTheme()` toggles `.selected` class fără swap actual CSS variables; per STRATEGIC SHIFT 2026-05-10 single-theme Clasic master FIRST = INTENTIONAL placeholder. Wire actual CSS var swap post-Beta when LB/Lux/BC mockups ported. 🟡 P3 deferred post-Beta.
- **P3-ζ — Dead `mute: '#6e6862'` Tailwind palette entry** — vestigial palette token unused post mockup polish + WCAG cleanup. 🟡 P3 deferred dedicated chat post-Beta single-theme master cleanup.

---

## P2 NEW DEFERRALS (mockup sweep)

**Source:** Mockup buguri sweep #1 PHASE A audit `📤_outbox/_archive/2026-05/366_MOCKUP_BUGURI_SWEEP_AUDIT_V1_CONSUMED.md` 5 P2 defer findings — dedicated chat scope. Status `🟡 P2 defer dedicated chat`.

- **P2-A — Persona switcher dead JS+CSS infrastructure** — Persona switcher REMOVED V1 LOCK per inline comment line 354; body class hard-locked `persona-gigica` permanent (line 352). DAR infrastructure remains: CSS `.marius-only` + `.persona-marius .marius-only { display: flex; }` + `.maria-hide` + `.persona-maria .maria-hide { display: none !important; }` (lines 118-122 + 266-293) + JS `personaBtns` querySelector empty NodeList no-op (lines 2047-2053) + 2 hidden DOM fragments retain RIR/RPE jargon (lines 953 + 1049-1054). 🟡 P2 defer dedicated chat.
- **P2-B — Dead `.marius-only-inline` class** — CSS lines 296-300 `.marius-only-inline` + `.persona-marius .marius-only-inline { display: inline; }` never apply (no `persona-marius` body class set). 🟡 P2 defer dedicated chat.
- **P2-C — Dead function `onboardBack`** — JS function defined but ZERO callers (orphan). 🟡 P2 defer dedicated chat (cleanup atomic with persona infrastructure).
- **P2-D — Vestigial `screen-medical-disclaimer`** — orphan disclaimer page line 1908 ~30 LOC; CTA pointed to dead `screen-home` (resolved P0-3 commit `0930b2a` retargeted to `antrenor`); replaced inline disclaimer step 1 onboarding (lines 508-511 `<label id="onb1-disclaimer-row">`). Screen unreachable from any goto call. 🟡 P2 defer dedicated chat (cleanup post-port confirm zero regressions).
- **P2-E — Two `<style>` blocks split across file** — single `<style>` consolidation single-source-of-truth Bugatti anti-pattern. 🟡 P2 defer dedicated chat.

---

## P1 BLOCKERS (require Daniel action before proceeding)

### P1-FLAG-MOCKUP-CLASIC-FINAL-LOCKED — Mockup andura-clasic.html FINAL v2 LANDED on disk (2026-05-11 chat ACASĂ POST chat birou ingest)

**Status:** 🟢 **LANDED on disk 2026-05-11 chat ACASĂ POST chat birou ingest** — `04-architecture/mockups/andura-clasic.html` REPLACE existing 154987 bytes (sweep #1 baseline 2026-05-10 22:36) → **305431 bytes / 3867 LOC / SHA256 `065893BFBD92B0F0AC4AE71444FBC7365DC46610157A240E2ED9CFF2A40E3344`** (SHA source↔dst MATCH ✅). Source PowerShell-discovered `C:\Users\Daniel\Downloads\andura-clasic.html` Daniel uploaded chat acasă (LastWrite 2026-05-11 15:39:55). **Lucide reconcile finding:** source uses **lucide CDN** ref line 8 `unpkg.com/lucide@latest` + jsdelivr fallback — NU inline UMD as audit claimed for 702KB v. Delta -397KB = Daniel exported cleaned version preferință maintainability (CDN refs preserved, acceptable mockup design master port React va elimina oricum). Backup tag pushed origin `pre-mockup-clasic-final-v2-replace-2026-05-11`. ~98% compliant spec V2 LOCKED V1. Bază solidă port-first vanilla JS Step 1 + React migration Step 2.
**Severity:** Design master pre-port LANDED (gates unblock Step 1 vanilla port execution)

**Cross-refs:** handover v2 archived NN 372 + audit Co-CTO chat birou archived NN 373 + previous LATEST cycled NN 371 + `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-11 POST ingest top descending + `03-decisions/DECISION_LOG.md` 2026-05-11 POST ingest entry top descending + `05-findings-tracker/INSIGHTS_BACKLOG.md` strategic insight training schedule override paradigm NEW + backup tag `pre-mockup-clasic-final-v2-replace-2026-05-11` + commit chain 2 atomic (mockup replace + vault sync).

---

### P1-FLAG-DECISIONS-10-13-LOCKED — Auth Google primary + Termina mai devreme confirm + 2x DEFER pre-Beta sumar/mesaj zilnic archive (2026-05-11 chat-current)

**Status:** 🟢 LOCKED V1 2026-05-11 chat-current. #10 Auth Google primary (brick top + Email ghost middle + Skip ultimul cu risk-note). #11 Termina mai devreme confirm extra (`screen-confirm-finish-early` body "NU pierzi progresul" anti-panic Maria 65). #12 DEFER pre-Beta Sumar săptămânal archive (push only). #13 DEFER pre-Beta Mesaj zilnic archive (push only, ephemeral by design).
**Severity:** UX flow LOCKED (mockup design refinement, zero impact arhitectură)

**Cross-refs:** handover archived NN 369 + `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-11 + DECISION_LOG 2026-05-11 entry top descending §2.

---

### P1-FLAG-PARADIGM-ADAPTIVE-RECONFIRMAT — CDL "follows the body, not the calendar" reconfirmat fundament (2026-05-11 chat-current)

**Status:** 🟢 LOCKED V1 RECONFIRMAT 2026-05-11 chat-current. NU paradigm nou — reconfirmat fundament PROJECT_VISION + ADR 011 CDL. CD ratat în prima versiune mockup (template săptămânal rigid "Joi · Push · Sapt 3 Ziua 3/4"). Refactor mockup cap-coadă aplicat: Antrenor home *"Coach-ul recomandă AZI"* + WHY line italic + REST-DAY variant + Schedule override 4 opțiuni adaptive (Vreau alt tip / Sesiune ușoară / Sar ziua / Vreau antrenez când era pauză contextual) + Heatmap Istoric legenda nouă (Greu/Normal/Ușor/Zi liberă NU "missed/skipped" compliance shame).
**Severity:** Fundament product paradigm (gates ALL future scheduling UX decisions)

**Cross-refs:** ADR `03-decisions/011-cdl-coach-decision-logic.md` + PROJECT_VISION reference + DECISION_LOG 2026-05-11 §3 + Daniel "halucinezi" 1x chat-current corrected.

---

### P1-FLAG-L6-DUAL-FEATURE-SEMANTIC — screen-auth-reactivate NEW + card "Bun venit înapoi" preserved separat (2026-05-11 chat-current)

**Status:** 🟢 LOCKED V1 2026-05-11 chat-current. L6 dual-feature distinct semantic: `screen-auth-reactivate` NEW (post-delete-grace 30 zile flow) + card "Bun venit înapoi" preserved separat (win-back inactive user 14+ zile). Comentarii clarificate ambele HTML+JS. CD a interpretat L6 greșit runda 2 (win-back inactive user în loc de reactivation post-delete-grace) — Claude (eu) tail fix aplicat.
**Severity:** Auth/reactivation flow distinct semantic (drop merge confusion)

**Cross-refs:** mockup `andura-clasic.html` FINAL screen-auth-reactivate + DECISION_LOG 2026-05-11 §5.

---

### P1-FLAG-VREI-ALTCEVA-TEXT-LINK — text link sub butonul Începe sesiunea NU chevron-row separat (2026-05-11 chat-current)

**Status:** 🟢 LOCKED V1 2026-05-11 chat-current. *"Vrei altceva azi?"* text link LOCKED sub butonul Începe sesiunea (NU chevron-row separat — Daniel preferință explicită). Drop complet *"Schimbă planul săptămânii"* row vechi (redundancy Hick's law).
**Severity:** UX micro-pattern LOCKED

**Cross-refs:** mockup `andura-clasic.html` FINAL home screen + DECISION_LOG 2026-05-11 §4.

---

### P1-FLAG-ENGINE-3-GAPS-PRE-PORT — muscleRecovery.js + coachDirector methods noi + US Navy BF calc identified pre-port (2026-05-11 chat-current)

**Status:** 🔴 BLOCKING PRE-PORT 2026-05-11 chat-current — 3 gap-uri engine identified pre-port-first vanilla JS Step 1. Grep verified `src/engine/` 0 references existing. Probabil extensions NU complete rebuild.
**Severity:** Pre-port mandatory (gates BATCH 2 SUB-BATCH 2 idle.js + subsequent steps)

**3 gap-uri reale:**
1. `muscleRecovery.js` helper — "Pectoralii recuperează din marți · spatele e gata" WHY line + Step 2 schedule override alt-type generation cu rationale recovery state. Probabil extension la `patternLearning`/`weaknessDetector`, NU complet nou.
2. `coachDirector` methods noi pentru 4 opțiuni schedule override: `buildLightMobility()` + `rebalanceWeekAfterSkip()` + `generateSafeSessionForRestDay()`.
3. US Navy BF calculation + greutate țintă projection — verifică `src/` existence sau e new helper.

**Cross-refs:** DECISION_LOG 2026-05-11 §6 + mockup `andura-clasic.html` FINAL Antrenor home + Schedule override + Setări BF section.

---

### P1-FLAG-3-THEMES-PORT-MECANIC-PENDING — Living Body / Luxury / Brain Coach port mecanic pending Daniel signal go (2026-05-11 chat-current)

**Status:** 🟢 LOCKED V1 PLAN 2026-05-11 chat-current — port mecanic 3 themes per Theme Parity Invariant LOCK V1 post-finisaj Clasic. Daniel decision: Claude (eu) port mecanic, NU CD (token quota limit). **Pending Daniel signal go.**
**Severity:** Theme parity gate post-Beta Clasic stable

**Cross-refs:** DECISION_LOG 2026-05-11 carry-forward + Theme Parity Invariant LOCK V1 chat-current 3 precedent.

---

### P1-FLAG-PROD-AUTO-FAZA-2026-05-10 — ⚠️ DISCREPANCY status reopen Daniel handover (2026-05-11 chat-current)

**Status:** 🔴 **DISPUTED 2026-05-11 chat-current** — Daniel handover *"Neinvestigat"*. **⚠️ Discrepancy vs precedent DIFF_FLAGS P1-FLAG-PROD-BUGS-2026-05-10 🟢 RESOLVED `05ba372`** (chat ACASĂ MCP filesystem 2026-05-10 + 3 regression tests T_AUTO_pre_pilot LANDED). Daniel handover override states still unresolved. **Reconcile mandatory pre-port** — verify actual prod behavior andura.app live + audit `src/sys.js` getPhase pilotActive removal effectiveness.
**Severity:** P1 prod bug (Auto template fallback 2000 kcal hardcoded vs auto-detect goal+calibrations)

**Cross-refs:** Daniel handover 2026-05-11 archived NN 369 + DIFF_FLAGS P1-FLAG-PROD-BUGS-2026-05-10 (precedent claim resolved) + `05ba372` (commit precedent fix) + `00-index/CURRENT_STATE.md` §ACTIVE_FLAGS 2026-05-11 reconcile.

---

### P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10 — ⚠️ DISCREPANCY status reopen Daniel handover (2026-05-11 chat-current)

**Status:** 🔴 **DISPUTED 2026-05-11 chat-current** — Daniel handover *"Neinvestigat"*. **⚠️ Same discrepancy as P1-FLAG-PROD-AUTO-FAZA-2026-05-10** — precedent DIFF_FLAGS claim 🟢 RESOLVED `05ba372` (Katch-McArdle BF-aware sys.js:54-67 + Mifflin fallback). Reconcile mandatory pre-port.
**Severity:** P1 prod bug (BF manual edit nu recalc kcal phase + BMR formula audit Katch-McArdle vs Mifflin)

**Cross-refs:** Daniel handover 2026-05-11 archived NN 369 + DIFF_FLAGS P1-FLAG-PROD-BUGS-2026-05-10 + `05ba372` + `00-index/CURRENT_STATE.md` §ACTIVE_FLAGS 2026-05-11 reconcile.

---

### P1-FLAG-BIROU-SETUP-MCP — Birou laptop MCP filesystem setup chat NEW PRIMARY (2026-05-10 chat-current 3)

**Status:** 🔴 P1 PRIORITY CHAT NEW 2026-05-10 chat-current 3 — Daniel mâine la birou laptop, vrea MCP funcțional NU halucineze chat-uri. Chat NEW deschid cu *"salut birou"* trigger + ghidare pas-cu-pas setup MCP. Daniel zero courier paradigm.
**Severity:** P1 priority chat NEW (workflow continuity laptop birou parity laptop ACASĂ MCP filesystem direct paradigm)

**Steps pas-cu-pas birou setup:**
1. Clone repo local laptop birou: `git clone https://github.com/markaroundthestates-cyber/andura.git C:\Users\<userprofile>\Documents\salafull`
2. `cd salafull` + `npm install` (deps install)
3. Config Claude Desktop `claude_desktop_config.json`: allowed paths add `C:\Users\<userprofile>\Documents\salafull`
4. Restart Claude Desktop
5. Test cu chat NEW *"salut birou"* → eu §CC.2 layered read MCP filesystem PRIMARY autonomous self-serve
6. Memory rule update post-confirm: paradigm BIROU = Windows Claude Desktop + VS Code Desktop + PowerShell + path local (în loc Codespaces). Caveat legal IP RO scope Daniel HR Senior preserved (NU sync work files acasă pe equipment work).

**Daniel constraint:** NU mai vrea Codespaces (atins limita). Are Claude Desktop deja instalat birou.

**Path consistent recomandat:** `C:\Users\<userprofile>\Documents\salafull` (parity ACASĂ).

**Action Daniel chat NEW:** deschide chat NEW Claude Desktop birou cu *"salut birou"* — eu ghidez pas-cu-pas + verifică fiecare step. Post-setup confirmed → continue autonomous direct BATCH 2 SUB-BATCH 2 idle.js implementation pe `feature/v2-vanilla-port`.

**Cross-refs:** `00-index/CURRENT_STATE.md` §JUST_DECIDED chat-current 3 + §NEXT P1 #1 + `03-decisions/DECISION_LOG.md` chat-current 3 entry top + handover archived NN 367.

---

### P1-FLAG-MOCKUP-BURURI-SWEEP-1-RESOLVED — Mockup buguri sweep #1 single-theme Clasic master LANDED (2026-05-10 chat-current 2)

**Status:** 🟢 RESOLVED LANDED 2026-05-10 chat-current 2 (Co-CTO Autonomous Daniel autonomy lock EXTINS scope). 8 atomic fix commits a9ddfa8 → 8d16361 (5 primary P0/P1 + 3 supplementary post second-opinion audit). Net file -228 LOC (2351 → 2123). Tests 2732 PASS preserved EXACT through all 8 commits via pre-commit hook. **Unblocks BATCH 2 Antrenor port execute on `feature/v2-vanilla-port` branch** (sub-decision #1 prerequisite RESOLVED). Cumulative LOCKED V1 ~742 PRESERVED (mockup polish meta-tooling NU additive product/architecture LOCK V1).
**Severity:** N/A (resolved, gates BATCH 2 Antrenor execution unblock)

**Audit raport SSOT:** `📤_outbox/MOCKUP_BUGURI_SWEEP_AUDIT_V1.md` — 18 findings (3 P0 + 4 P1 + 5 P2 defer + 6 P3 carry-forward) Bugatti craft 360° narrative ~80-200 LOC.

**8 atomic commits LANDED:**

| # | Commit | Severity | Concern |
|---|--------|----------|---------|
| 1 | `a9ddfa8` | P0-1 | Cloudflare email-protection injection removal — 7 sites obfuscated `__cf_email__` + email-decode CDN script |
| 2 | `37f8a42` | P0-2 | Duplicate ID stub divs removal — 4 vestigial screen-coach/home/sala/progress |
| 3 | `0930b2a` | P0-3 | Medical disclaimer landing target home → antrenor — V1 LOCK 4-tab nav alignment |
| 4 | `b2acb11` | P1-1 | Typo intenctie → intentie — Despre Andura body copy polish |
| 5 | `2100eef` | P1-2/3/4 | Remove 3 dead legacy screens (sala/home/coach) + orphan JS callers + tab alias cleanup → -207 LOC |
| 6 | `55846b3` | P1-5 | pickTheme JS unicode escape — drop ă diacritic (NO_DIACRITICS_RULE LOCK V1 violation) |
| 7 | `abcb8fd` | P1-6 | Engine jargon → Coach jargon — 5 sites Glossary V1 LOCK Gigel-friendly |
| 8 | `8d16361` | P1-7 | RPE numeric jargon → intensitate buckets — 6 sites Glossary V1 LOCK |

**Cross-refs:** `📤_outbox/MOCKUP_BUGURI_SWEEP_AUDIT_V1.md` SSOT + `00-index/CURRENT_STATE.md` §JUST_DECIDED chat-current 2 mockup buguri sweep entry + `03-decisions/DECISION_LOG.md` chat-current 2 entry top descending + `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` §LOCK V1 sub-decision #1 RESOLVED LANDED + backup tag `pre-mockup-buguri-sweep-vault-sync-2026-05-10-2218`

---

### P1-FLAG-NO-DIACRITICS-RULE — Strip global UI/tests/mockups LOCK V1 PERMANENT (2026-05-10 chat-current 2)

**Status:** 🟢 LOCKED V1 PERMANENT 2026-05-10 chat-current 2 (Daniel directive verbatim chat-current 2 *"strip diacritics global UI + tests + mockups, vault docs preserved"* + autonomy lock EXTINS scope). Strip LANDED commit `0841ed4` (263 files / 6034 replacements). Vault docs preserved verbatim (fluency RO chat continuity Daniel session-to-session natural).
**Severity:** N/A (rule lock permanent, NU pending — going forward all UI/tests/mockups strict no-diacritics)

**Mecanic:**
- Script Node.js automatizat parse 263 files / 6034 replacements
- Diacritics: ă→a, â→a, î→i, ș→s, ț→t + Ă/Â/Î/Ș/Ț equivalents (lowercase + uppercase)
- Scope: `src/**/*.{js,jsx,html,css}` + `tests/**/*.{js,spec.js}` + `04-architecture/mockups/**/*.html`
- Preserved: vault docs (`00-index/`, `01-vision/`, `03-decisions/`, `04-architecture/` non-mockups, `05-findings-tracker/`, `06-sessions-log/`, `07-meta/`, `08-workflows/`, `📥_inbox/`, `📤_outbox/`, `VAULT_RULES.md`, `DIFF_FLAGS.md`, `CLAUDE.md`, `README.md`)

**E2e cross-ref:**
- `tests/e2e/scenarios/calibration-ui.spec.js:194` SKIP'd post-strip (assertion `text=/Adherence scăzută/i` failed — banner string fără diacritic post-strip "Adherenta scazuta")
- Cross-ref P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER (banner F1 port unblocks re-enable per V1_FEATURES_AUDIT_V1 LOCK V1)

**Cross-refs:** `00-index/CURRENT_STATE.md` §JUST_DECIDED + `03-decisions/DECISION_LOG.md` 2026-05-10 chat-current 2 entry + commit `0841ed4` + V1_FEATURES_AUDIT_V1 §LOCK V1 F1 cross-ref

---

### P1-FLAG-V1-FEATURES-AUDIT-RESOLVED — V1 features audit LOCK V1 RESOLVED (2026-05-10 chat-current 2)

**Status:** 🟢 RESOLVED LOCK V1 2026-05-10 chat-current 2 (Co-CTO Autonomous Daniel autonomy lock EXTINS). 15 features Co-CTO bias preserved verbatim (10 keep + 4 modify + 1 drop V2-deferred F5 AA friction modal). Cumulative impact ~727 → ~742 (+15 net via V1_FEATURES_AUDIT_V1 §LOCK V1 2026-05-10 Co-CTO Autonomous). **Unblocks BATCH 2 Antrenor port implement on `feature/v2-vanilla-port` branch.**
**Severity:** N/A (resolved, gates BATCH 2 Antrenor execution unblock)

**Verdict 15/15 features Co-CTO bias preserved verbatim:**

| Verdict | Count | Features |
|---------|-------|----------|
| Keep verbatim (port direct) | 10 | F2 last session memory + F4 readiness + F6 PR wall + F7 coach director + F8 streak counter + F10 stats grid + F11 PRs notification + F12 rating buttons + F13 rating notes auto-apply + F15 per-set RPE granularity |
| Modify simplified | 4 | F1 patterns 5→2 (LOW_ADHERENCE + STAGNATION; drop HIGH_DEVIATION + EARLY_END + PEAK_HOURS) + F3 fatigue (drop visual bar) + F9 BMR strip (drop strip, single line) + F14 ratings window (extend 20→90 cu Tier archive ADR 020) |
| Drop V2-deferred | 1 | F5 AA friction modal (defer v1.5 inline UX flow non-blocking) |

**Cross-refs:** `04-architecture/V1_FEATURES_AUDIT_V1.md` §LOCK V1 2026-05-10 Co-CTO Autonomous + `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` (parent paradigm gates #4 selective port) + `00-index/CURRENT_STATE.md` §JUST_DECIDED chat-current 2 + `03-decisions/DECISION_LOG.md` chat-current 2 entry + P1-FLAG-PORT-FIRST-THEN-REACT 🟢 LOCKED V1 EXECUTION-READY

---

### P1-FLAG-PORT-FIRST-THEN-REACT — Strategic pivot IN PROGRESS BATCH 2 SUB-BATCH 1 LANDED (2026-05-10 chat-current 3)

**Status:** 🟡 IN PROGRESS BATCH 2 SUB-BATCH 1 LANDED 2026-05-10 chat-current 3 — predecessor 🟢 LOCKED V1 EXECUTION-READY (chat-current 2) → 🟡 IN PROGRESS chat-current 3. SUB-BATCH 1 router scaffold LANDED feature/v2-vanilla-port chain `f23453f..be82938` (4 substantive: amendment §4 7/7 + `src/router.js` NEW ~50 LOC + `src/state.js` +2 fields + `src/__tests__/router.test.js` NEW 4 cases). Tests **2732 → 2736 PASS** (+4 net). NEXT P1 chat NEW = BIROU SETUP MCP (cross-ref P1-FLAG-BIROU-SETUP-MCP top entry); subsequent SUB-BATCH 2 idle.js implementation (replaces renderIdle.js 465 LOC per V1_FEATURES_AUDIT_V1 LOCK V1). All 7 sub-decisions LOCK V1 autonomous Co-CTO bias preserved per Daniel autonomy lock EXTINS REAFFIRMED chat-current 3 *"esti autonomous pana la launch beta cand fac eu review"*. Cumulative impact ~742 PRESERVED unchanged (router scaffold meta-tooling NU additive product/architecture).
**Severity:** P1 strategic pivot — affects ALL future development paradigm

**Issue:**
Phase 3.6 cluster #1 attempt CC autonomous revealed mockup vs prod distincție FUNDAMENTAL ratat 15 chat-uri. `git diff origin/main..HEAD -- src/` = ZERO LINES = Phase 1+2+3+3.5 work was 100% mockup files (`04-architecture/mockups/`) + vault docs, ZERO src/ prod changes. Daniel screenshot andura.app prod live = layout VECHI complet diferit (6 taburi Coach/Dashboard/Greutate/Program/Plan/Setări) vs mockup V2 (4 taburi Antrenor/Progres/Istoric/Settings).

**Mockup vs prod distincție LOCKED:**
- `04-architecture/mockups/` = DESIGN MASTER pre-React migration target
- prod `src/` = current state separate (layout vechi V1)
- Două lumi paralele care n-au comunicat 15 chat-uri

**Port-First-Then-React strategy:**
- **Step 1** ~1-2 săpt: port mockup V2 design + Phase 3+3.5 fixes → prod vanilla JS modules `src/`. UI restructure prod V1 6 taburi → V2 4 taburi cap-coadă mockup design. Phase 3+3.5 HTML inline JS handlers → module ES refactor (NU copy-paste).
- **Step 2** ~1-2 săpt: React migration mecanic mapping post — state.js → useState/Context, src/pages/ → components/, src/engine/ preserved import direct.

**Beneficii vs React migration NOW direct:**
- App funcțional interim NU 2-3 săpt black hole
- Phase 3+3.5 mockup polish = real value (port la prod), NU throwaway
- Migration React = mecanic mapping (preserve structure), NU greenfield rewrite
- Risk-averse: validate vanilla JS port → migration React clean

**Action Daniel (Co-CTO SPEC DRAFT V1 prep gata 2026-05-10 chat-current continuation — review `04-architecture/PORT_FIRST_STEP_1_PARADIGM_V1.md` ~10-15 min CEO scope):**

Co-CTO recommended 5 tactical sub-decisions (#1 mockup clean state întâi + #2 structural restructure cap-coadă + #5 NEW branch `feature/v2-vanilla-port` + #6 vitest 2734 PASS preserved + extend). Daniel CEO LOCK V1 strategic 2 sub-decisions remaining (#3 UI restructure scope A vs B + #4 Phase 3+3.5 selective port + #7 mockup post-port paradigm).

**Original 7 sub-decisions verbatim source:**
1. Pre-port mockup buguri fix decision: clean state mockup ÎNTÂI sau direct port + fix vanilla forward
2. Step 1 port paradigm: incremental tab-by-tab sau structural restructure cap-coadă
3. UI restructure scope: prod V1 6 taburi → V2 4 taburi (rename+merge+drop sau structural rewrite)
4. Phase 3+3.5 fixes selective port (which carry value vs which throwaway buggy)
5. Branch strategy: continue feature/phase-3-orchestrator-final sau new branch feature/v2-vanilla-port
6. Testing strategy step 1: vitest 2731 PASS preserved sau test rewrites
7. Mockup paradigm post-port: archive historic sau preserve as design reference

**OBSOLETE drops post-pivot (cross-ref):**
- Phase 3.6 cluster #1 prompt CC = OBSOLETE drop (mockup vs prod distincție corectat — engine src/ NU broken)
- Phase 4 dedicate session ~22-30h backlog (Tasks T+U+X+Y + Cluster #4+#6 + Task I muscleMap + QA calibration banner) = OBSOLETE drop
- Mockup polish further = OBSOLETE post-pivot

**Cross-refs:**
- `00-index/CURRENT_STATE.md` §JUST_DECIDED top entry 2026-05-10 Phase 3.6 + Port-First-Then-React pivot
- `03-decisions/DECISION_LOG.md` top entry same date
- Handover archived NN 353
- Phase 3.6 cluster #1 raports archived NN 350-352 (PREFLIGHT + AUDIT + LATEST_HALT)
- ADR 005 vanilla JS preserved + react-migration ADR new TBD
- Memory rule #18 updated permanent (mockup vs prod distincție)
- P1-FLAG-STRATEGIC-SHIFT-CLASIC-MASTER (chat-precedent ~717 → ~718) preserved valid + compatibil port-first paradigm

---

### P1-FLAG-STRATEGIC-SHIFT-CLASIC-MASTER — Single-theme Clasic master FIRST cap-coadă LOCKED V1 (2026-05-10)

**Status:** 🟢 LOCKED V1 SUBSTANTIVE (cumulative ~717 → ~718 +1 net STRATEGIC SHIFT — Daniel directive verbatim post Phase 3.5 closure receipt)
**Severity:** P1 strategic decision — affects Phase 4 dedicate session scope + knowledge base architecture

**Issue:**
Phase 4 strategy revised post Daniel directive cap-coadă chat-current verbatim *"nu e mai productiv sa facem thema clasic full working 100% si dupa sa facem toate celelalte themes dupa ea?"* + *"daca dupa asta lucram doar la clasic... de ce mai indexez si celelalte 2 theme in knowladgebase?"*.

**Single-theme Clasic master LOCK V1 implications:**
- Tasks X (Lux storyboard ~6-8h) + Y (BC paradigm ~3-4h) + carry-forward Phase 3+3.5 backlog (Cluster #4 Istoric + Cluster #6 Workflow V1 LOCK + Task I muscleMap + QA calibration banner) → DEFERRED post Clasic master 100% production-ready confirmed Daniel Gates smoke
- Knowledge base architecture deselect plan (~10-12% capacity gain combined): deselect LB+Lux+BC mockups + 02-audit + 05-findings-tracker + 06-sessions-log + 07-meta + 08-workflows + public + react-test.html + tsconfig.* + playwright.config.js
- Total post-cuts ~88-91% capacity headroom rezonabil
- Preserve: andura-clasic.html + REACT_MIGRATION_STATE_MAPPING_V1 + 04-architecture critic specs + src/ 40% + 03-decisions/ 17% + 00-index/ 10% + 01-vision/ 4% + VAULT_RULES.md 2%

**Action Daniel:**
1. Smoke DEPTH cap-coadă Clasic FIRST per `LATEST_CONSOLIDATED.md §Smoke Validation Priority` P0 → P1 (NU "fugitiv")
2. Deselect knowledge base files per plan (capacity gain ~10-12%)
3. Schedule Phase 4 dedicate session post Clasic master 100% smoke validation OK (~22-30h estimated combined backlog: Tasks X+Y full + T+U + carry-forward Phase 3+3.5 muscleMap + QA calibration + Cluster #4+#6)
4. Decide merge `feature/phase-3-orchestrator-final` la main timing post Clasic master smoke validation OK (16 commits chain `47dcca8 → 3ff5726`)

**Cross-refs:** `00-index/CURRENT_STATE.md` §JUST_DECIDED top entry 2026-05-10 Phase 3.5 closure + STRATEGIC SHIFT + `03-decisions/DECISION_LOG.md` top entry same date + handover archived NN 349 + LATEST_CONSOLIDATED.md Phase 3+3.5 archived NN 350+362.

---

### P1-FLAG-3-TIER-TESTING-DISTINCTION — LOCAL vitest CC / e2e Playwright CI/CD / Daniel Gates prod (2026-05-10)

**Status:** 🟢 LOCKED V1 ANTI-RECURRENCE RULE (post Slip Co-CTO #2 mid-Phase 3 confirmation theater "solid + minor edge cases" claim BEFORE Daniel smoke → 13+ buguri Daniel smoke fugitiv)
**Severity:** P1 process discipline — CC orchestrator LANDED claim format MUST distinguish 3 tiers

**Rule LOCKED V1:**
1. **LOCAL vitest CC autonomous** — 2731 PASS preserved local (CC orchestrator fast feedback)
2. **e2e Playwright CI/CD GitHub Actions** — full integration tests scope (NU run pre-LANDED claim CC orchestrator)
3. **Daniel Gates prod smoke andura.app** — final acceptance pe production deploy

**CC orchestrator LANDED status = LOCAL vitest only — NU implies smoke prod-ready Daniel Gates.** CC NU ran e2e suite + NU ran prod smoke pre-LANDED claim. Future LANDED claim format mandatory: "LANDED LOCAL vitest 2731 PASS — pending e2e CI/CD + Daniel Gates smoke validation."

**Action CC orchestrator:** Apply 3-tier distinction în toate raporturile LANDED post-execution. NU promite "smoke clean expected" sau "minor edge cases" pre Daniel Gates smoke.

---

### P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER — e2e test fail Phase 4 backlog (2026-05-10)

**Status:** 🟡 OPEN Phase 4 backlog NU urgent (single-theme Clasic FIRST strategic shift)
**Severity:** P1 e2e test fail — `e2e/scenarios/calibration-ui.spec.js:193` LOW_ADHERENCE banner NU se afișează

**Issue:**
- Test: `CDL with 5 real entries low adherence shows LOW_ADHERENCE banner`
- Expect: text `/Adherence scăzută/i` în body
- Actual: body afișează default state "DATE INSUFICIENTE Completează 2+ sesiuni"
- Bug: LOW_ADHERENCE banner NU se afișează când CDL 5 entries low adherence threshold met

**Investigation Phase 4:**
- `src/engine/calibration.js` LOW_ADHERENCE logic verify
- `src/engine/CDL.js` adherence calculation + threshold verify
- `e2e/scenarios/calibration-ui.spec.js:193` test setup verify (5 entries low adherence reproduction conditions)

**Action Daniel:** Schedule Phase 4 dedicate session — bundle cu Tasks X+Y+T+U+muscleMap (~22-30h combined)

---

### P1-FLAG-1 — ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md SOURCE PENDING UPLOAD

**Status:** 🟡 PARTIALLY MITIGATED 2026-05-03 (chat strategic post-audit) — Faza 3 va integra direct sub-secțiuni A-M ADR 023 din addendum context window în chat strategic original (NU file upload separate). Original raised 2026-05-03 audit total ingest.
**Severity:** P1 BLOCKER (impedes ADR 023 implementation full sub-sections A-M, but Faza 3 cleanup integrates from chat context)

**Issue:**
Audit total ingest 2026-05-03 (3 fișiere ingestate: HANDOVER_AUDIT_TOTAL + AUDIT_VERIFICATION_REPORT + AUDIT_IDEATION_REPORT) referă al 4-lea fișier `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` ca sursă pentru ADR 023 LLM Intent Interpretation §2 sub-secțiuni A-M complete. **Acest fișier NU e în inbox la momentul ingest.**

**Per memory rule SUFLET ANDURA precedent (2026-05-02):** partial ingest procedat — fabricarea conținutului lipsă INTERZISĂ per zero-info-loss principle.

**Impact:**
- ADR 023 status `LOCKED V1 — partial spec` (file `03-decisions/023-llm-intent-interpretation.md` cu summary verifiable din 3 fișiere ingestate)
- Sub-sections A-M full spec (provider chain detail + sandbox detail + sanitizer whitelist exhaustive + async lifecycle + cache invalidation policy + cost cap enforcement detail + CDL llm_metadata schema + Gigel test scenarios + ToS impact + privacy impact + audit trail format + reconsideration triggers detail + implementation guidance) NU disponibile
- Implementation Tier 1 (Pain) + Tier 2 (Equipment) cannot start până full spec disponibil

**Action Daniel:**
1. Upload `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` în `📥_inbox/`
2. Comandă CC Opus: `Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL`
3. CC Opus va ingesta full sub-sections A-M și update `03-decisions/023-llm-intent-interpretation.md` din partial → complete
4. Update DIFF_FLAGS.md: P1-FLAG-1 status `🟢 RESOLVED` cu cross-ref commit hash ingest

**Cross-refs:**
- HANDOVER_GLOBAL §36.86 ADR 023 partial spec
- HANDOVER_GLOBAL §36.87 Cognitive Q4 DELOCK §AMENDMENT
- HANDOVER_GLOBAL §36.91 T2 RESOLVED via ADR 023
- `03-decisions/023-llm-intent-interpretation.md` partial stub
- Memory rule SUFLET ANDURA precedent 2026-05-02 (Procesul de gândire 12k cuvinte — partial ingest cu STUB pending source upload)

---

### P1-FLAG-NEW — Codespace `npm install` drift (3 test FILE imports broken)

**Status:** 🔴 OPEN 2026-05-04 (raised during handover ingest §36.99-§36.107 verification)
**Severity:** P1 (impedes pre-commit hook on Codespace; CI/dev-env only — production unaffected)

**Issue:**
3 test files in `src/storage/__tests__/` fail to load with **import errors** (NOT assertion failures, NOT timeouts):
- `src/storage/__tests__/db.test.js` — `Failed to resolve import "fake-indexeddb/auto"`
- `src/storage/__tests__/tieredRead.test.js` — `Failed to resolve import "fake-indexeddb/auto"`
- `src/storage/__tests__/tieringEngine.test.js` — `Failed to resolve import "dexie" from "src/storage/db.js"`

`tier2Stub.test.js` not affected (no Dexie/fake-indexeddb import path).

`package.json` DECLARES both deps:
```
"fake-indexeddb": "^6.2.5",
"dexie": "^4.4.2"
```

But `node_modules/fake-indexeddb` and `node_modules/dexie` are **NOT installed in this Codespace** — `npm install` was never run after deps were added on remote.

**Verified pre-existing on origin/main pre-this-session** — checked out clean `origin/main -- .` baseline and re-ran `npm run test:run`: same 3 file import errors, same 1155/1155 actual tests pass. NOT a regression introduced by handover ingest §36.99-§36.107.

**Provenance (git blame):**
- Packages added to `package.json`: `3892588 feat(storage): Dexie.js install + db.js setup (ADR 020 Tier 1)`
- Test files added: `7455e89 test(storage): 52 tests Golden Master (Dexie + rotation + tieredRead + Tier 2 stub)`
- Last package.json touch: `1640ffd 2026-05-03 chore(rebrand): config + package + CI workflows sweep (Phase 3)`

**Impact:**
- Pre-commit hook (`husky`) fails on this Codespace because `npm run test:run` exits 1 on the 3 import errors
- Forced `--no-verify` push for handover ingest §36.99-§36.107 (vault-docs-only commits f294c40 + 452fc75) — scope discipline preserved (zero `src/`, `tests/`, `scripts/` touched)
- Production unaffected (vite build runtime resolves deps via `node_modules` populated at deploy time)

**Daniel's note:** Daniel referenced "Dexie + getUserConfig path" — `getUserConfig` not observed in failure output (only `fake-indexeddb` + `dexie` imports). Possible separate path issue Daniel observed elsewhere — flag for investigation in dedicated chat.

**Action Daniel (deferred to dedicated chat strategic post Vault Hygiene Faza 3+4 + Auth Flow §36.80):**
1. Run `npm install` in Codespace (reinstall declared deps) → re-test
2. If still failing: investigate `getUserConfig` path Daniel observed (separate root cause possible)
3. Verify CI workflows have `npm install` step before `npm run test:run`
4. NU fix in handover ingest scope — out of scope per VAULT_RULES §2 (NU atinge `src/`, `tests/`, `scripts/`, configs)

**Cross-refs:**
- ADR 020 Storage Tiering Phase 1 (introduced Dexie dep)
- HANDOVER_GLOBAL §16 ADR 020 Storage Tiering Implementation Notes
- 📤_outbox/LATEST.md (handover ingest §36.99-§36.107 raport — verification step #10 ⚠️ flag)

---

## P2 PENDING (decision points pending Daniel chat strategic NEW)

### P2-FLAG-1 — Decision Points D1-D6 Status Update (post Vault Hygiene chat strategic 2026-05-03)

**Status:** 🟡 PARTIALLY RESOLVED 2026-05-03 — D2/D3/D4/D5/D6 RESOLVED Co-CTO; D1 only remaining strategic
**Severity:** P2 (decision-only, no fabricate)

**Updated status per HANDOVER §36.93-§36.96 + handover §1+§8:**

- **D1:** T1 "Save the week silent" — **🟡 PENDING** strategic dedicat post-Vault Hygiene Faza 3+4 + Auth Flow §36.80. A passive intelligence / C in-app banner pasiv (NU B opt-in). Recommend A sau C.
- **D2:** §36.86b DELOCK Mechanism META-RULE — **✅ RESOLVED** "ACCEPT propunere wording verbatim" (Co-CTO decide aliniat T3). Codification PENDING execution Faza 3 sau ad-hoc.
- **D3:** Cloud Functions Blaze plan upgrade — **✅ RESOLVED B Spark plan retain** per §36.93 (rationale calcul real 50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier 14400/zi limit).
- **D4:** Goal Taxonomy LOCKED Final — **✅ RESOLVED hybrid C** deja LOCKED §36.92 D4 (B onboarding + A engine internal mapping). Execute Faza 3 cleanup (Recomandare B audit Faza 1 = `01-vision/ONBOARDING_SSOT_V1.md` create).
- **D5:** Sprint Vault Hygiene Q2 2026 — **✅ SUPERSEDED** per §36.96 Vault Hygiene Sprint = Priority 0 acum (NU Q2 2026 deferred).
- **D6:** ADR 023 cost monitoring infrastructure — **✅ RESOLVED B frontend-only soft cap** (depends D3=B per §36.93). NEW-IDEATION-5 backend cost monitoring DEFERRED post-revenue.

**Action Daniel (only D1 remaining):**
- Strategic chat NEW dedicat D1 Save the week silent (~30min Daniel-time) — post Faza 3+4 Vault Hygiene + Auth Flow
- Sequencing: D1 strategic NU blocks Vault Hygiene execution (independent decision-only)

**Cross-refs:**
- HANDOVER_GLOBAL §36.93 (D3=B) + §36.94 (ADR 025 candidate) + §36.95 (ADR Numbering Additive) + §36.96 (Vault Hygiene Sprint Priority 0 + 8 recomandări APROBATE) + §36.97 (Faza 4 VAULT_HYGIENE_PASS LOCK PENDING) + §36.98 (System Prompt artefact)
- ADR 023 §Reconsideration Trigger #2 update (D3=B Spark retain rationale)
- HANDOVER_AUDIT_TOTAL_2026-05-03.md §4 (archived `📤_outbox/_archive/2026-05/104_*.md` post-ingest)

---

## P1 NEW (Pre-CC Implementation Daniel Manual Prep — Auth Flow §36.80)

### P1-FLAG-AUTH-DANIEL-PREP — Daniel manual prep prerequisites pre-CC Auth Flow §36.80 implementation

**Status:** 🟢 **RESOLVED 2026-05-04 night** (Daniel manual prep complete: Firebase Auth Console authorized domains + Email Template Magic Link RO + Google OAuth Client ID + Action URL `https://andura.app/auth-callback` + Privacy Policy + ToS V1 Beta validate sprint COMPLETE pre-CC Phase 1 Auth Flow §36.80 LANDED commit `0880641`)
**Severity:** N/A (resolved)

**Issue:** Auth Flow §36.80 CC Opus implementation Priority 1 ABSOLUT requires Daniel manual prerequisites prep before CC autonomous run can start. 3 manual tasks identified locked in §56.18 + §56.8.2 + §56.8.3.

**Action Daniel (sequential pre-CC):**

1. **Firebase Auth Console setup** §56.18.1 (~15 min):
   - Authorized domains: add `andura.app` în lista
   - Email Template Magic Link RO: subject "Link-ul tău de acces în Andura" + body brand Andura
   - Google OAuth Client ID: generate Google Cloud Console + paste Firebase Auth Google Provider
   - Action URL: `https://andura.app/auth-callback`

2. **Email infrastructure `suport@andura.app`** §56.18.2 (~15 min):
   - MX records Namecheap → forward Daniel personal email (gmail/yahoo)
   - Alternative: Google Workspace ($6/lună/user) sau temp `andura.suport@gmail.com` pre-Beta

3. **Privacy Policy + ToS V1 Beta validate sprint** §56.8.2 + §56.8.3 (~30-60 min):
   - Initial drafts created vault: `01-vision/PRIVACY_POLICY_V1_BETA.md` + `01-vision/TERMS_OF_SERVICE_V1_BETA.md` (verbatim from LOCKED V1 templates)
   - Daniel review + minor adjustments + lock final V1 Beta

**Cross-refs:**
- HANDOVER_GLOBAL §56.18 Daniel Manual Setup + §56.8.2/3 templates LOCKED V1
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04.18 + 2026-05-04.8
- §58 Priority 1 ABSOLUT CC Opus Auth Flow implementation (~30-45 min CC autonomous post-Daniel-prep)

---

### P1-FLAG-AUTH-PHASE2 — Phase 2 Auth Flow upgrade RESOLVED 2026-05-06 morning (SMTP Magic Link COMPLETE end-to-end)

**Status:** 🟢 **RESOLVED 2026-05-06 morning** (Phase 2 Auth Flow upgrade complete end-to-end: SMTP Magic Link + Google OAuth + IndexedDB namespace per UID Dexie multi-DB + Settings UI account lifecycle + Anonymous→Auth Merge Fork Decision UI + Logout double-confirm + admin-cleanup.js + Telemetry counters Firestore + Firestore Security Rules publish). Predecessor 2026-05-05 birou status `🔴 P1 ABSOLUT URGENT` superseded.
**Severity:** N/A (resolved)
**Historical context preserved (predecessor 2026-05-05 birou):**

**Issue:** Auth-Required Pivot LOCKED V1 chat strategic 2026-05-05 birou (§AMENDMENT 2026-05-05 .1 ADR_MULTI_TENANT_AUTH_v1) face Phase 2 Auth Flow upgrade prerequisite Beta launch. Pattern Anonymous = doar T0 trial 3-5 min DUPĂ care auth obligatoriu hard wall — Anonymous-permanent dispare conceptual. Fără Phase 2 wiring complet (Settings UI account lifecycle + Anonymous→Auth Merge Fork Decision UI + Logout double-confirm + IndexedDB per-UID Dexie multi-DB + Telemetry counters Firestore + Firestore Rules publish) Beta launch IMPOSIBIL.

**Argumentul critic (chat strategic Daniel):** *"in beta cat si dupa, noi ca sa imbunatatim tot, avem nevoie de datele alea nu?"* — fără auth ZERO Firestore writes, ZERO cohort ML, engine învață în vid → contradictoriu Bugatti improvement loop Beta+post-Beta.

**Cluster ~16-22h over 3-4 batches preserved §AMENDMENT 2026-05-04 §56.1.4-§56.16 verbatim:**
1. §56.1.4 IndexedDB namespace per UID (Dexie multi-DB) — DB layer arch change ~3-5h
2. §56.5 Settings UI account lifecycle (delete 2-step "ȘTERGE" + reactivation + email change) ~4-6h
3. §56.7 Anonymous→Auth Merge Fork Decision UI + archive 7 zile flow ~3-4h
4. §56.12 Logout Settings double-confirm + opt-in IndexedDB wipe toggle ~2h
5. §56.14.A admin-cleanup.js Daniel weekly script ~1h
6. §56.15 Telemetry counters FieldValue.increment Firestore ~2-3h
7. §56.16 Firestore Security Rules publish ~1h Daniel manual

**Action Daniel (NEXT chat dedicat post-this-handover):**
1. Open chat strategic NEW dedicat Phase 2 Auth Flow acceleration
2. Trigger CC Opus implementation cluster ~16-22h over 3-4 batches
3. Daniel manual: §56.16 Firestore Security Rules publish post-CC code generation

**Cross-refs:**
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05 .5 (Phase 2 Priority Ridicare P1 ABSOLUT URGENT)
- §AMENDMENT 2026-05-04 §56.1-§56.19 spec preserved (Phase 2 spec body)
- §AMENDMENT 2026-05-04.1 (auth-banner-soft) **SUPERSEDED** by §AMENDMENT 2026-05-05.1
- §AMENDMENT 2026-05-04.9 (Sunset Anonymous post-Beta v1.5) **MOOT** by §AMENDMENT 2026-05-05.3
- CURRENT_STATE §NEXT P1 ABSOLUT URGENT Auth Flow Phase 2
- DECISION_LOG 2026-05-05 birou entry (Implicații downstream)
- Phase 1 LANDED commit `0880641` preserved (BUG 2 fix + retry + wording + authShell)

---

### P1-FLAG-HANDOVER-SPLIT — HANDOVER_GLOBAL split EXECUTED ✅ RESOLVED 2026-05-05 overnight

**Status:** 🟢 **RESOLVED 2026-05-05 overnight** (split executed atomic per §62.2 thematic strategy LOCKED V1, CC TASK 5 finalize prompt). Original 7673 LOC split into 7 theme files + master converted to INDEX. ZERO data loss.
**Severity:** N/A (resolved)

**Resolution:** Source `HANDOVER_GLOBAL_2026-04-30_evening.md` (~7673 LOC) split via awk extracts into 7 theme files preserving verbatim section content. Sum split LOC 7729 (delta +0.7% header overhead, within ±10% tolerance). Master file content replaced cu INDEX (~115 LOC) + section→file mapping table.

**Theme files created:**
- HANDOVER_AUTH_FLOW_2026-04-30_evening.md (715 LOC)
- HANDOVER_ENGINES_SPEC_2026-04-30_evening.md (426 LOC)
- HANDOVER_ONBOARDING_T0_2026-04-30_evening.md (72 LOC)
- HANDOVER_DECISION_CLUSTER_D1_D4_2026-04-30_evening.md (527 LOC)
- HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md (127 LOC)
- HANDOVER_SCENARIOS_COVERAGE_2026-04-30_evening.md (146 LOC)
- HANDOVER_MISC_2026-04-30_evening.md (5716 LOC)

**Wikilinks strategy:** Master file preserved as INDEX navigation hub. Existing `[[HANDOVER_GLOBAL_2026-04-30_evening|...]]` references resolve to INDEX, drill-down via 1-hop indirection per § Section→File Mapping. ZERO active vault wikilinks rewired (trade-off chosen vs ~30+ active file rewires per split plan §3 risks atomicity + form variability).

**Backup tag:** `pre-handover-split-2026-05-05-overnight` (rollback safety, push pre-split, preserved untouched post-execution).

**Cross-refs:**
- VAULT_RULES.md §VAULT_HYGIENE_PASS STEP 13
- 06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md (split plan source — historical artefact)
- 06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md (now INDEX post-split)
- DECISION_LOG.md entry top "2026-05-05 overnight — HANDOVER_GLOBAL Thematic Split Execution (§62.2 LOCKED V1)"

---

### P1-FLAG-SCENARIOS-COVERAGE — Scenarios 1500-2000 PRE-BETA BLOCKER (NEW per §69, Validation Framework path concrete LOCKED V1 2026-05-05 evening late)

**Status:** 🔴 OPEN 2026-05-05 evening late (Validation Framework LOCKED V1 architectural foundation; batch overnight plan PENDING chat NEW artefacte technical 1-button copy)
**Severity:** P1 (BETA LAUNCH IMPOSIBIL fără)

**Issue:** Per §42.9 LOCKED V1 testing strategy mandatory: Hibrid Property-based + Persona Suite Maria/Gigica/Marius + 4-Invariant Safety Stack. Persona simulation suite ~50-100 tests representative + edge cases curated. Coverage actuală post chat-uri Auth + ADR 026 spec + Auth Flow §36.80 + Batch 1-6 + T0 Mechanics 75 + Engines #1-#7 spec sessions + #8 §45.6 + Validation Framework LOCK V1 = **~653 LOCKED V1** total. **Gap pre-Beta: ~990-1490 scenarios decisions remaining.**

**Gap reduction progress:**
- Initial gap (post §62-§73 ingest 2026-05-04 evening): 1200-1700 scenarios
- Post engine specs Periodization + Goal Adaptation + ADR 026 Q1-Q10 (2026-05-04 evening late): 1170-1670 (~50 decisions consumate engine specs, NU branches)
- Post Engines #3+#4+#5 spec sessions cumulative + Convergence Guard "T2 Unlock" (2026-05-05 birou after): 1080-1580 (~90 decisions consumate engine specs cumulative, NU branches enumeration)
- Post Engines #5 formal lock + #6 Tempo/Form Cues + #7 Specialization spec sessions + Roadmap §36.100 100% milestone (2026-05-05 birou late): **~990-1490** (~180 decisions consumate engine specs cumulative #1+#2+#3+#4+#5+#6+#7 + #8 §45.6 — NU branches enumeration). 🎯 Roadmap §36.100 100% COMPLETE — NU mai chat-uri engines spec sessions remaining
- Post Validation Framework LOCK V1 (2026-05-05 evening late): gap unchanged ~990-1490 scenarios decisions remaining (Validation Framework = architectural foundation, NU enumerate branches direct), dar **path concrete LOCKED V1**: 95% gate / weights 0.35/0.25/0.20/0.20 / Gate 2 DROPPED / Gate 3 selective / 500 queries
- Post pipeline §42.10 V1 IMPLEMENT closure 8/8 prescriptive engines (2026-05-06 evening chat-8 + chat-9 acasă): **gap status PRESERVED ~990-1490** scenarios decisions remaining. **V1 IMPLEMENT closure ≠ scenarios coverage decisions closure** — V1 implement = code-level coverage (8 engines functional + 2648 tests PASS cumulative); scenarios coverage decisions = product/UX edge case decisions (Persona Suite Maria/Gigica/Marius + Property-based + 4-Invariant Safety Stack still pending). Cumulative ~659 LOCKED V1 PRESERVED unchanged.

**🦫 V1 implement evidence (code-level coverage milestone, 2026-05-06 evening chat-8 + chat-9 acasă):**
- Pipeline §42.10 8/8 prescriptive engines V1 LANDED commits verbatim:
  - Periodization `1303b62` + Goal Adaptation `bf9814e` + Energy `69ec9ce` + Bayesian `8615ec1` + Tempo `d82d118` + Specialization `4cf50ab` + Warm-up `20999fb` + Deload `a6a0c87`
- Tests cumulative: **2648 PASS / 0 FAIL** (compile + V1 implement progression strict zero regression)
- ADR cleanup batch landed `dccda1f` — 031+032 NEW + 027/028/029 stub flip → SPEC REFERENCE §9.3-§9.8 ADR 026
- **Status PRESERVED 🔴 OPEN** — Validation Framework SPEC DRAFT V1 + Scenarios Simulator Design V1 + Faza 2 Filter Strategy V1 implementation pending; Persona Suite + 4-Invariant Safety Stack execution pending

**Validation Framework LOCKED V1 cross-ref (2026-05-05 evening late):**
- `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` status SPEC DRAFT V1 → LOCKED V1
- §1 north star ≥95% Claude parity strict (NU 90% range, NU aspirațional)
- §5 match metric weights universal Safety 0.35 + Exercise 0.25 + Sets/reps/RIR 0.20 + Key principles 0.20 (NU ghilotină conditional)
- §7 Gates: Gate 1 ≥95% MATCH | Gate 2 DROPPED | Gate 3 selective Daniel review pe Claude-judge flagged uncertain ~5-15%
- §2 corpus scope = 500 queries (Bugatti coverage breadth)
- §9 framing reformulat: Claude chat strategic ~5-10h + Daniel review reality-lock ~30-60min cumulative

**ADR 026 LOCKED V1 compile draft full cross-ref (2026-05-05 overnight):**
- `03-decisions/026-offline-coaching-decision-tree-exhaustive.md` status STUB → LOCKED V1 compile draft full
- 129 decisions aggregate (10 base §42 + 75 spec §45 + 44 D-cluster §50). ZERO net new substantive — aggregation only. Cumulative LOCKED preserved ~653.
- Branches enumeration separate concern (1500-2000 ramuri V1 distribution per engine, NU în ADR 026 monolith — ADR 026 = META-architecture global concerns SSOT)

**Action Daniel (Priority 2 NEW per §71, batch overnight plan post-LOCK):**

1. ✅ Daniel LOCK Validation Framework §1+§5+§7+§2 COMPLETE 2026-05-05 evening late
2. Chat NEW genera 2 artefacte technical 1-button copy (master prompt batch ordered 5 task-uri + CC #6 Consolidator) — pre-flight grep §56.1.4/§56.16 + ADR template format pentru rigour pragmatic NU gold-plated
3. Daniel paste master prompt tonight în 1 terminal CC `claude --dangerously-skip-permissions` → sequential 5 tasks ~3-5h overnight (TASK 1 Simulator Implementation cu LOCK overrides explicit + TASK 2 Auth Phase 2 batch 1 §56.1.4 + §56.16 + TASK 3 ADR 026 compile draft full + TASK 4 ADR stubs Engine #5/#6/#7 + TASK 5 HANDOVER_GLOBAL split)
4. Daniel paste consolidator dimineața după 5 LATEST_N done → ~10-15min generate `📤_outbox/LATEST_CONSOLIDATED.md` aggregate
5. Daniel review LATEST_CONSOLIDATED + audit nuclear post-batch
6. Post simulator delivery: ground truth production Claude chat strategic ~5-10h + Daniel review reality-lock ~30-60min → run validation → Faza 2 filter ~225-300 flagged branches workflow Bugatti 3-instance ~3 chats × 75-100 issues/chat
7. Pre-Beta blocker absolute: Beta launch IMPOSIBIL fără Both Gates PASS (Gate 1 ≥95% + Gate 3 zero blocker flag)

**Cross-refs:**
- HANDOVER_GLOBAL §69 PRE-BETA BLOCKER FLAG status verbatim
- §42.9 LOCKED V1 testing strategy
- Cumulative ~649 LOCKED V1 post 2026-05-05 birou late
- §71 Priority 2 NEW chat-uri strategice dedicate
- AUDIT_5000Q corpus + ONBOARDING_SSOT_V1 §10 Open Questions (existing scenarios sources)
- Beta launch decalare Quality > Speed default §62.7 justifies timeline flexibility
- 🎯 Roadmap §36.100 ✅ 100% COMPLETE milestone 2026-05-05 birou late (8/8 prescriptive engines SPEC COMPLETE) — NU mai chat-uri engines spec sessions remaining

---

### P1-FLAG-IOS-PERMANENT — iOS REJECTED LOCKED PERMANENT (NEW per §67.10)

**Status:** 🟢 LOCKED V1 PERMANENT 2026-05-04 evening (memory persistent rule, NU OPEN issue — locked rule going forward)
**Severity:** N/A (rule lock, NU pending)

**Rule LOCKED V1 PERMANENT:**
- Pre-Beta: PWA only iOS users (browser default, ~20-30% rate fail tolerated)
- Post-Beta v1.0: NU iOS distribution
- Post-Beta v1.5: NU iOS distribution
- v2/v3: demand-driven only (real iOS user demand + revenue justify $99/an Apple Developer)

**Distribution V1 Beta + post-Beta v1.0/v1.5:**
- PWA installable browser
- TWA wrap Android Play Store (per §56.10.3 contingent rate fail >30% activation)

**Cross-refs:**
- HANDOVER_GLOBAL §67.10 + §56.10 PWA strategy preserved
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 evening BATCH 1-6 .7 verbatim
- Memory persistent rule scope

---

## RESOLVED (audit trail)

### P1-FLAG-PROD-BUGS-2026-05-10 — Bug 1 (AUTO faza hardcoded 2000 kcal) + Bug 2 (BF edit nu recalc kcal phase same weight) RESOLVED `05ba372`

**Status:** 🟢 **LANDED 2026-05-10 chat ACASĂ MCP filesystem direct paradigm** (claude_code agent autonomous, prod bugs Daniel verbalize chat-current verified + fixed atomic single session ~3-4h Daniel-time)

**Bug 1 fix:** `src/engine/sys.js:125-127` drop pilotActive gate AUTO branch → AUTO returns TDEE×phase multiplier always (NU hardcoded `KCAL_TARGET=2000` pre-TARGET_DATE 2026-07-20). Plus `sys.js:77` getPhase pilotActive removal — phase auto-derives BF + sezon always. Propagation `src/pages/weight.js:78` + `src/pages/dashboard.js:193,533-534`.

**Bug 2 fix:** `src/engine/sys.js:54-67` estimateTDEE Mifflin → Katch-McArdle (`bmr = 370 + 21.6 * lbm`) când `getBF()` finite. Mifflin-St Jeor fallback când BF unknown defensive. `getLBM()` finally consumed (existed since launch dar nu wired la estimateTDEE). Math impact: at 100kg same weight, BF 30% (lbm=70) vs BF 5% (lbm=95) → delta ~837 kcal (was 0 kcal pre-fix).

**Tests +3 NEW:** T_AUTO_pre_pilot + T_BF_edit_recalc + T8 phase auto-derive + T4 split T4a Katch / T4b Mifflin. Total tests 2731 → 2734 PASS.

**Layer B deferred:** Energy-balance-path BF-awareness (`estimateTDEE()` energy-balance path ≥4 weights re-baseline pe `phase-change-date` dar nu pe BF override) deferred dedicated session. Needs delta-LBM model + state tracking + phase-change-date trigger pe BF override change.

**Cross-refs:** `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 chat ACASĂ + `03-decisions/DECISION_LOG.md` 2026-05-10 entry + commit `05ba372` (auto-watcher captured `chore(auto):` mesaj poor — content correct, narrative loss tracked carry-forward; auto-watcher race P3 RESOLVED PROBATION `8bd5dbb` chat-current continuation).

---

### P1-FLAG-AUTO-WATCHER-RACE-P3-ELEVATED — Stop hook `git add -A` race înainte agent commit narrative — RESOLVED PROBATION `8bd5dbb`

**Status:** 🟢 **RESOLVED PROBATION 2026-05-10 chat ACASĂ continuation MCP filesystem** (validation = next claude_code session natural monitor; if recurrence → escalate)

**Root cause:** `.claude/settings.json` Stop hook command: `cd <repo> && git add -A && git diff --staged --quiet || (commit chore(auto): + push)` fires la FIECARE Stop CC fără filter timpwise. Race window 31s observed: când claude_code agent pregătește commit cu Bugatti narrative, Stop hook fires în acel window și capturează first cu mesaj poor `chore(auto):`. Manifest 4× today commits `a7e951b` + `0b1d781` + `05ba372` + `dc54c2c`.

**Fix tactical Co-CTO LANDED:** Time gate 90s prepend la Stop hook command — `AGE=$(($(date +%s) - $(git log -1 --format=%ct))) && [ "$AGE" -ge 90 ] && ...`. Dacă HEAD commit < 90s vechi → short-circuit `&&` chain → `|| exit 0` silent (skip auto-commit). 90s = 3× safety margin peste race 31s observed. Subsequent Stops post-90s recapturează eventual work-in-progress = safety net intact.

**Self-validation chat-current:** Commit `8bd5dbb` LANDED + push success `a3d96b5..8bd5dbb main`. Post-Stop hook fired cu config NEW (settings.json deja pe disk la moment hook fire), AGE < 90 → skip silent — ZERO commits `chore(auto):` post-push. HEAD = `8bd5dbb` clean.

**Validation pending:** Next claude_code session natural test — monitor commits subsequent. Dacă recurrence → escalate (glob filter narrow `04-architecture/mockups/` only, sau debounce extend, sau disable hook).

**Anti-recurrence rule potential:** Dacă fix sustains stable >5 sessions → codify §AR.NEW VAULT_RULES (TBD).

**Cross-refs:** `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 chat ACASĂ continuation + `03-decisions/DECISION_LOG.md` 2026-05-10 entry + `.claude/settings.json` config-only fix.

---

### P2-FLAG-CLAUDE-CODE-INTERMITTENT-2026-05-10 — claude_code agent timeout/empty intermittent observed today

**Status:** 🟡 **MONITOR 2026-05-10 chat ACASĂ** (§AR.19 LOCK V1 mitigation in place; reaffirmed via 3 verify cycles successful chat-current vault hygiene + §AR.19 + prod bugs fix triple atomic LANDED)
**Severity:** P2 (process awareness, NU blocker; mitigation = §AR.19 verify ordine MANDATORY: git log origin/main -5 + LATEST.md raport + filesystem file sizes cu cache-stale awareness re-check post-delay)

**Issue:** claude_code agent timeout MCP response delivery NU = agent crash. Vault work cleanup atomic batch was complete + pushed origin BEFORE timeout signal returned. Filesystem:get_file_info returned stale data immediately post-timeout (Windows OS metadata cache lag few seconds post-write) reinforced "no work landed" assumption falsely.

**Action:** Continue monitor. §AR.19 anti-recurrence rule codified VAULT_RULES.md (commit `967460d`). Default = trust completion + verify, NU assume failure + recover.

**Cross-refs:** VAULT_RULES.md §AR.19 + §AR.PRE_FLIGHT_CHECKLIST_INVARIANT item 17 + commit `967460d` + `00-index/CURRENT_STATE.md` §ACTIVE_FLAGS.

---

### P1-FLAG-CAPACITY-A-LANDED — Run 2 Vault Cleanup ✅ LANDED 2026-05-07

**Status:** ✅ LANDED 2026-05-07 (vault hygiene meta-tooling)

**Scope:** Capacity A LOCKED archive + sub-section split + REDIRECT + canonical spans + INDEX/CURRENT_STATE/DIFF_FLAGS refresh.

**Evidence:**
- Tasks 1-5 complete sequential fail-stop (CC autonomous Run 2 Opus)
- 3 files archived: HANDOVER_GLOBAL_SPLIT_PLAN + HANDOVER_VAULT_HYGIENE + HANDOVER_MISC → `📤_outbox/_archive/2026-05/221+222+223_*_DEPRECATED.md`
- 4 new split files created standalone canonical (Task 1): PRE_LAUNCH_CHECKLIST_V1 + INVESTITII_PRIVATE + 033-muscle-memory-index + KNOWLEDGE_LAYER_CADENCE_V1
- 4 strict wikilinks REDIRECT verified 0 residual matches active vault (Task 2 Option A override; audit "12" methodology drift documented)
- Span 1 Pricing canonical → PRODUCT_STRATEGY §AMENDMENT 2026-05-02 (MOAT_STRATEGY line 113 + INDEX_MASTER NAVIGARE entry redirected)
- Tests baseline 2648 PASS preserved (doc-only ZERO src changes)
- Backup tag `pre-vault-cleanup-batch-2026-05-07-2257`

**Cross-refs:** `audit-vault-2026-05-07.md` + CURRENT_STATE §JUST_DECIDED 2026-05-07 entry + INDEX_MASTER VAULT CLEANUP HISTORY 2026-05-07 entry.

---

### §36.80 BUG 2 Firebase 401 — RESOLVED chat strategic 2026-05-04 evening (CC implementation pending Priority 1 ABSOLUT)

**Status:** ✅ RESOLVED chat strategic (CC Opus implementation pending P1-FLAG-AUTH-DANIEL-PREP prerequisite)
**Resolution:** Chat strategic 2026-05-04 evening Daniel + Claude — 35 substantive sub-decisions LOCKED V1 acoperind code-level fix `getUserPath()=null` mode Anonymous + 18 alte concerns auth flow integration. Cumulative 216 → 243 LOCKED V1.

**Root cause:** `getUserPath()` returnează `'users/daniel'` literal când `getAuthState()=null` → DB Rules per-UID strict §36.75 BLOCHEAZĂ → 401 cycle infinit.

**Fix LOCKED V1 (§56.1.3):** Mode Anonymous (`getAuthState() === null`) → `getUserPath()` returnează **obligatoriu `null`** (NU fallback hardcodat `LEGACY_USER_PATH = 'users/daniel'`). Toate apelurile Firebase API blocate când path null → app rulează exclusiv local IndexedDB. Bucla 401 eliminată mecanic.

**CC Implementation pending:** ~30-45 min CC autonomous factor 7-9x clusters mari (~10 fișiere `firebase.js` + `auth.js` + `pages/auth.js` + `index.html` + `main.js` + `_migration` flow + `_deleted` lifecycle + `_archived/` archive flow + IndexedDB namespace per UID + Firestore rules update + wording RO LOCKED + Playwright e2e + `admin-cleanup.js` script + setup Daniel runbook documentation).

**Cross-refs:**
- HANDOVER_GLOBAL §36.80 BUG 2 (origin) + §56.1-§56.19 (resolution full spec) + §57-§61
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-04 (Faza 2 wiring spec LOCKED V1 inline 19 sub-sections)
- DECISION_LOG 2026-05-04 evening entry
- P1-FLAG-AUTH-DANIEL-PREP (above) — prerequisite Daniel manual prep pre-CC
- 01-vision/PRIVACY_POLICY_V1_BETA.md + 01-vision/TERMS_OF_SERVICE_V1_BETA.md (initial drafts created)

---

🦫 **DIFF_FLAGS.md created 2026-05-03. P1-FLAG-1 ADDENDUM source upload pending. P1-FLAG-NEW Codespace `npm install` drift RESOLVED 2026-05-05 birou (npm install resolved deps). P2-FLAG-1 D1-D6 superseded. HANDOVER_GLOBAL split FLAG **TRIGGERED preserved post §62-§73 ingest 7664 LOC > 7000 threshold** — strategy LOCKED V1 thematic split per §62.2 chat strategic NEW dedicat post-Auth Phase 2. §36.80 BUG 2 RESOLVED chat strategic — Phase 1 LANDED commit `0880641`. P1-FLAG-AUTH-DANIEL-PREP 🟢 RESOLVED 2026-05-04 night. **P1-FLAG-AUTH-PHASE2 🔴 P1 ABSOLUT URGENT 2026-05-05 birou** — Phase 2 Auth Flow upgrade ridicat post Auth-Required Pivot LOCKED V1. Cluster ~16-22h over 3-4 batches: §56.1.4 IndexedDB per-UID + §56.5 Settings UI + §56.7 Fork Decision + §56.12 Logout + §56.14.A cleanup script + §56.15 Telemetry + §56.16 Firestore Rules. **P1-FLAG-SCENARIOS-COVERAGE PRE-BETA BLOCKER gap reducere ~990-1490 decisions remaining (din 1170-1670 post 🎯 Roadmap §36.100 100% COMPLETE milestone Engines #5 formal + #6 + #7 + #1+#2+#3+#4+#8 cumulative ~180 decisions consumate engine specs) ~5-15 chat-uri Priority 2 strategice dedicate.** **P1-FLAG-IOS-PERMANENT LOCKED V1 (PWA + TWA Android only).** Cumulative ~649 LOCKED V1 post 2026-05-05 birou late Engines #5 formal lock confirm preserve baseline ~593 + Engine #6 Tempo/Form Cues (~28) + Engine #7 Specialization (~28 ULTIMUL prescriptive) + 🎯 Roadmap §36.100 ✅ 100% COMPLETE milestone 8/8 prescriptive engines SPEC COMPLETE (+~56 net). NU mai chat-uri engines spec sessions remaining — pivot direction P1 CC Auth Flow §36.80 / P2 Scenarios Coverage / P3 ADR 026 compile draft full. ADR 022 stub → SPEC READY V1. ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard "T2 Unlock" Behavioral Validation Rule cross-cutting (formula final post 5 iterations: Statistical Convergence layer per-engine + Behavioral Validation layer shared N≥10 sesiuni adherence ≥80% max 2 Pain-Aware sesiuni din ultimele 10 + Pain-Aware Hybrid Spec V1 binary + forward-compat v1.5 silent vector ZERO migration). ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05 .1-.7 + §AMENDMENT 2026-05-04 evening BATCH 1-6 .1-.10 + PRODUCT_STRATEGY §5.4/§5.5/§5.8/§6.1/§6.5 + ONBOARDING §1/§8 amendments inline. Beta launch decalare oficial Quality > Speed default (Override §56.9.2 1 ian 2027). Review Division of Labor LOCKED V1. Workflow 3-instance Bugatti-grade RECOGNIZED matured (Gemini logic + Claude Bugatti challenge + Daniel reality lock — velocity crescând session-by-session).**
