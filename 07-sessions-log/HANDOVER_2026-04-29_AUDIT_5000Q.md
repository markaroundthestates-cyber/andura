# HANDOVER 2026-04-29 — AUDIT 5000Q + Sesiunea curentă state

**Created:** 2026-04-29 evening (Daniel home Windows post-birou)
**Owner:** Daniel
**Type:** Session log + state snapshot pentru chat nou seamless

---

## TL;DR pentru chat nou

Sesiunea 2026-04-29 a livrat:
- **Wave 1 fully completed** (production fixes verified clean console)
- **35+ decizii arhitecturale noi locked** (Multi-Gym ADR draft, Bayesian Nutrition, Reality validation, Readiness move la START, friction reductions)
- **AUDIT 5000Q lansat** ca prompt CC pentru Opus autonomous run la Daniel acasă

**Status la handover:** AUDIT_5000Q rulează la Daniel acasă (Windows + CC). Output expected: `cc-reports/AUDIT_5000Q.md` (single file, batched în 5 etape) + `cc-reports/AUDIT_5000Q_REPORT.md` (raport final cu top 20 PUSH-BACK CRITICAL pentru review prioritar).

---

## Context Daniel — chat de continuare

**Locație:** Daniel acasă Windows PowerShell `C:\Users\Daniel\Documents\salafull` (NU Codespaces birou).

**Bucket Plan x20:** consumat substantial sesiunea curentă (Wave 1 Opus fixes + AUDIT 5000Q autonomous run). Reset luni 10AM. Joi/vineri/sâmbătă/duminică = limited.

**Daniel mode:** post-AUDIT review. Acceptă deja cap weekend bucket-wise. Pickup luni cu bucket fresh dacă e cazul.

---

## Wave 1 — STATUS FINAL

### COMPLETED ✅

**Step 1: E2E LOW_ADHERENCE banner fix**
Sonnet — commit `c126134`. Tests: 762/762 PASS, E2E 9/9 PASS.

**Step 1.5: Readiness Card verdict fix**
Sonnet — commit `b0a6604`. 3 buguri: cache invalidation, test locator, Firebase sync contamination.

**Step 1.75: Modal Architecture refactor**
Sonnet — commits `361aecf`, `b4c2a18`, `041270b`. ModalManager singleton + Compatible Write Rule + dismiss persistence.

**Step 1.9: Production bug fix (3 bugs introduced de refactor)**
Opus — commits `9884105`, `c842104`, `8f11525`. Closure scope, oldCtx guard, undefinedkg coalescer.

**Step 1.95: AA Friction modal — anti-RE rewrite + dismiss persist + test isolation**
Opus — commits `bdb0be6`, `b24aaae`. Eliminat signal exposure, force-typing, escalation logic. Tests: 752/752 PASS. 11 e2e tests recovered.

### Production verified
HEAD: `b24aaae` — production console clean (Daniel screenshots Image 1+2). Modal AA dismiss persistence + override + signal exposure eliminated.

### PENDING (NU făcute Wave 1):
- Wave 1 Step 2: Q020 + Memory Paradox Firebase verify (Opus per #21 — read-only investigation)
- Signal exposure audit pe banners ("Adherence 0%", "Deviation 100%") — RE leak similar cu modal AA, urgent backlog

---

## DECIZII ARHITECTURALE NOI LOCKED — sesiunea 2026-04-29

### 1. Readiness MOVE la START antrenament + Reality validation (3 layere)

**Coach idle:** plan baseline fără readiness gate. Readiness card SUBTLE pentru `mood history` (pattern learning). Stocat ca `readiness-mood[date]`. NU schimbă plan vizibil → reverse engineering blocked.

**Click START:** modal readiness obligatoriu cu Skip (default neutru 3). Stocat ca `readiness-session[date]`. Engine recalculează instant.

**Post-session END (Reality validation):**
- <2min + 0sets → auto-delete silent
- <5min sau <30% volum → modal "Test sau real?" default delete
- 5-15min + 30-70% → "Sesiune scurtă, păstrăm?" default Yes
- >15min + >70% → log normal

User flow: vestiar → click START → "Cum te simți?" → engine recalculează → sesiune începe cu plan calibrat.

### 2. Bayesian Nutrition Inference (5 layere)

- **Layer 1 prior:** kg × multiplier per phase (CUT 2.2g/kg LBM, BULK 1.8, MAINT 2.0, STRENGTH 1.8). LBM din Boer formula.
- **Layer 2 input fizic:** rolling avg 7 zile cu confidence weighting (0 inputs = prior, 1 input = 50/50, 3+ = 100% input).
- **Layer 3 outlier rejection:** >400g sau <30g/day = silent reject + toast. Schimbare >100g/day vs avg = soft warning.
- **Layer 4 indirect signal (4 signals confirmed):** greutate trend + force progression + mood post-session + adherence training compliance. Tabel 5×5. Sleep/Stress/Hidratare EXCLUDED (friction = daily quest).
- **Layer 5 reconciliation:** Caz A concordanță, Caz B discordanță (input claim vs reality), Caz C reverse discordanță. Banner wording: "Verificăm contextul..."

### 3. BF% estimation = combo (a)+(b)+(c)

- (a) Photo-based primary: 6-8 poze 3D anatomical, click selecție
- (b) Optional: buton "Mai precis? Adaugă talie/gât" → Navy formula
- (c) Skip: "Sari peste" → Boer simple din kg+height+age+sex

User decide friction acceptable.

### 4. Kg/Lbs system

Onboarding întreabă "Sistem metric (kg/cm) sau imperial (lbs/inches)?" — default kg pentru RO, lbs pentru EN audience (din `navigator.language`). Storage internal mereu kg (single source truth). Display convertit dynamic.

### 5. Aware system pentru skip prompts (context-aware thresholds)

| Calibration tier | 50% reduce | 7d suppress | Off permanent |
|------------------|------------|-------------|---------------|
| COLD_START / INITIAL (sesiuni 0-10) | 3× | 7× | 15× |
| DEVELOPING (10-30) | 2× | 5× | 10× |
| PERSONALIZING+ (30+) | 1× | 3× | 5× |

Reset signal: accept = counter reset. 30 zile fără skip = reset.

### 6. User-facing display = CATEGORICAL (anti-RE pattern arhitectural ÎNTREG engine)

Display: target round number OK ("~180g protein"), status categoric ("✓ Excelent / OK / Slab"), banner contextual neutru. NU expune: numere precise actual vs target, signals triggered, counting windows, cross-pillar logic. Pattern aplicabil ÎNTREG engine NU doar Bayesian.

### 7. Multi-Gym Architecture (10 decizii)

1. Q1=(b) opt-in onboarding (default 1 sală, banner subtle adăugare)
2. Q2=(a) sală nouă asume FULL echipament, learn on-the-go via "Lipsă aparat" mid-session. NU prompt cross-gym.
3. Q3=(a)+prompt 60 zile re-validation
4. Q4=manual switch only, learn frequency pattern (NU GPS — privacy + Gigel test fail)
5. Q5=(b) global merged progresie + opt-in calibrare per echipament
6. Q6=(a) last active gym default
7. Q7=max 5 săli
8. Q8=(a) silent automated migration
9. Q9=(c) auto-substitute alternativă pe lipsă
10. Q10=free-text naming săli

Schema: `gyms: [{id, name, equipment_unavailable}], active_gym_id`. Engine query: filtrează exerciții pe equipment_unavailable per gym activ. Click "Lipsă aparat" → append + persist per-gym. Switch gym = NU re-prompt, configurația persistă independent.

### 8. UI Tabs Restructure (Wave 6 PRE-LAUNCH)

3 tabs final ordonate priority:
1. **Coach** — today + START sesiune + săptămâna informativă scroll-down
2. **Statistici** — log greutate/kcal/protein input rapid + read-only data layer (charts, projection, goal weight + ETA, fatigue, adherence, calendar, BF%, TDEE, LBM, **PR Wall mutat aici**)
3. **Profil** — onboarding edit, biometrie, phase override, settings, GDPR export, payment, account deletion

Eliminate: Dashboard tab (duplicate), Program tab (anti-RE risk + engine decide zilnic), Plan tab (nume nasol + content fragmentat).

Filozofia: Coach = action layer, Statistici = display layer.

### 9. Visual language fundațional

- Q1: Coach default + smart prompts non-invasive
- Q2: Single scrollable + prompts contextuale
- Q3: Engine-driven curation, 3-5 cards always (echilibru cognitiv)
- Q4-Q5: Final color palette + typography decision DEFERRED post-mockup Claude Design

### 10. Exercise visual demo

Generate prin Claude Design (bucket separat 0% used, zero cost main bucket). Style: illustration anatomical 3D side-by-side START/END (gen aparate sală). Daniel NU în poză. ~200 exerciții × 2 illustrations. Pilot 1 exercițiu cu 3-5 style variante înainte scale.

### 11. User input friction analysis

- **P1 RPE per-set = (d) combo:** smart inference din reps actual + selective prompt RPE 4-tap doar la outlier sets (reps deviation mare SAU primul set exercițiu). Reduce 75% friction.
- **P2:** Auto-dismiss summary modal 5 sec.
- **P3:** "Aparat ocupat" rămâne (efemerar context), "Lipsă aparat" persistent per-gym (Multi-Gym).
- **P5:** Mut card "Ultima Sesiune" de la Coach → la istoric tab.
- **P6:** NU voice input ("cine drq vrea sa urle in sala la telefon").
- Greutate corp: stale awareness 7/14/30 zile thresholds. Engine reduce confidence pe weight-driven recommendations după 14+ zile. Outlier detection >2kg/24h soft warning.

---

## BUGS FLAGGED — backlog Wave 6

### Firebase Sync Re-Pull (CRITICAL pre-launch)

Pattern observat de 2 ori: `_suppressFirebaseSync = true` setat în memorie pre-reload se PIERDE la reload. Pe page reload, Firebase pull re-introduce entries deleted local. **Solution: Tombstone & Branching pattern** (deja locked în Cognitive Architecture Spec v1, NU implementat). Trigger: pre-launch obligatoriu.

### Signal Exposure în banners (HIGH backlog)

Banners actuale ("Adherence scăzută ultimele 30 zile: 0%", "Deviation crescut: 100% sesiuni diferite") = signal exposure similar cu modal AA pre-fix. Opus a flag-uit ca backlog urgent: sweep `volume_creep|frustration|recovery_debt|ignore_recovery|calorie_acceleration` în `src/pages/`, `src/styles/`. Aceleași patterns RE leak în alte module.

### Pre-existing bugs flagged (NU fixate Bugatti decision)

- TS `checkJs: false` ascunde regresii (backlog)
- ESLint `no-undef` ar fi prins BUG 1 din production (backlog)
- ModalManager unit tests pending
- `aa-friction-pending` lifecycle key cosmetic redundant

---

## AUDIT 5000Q — STATUS

### Lansat: Daniel acasă Windows + CC + Opus

**Output expected:**
- `cc-reports/AUDIT_5000Q.md` — file principal cu Q1-Q5000 batched în 5 etape
- `cc-reports/AUDIT_5000Q_REPORT.md` — raport final cu Top 20 PUSH-BACK CRITICAL pentru review prioritar Daniel

**Estimated runtime:** 6-12h autonomous Opus run.

**Scope:** 15 domenii × 200-800 Q per domain = 5000 Q total. Format strict per Q: DECIZIE / RAȚIONAL / IMPACT / SURSA / PUSH-BACK / STATUS.

### Acțiune chat next

Daniel paste raport `AUDIT_5000Q_REPORT.md` (NU file complet 5000 Q care depășește context window). Discutăm Top 20 PUSH-BACK CRITICAL prioritar. Apoi review per-batch în zile separate (Daniel ritm propriu).

---

## MEMORY MANAGEMENT

30 → 27 reguli active după cleanup sesiune curentă. Eliminat: #6 work setup duplicate, #14 Code definition (internalized), #22 Bloodwork OUT (deja în vault DECISION_LOG + ADR-uri). Pattern: ce-i locked în vault NU dublezi în memory. Memory = behavior rules + workflow tactic.

Updated rules importante:
- #21 model selection NEW: la FIECARE prompt CC adaug 1 linie reasoning sus în chat: "Complex (arch decision/anti-pattern/multi-file/closure-state) → Opus" SAU "Easy (mecanic clear scope) → Sonnet". Plan x20 reset 5h. EXCEPȚIE foundation critical = Opus build+audit.

---

## URMĂTOAREA SESIUNE — ORDER STRICT

### IMMEDIATE NEXT
1. **Daniel acțiune:** paste `AUDIT_5000Q_REPORT.md` (Top 20 PUSH-BACK + Top 10 DECIZII NEACOPERITE) când Opus a terminat
2. Wave 1 Step 2: Q020 + Memory Paradox Firebase verify zero v0 ghosts production (Opus per #21 — read-only investigation)

### PENDING — Daniel decide la review

Daniel răspunde la PUSH-BACK pe care le consideră misaligned. Procesăm 1 cate 1, NU în paralel. Decision fatigue rule (#28).

### PENDING — Wave 6 Pre-Launch UX timing

UI tabs restructure DECISION LOCKED ca PRE-LAUNCH (NU post-launch) — argument Daniel: dacă lansăm cu UI Excel-cu-culori → beta testers feedback pe UI urât NU pe engine. Asymmetric perception risk = Bugatti engine + Dacia UI = users judecă după Dacia.

---

## STATUS FINAL SESIUNE 2026-04-29

- Tests: 752/752 PASS unit + 9/9 integration + 9/9 calibration-ui + 7/7 visual + regression all PASS + smoke 3/3 PASS
- HEAD post-toate-fixes: `b24aaae`
- Production verified clean console
- Wave 1 fully completed (5 sub-steps)
- 35+ decizii arhitecturale majore locked pentru Wave 6 implementation
- AUDIT 5000Q lansat ca prompt CC autonomous Opus run
- Memory cleanup 30 → 27 rules

## FILE PATHS PRESERVED

- Vault structure: `00-index/`, `01-vision/`, `02-audit/`, `03-decisions/`, `04-architecture/`, `05-prompts/`, `06-findings-tracker/`, `07-sessions-log/`, `08-meta/`, `09-workflows/`, `10-exec-queue/`
- Critical specs: `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md`, `01-vision/PRODUCT_STRATEGY_SPEC_v1.md`, `07-sessions-log/HANDOVER_2026-04-29_AUDIT_5000Q.md` (acesta), `06-findings-tracker/INSIGHTS_BACKLOG.md`
- ADR-uri referenced: 011 CDL, 013 AA detection, 014 Profile Typing, 016 Vitality, 017 Demographic Prior, 018 Engine Extensibility
- Production URL: https://markaroundthestates-cyber.github.io/salafull/
- Source paths: `src/components/modalManager.js`, `src/pages/coach/aaFrictionModal.js`, `src/pages/coach/renderIdle.js`, `src/util/coachDecisionLog.js`, `src/engine/coachContext.js`, `src/engine/coachDirector.js`
- CC reports temp: acasă `C:\Users\Daniel\OneDrive\Desktop\Claude Code messages\AUDIT_5000Q.md`
