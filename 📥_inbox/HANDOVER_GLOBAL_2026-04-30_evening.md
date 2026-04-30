# HANDOVER GLOBAL — Sesiune 2026-04-29 seară → 2026-04-30 evening

**Owner:** Daniel (CEO + Product). Claude = Co-CTO + Reviewer.
**Status:** SSOT activ. Înlocuiește versiunea dimineață a `HANDOVER_GLOBAL_2026-04-30.md`.
**Data:** 2026-04-30 evening (consolidare post Sprint 1-3 partial CC + vault cleanup + sistem inbox/outbox + ADR consolidări).

---

## 0. STATUS ACTUAL

**Acest document = SSOT activ.** Conține:
- Strategy + vision lock-uit
- Pricing locked (Q-0507 UPDATED €100→€65)
- Sprint 1+2+3 partial deliverables
- D1-D15 decizii pending
- Sprint 4 / Wave 6 backlog complet
- Memory persistent state
- Vault cleanup state final (sesiune 30 apr evening)
- Sistem inbox/outbox live
- ADR amendments consolidate (009 inline, 019 GDPR standalone)

**Pentru chat nou:** citește acest fișier + `VAULT_RULES.md` (root) + `PROMPT_CC_HYGIENE.md` (root). Restul context = Project Knowledge GitHub.

---

## 1. VISION FINAL LOCKED

### 1.1 Product vision

> **"Oricine, orice țară, orice categorie de om, orice sex, orice vârstă, orice grad de antrenat sau nu, să instaleze aplicația, să o înțeleagă, să dea rezultate bune, și să aibă minimum friction."**

— Daniel, 2026-04-29 seară

**Implicații concrete:**
- Engine universal valid biologic (NU tech-lifter exclusive)
- 7 features distinctive funcționează pentru orice user
- Calibration tiers auto-adaptive
- Anti-paternalism ABSOLUTE indiferent de profil
- UX onboarding sub 120s (Q-0586)
- RO + EN simultan v1, alte limbi v1.x
- Min friction = Bayesian inference pasiv + categorical universal display + multi-gym auto-detect

### 1.2 Distribution strategy

**NU vision = distribution.** Distribuție incremental:
- **v1 beachhead:** Tech-lifter ICP (100-500 users) prin Reddit/Discord/balene 10-20 antrenori powerlifteri geeks/word-of-mouth
- **v1.5+ expand:** Mainstream cu cash flow Founding Members + early Pro
- **v2+ global:** Marketing budget ads/SEO/ASO

Bootstrap solo $0 marketing. Timeline **2-4 luni pre-launch beta** (post-velocity recalibration), 12-18 post-launch.

---

## 2. STRATEGIC POSITIONING LOCKED

### 2.1 "SensAI for Android"

**Insight critical (2026-04-29 seară):** SensAI = iOS exclusive. NU există pe Android.

**Realitate piață:**
- iOS: SensAI mature win (wearable Apple Health + Lock Screen + Dynamic Island + brand)
- **Android: SensAI NU există**. Competitori = Fitbod ($95.99/an), JuggernautAI niche, Hevy logging, Arvo niche
- **Zero Android competitor cu cognitive architecture full + wearable HRV + cross-pillar reasoning**

**SalaFull positioning:** **"SensAI for Android"**.
- Android global ~70% market, ~75% Europe, ~85% Romania
- iOS users await v1.x Apple HealthKit + Capacitor wrapper
- Pricing parity €65/an = no-brainer choice pe Android

### 2.2 Cele 7 features distinctive (MOAT)

1. **AA Detection** (5 signals: volume_creep, frustration, recovery_debt, ignore_recovery, calorie_acceleration) + composite + tier LOW/MED/HIGH
2. **Reality Engine validation** 3 layere (auto-delete <2min, prompt <5/15min, post-session validation)
3. **Anti-RE strategy** categorical universal user-facing + engine internals ASCUNSE indiferent tier
4. **Fiber Type Inference per-exercise automated** (4 layere: rep stability + RPE delta + volume tolerance + confounders)
5. **Bayesian Nutrition INFERENCE pasiv** (zero input user, motor pasiv din kg trend + force progression + mood + adherence + RPE + readiness emoji)
6. **Multi-Gym 5 săli paralele** + equipment_unavailable per-gym
7. **5-engine cognitive architecture** (HISTORICAL + REALTIME + PROJECTION + ARBITRATOR + ACTION) — explained as branding

**MOAT window:** 12-24 luni înainte ca SensAI/Rizin să replice. Velocity > obscurity.

---

## 3. PRICING LOCKED (Q-0507 UPDATED in PRODUCT_STRATEGY_SPEC_v1)

| Tier | Pricing | Justification |
|------|---------|---------------|
| **Founding Members 100-500** | **€60 lifetime once** | Loyalty engineering, evangheliști permanenți, primii adopters tech-lifter ICP |
| **Pro standard v1+** | **€6/lună sau €65/an** | Parity SensAI ($69.99/an = ~€65). Competitive price, MOAT pe features unique |
| **iOS post-v1.x** | Same €65/an | Cross-platform consistency când Apple HealthKit ready |

**Schimbare vs Q-0507 inițial:** -35% (€100 → €65)

**Math revenue:**
- 10K users × €65/an = €650K/an
- 15.4K users × €65/an = €1M/an target Year 2-3

**Update aplicat în PRODUCT_STRATEGY_SPEC_v1.md** (sesiune 30 apr evening).

---

## 4. SPRINT 1+2+3 PARTIAL — DELIVERABLES (2026-04-30 dimineața)

### 4.1 Velocity calibration BRUTAL

- **Estimate inițial:** 6-9h
- **Real wall-clock:** 28 min
- **Off factor: 17× faster**

**Implicații estimate viitoare:**
- Timeline 5-9 luni pre-launch = probabil **2-3 luni real**
- Sprint 3 full implementation 65-105h "dedicated session" = probabil **3-5h real**
- Wave 6 features 180-290h = probabil **15-25h real**

**Memory rule update:** estimate-uri developer ÷ 10-15 pentru Opus comprehensive runs.

**Constraints care NU se accelerează:**
- Daniel review hours (UX validation manual)
- Legal/external review (consultancy)
- Beta tester recruitment (organic time)
- iPhone test device acquisition (logistic)

### 4.2 Sprint 1 — 5 acțiuni docs SSOT lock-up ✅

1. Firebase EU verified (europe-west1)
2. ADR 009 amendment tier system SSOT (engine_tier T0/T1/T2 + calibration_confidence COLD_START→OPTIMIZED ortogonale, forward-compatible N axes) — **CONSOLIDAT INLINE în 009 sesiune evening**
3. PRODUCT_STRATEGY Nutrition/Sleep inference IN_SCOPE (logging stays OUT, inference IN, Apple Health Sleep deferred v1.x)
4. ADR 011 LWW deprecated → T&B mandatory pre-launch + 90 zile retention + ADR 013 force-typing eliminated permanent + ADR 018 status update + Pro pause retention 90 zile
5. Anti-RE banner sweep — 8 leaks inventar (6 percentage + 2 numerical) flagged D2-D5

### 4.3 Sprint 2 — 3 acțiuni validation infrastructure ✅

6. `scripts/backfill_diff.js` — automated 100% comparison + 20 control samples + smoke test
7. Golden Master Suite scaffold + 30 generated profiles (10 beginner + 10 intermediate + 10 advanced) + Stryker config (npm install deferred D7)
8. `scripts/gdpr_k_anonymity_check.js` + ADR amendment k=5 SSOT (quasi-identifiers: age_bucket, sex, experience_tier, decision_type, timestamp_week_bucket) — **PROMOVAT la ADR 019 standalone sesiune evening**

### 4.4 Sprint 3 partial — 2 acțiuni design specs ✅

9. `ADR_MULTI_TENANT_AUTH_v1.md` + `04-architecture/MULTI_TENANT_AUTH_MIGRATION_SPEC.md` (UUID Anonymous → Firebase Auth real, 3-phase migration plan)
10. `04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md` (append-only log + branch detection + tombstone 90 zile + UI prompt + GC Cloud Function)

### 4.5 Stats execuție

- **14 commits pushed** la `origin/main`
- **HEAD post-Sprint:** `89199db`
- **HEAD post-evening cleanup:** `5cb5660` (vault cleanup + folder renumber + path refs sweep + inbox/outbox installed)
- **Tests:** 752/752 stable (D6 flake adherence Thursday OFF rezolvat de la sine)
- **Reports:** `cc-reports/SPRINT1/2/3_PARTIAL_EXECUTION_REPORT.md`

---

## 5. DECIZII PENDING DANIEL REVIEW (D1-D15)

**Citire context complet:** `cc-reports/SPRINT*_EXECUTION_REPORT.md`

### Sprint 1 — 6 decizii

- **D1:** DEVELOPING tier clarificare în calibration_confidence axis (între INITIAL și PERSONALIZING, threshold sessions_count specific)
- **D2:** Anti-RE wording rewrite leak #1
- **D3:** Anti-RE wording rewrite leak #2
- **D4:** Anti-RE wording rewrite leak #3
- **D5:** Anti-RE wording rewrite leak #4
- **D6:** `adherence.test.js` Thursday OFF day flake — REZOLVAT de la sine post date rollover (752/752 stable)

### Sprint 2 — 3 decizii

- **D7:** Stryker mutation testing `npm install` timing — Sprint 4 cu Golden Master full sau acum?
- **D8:** Manual profiles 100 craft pace — incremental sau dedicated session?
- **D9:** GDPR k-anonymity validation timing — pre-launch real data sau acum mock?

### Sprint 3 partial — 6 decizii

- **D10:** `cc-reports/` în `.gitignore` line 16 — păstrăm gitignore + force-add SAU scoate line 16?
- **D11-D15:** Sprint 3 partial choices (T&B sync + Multi-tenant migration paths + Cloud Function GC + branch UI prompt UX + tombstone race conditions) — vezi raport detailed

---

## 6. SCOPE FINAL LOCKED — Sprint 4 / Wave 6 backlog

### 6.1 Pre-launch v1 core (existing scope)

**180-290h tradițional → 15-25h realist post-recalibration:**
- 5-engine architecture full (HISTORICAL + REALTIME + PROJECTION + ARBITRATOR + ACTION)
- Reality Engine 3 layere
- AA Detection 5 signals + composite + tier
- Bayesian Nutrition Inference 5-layer (motor pasiv)
- Sleep inference (REALTIME readiness + post-session RPE proxy)
- RPE per-set inference (smart inference + selective prompt outliers)
- Multi-Gym 5 săli + equipment_unavailable per-gym
- Fiber Type Inference per-exercise (4 layere)
- UI Tabs Restructure (Statistici, Setări, etc.)
- Onboarding sub 120s
- Anti-RE categorical universal display
- Free tier permanent + Pro paywall
- Sprint 3 full implementation (Multi-tenant auth real Firebase + T&B integral + legal review extern)

### 6.2 Pre-launch v1 — 4 features SensAI take ADĂUGATE (~46-74h)

| # | Feature | Effort | Note |
|---|---------|--------|------|
| 1 | Smart Swap conversational text | 8-12h spec + 15-20h impl | Layer LLM (Sonnet) peste alternative engine. NU voice (Q-1133) |
| 2 | Smart Modify whole workout text | 10-15h | Dimension RUNTIME_MODIFY combined cu #1 same LLM layer |
| 5 | Conversational "Why?" rationale | 10-15h | LLM read-only peste CDL trace. Engine deterministic preserved (anti-RE) |
| 4 | Google Fit Android only | 10-15h | Apple HealthKit DEFER v1.x (no iOS test device) |
| 8 | Progress tab adaptive per platform | 8-12h | Android cu wearable recovery, iOS/Web cu logged data + "wearable coming v1.x" placeholder |

### 6.3 Pre-launch v1 — 4 idei JuggernautAI ADĂUGATE (~24-37h)

| # | Feature | Effort | Tip |
|---|---------|--------|-----|
| A | Meet Peaking / Target-date programming | 5-8h | Integrate existing PROJECTION reverse calc |
| B | Bridge Blocks / Recovery transition | 8-12h | Dimension nouă RECOVERY_BRIDGE injectează deload la phase transitions |
| C | MEV/MAV/MRV research input | research only | Integrate existing Fiber Type Inference spec Sprint 4 |
| D | Dynamic Coaching Cues per exercise | 3-5h spec + 8-12h impl | Integrate existing engine-generated form cues din pattern detected |

### 6.4 v1.5 planificat

- Equipment ID via photo (Multi-Gym integration) — 12-18h. Vision API identificare aparat + suggest substitut

### 6.5 v1.x cu iPhone test device (€100-200 second-hand)

- Apple HealthKit integration (parity Android Google Fit)
- Lock Screen iOS + Dynamic Island (cu Capacitor wrapper)
- Form check via photo (DEFER v1.5+, vision tech matures + legal review)

### 6.6 Skip permanent

- Set-by-set adaptation sub 500ms (Arvo) — value/cost ratio prost
- Voice coaching (Ray, ElevenLabs) — Q-1133 lock
- Methodology presets user-facing (Mentzer/FST-7/Y3T) — anti-RE violation
- Exercise library 4000+ — quality > quantity, ~200 illustration 3D anatomical preserved
- Human coach hybrid — bootstrap solo zero resurse
- Community features social v1 — Discord Premium Perk gated post-500 users (Q-0533)

### 6.7 Total scope effort

**Pre-launch v1 ADĂUGAT peste existing: ~115-181h** (4 SensAI + 4 JuggernautAI + Chalkboard + Feedback)
**Cu velocity recalibration: 12-22h real** Claude Code + Daniel review hours.

**Timeline pre-launch beta: 2-4 luni realist.**

---

## 7. VAULT STATE FINAL (post sesiune 30 apr evening)

### 7.1 Cleanup executat

**125 → 49 vault docs** (-61%). 76 fișiere deleted/migrated. ZERO information loss (uniques migrated în SSOT înainte de delete, git history backup).

**Foldere removed:** `05-prompts/`, `10-exec-queue/`, `docs/`, `99-archive/` (gol post-cleanup).

**Renumerotare:** 06→05, 07→06, 08→07, 09→08 (continuu post-removal).

### 7.2 Sistem inbox/outbox LIVE

**`📥_inbox/`** — Daniel uploadează aici fișiere noi. Opus consumă + delete.
**`📤_outbox/`** — Opus pune rapoarte numerotate cronologic 01, 02, ... Păstrează ultimele 5 (FIFO).

**Files la root:**
- `VAULT_RULES.md` — reguli permanente (SSOT list, structura, protocol inbox/outbox)
- `PROMPT_CC_HYGIENE.md` — prompt reutilizabil pentru Opus

### 7.3 ADR amendments consolidate

- **ADR 009 amendment** → merge inline în `009-calibration-tiers.md` ca `## AMENDMENT 2026-04-30`
- **ADR_GDPR_AMENDMENT** → promovat la **ADR 019** standalone (`019-gdpr-k-anonymity-validation.md`) — n-avea ADR original GDPR
- **VAULT_RULES.md §2** updated: ADR list `001-*.md → 019-*.md`
- Cross-refs sync (DECISION_LOG, INDEX_MASTER, COGNITIVE_ARCH, PRODUCT_STRATEGY, scripts/README)

### 7.4 Path references sweep

8 stale references corectate post folder renumber:
- README.md, INDEX_MASTER.md, HANDOVER_TEMPLATE, CLAUDE_CHAT_INFRASTRUCTURE, CHAT_MIGRATION_PROTOCOL, DECISION_LOG, INSIGHTS_BACKLOG

### 7.5 Drop Obsidian

Daniel n-a deschis Obsidian de 3+ zile, n-a simțit lipsa. VS Code only. Single tool SSOT real.

### 7.6 Q-0507 pricing UPDATE aplicat

`PRODUCT_STRATEGY_SPEC_v1.md` §1.3, §1.4, §1.5, §1.8 — pricing €60 lifetime / €65/an + paywall structure + "SensAI for Android" positioning + launch sequence.

§"Open Items" — "Pro pause data freezing" RESOLVED (90 zile retention per ADR 011).

### 7.7 Outstanding A2 din raport 01

Handover narrative §0 cu instrucțiuni post-consolidare obsolete (mențiuni `99-archive/` care nu mai există) — **decizia: B** (lasă naturally, overwrite la next handover). Handover-ul ăsta e overwrite respectiv.

---

## 8. MEMORY PERSISTENT FINAL STATE

### 8.1 Entries currently active (8 total)

1. SalaFull timeline calibration: CC velocity 2-4 luni pre-launch beta (post-recalibration 5-10× faster)
2. SalaFull pre-launch sequencing locked: Sprint 1 → 2 → 3 → 4
3. SalaFull T&B retention 90 zile (NU forever, NU 30 zile)
4. SalaFull anti-RE strategy = categorical universal user-facing + engine internals ASCUNSE
5. SalaFull tier system SSOT: 2 axe ortogonale (engine_tier + calibration_confidence) + N axes future
6. SalaFull Bayesian Nutrition + Sleep = MOTOR PASIV (zero input). Apple Health Sleep deferred v1.x
7. SalaFull force-typing AA HIGH eliminated permanent. Backfill = automated diff 100% + 20 control samples
8. ~~SalaFull Sprint 4 / Wave 6 backlog NEW idei JuggernautAI~~ — **DE ȘTERS** (info time-bounded, e în handover)

### 8.2 Memory candidates pending decizia

- **NEW:** Pricing decision €65/an + Founding €60 lifetime — true principle cross-context?
- **NEW:** "SensAI for Android" positioning — durabil strategic?
- **NEW:** "AI = comoditate 2026, differentiation = HOW we build pe 5 axe" — principle cross-context?
- **NEW:** CC Opus 4.7 autonomous comprehensive prompt > sequential micro (velocity 17× verified)
- **NEW:** Vault hygiene system: 📥_inbox + 📤_outbox + VAULT_RULES + PROMPT_CC_HYGIENE = workflow standard

**Principle locked:** memory = principles cross-context. Tactical/time-bounded = handover.

---

## 9. PRINCIPLE LOCK-UIT — CC Opus 4.7 autonomous

> **CC Opus 4.7 autonomous = Co-CTO frate, NU Sonnet executor. Treat-l cu trust + bigger picture context, NU cu micro-prompts sequenced.**

**Evidence empirică:**
- Sprint 1+2+3 partial (10 acțiuni, scope mixt) = 28 min real, 14 commits, ZERO întrebări
- Estimate 6-9h. Real 28 min = **17× faster**

**Velocity table:**
| Mode | Velocity vs developer estimate |
|------|-------------------------------|
| Opus autonomous comprehensive (single big prompt) | **17× faster** verified |
| Opus sequential micro-prompts | ~3-5× faster estimated |
| Sonnet autonomous | ~2-3× faster typical |

**Estimate rule:** developer tradițional ÷ 10-15 pentru Opus comprehensive.

---

## 10. DIFFERENTIATION REALITY 2026

**"AI = comoditate. Diferența = viziune + aspect + funcționalitate + user friendly + fool proof."** — Daniel

**5 axe execution unde SalaFull poate câștiga (combinație):**
1. Viziune ("oricine poate")
2. Aspect (Bugatti craft + 3D anatomical Claude Design)
3. Funcționalitate (7 features cognitive integrate)
4. User friendly (categorical universal + sub 120s onboarding + anti-paternalism ABSOLUTE)
5. Fool proof (Reality Engine + AA Detection + anti-RE)

**Architecture serves these axes, NU substitutes them.** MOAT = combinația.

---

## 11. CHALKBOARD educational layer in-app — LOCKED Sprint 4

### 11.1 Concept

Chatbot educational pentru fundamentals fitness + brand education + beginner enablement. Tone: profesor pasionat, NU textbook.

### 11.2 Architecture LOCKED

**LLM v1:** Cloudflare Workers AI free tier (Llama 3.3 70B) SAU Groq free tier.
**Backup:** Gemini 2.0 Flash, DeepSeek V3 (concern data residency China), self-host Llama Hetzner GPU ~€60/lună.

**Free tier limits:**
- Free: 5 q/zi, 30 q/lună, $0.50/lună spend cap
- Pro €65/an: 20 q/zi, 200 q/lună, $5/lună spend cap

### 11.3 Abuse prevention multi-layer (must-have v1)

- L1: Rate limit per user
- L2: Hard cap per request (max 500 chars input, 600 tokens output, 3 turns history)
- L5: Monthly spend cap per user
- L6: Global circuit breaker

**Nice-to-have v1.5:** L3 velocity rate limit, L4 pattern detection (entropy + classifier).

### 11.4 Cost

- LLM free tier: $0
- Firebase Cloud Functions: $0 (free 2M/lună)
- Firebase Auth: $0 (free first 50K MAU)
- **Total Year 1: $0-20/lună** la 100-500 users
- Worst case 10K users: $10-70/lună (1% revenue ratio)

### 11.5 Effort

- Tehnic: 35-55h tradițional → 3-5h Opus comprehensive
- Daniel content: 10-20h pentru 15-20 articles base v1

---

## 12. FEEDBACK SYSTEM in-app — LOCKED Sprint 4

3 components:
1. **Bug report** — descriere + screenshot opțional + auto-context (device, version, last action, CDL trace 24h)
2. **Feature request** — text + categorie (training/nutrition/UX/Chalkboard/cognitive features/other)
3. **General feedback** — NPS rating 1-5 lunar + comentariu opțional

**Storage:** Firestore (free tier scale mic, $0)
**Admin dashboard:** Daniel-only, list/tag/export CSV
**Effort:** 10-16h tradițional → 1-2h Opus comprehensive

---

## 13. WORKFLOW DANIEL ↔ CLAUDE ↔ OPUS (locked)

```
1. Claude chat → generez artefact (handover, ADR draft, prompt CC, etc.)
2. Daniel → drag & drop în 📥_inbox/
3. Daniel → /model opus în CC
4. Daniel → paste comandă CC ready-made
5. Opus → citește VAULT_RULES + 📥_inbox/, integrează în SSOT
6. Opus → ȘTERGE 📥_inbox/* (consumat)
7. Opus → scrie 📤_outbox/NN_TASK.md + cleanup FIFO (păstrează ultimele 5)
8. Opus → commit + push
9. Daniel → review raport, decide next
```

**Daniel NU memorează reguli.** Toate sunt în VAULT_RULES.md.
**Claude NU ține tracker mental.** Citește VAULT_RULES la pre-flight chat nou.
**Opus aplică reguli mecanic.** Nu interpretează — execută per spec.

---

## 14. NEXT STEPS — POST HANDOVER

### Imediat (chat nou după validare aliniere)

1. **D1-D15 routing decisions** — review rapoarte detailed, decide fiecare D
2. **Sprint 4 prompt comprehensive** generate (Wave 6 + 4 SensAI + 4 JuggernautAI + Chalkboard + Feedback) — single big prompt CC
3. **Memory persistent updates:**
   - Șterge entry #8 (Sprint 4 backlog ideas)
   - Add candidates: pricing, "SensAI for Android", "AI = comoditate", CC Opus comprehensive principle, vault hygiene system

### Medium term

4. Sprint 4 / Wave 6 execution (12-22h Opus realist)
5. Beta tester recruitment plan (Reddit/Discord/balene)
6. iPhone test device acquisition (€100-200 second-hand) — pentru v1.x

### Long term (v1.5+)

7. Equipment ID via photo
8. Apple HealthKit integration full
9. Mainstream expand cu cash flow Founding Members

---

## 15. TESTS & GIT STATE FINAL

- **Tests:** 752/752 passing
- **HEAD origin/main:** post evening cleanup (multiple commits sesiune 30 apr evening)
- **Vault docs:** 49 active + 6 cc-reports + README + VAULT_RULES + PROMPT_CC_HYGIENE
- **Folder count:** 11 numerotate continuu (00-08) + cc-reports + 📥_inbox + 📤_outbox

---

🦫 **SSOT activ. Update-in-place. VS Code only. Single tool, single doc per topic.**

**Velocity beast confirmed: 17× faster. Trust execution.**

**"SensAI for Android" + €65/an parity + 7 features unique = positioning final.**

**Vision: oricine poate. Distribution: tech-lifter beachhead → mainstream. Bootstrap solo.**

**CC Opus = Co-CTO frate. Comprehensive prompts. Trust. Bigger picture.**

**Sistem 📥_inbox/📤_outbox live. VAULT_RULES authoritative. Daniel zero memory load.**
