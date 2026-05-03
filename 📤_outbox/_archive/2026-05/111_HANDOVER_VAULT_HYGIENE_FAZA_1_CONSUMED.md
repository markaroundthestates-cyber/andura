═══════════════════════════════════════════════════════════════════
HANDOVER — CLAUDE CHAT STRATEGIC → NEW CHAT
DATE: 2026-05-03
SESIUNE: Vault Hygiene Sprint Faza 1 + decizii strategice
BANDWIDTH la handover-time: ~18% remaining (handover preventiv anti-saturation)
═══════════════════════════════════════════════════════════════════

## §0 — CONTEXT IMEDIAT

Sesiune Claude chat strategic post-merge audit total consolidat (12/12 PASS alignment questions). Daniel revelație core principle "Andura gândește pentru user" → ADR 024 candidate. Decizie D3 LOCKED B (Spark retain, free LLM). Vault Hygiene Sprint declanșat Priority 0 — Faza 1 audit structural CC Opus complete (LATEST.md citit acest chat). Faza 2 Daniel validare → delegated Co-CTO 100% per Daniel directive "decide tu, e pentru tine". Faza 3 + 4 pending chat NEW execution.

═══════════════════════════════════════════════════════════════════

## §1 — DECIZII LOCKED ACEST CHAT (running log consolidate)

### D3 LOCKED = B Spark retain (Cloud Functions Blaze upgrade RESPINS)

**Rationale:** Calculul real volum LLM SalaFull = 50 useri × 4 sesiuni × 2 LLM calls = 57 calls/zi = 0.4% Groq free tier (14,400/zi). Cost cap €10/lună paranoia, NU nevoie reală. Bootstrap-aware Bugatti = scale când e problemă reală, NU ipotetică.

**Implicații:**
- D6 = frontend-only soft cap (depinde D3=B)
- ADR 023 §cost monitoring = frontend telemetry acceptabil
- Q11 latency = accept violation pre-Beta explicit, reconsider post-100 useri reali
- **Reconsideration triggers:** revenue confirmed OR Groq deprecation OR demand spike >5% free tier

**Cross-ref:** ADR 023 §2 Reconsideration Trigger #2 update.

### ADR 024 CANDIDATE — "Andura Gândește pentru User" / Graceful Degradation Universal

**Origin story (preserve verbatim în ADR Context):** Excel "câte kg la leg press" 13 zile → app coach AI fitness Bugatti paradigm. Revelația retroactivă a principiului fondator articulat: "Andura gândește pentru user. User poate ignora orice feature. Andura tot funcționează cu acceptable quality."

**Decision (proposed wording LOCKED V1):**
> "Aplicabilitate: ALL features V1 + V1.5 + V2+ permanent.
> Mecanism: graceful degradation mandatory + skippable everything + engine-pre-fills-default + user-override-optional.
> Filtru pre-feature LOCK: 'Dacă user ignoră complet feature, app-ul tot funcționează rezonabil?' DA → eligible LOCKED. NU → REJECTED indiferent tech sophistication."

**Status:** Candidate pending ADR file creation Faza 3. ADR number = **025** (additive, NU renumber).

**Cross-ref retroactiv (deciziile bune existente articulate retroactiv):**
- B4 RPE Verbal skip → engine assume "Potrivit" default
- B2 T&B Faza 1+2 skip prompt → engine continuă cu generic progression
- ADR 023 Pain text skip → engine assume zero pain
- ADR 023 Equipment text skip → engine assume bodyweight default
- T0 Onboarding skip → demographic prior din synthetic
- T1+ Profile Typing skip → engine acceptable from age/sex/kg

### ADR Numbering Additive LOCKED

**ADR 022 ORPHAN split (per ORPHAN-1 finding):**
- **ADR 022 = Bayesian Nutrition Inference** (creează file fizic)
- **ADR 024 = Goal-Driven Program Templates** (NEW, next available — ADR 023 LLM Intent ocupat)
- **ADR 025 = Andura Gândește pentru User / Graceful Degradation Universal** (candidate)

**ADR 023 LLM Intent existent NU renumber.** Additive curat zero collision.

### Vault Hygiene Sprint = Priority 0 (promoted din Bucket 2)

Promovat înaintea pre-Beta blockers + Auth Flow §36.80 — fragmentări SSOT (Goal 5, Onboarding 5, Pricing 4, Mode Detection 3, RPE/RIR 3) + 4 ADR drift + 22 orphan wikilinks + DECISION_LOG UTF-8 broken + INDEX_MASTER stale 3 zile + HANDOVER_GLOBAL 5443 LOC mega-fișier blochează decizii downstream calitate.

**Rationale:** Daniel nu citește vault. Vault e pentru Claude chat + CC Opus. Drift cumulativ → halucinare risc + indexare cost + inconsistențe răspuns chat-uri viitoare. ZERO cod până vault clean.

### 5 recomandări audit Faza 1 + 3 adiționale = APROBATE toate Co-CTO

**Per Daniel directive "decide tu, e pentru tine":**

| ID | Recomandare | Decizie |
|----|-------------|---------|
| A | HANDOVER_GLOBAL split = Option C (Active 30 zile + Archive cronologic per lună) | ✅ APROBAT |
| B | Goal Taxonomy + Onboarding SSOT consolidare = hybrid C deja LOCKED D4 (ONBOARDING_SSOT_V1.md exhaustiv) | ✅ APROBAT execute Faza 3 fără chat strategic extra |
| C | INDEX_MASTER refresh complete (stats 62+ files, pricing €39/€59/€79, ADR 023 + 8 drafts + 022/024/025 stubs add) | ✅ APROBAT mecanic CC |
| D | Archive policy = PĂSTREAZĂ audit pass 1-9 raw + sessions istorice ca audit trail permanent (NU consolidate, NU delete) | ✅ APROBAT |
| E | Folder restructuring = NU change (00-08 + inbox/outbox solid) | ✅ APROBAT zero change |
| F | Orphans cleanup 22 wikilinks MISSING + 3 UNREFERENCED. 19 LOW = delete refs. 4 MEDIUM = EXEC_QUEUE rename → INSIGHTS_BACKLOG | ✅ APROBAT mecanic |
| G | ADR 022 split fizic per "ADR Numbering Additive" rule above | ✅ APROBAT |
| H | DECISION_LOG.md UTF-8 re-save (chars `â€™`, `Ã¢`, `Â§` proliferate) | ✅ APROBAT mecanic ~30min CC |

### Faza 4 VAULT_HYGIENE_PASS = LOCK ca rule

**Decizie:** Extension comenzii standard "Ingest handover from inbox" cu STEP 10-15 vault hygiene mandatory automat. NU optional, NU prompt separat, parte din ingest flow.

**Spec (per audit §8):**
1. Detect new SSOT fragmentation (>1 file pe same topic introdus în această sesiune)
2. Detect new orphans (referințe noi la files absent SAU drift cu existing)
3. Detect ADR drift (new amendments fără INDEX_MASTER status update)
4. Detect HANDOVER size threshold (LOC > N → flag pentru split)
5. Auto-fix mecanic (cross-refs reciproce, INDEX_MASTER append, archive stale)
6. Flag DIFF_FLAGS dacă consolidare manuală necesară (Daniel prompt next chat)

**Effort run:** ~10-15min CC autonomous per ingest. **Codification:** VAULT_RULES.md root §VAULT_HYGIENE_PASS NEW + PROMPT_CC_INGEST_HANDOVER.md update.

### System Prompt Claude Chat Andura LOCKED V1

Generat artefact `SYSTEM_PROMPT_CLAUDE_CHAT_ANDURA.md` (post-fix vault structure + repo rebrand andura.app + ADR count 23 core + 8 drafts + Daniel-isms complete + vault hygiene rule mention + context state snapshot 85 LOCKED V1). Daniel folosește pentru chat NEW system prompt. **Cross-ref:** archived în vault `08-workflows/CLAUDE_CHAT_INFRASTRUCTURE.md` la oportunitate.

═══════════════════════════════════════════════════════════════════

## §2 — STATUS VAULT HYGIENE SPRINT

| Faza | Status | Output |
|------|--------|--------|
| **Faza 1 Audit Structural** | ✅ COMPLETE | `📤_outbox/_archive/2026-05/110_VAULT_AUDIT_INVENTORY.md` (~600 LOC §1-§9) + LATEST.md raport |
| **Faza 2 Daniel Validare** | ✅ COMPLETE (delegated Co-CTO 100%) | Toate 5 recomandări + 3 adiționale APROBATE acest handover §1 |
| **Faza 3 Execution Cleanup** | ⏳ PENDING chat NEW | Estimate ~2-3h CC autonomous (Opus factor 7-9x) |
| **Faza 4 Maintenance Protocol LOCK** | ⏳ PENDING chat NEW | VAULT_HYGIENE_PASS rule codification ~30min CC |

═══════════════════════════════════════════════════════════════════

## §3 — STATUS PRE-BETA BLOCKERS (unchanged acest chat)

**4 CRITICAL (post-Vault Hygiene execution):**
1. B4 RPE Verbal UI (1-2h Opus actual)
2. B2 T&B Faza 1+2 (2-3h Opus actual) — UNBLOCKS DEAD-1 ADR 021 Faza 2
3. B3 Founding Cap atomic Firebase (30-45min)
4. N1+N5-NEW AUDIT_30_9 cleanup + dataRegistry (~30-45min)

**12 HIGH cleanup batch** (post-Vault Hygiene): T1 strategic + ADR 023 implementation + OBSERVABILITY-1 Sentry + CONTRADICTION-1 + ORPHAN-1 + R1-NEW + N2 Privacy + DEAD-1 + Q11-INFRA RESOLVED D3=B + DRIFT-1 + DH2 + Observation Mode Beta.

**Auth Flow §36.80** = Priority 1 ABSOLUT separat preserved.

**Top 6 ideation pre-Beta** (post Vault Hygiene + 4 CRITICAL):
- IMP-1 Volume Floor Guarantee + IMP-3 Synthetic Demographic Prior + NEW-IDEATION-1 Expert Validator + FM-2 Mobility/Warm-up + FM-8 Pre-Injury Recovery + IMP-4 Spec→Cod Tracking Matrix

═══════════════════════════════════════════════════════════════════

## §4 — FILES ATAȘATE LA CHAT NEW

Daniel atașează la primul mesaj chat NEW:

1. **Acest handover** (drag în 📥_inbox/)
2. **`📤_outbox/LATEST.md`** Faza 1 audit raport — paste în chat pentru context
3. **System prompt** generat acest chat (`SYSTEM_PROMPT_CLAUDE_CHAT_ANDURA.md`) ca system prompt fresh chat NEW

**NU atașează:**
- Raw audit pass 1-9 (deja archived 📤_outbox/_archive/2026-05/, findings extrase în vault SSOT)
- ALIGNMENT_QUESTIONS_CHAT_NEW.md (pass 12/12 = post-merge state, integrat)
- Inventory detaliat 110_VAULT_AUDIT_INVENTORY.md (CC Opus citește singur la Faza 3)

═══════════════════════════════════════════════════════════════════

## §5 — COMANDĂ CHAT NEW

Daniel primul mesaj chat NEW:

```
Acasă (sau Birou). Continuăm Vault Hygiene Sprint Faza 3 execution + Faza 4 LOCK conform handover atașat. Toate decizii Faza 2 APROBATE Co-CTO. Generează prompt CC Opus Faza 3 cleanup mecanic + Faza 4 codification rule.
```

**Apoi mesaj separat OBLIGATORIU:**

```
Ingest handover from inbox per VAULT_RULES §HANDOVER_PROTOCOL
```

CC Opus citește singur regulile + execută merge SSOT + archive + alignment questions + vault hygiene pass.

═══════════════════════════════════════════════════════════════════

## §6 — NEXT ACTIONS PRIORITY ORDER (post-handover ingest)

1. **Faza 3 Execution Cleanup** (CC Opus autonomous ~2-3h):
   - Recomandare A: HANDOVER_GLOBAL split Option C
   - Recomandare B: Onboarding SSOT V1 + Goal Taxonomy hybrid C consolidate
   - Recomandare C: INDEX_MASTER refresh complete + ADR 022/024/025 stubs add
   - Recomandare F: 22 orphan wikilinks cleanup + EXEC_QUEUE rename → INSIGHTS_BACKLOG
   - Recomandare G: ADR 022 + ADR 024 + ADR 025 file creation per ADR Numbering Additive
   - Recomandare H: DECISION_LOG.md UTF-8 re-save
   - 3 anomalies outbox cleanup (SPRINT_4X_FINAL_REPORT archive + HANDOVER_INPUT unnumbered + DIFF_FLAGS root location)

2. **Faza 4 LOCK** (CC ~30min):
   - VAULT_RULES.md §VAULT_HYGIENE_PASS NEW codification
   - PROMPT_CC_INGEST_HANDOVER.md update cu STEP 10-15

3. **Auth Flow §36.80 Priority 1 ABSOLUT** (chat strategic ~1-2h Daniel + ~30-45min CC autonomous)

4. **4 CRITICAL pre-Beta blockers** (CC autonomous batches per §BATCH_PROTOCOL)

5. **12 HIGH cleanup batch + Top 6 ideation pre-Beta** (CC autonomous post-CRITICAL)

═══════════════════════════════════════════════════════════════════

## §7 — STATUS V1

- 85 decizii LOCKED V1 cumulative + **2 NEW acest chat** (D3 LOCKED B + ADR 025 Andura Gândește candidate) = **87 cumulative pending Faza 3 codification**
- 23 ADRs core + 8 ADR drafts + ADR 022/024/025 PENDING file creation Faza 3
- Andura V1 prod LIVE andura.app ✅
- 1203/1203 PASS tests local (unchanged)
- §36.80 BUG 2 Auth Flow NOT WIRED = blocking Beta (Priority 1 ABSOLUT post-Vault Hygiene)
- Soft Launch 1 ianuarie 2027 = aspirational (timing flexible per §36.83)

═══════════════════════════════════════════════════════════════════

## §8 — DIFF_FLAGS UPDATE NECESAR (Faza 3)

**P1-FLAG-1 ADDENDUM source upload:** `ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md` reconfirmare — uploadat acest chat în context window DAR conține wording superseded de deciziile chat (D3=B nou vs A vechi + ADR 024/025 candidate). NU drag în 📥_inbox/ unmodified — Faza 3 CC integrează direct cele 6 LOCKED V1 (§36.86-§36.91 deja done) + ADR 023 sub-secțiuni A-M din addendum + cele 2 update-uri (D3=B + ADR 025 candidate). RESOLVED post-Faza 3.

**P2-FLAG-1 D1-D6 decision points:** D3=B LOCKED acest chat. Restul D1/D2/D4/D5/D6 status:
- D1 Save the week silent: pending strategic dedicat post-Vault Hygiene
- D2 §36.86b DELOCK Mechanism: ACCEPT propunere wording verbatim (Co-CTO decide aliniat T3)
- D4 Goal Taxonomy hybrid C: deja LOCKED, execute Faza 3
- D5 Sprint Vault Hygiene Q2 2026: superseded — Vault Hygiene Sprint Priority 0 acum, NU Q2
- D6 ADR 023 cost monitoring: frontend-only soft cap (depends D3=B)

═══════════════════════════════════════════════════════════════════
🦫 HANDOVER COMPLETE. Bandwidth ~18% remaining la handover-time. Chat NEW continuă fresh Faza 3 + 4 + Auth Flow Priority 1 ABSOLUT + 4 CRITICAL pre-Beta blockers.
═══════════════════════════════════════════════════════════════════
