# Build Performance Baseline (BATCH_09)

**Date:** 2026-05-02
**Tool:** `npm run build` (vite@5.4.21) + manual inspection

## Build timing

| Metric | Value |
|--------|-------|
| Wall-clock time (real) | **4.026s** |
| User CPU | 0.091s |
| Sys CPU | 0.090s |
| Vite-reported "built in" | 2.90s |

**Build status:** ✅ Success (exit code 0)
**Modules transformed:** 377

## Bundle sizes

### Total

- **Total dist/ size:** **921 KB** (10 files)

### JavaScript

| File | Size raw | Size gzipped |
|------|----------|--------------|
| `assets/index-D7JyUQ7S.js` | 443.56 KB | **146.54 KB** |
| `assets/main-BiZwWlv9.js` | 373.08 KB | **117.64 KB** |
| `assets/tombstones-B4SokQlz.js` | 2.55 KB | 1.01 KB |
| `assets/whyEngine-cq0Rc05-.js` | 0.96 KB | 0.50 KB |

**Total JS raw:** ~820 KB / **Total JS gzipped:** **~265.69 KB**

### CSS

| File | Size | Gzipped |
|------|------|---------|
| `assets/main-BorYfxhx.css` | 28.29 KB | 5.98 KB |

**Total CSS:** 28.29 KB / 5.98 KB gzipped

### HTML

| File | Size | Gzipped |
|------|------|---------|
| `index.html` | 60.50 KB | 11.53 KB |

### Assets (PWA)

| File | Size |
|------|------|
| `icon-192.png` | 4 KB |
| `icon-512.png` | 4 KB |
| `sw.js` | 4 KB |

## Mobile PWA context

### Cold-start payload estimate

- **JS critical path:** index.js + main.js = **~265 KB gzipped** (3G ~750kbps = ~2.8s download)
- **CSS:** 5.98 KB gzipped
- **HTML:** 11.53 KB gzipped
- **Total cold-start gzipped:** **~283 KB**

### 3G slow connection (~750 kbps)

- ~3.0s cold-start estimate (acceptable pentru PWA context, similar Fitbod/Hevy benchmark)

### 4G LTE (~10 Mbps)

- ~0.3s cold-start estimate (immediate UX)

### Sprint UI Integration impact concern

- Sprint UI Integration adds:
  - Suflet Andura wiring în RuleEngine integration ~+5 KB gzipped (pure logic)
  - Bias Detection signals plumbing CDL extension ~+3 KB
  - 3 Card buttons UI (Aparat ocupat/lipsă/Disconfort) ~+8 KB
  - Goal Shift card UI counter ~+3 KB
  - PROMPT_PROFILE_VALIDATION_PLACEHOLDER UI render ~+3 KB
  - Founding cap counter UI ~+5 KB
  - Telegram CTA surface ~+2 KB
- **Estimated bundle increase:** **~+30 KB gzipped** (~10% growth)
- **Mobile cold-start impact:** ~+0.3s on 3G (acceptable)

## Recommendations

### Pre-Beta (no action needed)

- Bundle size **optimal** — 921 KB total / 283 KB gzipped critical = competitive (Fitbod 350-450 KB gzipped, Hevy 250-300 KB)
- Code splitting working (4 JS chunks vs single bundle) ✅
- Tree-shaking active (vite default) ✅
- Build time fast (~4s wall-clock) ✅

### Post-Sprint UI Integration regression check

```bash
npm run build
```

Compare against this baseline:
- **Build time target:** <8s wall-clock (currently 4s, 2x headroom)
- **Bundle gzipped target:** <350 KB (currently 283 KB, ~+67 KB headroom)
- Flag dacă +>20% increase neaventajos.

### Code splitting future opportunities

- `whyEngine` already split (separate chunk 0.96 KB) — pattern good
- `tombstones` split (2.55 KB) — pattern good
- Consider lazy-load: `pricing.js` + Founding cap counter UI (post-onboarding only); 3 Card buttons (per-session triggered NU initial)

## Baseline locked

Reference 2026-05-02. Future regression check via this baseline.

## Cross-refs

- Sprint UI Integration scope: HANDOVER_GLOBAL §36.71 cumulative session-lock (BATCH_10)
- Beta-launch ASAP path: HANDOVER_GLOBAL Sprint 4.x cluster execution session-lock entry
- vite 5→8 major upgrade post-Beta: §36.69 dependencies audit (potential build perf shift)
