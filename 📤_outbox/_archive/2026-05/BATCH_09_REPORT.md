# BATCH_09_BUILD_PERF_BASELINE — Report

**Status:** ✅ Complete
**Model:** Opus
**Duration:** ~5min
**Commit:** `0c64a0c`

## Modificări
- `📤_outbox/_archive/2026-05/BATCH_09_BUILD_PERF_BASELINE.md` baseline detailed
- HANDOVER_GLOBAL §36.70 entry

## Build results
- Build time: **4.026s wall-clock** (vite "built in 2.90s")
- Total bundle: **921 KB** raw / ~283 KB gzipped (cold-start)
- JS: ~820 KB raw / ~265.69 KB gzipped (4 chunks code-split)
- CSS: 28.29 KB / 5.98 KB gzipped
- HTML: 60.50 KB / 11.53 KB gzipped
- Mobile cold-start: ~3.0s on 3G estimate

## Verification gate
- [✅] BATCH_09_BUILD_PERF_BASELINE.md exists with real numbers
- [✅] grep §36.70: 1 match
- [✅] Build success exit code 0 (377 modules transformed)
- [✅] npm test: pre-commit 1203/1203 PASS

## Issues
None. Bundle size competitive (Fitbod ~350-450 KB gzipped, Hevy ~250-300 KB), build time fast (~4s).

## Next batch
BATCH_10_FINAL_REPORT
