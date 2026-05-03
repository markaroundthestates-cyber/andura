# DIFF FLAGS — Outstanding Issues Requiring Daniel Action

**Owner:** Daniel (CEO + Product). Used by CC Opus / Claude chat to surface pending issues.
**Updated:** 2026-05-03 (post audit total consolidat ingest)
**See also:** [[VAULT_RULES]] §HANDOVER_PROTOCOL §5 (Safety Net) | [[06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] | [[05-findings-tracker/FINDINGS_MASTER]]

---

## P1 BLOCKERS (require Daniel action before proceeding)

### P1-FLAG-1 — ADDENDUM_CHAT_STRATEGIC_RECONSIDERARI_2026-05-03.md SOURCE PENDING UPLOAD

**Status:** 🔴 OPEN (raised 2026-05-03 audit total ingest)
**Severity:** P1 BLOCKER (impedes ADR 023 implementation)

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

## P2 PENDING (decision points pending Daniel chat strategic NEW)

### P2-FLAG-1 — Decision Points D1-D6 Pending (Audit Total)

**Status:** 🟡 PENDING Daniel chat strategic NEW
**Severity:** P2 (decision-only, no fabricate)

**Issue:**
6 decision points pending Daniel chat strategic NEW per HANDOVER_AUDIT_TOTAL §4:

- **D1:** T1 "Save the week silent" — A passive intelligence / C in-app banner pasiv (NU B opt-in). Recommend A sau C.
- **D2:** §36.86b DELOCK Mechanism META-RULE — "orice prebeta LOCKED V1 are date target; 2 săpt înainte de Beta lock NU e implementabil → V1.1 cu Daniel sign-off explicit"
- **D3:** Cloud Functions Blaze plan upgrade — A €5-10/lună budget pre-Beta / B Spark plan retain accept Q11 violation explicit. Recommend A.
- **D4:** Goal Taxonomy LOCKED Final — A ADR 017 6 EN / B §26.3 5 RO sub-routing / C hybrid B onboarding + A engine internal map. Recommend C.
- **D5:** Sprint Vault Hygiene Q2 2026 — A dedicate ~6-10h Daniel + CC pre-Beta / B inline / C defer. Recommend A foundation post-launch.
- **D6:** ADR 023 cost monitoring infrastructure — A backend Cloud Functions enforcement (depends D3=A) / B frontend-only soft cap (D3=B). Recommend per D3 outcome.

**Action Daniel:**
- Open chat strategic NEW dedicat decision points D1-D6 (~5-7h Daniel chat strategic)
- Lock decisions per recommend Claude sau alternative justified
- Comandă CC Opus integration același chat strategic sau next ingest

**Cross-refs:**
- HANDOVER_GLOBAL §36.92 Audit reclasificare 4 buckets + decision points pending
- HANDOVER_AUDIT_TOTAL_2026-05-03.md §4 (archived `📤_outbox/_archive/2026-05/104+_*.md` post-ingest)

---

## RESOLVED (audit trail)

(none yet — DIFF_FLAGS.md created 2026-05-03 audit total ingest)

---

🦫 **DIFF_FLAGS.md created 2026-05-03. P1-FLAG-1 ADDENDUM source upload pending. P2-FLAG-1 D1-D6 decision points pending. Daniel action required pentru proceed cu ADR 023 implementation + audit total cleanup batches.**
