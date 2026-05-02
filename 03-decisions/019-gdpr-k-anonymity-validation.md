# 019. GDPR K-Anonymity Validation for Anonymized arbitration_log

**Status:** Accepted (formalized 2026-04-30 Sprint 2 autonomous post chat strategic 2026-04-29 lock decision)
**Date:** 2026-04-30
**See also:** [[DECISION_LOG]] | [[COGNITIVE_ARCHITECTURE_SPEC_v1]] §Q14 + §Q6 | [[011-coach-decision-log-architecture]]
**Cross-ref audit:** AUDIT_5000Q Q-0049 + Q-0570 + Q-1100 (re-identification risk în arbitration_log anonymized)
**Note:** Promoted 2026-04-30 from standalone `ADR_GDPR_AMENDMENT_K_ANONYMITY_v1.md` → full ADR 019 per VAULT_RULES §3.1 (no pre-existing GDPR ADR to merge into).

---

## Context

Cognitive Architecture Spec v1 §Q14 lock-uiește GDPR pattern "Anonymize NU delete" pentru `arbitration_log`:

> "Anonymize NU delete (GDPR) — păstrăm math/confidence pentru research, UUID → DELETED_USER, age + decision + math preserved"

§Q6 — Telemetry retention permanent în Cold Storage Data Lake pentru viitor ML v2.x.

**Risc identificat de AUDIT_5000Q:**

- **Q-0049:** combination `(age, decision_type, timestamp)` poate identifica user unique chiar dacă UUID a fost înlocuit cu DELETED_USER
- **Q-0570:** small dataset (sub 100 users early launch) → group sizes mici naturali → re-identification trivial pentru Daniel/Mark/Iuli sau alte profile distinctive
- **Q-1100:** combination cu `decision_type` granular (e.g., `STAGNATION_WEEK_8` rare event) reduce significant group size → user singled out

Fără validation formală, "anonymized" e nume incorect — dataset rămâne re-identifiable prin **quasi-identifiers combination**, NU prin UUID direct.

---

## Decision

Pre-launch + permanent post-launch: **k-anonymity validation cu k=5 minim** obligatorie pentru orice export `arbitration_log` anonymized destinat:
1. Data Lake research storage (per §Q6 cold storage)
2. ML training data viitor (post 50,000 sessions threshold per PRODUCT_STRATEGY §10.4)
3. Aggregate stats partajate (Plausible analytics, community channel exposure, blog posts publice)
4. Third-party audits / legal compliance check

**Validation tool:** `scripts/gdpr_k_anonymity_check.js` standalone Node.js script (livrat Sprint 2 Acțiunea 8).

### Quasi-identifiers SSOT (5 fields)

| Field | Definition | Bucket |
|-------|------------|--------|
| `age_bucket` | User age grouped în 5-year buckets | `<18`, `18-22`, `23-27`, ..., `58-62`, `65+`, `unknown` |
| `sex` | User self-reported | `M` / `F` / `X` / `unknown` |
| `experience_tier` | Onboarding self-report (per ADR 014) | `beginner` / `intermediate` / `advanced` / `unknown` |
| `decision_type` | Arbitrator decision rule fired | `DELOAD` / `REST_DAY` / `AA_HIGH` / `CUT_CONSERVATIVE` / etc. |
| `timestamp_week` | ISO 8601 year-week | `YYYY-Www` |

**Rationale picks:**
- **5-year age** = balance między granularity util ML și anonymization. 1-year = too granular (identifies). 10-year = too coarse (hides patterns).
- **Sex** = required pentru recovery curve calibration, can't drop. M/F sufficient majoritate; X for non-binary self-report (preserves dignity NU re-identifies).
- **Experience tier** = signal-rich for ML, 3 buckets only.
- **Decision type** = primary research signal — can't drop, but bucket if needed (mitigation guide).
- **Timestamp week** = ISO standard, 52 buckets/year. Mitigation: drop to month/quarter dacă week granularity produce small groups.

### k=5 rationale

| k value | Trade-off |
|---------|-----------|
| k=2 | Industry minim — too lax for sensitive health data |
| k=3 | Some industries (medical research) — borderline |
| **k=5** | **Lock SSOT** — accepted threshold pentru health data + permite ML utility while protecting users |
| k=10 | Strict — used in adversarial environments (criminal records). Overkill SalaFull. |

k=5 = **EU GDPR Working Party recommendation** pentru pseudonymized health data + practice common în research consortia (UK Biobank, etc.).

### Workflow pre-launch

```
1. Collect arbitration_log dataset (anonymized: UUID → DELETED_USER)
2. Run validation:
   node scripts/gdpr_k_anonymity_check.js \
     --dataset path/to/arbitration_log.json \
     --k 5 \
     --output 📤_outbox/gdpr_k_anonymity_report.json
3. Inspect output:
   - Recommendation = PROCEED → publish/store dataset OK
   - Recommendation = BLOCK → apply mitigation:
     a. Generalize age_bucket: 5-year → 10-year ranges
     b. Drop timestamp_week granularity → timestamp_month or timestamp_quarter
     c. Bucket decision_type: SAFETY/OPTIMIZATION/PREFERENCE (3 broad categories) instead of fine-grained rule IDs
     d. Drop quasi-identifier (last resort)
4. Re-run validation post-mitigation
5. Iterate until PROCEED
6. Document mitigation applied în publication metadata
```

### Workflow post-launch (recurring)

- **Monthly:** automated validation pe latest dataset publication batch (Cloud Function cron)
- **Pre-share (research / blog post / public community channel):** manual run → Daniel sign-off în EXEC_RESULTS.md
- **ML training data prep:** mandatory pe full export pre-feed la training pipeline

**§AMENDMENT 2026-05-02 (§36.59 LOCKED V1):** Toate referințele "Discord" înlocuite cu formulare channel-agnostic ("community channel exposure" / "public community channel" / "community engagement platform"). Rationale: ADR long-lived resilient, NU committezi la canal specific când marketing channel mix DEFERRED post-launch V1 (cross-ref §36.60). GDPR data exposure logic identică indiferent platformă (user data shared în public community = same risk profile).

---

## Consequences

### Positive

- **Re-identification risk explicit measured** + mitigated. NU "trust me bro anonymization".
- **GDPR Article 32 compliance** (technical measures pseudonymization).
- **Audit trail** — orice export are companion JSON report cu validation result.
- **EU AI Act 2025+ futureproof** — high-risk AI systems require data quality + privacy validation.
- **Standalone tool** — zero engine coupling, run-once / on-demand.

### Negative

- **Small dataset early launch (<100 users)** → likely BLOCK output frecvent. Mitigation aggressive needed (age bucket → 10y, drop week granularity).
- **Decision_type granularity tradeoff** — bucket-uind în 3 categorii pierde signal pentru research, dar necessary la dataset mic.
- **Validation overhead** — pre-publication step. Acceptable pentru sensitivity health data.

### Risks

- **Mitigation aggression infinite loop** — dacă dataset e too small pentru orice combination quasi-id, validation blochează indefinit. Mitigation: drop dataset publication (don't publish small-N datasets, wait until N grows).
- **Quasi-id list incomplete** — additional quasi-ids may emerge (geographic location, gym membership, time-of-day patterns). Reconsideration trigger.
- **Daniel personal profile pre-launch** — Daniel = 1 user în beta, his arbitration_log singular. Cannot anonymize practical pre-100-users-real. Mitigation: treat pre-launch dataset as private, NU publish anywhere. Validation runs only post-100-real-users threshold.

---

## Reconsideration Triggers

1. **Quasi-identifier discovery** — if user research surfaces additional re-identification vectors (e.g., specific exercise combinations rare = identifying), add la quasi-id list.
2. **k threshold pressure** — if research consortium / regulator requires k=10+, raise threshold + add stricter mitigation.
3. **Geographic dimension** — if SalaFull adds geo-targeting (gym recommendation, regional language), geo becomes quasi-id.
4. **Re-identification proven by 3rd party** — orice incident demonstrates re-id with current quasi-id list = immediate review + likely add new quasi-ids.

---

## Cross-references

- AUDIT_5000Q Q-0049 / Q-0570 / Q-1100
- COGNITIVE_ARCHITECTURE_SPEC_v1 §Q14 (GDPR Anonymize NU delete) + §Q6 (Telemetry Retention)
- PRODUCT_STRATEGY_SPEC_v1 §5.10 (GDPR compliant) + §10.4 (ML threshold 50k sessions)
- ADR 011 §Firebase sync amendment (90 zile tombstone retention — aligned cu Cloud Storage cleanup)
- `scripts/gdpr_k_anonymity_check.js` — implementation tool

---

*Authored 2026-04-30 Sprint 2 autonomous run Opus 4.7. Sign-off implicit via handover lock 2026-04-29 chat strategic Daniel + Claude Opus. Promoted from standalone amendment to full ADR 019 on 2026-04-30 per VAULT_RULES §3.1.*
