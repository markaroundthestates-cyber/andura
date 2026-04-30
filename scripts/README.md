# Scripts — SalaFull standalone tools

Standalone Node.js scripts pentru validation + ops. **NU integrate cu engine.** Run-once / on-demand utilities.

Toate scripturile folosesc ESM (project `"type": "module"`). Run cu `node scripts/<script>.js`.

---

## backfill_diff.js

**Purpose:** Validates synthetic CDL backfill against raw log source per ADR 011 Backfill + chat strategic 2026-04-29 lock decision #5 (automated diff 100% > 25% manual sample, detection probability bug 5% sub-64% inadequate).

**Inputs:**
- `--synthetic` JSON array of synthetic CDL entries (output of `src/util/cdlBackfill.js`, e.g., `DB.get('coach-decisions').filter(e => e.synthetic)`)
- `--raw` JSON array of raw logs (`DB.get('logs')`)
- `--output` Path where JSON report is written (auto-creates dir)
- `--samples` (optional, default 20) Number of random PASS samples surfaced ca control statistical baseline

**Usage:**

```bash
node scripts/backfill_diff.js \
  --synthetic path/to/synthetic.json \
  --raw path/to/raw.json \
  --output 📤_outbox/backfill_diff_report.json \
  --samples 20
```

**Output:**

JSON report cu:
- `summary` — totals + severity counts (CRITICAL / SEVERE / MODERATE / MINOR)
- `recommendation` — `PROCEED` / `REVIEW` / `BLOCK`
- `discrepancies` — flagged entries cu detail per severity
- `controlSamples` — N random PASS entries (cu raw logs sample) pentru Daniel manual sanity-check

**Severity mapping:**

| Severity | Trigger |
|----------|---------|
| CRITICAL | sessionType mismatch (PUSH inferred ca PULL etc.) OR orphan synthetic (no raw match) |
| SEVERE | exercises Jaccard overlap < 50% |
| MODERATE | actualSets / proposedSets diff > 20% |
| MINOR | outcome.executed not true, outcome.deviation true (synthetic should be false) |

**Recommendation logic:**

| Recommendation | Trigger |
|----------------|---------|
| PROCEED | 0 critical + 0 severe (only moderate/minor noise) |
| REVIEW | 1-3 critical OR 1-5 severe (Daniel investigates) |
| BLOCK | 4+ critical OR 6+ severe (backfill script needs fix + re-run) |

**Exit code:** 0 dacă PROCEED/REVIEW, 1 dacă BLOCK (CI-friendly).

**Notes:**
- Heuristic muscle classification inline (keyword-based). NU canonical — canonical e `src/util/cdlBackfill.js`. Standalone tool intentionally avoids engine coupling.
- Backfill validation real va rula când Daniel are date pre-launch sample suficient (>30 sesiuni real diverse).
- Pre-launch GATE B per ADR 011 §Backfill validation gate.

---

## gdpr_k_anonymity_check.js

**Purpose:** Validates k-anonymity (k=5 minim per [[019-gdpr-k-anonymity-validation]]) for arbitration_log anonymized dataset. Pre-publication / pre-data-lake / pre-ML-training validation.

**Quasi-identifiers (5 fields per ADR 019 SSOT):**
- `age_bucket` (5-year buckets: 18-22, 23-27, ..., 58-62, 65+)
- `sex` (M / F / X)
- `experience_tier` (beginner / intermediate / advanced)
- `decision_type` (DELOAD / AA_HIGH / REST_DAY / etc.)
- `timestamp_week` (ISO YYYY-Www)

**Inputs:**
- `--dataset` JSON array of anonymized arbitration_log entries
- `--k` Minimum group size (default 5 per SSOT)
- `--output` Path where JSON report is written

**Usage:**

```bash
node scripts/gdpr_k_anonymity_check.js \
  --dataset path/to/arbitration_log.json \
  --k 5 \
  --output 📤_outbox/gdpr_k_anonymity_report.json
```

**Output:**

JSON report cu:
- `summary` — totalEntries, totalCombinations, passCombinations, failCombinations, kThreshold, min/max group sizes
- `recommendation` — `PROCEED` (all combinations ≥ k) sau `BLOCK` (any combination < k)
- `atRiskCombinations` — flagged combinations cu count + percentage + suggestedMitigation per combination + sampleIds
- `mitigationGuidance` — general suggestions (generalize age, drop timestamp granularity, bucket decision_type)

**Exit code:** 0 PROCEED, 1 BLOCK (CI-friendly).

**Workflow pre-publication:** run validation → if BLOCK, apply mitigation (generalize age 5y→10y / drop week granularity / bucket decision_type into broad categories) → re-run → iterate până PROCEED → document mitigation aplicat în publication metadata.

**Cross-ref:** [[019-gdpr-k-anonymity-validation]] + AUDIT_5000Q Q-0049/Q-0570/Q-1100.
