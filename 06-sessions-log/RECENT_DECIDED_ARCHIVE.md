# RECENT_DECIDED ARCHIVE — Rolling §JUST_DECIDED Compaction

**Status:** ACTIVE rolling archive (single-purpose append-only — §JUST_DECIDED entries >7 days truncated periodic per §CC.6)
**Authority:** META (vault meta-tooling, NU product/architecture)
**First-source:** `00-index/CURRENT_STATE.md` §JUST_DECIDED (live SSOT — entries migrate here cronologic descending când >7 days from latest chat-NEW)
**Date created:** 2026-05-07 (Run 2 vault cleanup Task 6 — periodic compaction NEW pattern, scaffold only — no entries migrated yet, all current §JUST_DECIDED entries within 7-day rolling window)
**Pattern rationale:** HANDOVER_GLOBAL_2026-04-30_evening.md = INDEX file post-split (~50 LOC navigation purpose) — preserved integrity. Single-purpose dedicated file pentru rolling archive §JUST_DECIDED preserves PK indexing clarity (NU contaminate top SSOT inbound 91 with append content).

**Truncation policy (per VAULT_RULES §CC.6 + §CC.9 NEW Task 7):**
- §JUST_DECIDED last 7 days (rolling) preserved în CURRENT_STATE
- Entries >7 days from latest chat-NEW move aici append-only descending chronologic
- Truncation triggered manual periodic OR automatic post-handover ingest dacă §JUST_DECIDED LOC >1000 (audit baseline 1128 LOC pre-cleanup)

**Cross-refs:**
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED (live SSOT, source of truncation)
- [[../03-decisions/DECISION_LOG]] (master log full chronologic descending — distinct from this rolling archive: DECISION_LOG = formal LOCKED V1 records permanent; RECENT_DECIDED_ARCHIVE = §JUST_DECIDED narrative aged out >7 days)
- [[../00-index/INDEX_MASTER]] §POINTERS (deep history drill-down hub)
- [[../VAULT_RULES]] §CC.6 CURRENT_STATE.md Append-Only Architecture + §CC.9 (Task 7 NEW) Mandatory File Updates Per Handover

---

## Migrated entries (descending chronologic from CURRENT_STATE §JUST_DECIDED, cutoff < 2026-04-30)

*(none yet — first periodic compaction 2026-05-07 found ZERO pre-cutoff entries; all §JUST_DECIDED entries 2026-05-04 to 2026-05-07 within 7-day window. File scaffolded for future periodic compaction când entries age out >7 days.)*
