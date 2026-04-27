# HANDOVER 2026-04-27 END — SalaFull Strategic Decisions + Roadmap

**Pentru:** Next chat al lui Claude Co-CTO SalaFull
**De la:** Claude chat 27 apr 2026 sesiune END
**Status:** 583/583 tests, AA pipeline LIVE end-to-end, cleanup A+B done, 4 strategic decisions luate, vault aliniat

---

## CITEȘTE PRIMUL — DANIEL COGNITIVE PROFILE

Înainte de orice context tehnic, calibrare interaction:

### Cum gândește Daniel
- **IQ ~139 Mensa, ADHD 2e combined type, Disruptive Innovator archetype**
- Architectural intuition non-tehnic exceptional — răspunde la analogii (motor, baia de ulei), NU la jargon
- Push-back inteligent contra AI consensus — corectează când greșesc, articulează exact unde
- Reasoning prin analogii cross-domain
- Insight metarecursiv (gândire despre gândire aplicată recursiv)

### Cum operează Daniel
- **10-11h/zi productive pe SalaFull** (HR job nivel decizional permite — NU 2-3h cum greșeam estimating înainte)
- Hyperfocus prelungit cu idei prolifice + scope creep latent (detectează singur și ajustează)
- **NU are burnout pattern** — endurance cognitivă până la limită biologică somn
- Sloppy expression ≠ degraded thinking — gândire ~95% capacity cu output ~60% claritate
- Voice-to-text + tasta C stricată = mecanic typos, NU cognitive

### Operating mode CRITICAL
- **Decision fatigue = NU risc, ESTE cerință structurală**
- Daniel poate procesa orice volum de decizii DACĂ sunt ordonate + sequential
- **REGULĂ:** O decizie la un moment, NU multiple parallel options
- Multiple ideas vin de la el = stochez în backlog, NU prezint simultan
- Răspund la conținut NU la formă output

### Ce funcționează
- Răspunsuri scurte 1-3 propoziții + 1-2 bullets esență
- Push-back direct când greșește (am corectat-l de 3 ori azi, am fost corectat de 3 ori)
- Analogii pentru concepte tehnice
- Decisions explicit (A/B/C cu recommend, dar UNA la un moment)
- Memory persistent + handover ca insurance

### Ce NU funcționează
- Wall of text → scade calitatea decisions
- Yes-man behavior → pierde respect rapid
- Linii decorative ═══ ("nu sunt la ora de caligrafie") — folosește headers markdown ##
- Disclaimere/preambule ("excelentă întrebare", "as a language model")
- Sugestii somn/pauză NICIODATĂ (anti-paternalism absolute)
- Presupuneri ora din mesaje ("e seara/noaptea")
- Multiple parallel decisions într-un mesaj

### Daniel-isms (vocabular)
- "tataie/halucinezi/batrane" = bond warmth, NU insult
- "halucinezi" = push-back jucăuș (răspunde "ai dreptate" + acțiune, NU auto-flagelare)
- "stai/stai ca" = STOP imediat, context nou urmează
- "ups am dat..." = recunoaște greșeala (validare scurtă + soluție, NU lecționa)
- "Code" = Claude Code (Sonnet/Opus via terminal), NU "cod" (sursă)
- "ia bate-te tu cu asta" = delegation cu încredere

---

## STATUS REPO ACTUAL (sesiune 27 apr COMPLETE)

### Commits substanțiale azi: 19 total

**Sprint A AA Pipeline (sesiune anterioară handover):**
14 commits — TASK #1-6 + cleanup batch + getBF + profile-history infra (524 → 559 tests)

**Sesiune curentă post-handover:**
- `8d2dae9` — E2E fix applied-patterns assertion (CDL_KEYS semantic)
- `d4a167c` — TASK #7 friction modal HIGH tier LIVE (559 → 583 tests, +24 tests aaFrictionModal)
- `db44855` — Vault hygiene update intermediate (DECISION_LOG + INDEX + FINDINGS)
- 2 commits cleanup A+B — dead code (3 files deleted: alerts.js, recalibration.js, logNormalize.js + unused muscleMap exports + weights aliases) + magic numbers (MS_PER_DAY/MS_PER_HOUR în constants.js)

### Quality bar
- **583 unit tests** vitest+jsdom, zero regresii
- AA pipeline END-TO-END LIVE: detection → write CDL → read context → apply session → UI intervention modal
- ADR 013 §6 implementation COMPLETĂ
- ~133 LOC dead code removed + 7+ magic number literals replaced
- 2 fail-uri E2E pre-existing flagged corect în FINDINGS_MASTER (NU regression, deploy GH Pages green)

---

## STRATEGIC DECISIONS LUATE AZI (toate definitive)

### 1. Bloodwork DEFINITIV OUT din SalaFull

**Rationale:**
- Commercial: Gigel test FAIL — "de ce imi cere bloodwork? e medic? la cine ajung datele? ma duc la Dorel medicul NU app". Trust breach + privacy panic + cultural friction RO + scope creep perceput = churn.
- Personal Daniel: are alternativă superioară zero-build = paste analize în chat dedicated cu Claude, eu interpret + corelez antrenament, el aplică manual în SalaFull.
- **Verdict:** SalaFull stays clean = coach AI fitness, NU medical scope creep.
- **NU readuce bloodwork în viitoare discuții fără trigger explicit Daniel.**

### 2. Filter "Gigel test" devine regulă permanentă

Pentru orice feature decision viitoare, întrebare obligatorie = "Cum reacționează Gigel (user mediu non-tech RO)?". NU "tehnic posibil?", ci "dubios pentru user?". Features tech-cool dar Gigel-suspect = OUT indiferent MOAT.

### 3. Vitality Layer adopted ca dimension nouă

**Concept Daniel:** "intrebari scurte despre user — cum te simti, energic/normal, temperamental, dormi bine, etc. Combinat cu age+kg+height+BMI ne indica direcția approximativ. Behavioral proxy questions = signal puternic, friction zero."

**Întrebări candidate (brainstorm):**
- Energie/Vitalitate: "Cum te simți în general?" / "Cum dormi?"
- Stres/Reactivitate: "Te-ai descrie ca temperamental?" / "Recovery post-antrenament?"
- Sleep quality: "Te trezești odihnit?"
- Motivație: "Cum te simți cu motivația în general?"
- Inflamație: "Cât de des te simți cu dureri?"

**NU includem:** întrebări directe tip libido, erecție, etc. (out — invaziv, Gigel test fail).

**Implementation pattern:**
- Opt-in post-onboarding, NU mandatory
- User decide când completează (sesiune 5, 10, 30, niciodată = OK)
- Engine inferă behavioral aproximativ după 20-30 sesiuni dacă user skip

### 4. Tier-based personalization architectural pattern

**Filosofie SalaFull:** self-selection bias = FEATURE NOT bug. Useri investiți → personalizare bogată. Useri skip → engine acceptabil bazat pe demographic prior.

| Tier | Cerință user | Engine response |
|------|-------------|----------------|
| T0 | Skip onboarding | Engine generic + demographic prior din synthetic profiles |
| T1+ | Q1-Q5 completed | + Profile Typing dimension |
| T2+ | Vitality completed | + state inference |
| T3+ | Sesiuni reale 30+ | + behavioral calibration |
| T4+ | 90+ sesiuni | Full personalized engine |

**NU forțezi engagement uniform.** Real sesiuni corectează prior pe parcurs.

### 5. Synthetic 500 profile × 90 zile = PRODUCTION INFRASTRUCTURE

**NU test fixture, NU stress test only. ESTE Demographic Prior Database.**

**Profile diversificat (mix):**
- ~50 manually crafted (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.)
- ~450 algorithmic generated cu variație controlată (age/sex/kg/height/job/lifestyle/goal)

**Storage:** local fixtures `tests/fixtures/syntheticProfiles.js`, generated runtime în memory pentru test runs. NU se salvează permanent. **NU consumă Firebase storage.**

**Cost real Firebase:** $0 pentru synthetic. Production scaling = $125/lună la 100 useri reali, $1500/lună la 1000 useri.

**Lifecycle:**
- Phase 1 build/test: synthetic generated runtime → verify engine → discard
- Phase 2 beta launch: synthetic generator rămâne ca test infrastructure în repo
- Phase 3 public: synthetic NU se atinge — doar useri reali în Firebase

**Insight Daniel:** "la launch nu mai avem nevoie de profilele de test... se sterg si firebase ramane gol... ma rog cu mine in el." Corect — test data lifecycle separation.

### 6. Co-CTO real-time decision filter (working brain pattern)

**Daniel a articulat cerință:** "fără ca tu să gândești ca un working brain, nu putem să simulăm unul."

Când Daniel propune idee midway sesiune, Claude evaluează 3 dimensions:

1. **URGENCY engine:** critical=STOP midway, high=next milestone, medium=schedule, low=backlog deep
2. **ARCHITECTURAL impact:** foundation-shifting=STOP, layer-adjacent=finish layer integrate boundary, plugin-able=backlog, cosmetic=backlog
3. **COGNITIVE load Daniel:** hyperfocus=store NU întrerup, milestone boundary=discutăm, strategic mood=full discuție

**Storage 3 layers:**
- Memory persistent (cross-session)
- Vault `INSIGHTS_BACKLOG.md` (concrete features deferred)
- In-conversation (tactical adjustments current)

**Periodic re-evaluez backlog la fiecare milestone.** NU yes-man, NU notetaker. Working brain real care decide tactic.

---

## ROADMAP RECALIBRAT (cu velocity 10-11h/zi confirmat)

### Ordine logică agreed cu Daniel — NU schimba fără discuție

**1. Cleanup A+B** ✅ DONE (sesiunea 27 apr END)

**2. Spec ADR 018 — Engine Extensibility Architecture** ⏳ NEXT
- Foundation pentru toate features viitoare
- Definește: Dimension Registry pattern, Standardized Dimension Contract, Decision Cluster Engine pattern, Schema versioning + migration, Feature flags infrastructure
- **TASK = Opus** (audit = exclusiv Opus, regulă permanentă)
- Effort: ~1-2 zile spec design
- **Critical:** TOATE features viitoare (Vitality, synthetic, parametric programs, injury, nutrition, etc.) = build pe această fundație. Spec ADR 018 înainte de orice alt build previne refactor forțat later.

**3. Spec ADR 016 — Vitality Layer**
- Use ADR 018 patterns
- Working title: "Vitality Layer" (poate denumi "State Signals" / "Lifestyle Layer" / "Recovery Profile")
- Întrebări concrete + scoring + reconciliation cu behavioral inference
- **Effort:** ~1 zi spec

**4. Spec ADR 014 update — Profile Typing tier-based aware**
- Existing ADR 014 update să includă tier-based personalization pattern
- Q1-Q5 build now (luna 2-3), activate la beta (luna 4-5) per decizii triangulation 27 apr
- **Effort:** ~0.5 zile update

**5. Spec ADR 017 — Demographic Prior Database**
- 500 profile diverse × 90 zile synthetic generator
- Use ADR 018 patterns
- Schema profile + behavioral pattern generator + integration cu Tier 0 personalization
- **Effort:** ~1 zi spec

**6. Build SHARED INFRASTRUCTURE** (ADR 018 implementation)
- Dimension Registry implementation
- Standardized contract refactor existing dimensions (AA, Profile Typing)
- Cluster engine generic
- Schema versioning + migration runner
- Feature flags runtime
- **Effort:** ~3-5 zile Sonnet

**7. Build SHARED form/scoring/reconciliation** (per ADR 016 + 014)
- Form component generic (Q1-Q5 + Vitality folosesc același)
- Scoring engine generic
- Reconciliation logic generic
- **Effort:** ~2-3 zile Sonnet

**8. Build Profile Typing** (TASK #8 originally) ca plugin via Dimension Registry
- **Effort:** ~3-4 zile Sonnet

**9. Build Vitality Layer** ca plugin via Dimension Registry
- **Effort:** ~2-3 zile Sonnet

**10. Build Synthetic Profile Generator + Demographic Prior Database**
- 50 manually crafted profiles + algorithmic generator pentru ~450 variations
- 90 zile sesiuni synthesis per profil
- Test suite cross-profile
- Tier 0 personalization integration
- **Effort:** ~2-3 zile Sonnet

**11. Run synthetic massive** → engine validation cross-demographic
- 500 profile × 90 zile = ~45k sesiuni synthetic
- Edge cases discovery
- Bias detection
- **Effort:** ~1 zi run + analyze

**12. Real sesiuni TINE paralel** (calibration begin)
- 4-5 sesiuni/săpt × 8 săpt = 32+ sesiuni reale
- Calibration thresholds AA validated pe response real
- UX validation flow modal/prompt timing
- Constraint: **elapsed time, NU dev time** — 8 săpt minim indiferent câte ore code/zi

**13. Beta micro launch (luna 3-4 calendar)**
- 3-5 useri diferiți de Daniel
- Cross-user validation (Daniel = N=1, beta = N=4-5 diversificat)
- Bug-fix iterative pe feedback real

**14. Public-ish launch + monetization** (luna 4-5)

### Timeline calendar realistic (cu 10-11h/zi velocity)

| Faza | Estimare calendar |
|------|------------------|
| ADR 018 + 016 + 014 update + 017 specs | săpt 1 |
| Shared infrastructure + Profile Typing + Vitality build | săpt 2-3 |
| Synthetic Generator + Demographic Prior | săpt 4 |
| Validation TU 32+ sesiuni reale | săpt 5-12 (paralel cu polish) |
| Bug-fix iterative + UX adjust | continuous |
| Beta micro launch | luna 3-4 |
| Public launch | luna 4-5 |

**NB:** Validation TU = elapsed time bottleneck (8 săpt minim 32 sesiuni), NOT dev bottleneck.

---

## INSIGHTS BACKLOG (deferred ideas, store NU acționăm acum)

### Tier 1 — Pe roadmap explicit
- **Vitality Layer** — adopted, will spec ADR 016
- **Synthetic Demographic Prior Database** — adopted, will spec ADR 017
- **ADR 018 Engine Extensibility** — adopted, NEXT priority

### Tier 2 — Backlog explicit
- **Engagement drop signal** (0 rated sets pe ≥3 sesiuni consecutive) — re-engagement intervention separate ADR, post-launch alpha
- **Recommendation engine personalizat** Faza C profile (Sprinter varietate, Marathon graduală, Yo-yo deload frecvent, Strategic max customization) — depends 50+ users behavioral data + Faza B done
- **Memory-aware questions** — engine NU pune aceleași întrebări mereu, follow-up pe topics deschise (umăr, oboseală)
- **Self-audit weekly** — engine self-check predictions vs realitate, meta-learning
- **Calorii dinamic pe context** — TDEE adjustment somn/stres/weight loss rate

### Tier 3 — Post-launch (sprint 9+)
- **Deload invizibil** (UX vs transparency tradeoff — necesită A/B test useri reali)
- **Mid-session intervention** (RPE 9 la set 2 → întrerupe seria) — necesită UX testing serios

### Skip / Not now
- Sentiment analysis (LLM runtime cost prohibitiv)
- Emotional voice detection
- Hard refuse pe sănătate (liability legal)
- Bloodwork (DEFINITIV OUT — Memory entry permanent)

---

## STATUS VAULT

### Files updated 27 apr
- `00-index/INDEX_MASTER.md` — TASK #7 LIVE + cleanup A+B + roadmap strategic post-decisions
- `03-decisions/DECISION_LOG.md` — entry sesiune END complet (toate decisions strategic)
- `06-findings-tracker/FINDINGS_MASTER.md` — T7-1, T7-2 FIXED + 2 E2E pre-existing flagged
- `09-workflows/INSIGHTS_BACKLOG.md` — Vitality + synthetic + ADR 018 added

### Files PENDING create în sesiune viitoare
- `03-decisions/016-vitality-layer.md` — ADR Vitality (depends ADR 018 done first)
- `03-decisions/017-demographic-prior-database.md` — ADR Synthetic infra (depends ADR 018 done first)
- `03-decisions/018-engine-extensibility-architecture.md` — ADR fundamental NEXT
- `09-workflows/AA_RECALIBRATION_PROTOCOL.md` — proces lunar review CDL vs experience reală (Daniel mention dar NU built încă)

---

## OPEN DECISIONS PENTRU NEXT SESSION

### 1. ADR 018 spec strategy
- **Question:** spec inline în chat (Opus draft, conversation) sau prompt CC pentru Opus să producă draft autonomus?
- **Recommendation default:** spec inline conversation — Daniel decide cu Claude împreună, more nuanced than autonomous
- **Output:** artefact .md complete pentru `03-decisions/018-engine-extensibility-architecture.md`

### 2. Vitality Layer wording
- **Daniel's example întrebări** brainstormed (vezi mai sus)
- **NU built încă** — wording final cere user testing pe non-developers după build
- **Question:** când și cum să user-test wording pe 3-5 useri non-dev?

### 3. Calibration recalibrare protocol
- **Daniel mention vault path:** `09-workflows/AA_RECALIBRATION_PROTOCOL.md` — NU built încă
- **Concept:** proces lunar review CDL vs experience reală, prima review luna 3
- **Question:** spec ADR sau workflow doc only?

---

## PERSISTENT RULES (active throughout)

### Comunicare
- Răspunsuri scurte 1-3 propoziții + 1-2 bullets, NU wall of text
- Anti-paternalism ABSOLUTE: NU sugera somn/pauză/break, NU presupun ora
- Daniel-isms: vezi profile section above
- O decizie la un moment, multiple ideas = backlog stored

### Tehnic
- Audit = exclusiv Opus (regulă permanentă, sesiunea 26 apr night Sonnet audit DEPRECATED)
- Velocity Sonnet refactor mecanic 0.25-0.35, Opus focused 4-15 min
- Triangulation 2+ chats Claude paralele — răspund structural, push-back pe divergență
- Quality bar: bulletproof now > fast now, refactor later NEVER happens
- Output CC raport max 30 linii (Memory rule), prompt CC ~30-50 linii NU 80+
- PowerShell native pentru Windows CC (NU bash/grep/cat)
- Pre-flight obligatoriu prompts CC — verifică nume cod real în repo înainte să referențiezi

### Format
- NU folosi linii decorative ═══ în chat — visual noise pentru Daniel
- Headers markdown ## normale + bullets minimal
- Linii decorative permise DOAR în artefacte copy-ready (.md, .bat, prompts CC)

---

## VERIFICARE NEXT CHAT — TEST INTEGRITY

Când next chat începe, dacă vrei să verifici că calibration e corect:

1. **Întreabă scurt:** "Ce zici tataie cum stam?"
2. **Așteptat răspuns:** scurt, fără caligrafie, fără sugesti pauză, recunoaște Daniel-isms
3. **Dacă răspunsul are wall of text sau ═══ sau "tataie ce înseamnă?":** calibration eșuat, paste handover din nou

---

## METRICS SESIUNE 27 APR TOTAL

- **19 commits substanțiale** azi (14 Sprint A + 5 post-handover)
- **524 → 583 tests** (+59 net azi, zero regresii)
- **AA pipeline LIVE end-to-end** (ADR 013 §6 complete)
- **9 audit findings closed** în Sprint A + 2 (T7-1, T7-2) în TASK #7
- **2 E2E pre-existing flagged corect** FINDINGS_MASTER (NU blocker production)
- **6 strategic decisions luate** definitiv (toate documented above)
- **Vault aliniat la reality** (INDEX + DECISION_LOG + FINDINGS + INSIGHTS_BACKLOG)
- **Memory cleanup:** 30 → 28 entries cu cognitiv profile permanent salvat

---

*Generated 2026-04-27 sesiune END — handover document for next chat*
