# PLAN COMPLET — Anti-Halucinație + Anti-Repetare Vault (SCOPE 95% LOCKED)

**Owner:** Daniel (CEO, scope LOCK V1 2026-05-11) + Claude Co-CTO execution autonomous via claude_code.
**Trigger:** Chat 2026-05-11 — Claude repetat slip-uri pe info deja decis în vault. Daniel verbatim: *"chiar ma scoate din sarite. In loc sa dam inainte ne uitam la ce e deja rezolvat si mai rezolvam o data... e de rasul curcilor"*.
**Goal:** ~95% mecanic codificabil. Restul ~5% = behavioral compliance Claude inherent + edge cases noi imprevizibile.
**Scope LOCK V1:** ALL 5 PHASES × 15 items execute integral overnight session (~13h CC autonomous).

═══════════════════════════════════════════════════════════════════

## §1 — Root-cause analiză (5 cauze identificate)

**Slip-uri concrete chat 2026-05-11 (audit verbatim):**
1. Descriere P1-FLAG-PROD-AUTO-FAZA stale ("2000 kcal hardcoded" vs Daniel: *"in prod nu mai e nimic hardcoded"*)
2. Întrebat V1 features keep/drop deja LOCKED vault (*"PĂSTRĂM existing prod transferat spec V2"*)
3. Sărit la P1 prod bug fix pe layer înlocuit Step 1 port (Port-First-Then-React LOCKED)
4. SETUP memorie stale (acasă VS Code+PowerShell vs Daniel verbatim "Claude Desktop+MCP+full autonomy")
5. §CC.3 "Continuăm?" final inutil când §NEXT priority order clar
6. Artefact CC paste-able BATCH 2 = Autonomy LOCKED V1 PERMANENT 2026-05-11 violation

**Cauze root (5 categorii):**

| # | Cauză | Impact |
|---|-------|--------|
| C1 | Vault descriptions stale (paraphrase Claude vs verbatim Daniel) | P1-FLAG-PROD-AUTO-FAZA "2000 kcal hardcoded" |
| C2 | Decision answers dispersed multi-file (DECISION_LOG + HANDOVER + JUST_DECIDED + RECENT_DECIDED_ARCHIVE) | V1 features keep/drop pattern în 4 locuri |
| C3 | Strategy LOCK V1 nu e filtru pre-decision (acoperiș-pereți) | Port-First-Then-React ignorat |
| C4 | Memorie Claude vs vault arbitraj absent | SETUP acasă stale |
| C5 | §NEXT priority order ignorat (săritură P1→P3) | "Continuăm V1 features?" când P1 era auto-faza |

═══════════════════════════════════════════════════════════════════

## §2 — Plan intervenții (5 PHASES, 15 items concrete)

### PHASE 1 — Vault structure hygiene (fix C1+C2)

**1.1 — `00-index/DECISIONS_ANSWERED.md` NEW SSOT**
Append-only Q&A flat searchable. Format strict per entry:
```
## Q: <topic-keyword>
**A (Daniel verbatim):** "<quote>"
**Source:** <path:§>
**Date:** YYYY-MM-DD
**Status:** LOCKED V1 | SUPERSEDED-BY [...]
```
Initial populate ~50-100 entries critice din DECISION_LOG + HANDOVER recent. Maintenance: fiecare decision NEW LOCKED → append automat via claude_code post-decision hook. Effort: initial ~2-3h + ongoing ~1 min/decision.

**1.2 — DIFF_FLAGS verbatim regen MANDATORY**
Fiecare P1-FLAG description re-write din verbatim Daniel quote, NU paraphrase Claude. Anti-stale slip exemple P1-FLAG-PROD-AUTO-FAZA. Format:
```
### P1-FLAG-<id>
**Daniel verbatim:** "<quote>"
**Source chat:** <YYYY-MM-DD chat-name>
**Status:** 🔴 OPEN | 🟢 RESOLVED | 🟡 PARTIAL
**Investigation needed:** <specifically what>
```
Effort: ~1-2h CC audit + regen.

**1.3 — `01-vision/VERBATIM_QUOTES.md` NEW**
Colecție Daniel quotes literal indexed by topic. Topics initial: Bugatti (end product perfect NU process zero-error), Gigel test, Port-First-Then-React, V1 features keep/drop, Auto template, "PĂSTRĂM existing prod", mockup vs prod, Autonomy LOCKED V1 PERMANENT, "deciziile pending deja am răspuns 5x". Anti-paraphrasing drift. Effort: ~2h CC extract din chat history archived.

**1.4 — CURRENT_STATE §JUST_DECIDED expandare verbatim + §CC.6 ~200 LOC preserve**
§JUST_DECIDED entries include verbatim Daniel quote + Source path explicit, NU summary Claude. §CC.6 append-only architecture LOCKED V1 2026-05-10 PRESERVE STRICT — CURRENT_STATE.md NU has voie să crească >250 LOC fără auto-cleanup via RECENT_DECIDED_ARCHIVE rolling pattern. Re-introducere 596KB inflate = REJECT. Effort: rule update VAULT_RULES + ongoing maintenance.

### PHASE 2 — Strategy-lock filter mechanism (fix C3)

**2.1 — `00-index/STRATEGY_LOCK_V1.md` NEW SSOT**
Single SSOT pentru ALL strategy LOCKED V1 active cross-cutting toate decisions. Format:
```
## <Strategy name> LOCKED V1 [YYYY-MM-DD]
**Daniel verbatim:** "<quote>"
**Source:** <path:§>
**Scope:** What layers/decisions this strategy affects
**Filter rule:** Before fix/decision on X → check if X is replaced in Step N → if yes, REJECT throwaway
**Status:** ACTIVE | SUPERSEDED
```
Initial populate: Port-First-Then-React, single-theme Clasic master, Bugatti paradigm (end product perfect), Gigel test, Autonomy LOCKED V1 PERMANENT, Theme Parity Invariant, Mockup vs prod distincție. Effort: ~1-2h CC autonomous.

**2.2 — VAULT_RULES §AR.STRATEGY_LOCK_FILTER NEW**
Anti-recurrence rule formal codificat: *"Înainte de orice fix/investigation pe layer X: load STRATEGY_LOCK_V1.md → check if X is replaced in Step N of any active strategy → if YES, REJECT fix throwaway, redirect to strategy execution."* §CC.4 citation enforcement extended — pre-action filter explicit declared. Effort: rule append.

### PHASE 3 — Anti-halucinație enforcement (fix C1+C4)

**3.1 — `00-index/HALUCINATION_LOG.md` NEW append-only**
Slip log cross-chat pattern detection. Format:
```
## YYYY-MM-DD — <chat-name>
**Topic:** <area>
**Claude claim (halucinație):** "<verbatim claim>"
**Realitate:** "<verbatim Daniel correction>"
**Source corecție:** <path:§>
**Root cause:** <C1/C2/C3/C4/C5>
**Anti-recurrence:** <specific rule applied>
```
Population initial: ~20-30 slip-uri documented din 15 chat-uri istorice. Effort: ~2h CC audit + initial populate.

**3.2 — §CC.0 PRE-FLIGHT SEARCH DECLARATION MANDATORY (VAULT_RULES extension)**
Înainte de ORICE claim factual/decision/push-back, Claude declară explicit:
```
[PRE-FLIGHT SEARCH]
Topic: <area>
Queries executed: <list>
Sources found: <citations path:§>
Gap: none | specifically <X>
Strategy-lock check: <relevant strategy or "N/A">
→ Proceeding with claim
```
ZERO claim fără PRE-FLIGHT declaration. Violation = /caveman warning. Effort: rule append + behavioral retrain.

**3.3 — Memorie Claude vs vault arbitration rule STRICT (§AR.MEMORY_VS_VAULT)**
Codified: *"Memory Claude poate fi stale (snapshot >24h). When conflict detected (Daniel says X vs memory says Y): vault SSOT PRIMAT. Re-verify via filesystem:read_text_file direct. Update memory edit post-verification. NEVER defend stale memory."* Detection trigger: Daniel correction verbatim contradicting Claude's claim → instant flag + re-verify cycle. Effort: rule append + memory edit protocol update.

### PHASE 4 — Indexing & fast-lookup (fix C2+C5)

**4.1 — `00-index/QUICK_ANSWERS.md` NEW flat index**
~50-100 most common topics + 1-line answer + source path. Flat, searchable, NO drill-down. Generation: auto-derived din DECISIONS_ANSWERED.md weekly via claude_code. §CC.2.0 startup search QUICK_ANSWERS FIRST înainte de layered read. Effort: auto-generate script + manual curate top 30 topics.

**4.2 — §CC.2.0 PRE-LAYERED-READ STEP NEW**
§CC.2 extension: înainte de layered read 4-step, Claude search QUICK_ANSWERS.md + DECISIONS_ANSWERED.md pentru top topics. Output addition §CC.3: "Quick answers loaded: <top 5 topics relevant la curent chat>." Effort: §CC.2 rule update.

**4.3 — §NEXT priority order ENFORCEMENT strict (§AR.NEXT_PRIORITY_STRICT)**
*"§NEXT priority order P1→P2→P3 strict execute. NU săritură la item interesting. Daniel signal explicit pentru deviation OR P1 blocked technical → next P. Anti-slip 2026-05-11 'Continuăm V1 features?' când P1 era auto-faza."* §CC.3 output declarație: "Next action: P1 <task> per §NEXT order. NU deviate." Effort: rule append.

### PHASE 5 — Behavioral consistency cross-surface (fix C4)

**5.1 — Sync userPreferences + memory + system prompt + VAULT_RULES**
4 surfaces aligned consistent post-Phase 1-4 LANDED. userPreferences + memory + system prompt project = DONE chat-current (Daniel a procesat updates). VAULT_RULES extensions §AR.STRATEGY_LOCK_FILTER + §AR.MEMORY_VS_VAULT + §AR.NEXT_PRIORITY_STRICT + §CC.0 PRE-FLIGHT SEARCH = pending claude_code execute next chat. Effort: VAULT_RULES update ~30 min CC.

**5.2 — Chat NEW startup behavioral declaration MANDATORY**
§CC.3 output extended cu anti-recurrence declarație 1-line: *"Anti-recurrence verified: PRE-FLIGHT SEARCH active, STRATEGY-LOCK filter loaded, NEXT priority strict, MEMORY vs VAULT arbitraj on."* Visible reminder per chat că protocoalele active. Daniel poate spot instant dacă Claude slip. Effort: §CC.3 rule update.

**5.3 — Weekly HALUCINATION_LOG review + pattern detection**
Weekly (sau end-of-major-milestone) claude_code autonomous review HALUCINATION_LOG.md + extract patterns + propose anti-recurrence rules update. Continuous improvement loop. Patterns recurente devin codified rules. Effort: weekly ~30 min CC + Daniel review propose.

═══════════════════════════════════════════════════════════════════

## §3 — Sequence execution recommended

**Critical path P0 (~4-6h CC overnight):**
1. Item 1.1 — DECISIONS_ANSWERED.md NEW + initial populate (~2-3h) — UNLOCKS fast-lookup
2. Item 2.1 — STRATEGY_LOCK_V1.md NEW + initial populate (~1-2h) — UNLOCKS strategy filter
3. Item 5.1 — VAULT_RULES extensions sync (~30 min) — UNLOCKS enforcement

**Parallel execution candidate P1 (~3-4h CC paralel):**
- Item 1.2 (DIFF_FLAGS regen) + Item 1.3 (VERBATIM_QUOTES) — disjuncte, RUN paralel
- Item 3.1 (HALUCINATION_LOG initial) + Item 4.1 (QUICK_ANSWERS) — disjuncte, RUN paralel

**Sequential post-P0+P1 (~2-3h CC):**
- Item 1.4 (CURRENT_STATE §JUST_DECIDED verbatim + §CC.6 ~200 LOC rule preserve)
- Item 2.2 (§AR.STRATEGY_LOCK_FILTER rule)
- Item 3.2 (§CC.0 PRE-FLIGHT SEARCH rule)
- Item 3.3 (§AR.MEMORY_VS_VAULT rule)
- Item 4.2 (§CC.2.0 pre-layered-read step)
- Item 4.3 (§AR.NEXT_PRIORITY_STRICT rule)
- Item 5.2 (§CC.3 behavioral declarație)
- Item 5.3 (weekly review loop setup)

**Grand total: ~9-13h CC autonomous + ~2-3h Daniel review/LOCK post-LANDED.**

═══════════════════════════════════════════════════════════════════

## §4 — Acceptance metrics

**Quantitative:**
- Slip rate per chat < 1 (vs ~6 chat-current 2026-05-11)
- Daniel "halucinezi" / "deja am răspuns" interventions per chat < 1
- Vault search hit rate (Claude finds answer pre-question) > 95%
- Strategy-lock filter rejections (acoperiș-pereți avoided) tracked count

**Qualitative:**
- Daniel verbatim "în sfârșit nu mai întrebi inutil" sau echivalent
- Cross-chat continuity zero context loss
- §NEXT priority order respected strict

═══════════════════════════════════════════════════════════════════

## §5 — Risks + mitigations

**R1: Vault bloat post-Phase 1** — 5 new SSOT files (DECISIONS_ANSWERED + VERBATIM_QUOTES + HALUCINATION_LOG + QUICK_ANSWERS + STRATEGY_LOCK_V1).
- Mitigation: §CC.6 append-only architecture preserve + truncation rules. Auto-archive >7 days entries la _archive. CURRENT_STATE.md ~200 LOC rule LOCKED V1 2026-05-10 PRESERVE STRICT — NU re-introduce 596KB inflate.

**R2: Maintenance overhead** — fiecare decision LOCKED append multiple files.
- Mitigation: claude_code autonomous via post-decision hook (post §CC.5 fast ingest auto-append DECISIONS_ANSWERED + QUICK_ANSWERS regen).

**R3: PRE-FLIGHT SEARCH declarație verbose** — slow down chat.
- Mitigation: declaration concise 3-line max. Acceptable trade-off vs halucinație cost.

**R4: VERBATIM_QUOTES extraction inaccurate** — historic chat archive incomplete.
- Mitigation: best-effort populate from available history + ongoing accumulation. NOT 100% complete pre-Beta acceptable.

═══════════════════════════════════════════════════════════════════

## §6 — Inherent limit ~95% (NU 100%)

5% rest = behavioral compliance Claude inherent + edge cases noi imprevizibile + memory edits limited 30 slots + Daniel oboseală/sloppy expression ambiguous prompts. Vault structural NU poate forța 100% — doar enforce mecanic ~95%. Restul = retraining Claude per chat + Daniel spot-check + weekly HALUCINATION_LOG pattern detection.

═══════════════════════════════════════════════════════════════════
END PLAN
═══════════════════════════════════════════════════════════════════
