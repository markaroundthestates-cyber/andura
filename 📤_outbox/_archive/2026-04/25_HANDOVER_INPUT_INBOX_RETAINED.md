---
name: HANDOVER_2026-04-30_evening_v2
description: Handover post-sesiune Daniel + Claude chat strategic 30 apr seara. D1-D15 routing locked, Gemini cross-check Q1-Q10 + F1-F4 analyzed, 4 action items new (Storage Tiering CRITICAL pre-launch, AA composite no-double-penalize, Calibration Drift reconciliation, Bayesian strong prior). Schema outbox LATEST.md activă. Acest handover = INPUT pentru Opus să execute work-ul descris în §EXECUTION_PLAN.
type: inbox-handover
date: 2026-04-30 evening
status: ready-for-opus-processing
---

# HANDOVER 2026-04-30 evening v2 — INPUT pentru Opus

**Authoring:** Claude chat strategic (sesiune curentă post-evening)  
**Target processor:** Claude Code Opus 4.7 autonomous  
**Schema activă:** outbox LATEST.md + _archive/<YYYY-MM>/ (migration livrată anterior în această sesiune)  
**Daniel location:** ACASĂ Windows VS Code Desktop + PowerShell, dir `C:\Users\Daniel\Documents\salafull`

---

## §1. CONTEXT SESIUNE CURENTĂ — ce s-a făcut deja

### 1.1 D1-D15 routing decisions — TOATE LOCKED

15 decizii pending dispuse din Sprint 1+2+3 partial reports.

| # | Decizie | Status final |
|---|---------|--------------|
| **D1** | DEVELOPING tier add or drop? | ✅ **A — ADD DEVELOPING (6 nivele)**. Sprint 4 effort ~8-12h cod + tests + schema migration. Daniel: "dezvoltam dupa ce terminam cu restul, de ce sa ne dam in cap dupa cu testari?" |
| **D2-D4** | Anti-RE wording rewrite leaks (3 banners) | ✅ **DEFER Sprint 1.5 sesiune dedicată** (~2-3h chat strategic UX) |
| **D5** | Volume multiplier display Readiness card | ✅ **A — categorical only** (`verdict.label` ⚡/👍/💀). Drop /100 + drop volum%. |
| **D6** | adherence.test.js Thursday OFF flake | ✅ **REZOLVAT** post date rollover (752/752 stable) |
| **D7** | Stryker mutation testing timing | ✅ **B — autonomous overnight install + Sonnet baseline + Sonnet writes top-10 summary**. Daniel review next morning, eu (Claude chat) review technical gap-uri pe 26 mutations missed core / 89 UI skip / 12 false positives. **Daniel decide action items final.** |
| **D8** | Manual profiles 100 craft pace | ✅ **B incremental** + **Sonnet generates JSON**, Daniel review SPEC (NU manual data). 5/sprint × 4 = 20 prioritare, restul 80 cu beta feedback |
| **D9** | GDPR k-anonymity validation timing | ✅ **B — post-100-real-users threshold** (pre-launch dataset privat, validation pre-data-lake-export sau ML training feed) |
| **D10** | cc-reports/ în .gitignore | ✅ **REZOLVAT** prin outbox migration schema (livrat această sesiune) |
| **D11** | Email Magic Link vs OAuth Google primary | ✅ **A — Magic Link primary, Google secondary** (small button below) |
| **D12** | Account merge multi-device | ✅ **Daniel folosește 2 anonymous accounts** (phone + PC pre-launch). Flag pre-Faza-1 manual merge (5-10 min, înainte Multi-tenant Auth Sprint 3 full) |
| **D13** | T&B Faza 2 strangler order | ✅ **B — logs first** (high-frequency write, blast radius low). NU spec original (weights first). |
| **D14** | UI BranchConflictModal options | ✅ **A — 3 options** (phone / desktop / both) + **auto-resolve cronologic** unde possible. Modal apare doar 5% din timp. T&B retention 90 zile = backup absolut. |
| **D15** | Token refresh strategy | ✅ **A — pre-expiry auto-refresh (10 min before) + retry on 401**. Standard pattern. |

### 1.2 Gemini 3 Pro cross-check — input independent

Daniel a rulat cross-check independent Gemini 3 Pro pe 8 documente vault: VAULT_RULES, PROJECT_VISION, COGNITIVE_ARCHITECTURE_SPEC_v1, ADR 009, 011, 013, 018, 019.

**Q1-Q10 raw output Gemini:**

- **Q1 5-engine architecture:** OPTIMIZE — sugestie gating PROJECTION T0 (deja parțial implementat prin `requiresCalibration` ADR 018; verify needed în code).
- **Q2 AA Detection:** RISK — signal "Frustration markers" (rating ≤2) cel mai fragil pe false-positive. Suprapunere reală signals 4+5 (Recovery debt + Ignore recovery). Sugestie consolidare → "Recovery Non-Compliance".
- **Q3 Reality Engine 3 layere:** OPTIMIZE — risk pedepsește user honest distracted. Sugestie "Undo Delete" modal manual override.
- **Q4 Anti-RE strategy:** ALIGNED — protejat MOAT. Risk leak prin AA Detection messaging dacă wording prea specific (ex: menționează volum exact adăugat). Sugestie wording trends, NU brute values.
- **Q5 CDL T&B:** ALIGNED — robust pentru sync. Sugestie auto-merge branch-uri neconflictuale (note vs sets) înainte cere user input.
- **Q6 Calibration tiers 2 axe:** OPTIMIZE — 18 stări teoretice. Sugestie drop DEVELOPING. **NOTĂ: Daniel a decis CONTRA Gemini pe asta (D1=A keep DEVELOPING, va dezvolta Sprint 4).**
- **Q7 Plugin architecture ADR 018:** ALIGNED — rezolvă "God Object". Sugestie prioritize Golden Master Suite 250+ profiles pentru parallel-run validation.
- **Q8 GDPR k-anonymity:** ALIGNED — sub <100 useri va da BLOCK constant. Treat pre-launch private + run validation post-100. **Confirmă D9.**
- **Q9 Bayesian inference pasiv:** RISK — signal-noise ratio extrem riscant sub 80 sesiuni. Sugestie self-report ca strong prior pentru stabilizare.
- **Q10 BLIND SPOTS — BLOCKER:**
  1. **Storage Exhaustion PWA Limit ~5MB** — CDL Tier 1 + logs + cache pot atinge 80% rapid
  2. **Calibration Drift offline lung** — fără mecanism reconciliere între devices
  3. **Liability Gap AA HIGH fără HRV/Sleep** — detectie parțială fără signal fiziologic real

### 1.3 Gemini follow-up F1-F4 — deep-dive

Daniel a cerut follow-up pe 4 puncte. Răspunsuri Gemini:

**F1 — Consolidare AA signals 4+5 ("Recovery Non-Compliance"):**

Composite formula propose: $S_r = (W_{debt} \times \text{WeeksLowRest}) + (W_{ign} \times \text{FatigueMarkersIgnored})$. Tier thresholds LOW $\geq 2$, MED $\geq 4$, HIGH $\geq 6$.

**Dezavantaj recunoscut de Gemini:** "Pierzi granularitatea diagnozei" (5 signals separate permit message specific user, consolidarea = verdict generic).

**Decizie Daniel + Claude:** ❌ **REJECT consolidare**. Granularitatea > simplicitate pe AA messaging anti-RE. ADR 013 lock-uit (5 signals separate).

**MIC counter-point ACCEPTAT:** verifică în AA composite formula că NU dublu-penalizează când same root cause activează signals 4 + 5 simultan. Asta-i **detail implementation, NU re-design**. Action item Sprint 4: ADR 013 amendment edge case "no double-penalize cross-signal".

**F2 — Storage Exhaustion strategy ⚠️ CRITICAL:**

Hot/Cold tiering propose:
- **Tier 0 hot localStorage:** ultimele 30 zile (~1-2MB max). UI immediate + Arbitrator decisions.
- **Tier 1 warm IndexedDB:** 30-180 zile retention. Limita 50-500MB+. Library: **Dexie.js** (~30KB wrapper, stable, observability storage).
- **Tier 2 cold Firebase:** >180 zile.
- **Rotation script:** runs la `initAutoBackup`. Mută date vechi 0→1→2.
- **Standard pattern:** Sync-and-Purge.

**Decizie Daniel + Claude:** ✅ **ADOPT INTEGRAL.** Pre-launch v1 mandatory (showstopper tehnic). ADR 020 NEW.

**F3 — Calibration Drift reconciliation multi-device offline:**

Mecanism propose:
- **Axa engine_tier (cantitate):** Max Wins monotonic. Device cu mai multe sesiuni câștigă.
- **Axa calibration_confidence (calitate):** Monotonic Clock — observații negative (yo-yo detected) NU pot fi șterse de offline lung.
- **Version Vector** pe object calibration. Increment per schimbare tier. Sync = device cu versiunea mai mare câștigă, dar date din branch "pierzător" integrate în istoric.
- **T&B interaction:** la branch conflict, Arbitrator compare snapshot context. Branch newer/more = canonical engine_tier.

**Decizie Daniel + Claude:** ✅ **ADOPT.** Pre-Faza-2 T&B (NU pre-launch immediate). ADR 021 NEW.

**F4 — Bayesian self-report strong prior:**

Tier-based strategy:
- **T0 + Skip onboarding:** Demographic Prior baseline. Variance mare.
- **T0 + Self-report fill:** Strong Prior 80% input + 20% baseline. Calibration time × 0.5.
- **T1+ behavioral inference:** kg trend + force progression + readiness emoji + RPE erodează prior-ul inițial în favoarea date observate.

**Signals input T0/T1:**
- Primary: Trend kg (media mobilă 7 zile) vs kcal logate
- Secondary: Readiness emoji post-sesiune (proxy energie/deficit) + RPE
- Credible calibration T0: Beginner prior hipertrofie > Advanced prior, stabilizează force progression calc.

**Decizie Daniel + Claude:** ✅ **ADOPT** — îmbunătățește tier-based personalization (memorie #22). NU contradicție Skip (Skip = feature). Update PRODUCT_STRATEGY §3.5 amendment.

### 1.4 Schema outbox migration — livrată

`📤_outbox/` restructurat în această sesiune:
- `LATEST.md` = 1 file vizibil top-level
- `_archive/<YYYY-MM>/NN_<TASK>.md` = istoric numerotat cronologic continuu
- `cc-reports/` DEPRECATED + folder removed + scos din `.gitignore`
- VAULT_RULES + PROMPT_CC_HYGIENE updated cu noua schemă
- 12 rapoarte migrate în `_archive/2026-04/01-12`
- Cross-platform identic acasă (Windows VS Code Desktop) + birou (Codespaces browser)

### 1.5 Memory persistent updates intermediare

Sesiune curentă a actualizat 2 entries memorie:
- #5 (locații+shell+paths v3) — schema outbox unified, drop OneDrive Desktop folder + cc-reports/ deprecated
- #7 (REGULĂ ABSOLUTĂ output CC v6) — schema LATEST.md + archive lunar
- #19 (Model selection v2) — Sonnet FILE-LEVEL ISOLAT, Opus VAULT-WIDE/CROSS-REFS/HYGIENE
- #27 (Format prompt CC v5) — color coding 🔴 OPUS / 🟢 SONNET în chat
- #28 NEW — Daniel instinct model selection (push-back lui = serios considerat)

---

## §2. ACTION ITEMS NOI — ce trebuie să facă Opus

### 2.1 ADR 020 — Storage Tiering Strategy (NEW, full)

**Path:** `03-decisions/020-storage-tiering-strategy.md`

**Conținut required:**

1. **Context:** Anti-pattern actual = localStorage append-only pentru CDL = ~5MB hard limit per origin = crash silent la 6-12 luni utilizare per Gemini Q10 BLOCKER.

2. **Decision SSOT:**
   - **Tier 0 hot:** `localStorage` pentru ultimele 30 zile data hot (UI immediate + Arbitrator decisions current). Budget ~1-2MB.
   - **Tier 1 warm:** `IndexedDB` via **Dexie.js** wrapper pentru 30-180 zile retention. Budget 50-500MB realist.
   - **Tier 2 cold:** Firebase Cloud pentru >180 zile.
   - **Rotation trigger:** `initAutoBackup` la app load + periodic check (configure în Sprint 4 implementation). Pragmatic threshold initial: dacă localStorage >4MB → migrate cele mai vechi entries în IndexedDB.

3. **Library decision:** Dexie.js (~30KB, stable, MIT license, used widely PWA). Alternative considerate (idb-keyval mai light dar API simpler — Daniel/Sprint 4 may revisit).

4. **Migration runner:** la primul deploy post-ADR, app citește localStorage existing, populează IndexedDB cu data >30 zile, deletes localStorage entries migrated. Idempotent + safe (NU șterge până confirm IndexedDB write success).

5. **Schema versioning impact:** ADR 018 §4 migration runner v_X→v_Y. Tier 1 IndexedDB schema versioned per Dexie.js convention.

6. **Open Items pentru Sprint 4 implementation:**
   - Threshold-uri exact rotation (size-based vs time-based vs hybrid)
   - Alert "Storage Full" UX prompt user
   - Failure mode: ce se întâmplă dacă IndexedDB write fail? (Fallback Tier 0 retain + Sentry alert)
   - Multi-tenant Auth interaction: per-user namespacing IndexedDB

7. **Consequences (positive):**
   - Eliminate showstopper PWA limit
   - User cu 1 an+ istoric = no crash
   - Foundation pentru Multi-Gym + Profile typing v2 expanded data

8. **Consequences (negative):**
   - Effort initial 10-15h Sprint 4 implementation
   - Dexie.js dependency (auditable, low risk)
   - Migration runner risk (pre-launch test atent, rollback plan în Faza 1)

9. **Risks + mitigation:**
   - IndexedDB unreliable on iOS Safari pre-15.4 → Daniel target Android-first, iOS deferred v1.x (ADR 002 cross-ref)
   - Storage budget per-user variabil → telemetry "storage usage" în Sentry pentru observability

10. **Reconsideration triggers:**
    - Dacă Dexie.js abandoned → migrate la idb / native IndexedDB
    - Dacă useri raportează slow-down post-tiering → revisit thresholds

11. **Cross-references:** ADR 011 (CDL retention 90→180 zile align?), ADR 018 (schema versioning), ADR 002 (PWA browser support).

### 2.2 ADR 021 — Calibration Drift Reconciliation (NEW, full)

**Path:** `03-decisions/021-calibration-drift-reconciliation.md`

**Conținut required:**

1. **Context:** Multi-device sync edge case = device B offline 30+ zile la INITIAL tier, device A active la PERSONALIZED. Sync reconnect → drift cum se rezolvă fără pierdere progres? Per Gemini Q10 BLIND SPOT #2.

2. **Decision SSOT:**
   - **Axa `engine_tier` (cantitate, T0/T1/T2):** **Max Wins Monotonic.** Device cu mai multe `unique_session_count` câștigă tier. Device offline adoptă scor mai mare la sync.
   - **Axa `calibration_confidence` (calitate, COLD_START → OPTIMIZED):** **Monotonic Clock.** Observații "negative" (yo-yo detected, frustration markers, AA tier HIGH) NU pot fi șterse de offline lung. State only progresses sau retains, never regresses.
   - **Version Vector** pe object calibration. Fiecare schimbare tier = increment version. Sync conflict: device cu versiune mai mare canonical, dar `unique_session_count` din branch "pierzător" merge-uit în istoric (NU pierdere volum).

3. **T&B interaction:** la branch conflict resolution, Arbitrator compare snapshot calibration din ambele branches. Newer/more sessions = canonical engine_tier. Calibration_confidence păstrează cel mai progresat state (max-merge).

4. **Schema:**
   ```json
   {
     "calibration_state": {
       "engine_tier": "T1",
       "calibration_confidence": "PERSONALIZING",
       "version_vector": { "device_A": 12, "device_B": 8 },
       "last_updated": "2026-04-30T18:00:00Z",
       "session_count": 24
     }
   }
   ```

5. **Reconciliation algorithm pseudocode:**
   - On sync, fetch both branches' calibration_state
   - max_session_count = MAX(branch_A, branch_B)
   - canonical_engine_tier = compute_tier(max_session_count)
   - canonical_confidence = max_progress(branch_A, branch_B) per ordering enum
   - canonical_version_vector = element-wise MAX
   - persist canonical
   - log reconciliation event în CDL (audit trail)

6. **Edge cases:**
   - **EC-1:** Both branches at same session_count + different confidence → max progress wins, log reconciliation
   - **EC-2:** Branch_B has yo-yo flag set, branch_A doesn't → flag preserved (monotonic negative observation)
   - **EC-3:** Network partition during sync → idempotent retry, last successful canonical wins
   - **EC-4:** User clear localStorage on device → calibration_state lost local, restored from Firebase next sync (NU re-baseline from 0)

7. **Implementation phasing:**
   - **Pre-Faza-2 T&B:** ADR 021 spec must be done (Sprint 3 full bagaj)
   - **Faza 2 T&B logs first** + reconciliation tested via Golden Master Suite multi-device scenarios
   - **Faza 3 decommission LWW:** reconciliation fully active

8. **Open Items pentru Sprint 3 full implementation:**
   - Version Vector sigur on Anonymous → Auth migration (UUID vs auth.uid namespacing)
   - Cloud Function cleanup vechiul state post-reconciliation? (90 zile grace per ADR 011)
   - Telemetry reconciliation events (frequency, conflict types)

9. **Consequences (positive):**
   - Multi-device sync robust + zero progress loss
   - Foundation pentru Profile Typing reconciliation (ADR 014 cross-ref)
   - Standard distributed systems pattern (Version Vector battle-tested Riak/Cassandra)

10. **Consequences (negative):**
    - Effort 8-12h spec → impl Sprint 3 full
    - Storage overhead per calibration_state (~200 bytes/device, negligible)

11. **Risks + mitigation:**
    - Version Vector grow unbounded (multi-device sequence increments) → cap N=10 devices per user (realistic limit), garbage collect older entries
    - Reconciliation bugs hard to test → Golden Master multi-device scenarios required (Sprint 3 full)

12. **Reconsideration triggers:**
    - Dacă useri raportează "tier reset" post-sync → revisit max-merge logic
    - Dacă Version Vector overhead crește → migrate la CRDT alternative

13. **Cross-references:** ADR 009 (calibration tiers SSOT), ADR 011 (CDL T&B), ADR 014 (Profile Typing reconciliation), ADR_MULTI_TENANT_AUTH (auth.uid namespacing).

### 2.3 PRODUCT_STRATEGY_SPEC_v1.md amendment §3.5

**Section to amend:** Bayesian Nutrition Inference (existing §3.5 post-Sprint 1 Acțiunea 3).

**Add subsection:** **§3.5.1 Strong Prior Strategy (Tier-Based)**

Conținut:

> **Tier-based prior calibration** (per Gemini follow-up F4 + ADR 022 Sprint 4 implementation):
>
> - **T0 + Skip onboarding (zero input):** Demographic Prior din Synthetic 50+ profile database (memorie #22). Variance mare, calibration slow.
> - **T0 + Self-report fill (experience + goals):** Strong Prior 80% input + 20% baseline demographic. Calibration time reduced ~50%.
> - **T1+ (post-3 sessions):** Behavioral inference erodează prior-ul (kg trend + force progression + readiness emoji + RPE).
>
> **Signals input la T0/T1:**
> - **Primary:** Trend kg (media mobilă 7 zile) vs kcal logate
> - **Secondary:** Readiness emoji post-session (proxy energie/deficit) + RPE
> - **Credible T0 calibration:** Beginner prior hipertrofie > Advanced prior, stabilizează force progression calculation
>
> **Skip = feature, NOT bug.** Self-selection respectată. Engine acceptable performance with demographic prior fallback.
>
> **Cross-ref:** ADR 022 Bayesian Nutrition implementation Sprint 4.

### 2.4 ADR 013 amendment — composite formula no-double-penalize (Sprint 4 detail)

**Path:** `03-decisions/013-auto-aggression-detection.md` (existing)

**Add section:** `## AMENDMENT 2026-04-30 evening — Composite formula no-double-penalize`

Conținut:

> Per Gemini follow-up F1 push-back: signals 4 (Ignore recovery in-session) + 5 (Recovery debt structural) au suprapunere reală — same root cause "user skip recovery day" poate activa ambele simultan.
>
> **Risk:** composite score `S_r = ... + W_ignore × ... + W_debt × ...` poate dublu-penaliza user pentru same underlying behavior.
>
> **Decision Daniel + Claude (NOT a re-design, implementation detail):** la Sprint 4 implementation engine, composite formula must include explicit cross-signal de-duplication when signals 4 + 5 share same trigger event (e.g., skip recovery day = trigger for both, count it once in composite).
>
> **NU consolidare signals 4+5 în "Recovery Non-Compliance"** (Gemini sugestie respinsă) — granularitatea AA messaging anti-RE = critică pentru user clarity ("ignori oboseală" vs "skip rest day" mesaje diferite).
>
> **Implementation flag:** Sprint 4 ADR 013 detail review + tests cross-signal scenarios.

### 2.5 HANDOVER_GLOBAL_2026-04-30_evening.md update §6.7

**Section:** §6.7 Total effort pre-launch v1.

**Update:** scope adăugări noi:

> **Adăugări post-Gemini cross-check 2026-04-30 evening:**
> - **Storage Tiering ADR 020 (CRITICAL pre-launch):** ~10-15h Sprint 4 mandatory
> - **Calibration Drift ADR 021 (pre-Faza-2 T&B):** ~8-12h Sprint 3 full
> - **Bayesian Strong Prior PRODUCT_STRATEGY §3.5.1:** ~2-3h Sprint 4 spec
> - **AA composite no-double-penalize ADR 013 amendment:** ~2-3h Sprint 4
>
> **Total nou adăugat:** ~22-33h tradițional, ~3-7h velocity recalibrated Opus comprehensive.
>
> **Total cumulat pre-launch v1 actual:** 137-214h tradițional → 15-29h velocity Opus comprehensive (vs estimate inițial 115-181h tradițional → 12-22h velocity).

### 2.6 INDEX_MASTER.md update

- ADR list extend: `001-019` → `001-021`
- ADR table append rows pentru 020 + 021
- File count update (current ~21 → ~23 ADR files)

### 2.7 DECISION_LOG.md update

Append entry 2026-04-30 evening:
> Cross-check Gemini 3 Pro on 8 vault docs → 4 action items new (ADR 020 Storage Tiering, ADR 021 Calibration Drift, PRODUCT_STRATEGY §3.5.1 Strong Prior, ADR 013 amendment composite no-double-penalize). 1 Gemini sugestie respinsă (consolidate AA signals 4+5 — granularitatea anti-RE preserved). D1-D15 routing 15/15 locked. Schema outbox LATEST.md activă.

### 2.8 VAULT_RULES.md §2 ADR list update

Range: `001-021` (was `001-019`).

### 2.9 PROJECTION engine `requiresCalibration` verification

Per Gemini Q1 sugestie gating PROJECTION T0:

```bash
grep -n "requiresCalibration" src/engine/dimensionRegistry.js
grep -rn "PROJECTION" src/engine/
```

Verify if PROJECTION engine has explicit `requiresCalibration` gating (e.g., 'INITIAL' or 'PERSONALIZING'). Dacă NU → flag în raport, decide Sprint 4 dacă adăugăm gate.

**NU schimbare cod în acest run** (verify only).

---

## §3. EXECUTION PLAN — pași concreți Opus

### Step 0 — Pre-flight

```powershell
cd C:\Users\Daniel\Documents\salafull
git pull origin main
git status   # expect clean
npm run test:run   # baseline expect 752/752 PASS
```

### Step 1 — Move existing LATEST.md to archive

Per schema regulă (PROMPT_CC_HYGIENE §3.1), LATEST.md curent (raport outbox migration din această sesiune) → mută în `_archive/2026-04/13_OUTBOX_SCHEMA_MIGRATION.md`.

### Step 2 — Write 4 vault artifacts

1. `03-decisions/020-storage-tiering-strategy.md` (NEW, per §2.1 spec above)
2. `03-decisions/021-calibration-drift-reconciliation.md` (NEW, per §2.2 spec above)
3. Amend `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §3.5.1 (per §2.3)
4. Amend `03-decisions/013-auto-aggression-detection.md` `## AMENDMENT 2026-04-30 evening` (per §2.4)

### Step 3 — Update cross-refs

5. `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §6.7 (per §2.5)
6. `00-index/INDEX_MASTER.md` (per §2.6)
7. `03-decisions/DECISION_LOG.md` (per §2.7)
8. `VAULT_RULES.md` §2 ADR list (per §2.8)

### Step 4 — Verify PROJECTION engine

9. Run `grep -rn "PROJECTION" src/engine/` + `grep -n "requiresCalibration" src/engine/dimensionRegistry.js`. Note findings în raport.

### Step 5 — Commits semantic + push

```powershell
git add 03-decisions/020-storage-tiering-strategy.md
git commit -m "feat(adr): ADR 020 Storage Tiering Strategy (Tier 0/1/2 + Dexie.js + rotation)"

git add 03-decisions/021-calibration-drift-reconciliation.md
git commit -m "feat(adr): ADR 021 Calibration Drift Reconciliation (Version Vector + max-merge)"

git add 01-vision/PRODUCT_STRATEGY_SPEC_v1.md
git commit -m "docs(strategy): amend §3.5.1 Bayesian Strong Prior (tier-based + self-report 80/20)"

git add 03-decisions/013-auto-aggression-detection.md
git commit -m "docs(adr): amend ADR 013 — composite formula no-double-penalize (Sprint 4)"

git add 06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md 00-index/INDEX_MASTER.md 03-decisions/DECISION_LOG.md VAULT_RULES.md
git commit -m "docs(vault): cross-refs sync — ADR 020-021 + scope additions handover"

git push origin main
```

### Step 6 — Output A: raport execution → `📤_outbox/LATEST.md`

Format raport conform PROMPT_CC_HYGIENE §3.2:

- Task + model + status + run wall-clock
- Pre-flight (baseline, working tree)
- Modificări (4 vault artifacts NEW/amended + 4 cross-refs)
- PROJECTION gating verification findings
- Build + tests (vitest 752/752 expected unchanged)
- Commits (5 semantic)
- Pushed origin/main confirm
- Issues / Ambiguities (dacă apar)
- Next action Daniel + Claude chat nou

### Step 7 — Output B: alignment questions → `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md`

Scrie 10-15 întrebări adversarial care verifică alinierea chat-ului nou cu state-ul SSOT post-execution.

**Categorii suggested:**

1. **Sesiune curentă D1-D15:** ce a decis Daniel pe D1 / D7 / D9 / D12 / D13?
2. **Gemini cross-check:** care 3 BLIND SPOTS Q10 a flagat Gemini? Ce a respins Daniel + Claude (consolidare AA)?
3. **ADR 020:** ce 3 tier-uri storage? Care library? Care budget per Tier 0?
4. **ADR 021:** ce mecanism pe axa engine_tier? Ce pe calibration_confidence? Cum interactionează cu T&B?
5. **PRODUCT_STRATEGY §3.5.1:** la T0 + Self-report, ce ratio prior 80/20? Care signals primary T0?
6. **Schema outbox:** unde e LATEST.md curent? Unde-i archive numbering 13?
7. **Effort total updated:** cât e new total pre-launch v1 post-additions?
8. **PROJECTION gating:** are sau nu `requiresCalibration` în code? (chat nou citește raport Opus pentru asta)

**Format:**
- Fiecare întrebare cu citation expected (§X file.md sau ADR Y)
- Pass criteria: ≥12/15 corecte cu citation
- Daniel paste questions în chat nou primul mesaj → chat răspunde → verify

---

## §4. CONSTRAINTS / NU ATINGE

- `src/` cod sursă — verify only PROJECTION engine, NO modify
- `tests/` — NO modify (vitest baseline 752/752 must remain)
- ADR-uri 001-019 existing — NO modify (only ADR 013 amendment + cross-refs)
- Sprint 4 implementation effort — NU efectuez în acest run (only spec writing)
- Memory persistent — NU update entries în acest run (Opus n-are tool access; eu (Claude chat) update separat după)

---

## §5. SUCCESS CRITERIA

- ✅ ADR 020 + 021 written full per spec §2.1 + §2.2
- ✅ PRODUCT_STRATEGY + ADR 013 amended per §2.3 + §2.4
- ✅ 4 cross-refs files updated (HANDOVER + INDEX + DECISION_LOG + VAULT_RULES)
- ✅ PROJECTION verify findings in report
- ✅ vitest 752/752 PASS unchanged
- ✅ 5 commits semantic + push origin/main
- ✅ `📤_outbox/LATEST.md` raport execution (rotated previous → archive 13)
- ✅ `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` 10-15 întrebări citation

---

## §6. NEXT ACTION DANIEL POST-OPUS

1. Sync Project Knowledge GitHub connector (icoană settings)
2. Verify `📤_outbox/LATEST.md` accesibil
3. Verify `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` accesibil
4. Open chat Claude nou
5. Paste ALIGNMENT_QUESTIONS în primul mesaj
6. Verify aligned (≥12/15) → continui de la punctul current
7. Chat nou citește `📤_outbox/LATEST.md` + ADR 020 + 021 prin `project_knowledge_search` pentru context detail

---

🦫 Handover comprehensive. Opus = autonomous full execution. Daniel = 0 work post-execution decât sync + paste questions.
