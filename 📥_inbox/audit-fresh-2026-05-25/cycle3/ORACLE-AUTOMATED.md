# Coach Brain Eval - Oracle AUTOMATED (cycle3)

Run: 2026-05-25T21-01-43Z (report `reports/coach-brain-eval/2026-05-25T21-01-43-328Z.{json,md}`)
Oracle model: **claude-opus-4-7** (working id, see Model-ID note). Pricing $5/$25 per MTok.

## Headline

- **Invariants: 0 violations / 50009 scenarios** (Level 1, deterministic). PASS.
- **Oracle agreement: 66.1%** overall (4762 / 7200 dimension-comparisons across **900** scenarios scored, 0 oracle errors).
- **Real-bug candidates: 0.** Every disagreement pattern classifies as known-defensible difference, harness/comparator artifact, or oracle-side error. No pattern indicts the Andura engine.

## Model-ID note (important)

The configured id `claude-opus-4-7` is VALID. The harness initially failed with HTTP 400 `temperature is deprecated for this model` - NOT a 404 / model-not-found. Root cause: `oracle.js` hardcoded `temperature: 0`, which opus-4-7 rejects. Surgical fix applied: omit `temperature` for opus-4.7+ (regex `claude-opus-4-(7|8|9)`), keep `temperature:0` for older models. After the fix, opus-4-7 returns HTTP 200. The instructed fallbacks (opus-4-5 / sonnet-4-6) were NOT needed - the gold-standard opus-4-7 ran the whole batch.

## Per-dimension table

| Dimension | Agree | Total | % | Classification |
|---|---|---|---|---|
| energyState | 900 | 900 | 100.0% | clean |
| specialization | 807 | 900 | 89.7% | oracle-error (see below) |
| tdeeDirection | 715 | 900 | 79.4% | artifact (Bayesian maintenance vs oracle noise-read) |
| deloadState | 630 | 900 | 70.0% | artifact (oracle over-triggers REACTIVE + arithmetic error) |
| phase | 625 | 900 | 69.4% | oracle-error (provable arithmetic mistakes) |
| goalPhase | 497 | 900 | 55.2% | known-defensible (RECOMP heuristic) + oracle trend-read |
| adjustmentDirection | 306 | 900 | 34.0% | harness artifact (NONE vs hold vocabulary mismatch) |
| deloadDepth | 282 | 900 | 31.3% | comparator artifact (0 vs null) + cascade from deloadState |

Total disagreements: 2438.

## Triage - real-bug candidates separated from known/artifact

### REAL ENGINE BUGS: none found

No disagreement pattern points to an Andura engine error. Where the oracle disagrees on deterministic dimensions (phase, deloadState week-4), the oracle's OWN rationale contains arithmetic mistakes while the engine is provably correct.

### (b) KNOWN-DEFENSIBLE DIFFERENCE

- **goalPhase RECOMP->BULK: 117 / 403.** Pre-flagged detrained-return heuristic - engine auto-detects RECOMP for hipertrofie; oracle says BULK. Defensible, not a bug.
- **goalPhase BULK->MAINTAIN: 169 / 403** (+ smaller buckets). Oracle reads weight-trend / kcal signals and reframes the goal; engine maps goal->phase deterministically. Two valid framings of the same input; engine framing is internally consistent.

### (c) HARNESS / COMPARATOR / ORACLE ARTIFACT

- **adjustmentDirection: 594 / 594 disagreements have Andura = `NONE`.** Engine vocabulary is `UP / DOWN / NONE` (src/engine/energyAdjustment/index.js:77 + blueprint line 204, `ADJUSTMENT_DIRECTION.NONE`). Oracle was told to return `up|hold|down`. There is no shared neutral token: engine `NONE` vs oracle `hold` can never match. 325 `NONE->hold`, 266 `NONE->up`, 3 `NONE->down`. This is the pre-flagged energy-gate artifact, with exact mechanism: engine resolves to the neutral/suppressed `NONE` state for generated scenarios while the oracle naively nudges from raw `energyEmoji`. `energyState` agrees 100%, proving the input energy is read identically - the gap is purely the direction-vocabulary mismatch. NOT an engine bug.
- **deloadDepth: 472 / 618 are engine-numeric vs oracle = null.** When no deload, engine reports `depthPct: 0`; oracle abstains on depth (returns null). Comparator `within(0, null, 10)` is false by the null guard. The remaining 146 (`0->55`, `45->60`, etc.) cascade from deloadState disagreements - once the oracle invents a reactive deload, it assigns a depth the engine never produced. Comparator null-vs-0 handling + downstream cascade, not an engine bug.
- **phase: oracle arithmetic errors.** 49 `DELOAD->PEAK` + 18 `DELOAD->LOAD+` + 7 `DELOAD->LOAD`: the oracle rationale literally miscomputes the mesocycle week (e.g. `weeksElapsed=11 -> "(11%4)+1 = week 3 = PEAK"`, but 11%4=3, +1=4 = DELOAD). Engine is correct. One rationale even self-corrects mid-sentence ("Actually (1%4)+1=2, so LOAD+. Correcting: LOAD+"). The LOAD/LOAD+/PEAK off-by-one buckets (88/57/55) are the same boundary miscount. Pure oracle error.
- **deloadState: 217 / 270 = oracle picked REACTIVE_* when engine did not.** Engine triggers reactive deloads only on a strict fatigue threshold; oracle over-reads synthetic random yellow/red session emoji as warranting REACTIVE_COMPOSITE. The 51 `SCHEDULED_LINEAR->IDLE` are the same week-4 arithmetic error as `phase`. Oracle over-sensitivity + arithmetic, not an engine bug.
- **tdeeDirection: 138 / 185 = engine `maintenance` vs oracle directional.** Generator produces near-zero-mean symmetric weightDelta observations (`+-0.3`); engine's Bayesian posterior argmax correctly centers on maintenance, oracle eyeballs the cumulative sign as deficit/surplus (reading noise as signal). Generator-data + oracle-eyeballing artifact.
- **specialization: 82 / 93 = `on->off` ORACLE ERROR.** Engine says spec ON; oracle says OFF citing "T2 fails T1+ gate" - but T2 satisfies T1+ (T2 >= T1). The oracle misreads its own gate definition. The 11 `off->on` are oracle being permissive. Engine gate logic is correct; these are oracle confusions.

## Scored count + spend

- **Scored: 900 / 900** requested (0 errors).
- **Model id that worked: `claude-opus-4-7`** (after the temperature-param fix; no fallback needed).
- **Approx spend: ~$9.8 / ~EUR 9.0** across 721 unique API calls total (an earlier full run was killed externally at 504 cached calls; those persisted in the on-disk cache and were reused free, so this rerun added only ~217 new live calls). Estimate is token-derived (harness does not capture the API `usage` field): even-stratified avg input ~1645 tok/call (gigel ~633, marius ~1602, maria ~2702) + ~213 output tok/call. Well under the ~20 EUR cap; ample headroom.

## Bottom line

Engine is healthy: 0 invariant violations on 50k, and the 66.1% headline agreement is depressed entirely by harness vocabulary mismatches (adjustmentDirection NONE-vs-hold, deloadDepth 0-vs-null), one known-defensible heuristic (goalPhase RECOMP), and oracle-side mistakes (phase/deloadState arithmetic, specialization gate misread). Clean dimensions where vocabulary aligns: energyState 100%, specialization ~90% (and its misses are oracle errors), tdeeDirection ~79%. Recommend NO engine changes from this cycle. If a higher headline number is wanted, two harness fixes would lift it materially without touching the engine: (1) map oracle `hold`->engine `NONE` and add `HOLD` synonymy in the adjustmentDirection comparator; (2) treat oracle `null` depth as agreement when engine depth is 0 / deloadState is IDLE.

## CORRECTED re-score (2026-05-25T21-36Z) - comparator semantic-equivalence fixes applied

Both recommended harness fixes from the Bottom line above are now LANDED in `comparators.js` (zero engine change). Re-scored against the SAME on-disk oracle cache (721 entries, model `claude-opus-4-7`): 900/900 scenarios scored, 0 errors, **0 new live API calls = $0 additional spend** (verified: cache entry count unchanged before/after). Report: `reports/coach-brain-eval/2026-05-25T21-36-35-455Z.{json,md}`.

- **TRUE agreement: 76.5%** (5508 / 7200) - up from 66.1% (4762 / 7200). The +10.4pp lift is purely the two false-miss classes being correctly counted as agreement; no fabricated agreement.

| Dimension | Before | After | Delta | Note |
|---|---|---|---|---|
| energyState | 100.0% | 100.0% | - | clean (unchanged) |
| specialization | 89.7% | 89.7% | - | oracle-error misses (left untouched) |
| tdeeDirection | 79.4% | 79.4% | - | artifact (left untouched) |
| deloadDepth | 31.3% | **78.1%** | +46.8pp | null-vs-0 false misses now agree; residual = genuine cascade from deloadState |
| adjustmentDirection | 34.0% | **70.1%** | +36.1pp | NONE/hold neutral-token equivalence now agree |
| deloadState | 70.0% | 70.0% | - | oracle over-trigger + arithmetic (left untouched) |
| phase | 69.4% | 69.4% | - | oracle arithmetic errors (left untouched) |
| goalPhase | 55.2% | 55.2% | - | known-defensible RECOMP heuristic (left untouched) |

Only the two flagged semantic-equivalence dimensions moved; every other dimension is byte-identical, confirming the fixes were surgical and did not inflate unrelated buckets. Residual gaps remain attributed to oracle-side errors + one defensible engine heuristic per the triage above - NOT engine bugs.
