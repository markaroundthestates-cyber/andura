# PROMPT_CC_BATCH_09_BUILD_PERF_BASELINE

**Model:** Opus
**Order:** 9/10
**Dependencies:** BATCH_05 + BATCH_07 complete (metadata audited + coverage baseline — build pe state final stable)
**Scope:** npm run build cu timing + bundle size analysis raport
**Estimate:** ~30min

---

## CONTEXT

Build performance baseline pentru future regression detection. Bundle size matters pentru PWA mobile cohort cold_start (slow connection RO). Sprint UI Integration potential bundle bloat — este critical baseline ÎNAINTE acel sprint.

---

## TASKS

### Task 9.1 — Run build cu timing

```bash
time npm run build > /tmp/build_output.log 2>&1
```

Capture:
- **Real time:** wall-clock duration
- **User time:** CPU user time
- **Sys time:** CPU sys time
- **Build success:** exit code 0

Verify build succeeded (exit code 0) ÎNAINTE proceed la analysis. If failed → STOP, flag în report, NU continue cu invalid baseline.

---

### Task 9.2 — Analyze bundle size

Inspect `dist/` (sau `build/` — verify exact output folder per `vite.config.ts` sau similar):

```bash
ls -lah dist/
du -sh dist/
find dist/ -name "*.js" -exec ls -lah {} \;
find dist/ -name "*.css" -exec ls -lah {} \;
```

Identify:
- **Total dist/ size:** human-readable
- **JS bundle sizes:** individual files (look for main bundle + chunks)
- **CSS bundle sizes:** individual files
- **Asset sizes:** images/fonts/etc.

For PWA optimization context:
- **Largest JS chunk:** size + filename
- **Total JS size:** sum
- **Total CSS size:** sum

---

### Task 9.3 — Identify large dependencies (optional, dacă tooling available)

If `vite-bundle-visualizer` or `rollup-plugin-visualizer` available:
```bash
npm run build -- --mode analyze 2>/dev/null || echo "no analyzer configured"
```

If NOT available, skip (NU instala doar pentru baseline single-shot).

Alternative simple analysis:
```bash
# Find largest deps în node_modules contributing la bundle
du -sh node_modules/* | sort -h | tail -20
```

Document top 10 largest deps în report (informative, NOT actionable).

---

### Task 9.4 — Generate report

**Create file:** `📤_outbox/_archive/2026-05/BATCH_09_BUILD_PERF_BASELINE.md`

```markdown
# Build Performance Baseline (BATCH_09)

**Date:** 2026-05-02
**Tool:** `npm run build` + manual inspection

## Build timing

| Metric | Value |
|--------|-------|
| Wall-clock time | XXm XX.XXs |
| User CPU | XXm XX.XXs |
| Sys CPU | XXm XX.XXs |

**Build status:** ✅ Success (exit code 0)

## Bundle sizes

### Total

- **Total dist/ size:** XX.X MB

### JavaScript

| File | Size | Gzipped (estimate) |
|------|------|---------------------|
| `<main-bundle>.js` | XXX KB | XX KB |
| `<chunk-1>.js` | XXX KB | XX KB |
<repeat>

**Total JS:** X.X MB raw / X.X MB gzipped (estimate)

### CSS

| File | Size |
|------|------|
| `<main>.css` | XX KB |

**Total CSS:** XXX KB

### Assets (images/fonts/etc.)

**Total assets:** X.X MB

## Largest dependencies (informative)

Top 10 by size în `node_modules/`:
1. `<pkg>` — XX MB
2. `<pkg>` — XX MB
<repeat>

## Mobile PWA context

**Cold-start payload estimate:**
- JS critical path: <main-bundle> + <main-chunk> = ~X.X MB
- CSS: ~XXX KB
- Total cold-start: ~X.X MB

**Slow connection (3G ~750kbps):** ~Xs cold-start estimate

**Sprint UI Integration impact concern:**
- Sprint UI Integration adds React components + UI primitives
- Bundle size increase estimated: +XXX KB (TBD post-Sprint)
- Mobile cold-start impact: +X.Xs estimated

## Recommendations

**Pre-Beta:**
- Verify lazy loading enabled pentru routes non-critical
- Verify code splitting working (multiple chunks vs single bundle)
- Verify tree-shaking active (unused deps eliminated)

**Post-Sprint UI Integration regression check:**
```
npm run build
```
Compare timing + bundle sizes against this baseline. Flag dacă +>20% increase neaventajos.

## Baseline locked

Reference 2026-05-02. Future regression check via this baseline.
```

---

### Task 9.5 — Cross-ref HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry:

```markdown
### §36.70 BUILD PERF BASELINE 2026-05-02

Build performance baseline locked:
- **Build time:** XX seconds wall-clock
- **Total bundle:** X.X MB (JS X.X MB + CSS XXX KB + assets X.X MB)
- **Cold-start mobile estimate:** ~Xs on 3G

Reference baseline pre Sprint UI Integration. Regression check post-Sprint via `BATCH_09_BUILD_PERF_BASELINE.md`.

**Cumulative LOCKED count:** 60 → 60 (measurement, NU decizie nouă)
```

---

## VERIFICATION GATE

Pre-commit:
1. `ls 📤_outbox/_archive/2026-05/BATCH_09_BUILD_PERF_BASELINE.md` → file exists
2. `grep "§36.70 BUILD PERF BASELINE" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match
3. Report has actual numbers (NOT placeholders)
4. Build success verified (exit code 0)
5. `npm test` → all pass (no changes affecting tests)

---

## COMMIT

```
git add 📤_outbox/_archive/2026-05/BATCH_09_BUILD_PERF_BASELINE.md 06-sessions-log/HANDOVER_GLOBAL.md
git commit -m "feat(batch-09): build performance baseline 2026-05-02

- Build time: XX seconds
- Total bundle: X.X MB (JS + CSS + assets)
- Mobile cold-start estimate: ~Xs on 3G
- BATCH_09_BUILD_PERF_BASELINE.md detailed analysis + recommendations
- HANDOVER_GLOBAL §36.70 entry"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_09_REPORT.md`:

```markdown
# BATCH_09_BUILD_PERF_BASELINE — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- BATCH_09_BUILD_PERF_BASELINE.md baseline detailed
- HANDOVER_GLOBAL §36.70 entry

## Build results
- Build time: XX seconds
- Total bundle: X.X MB
- JS: X.X MB / CSS: XXX KB / assets: X.X MB
- Mobile cold-start: ~Xs on 3G estimate

## Verification gate
- [✅/❌] BATCH_09_BUILD_PERF_BASELINE.md exists with real numbers
- [✅/❌] grep §36.70: 1 match
- [✅/❌] Build success exit code 0
- [✅/❌] npm test: all pass

## Issues
<none / lista — flag dacă build failed sau bundle anomaly detected>

## Next batch
BATCH_10_FINAL_REPORT
```

Stop. Trigger BATCH_10.
