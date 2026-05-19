# CUSTOM DOMAIN BASE PATH HOTFIX

**Task:** Fix 404 on andura.app assets post §36.78 rebrand sweep
**Model:** Opus
**Status:** ✅ Complete
**Date:** 2026-05-03 evening

---

## Pre-flight

- ✅ git clean working tree, branch main
- ✅ Tests baseline 1203 PASS / 75 files
- ✅ git pull `markaroundthestates-cyber/andura` synced (Daniel deja repo rename post Phase 5)

---

## Modificări

### vite.config.js
```diff
- base: '/andura/',
+ base: '/',
```

### public/sw.js
```diff
- const CACHE_VERSION = 'andura-v1';
+ const CACHE_VERSION = 'andura-v2';
- const BASE = '/andura';
+ const BASE = '';
- const ASSETS = [BASE + '/', BASE + '/index.html', ...];
+ const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
```

CACHE_VERSION bump v1 → v2 = mandatory pentru invalidate sw cache zombie pe browsers care au accesat în window-ul broken pre-fix.

### public/manifest.json
- `start_url: "/andura/"` → `"/"`
- `scope: "/andura/"` → `"/"`
- `icons.src: "/andura/icon-*.png"` → `"/icon-*.png"`

### src/main.js
```diff
- navigator.serviceWorker.register('/andura/sw.js')
+ navigator.serviceWorker.register('/sw.js')
```

### index.html
```diff
- <link rel="manifest" href="/andura/manifest.json"/>
- <link rel="apple-touch-icon" href="/andura/icon-192.png"/>
+ <link rel="manifest" href="/manifest.json"/>
+ <link rel="apple-touch-icon" href="/icon-192.png"/>
```

### playwright.config.js
```diff
- baseURL: 'https://markaroundthestates-cyber.github.io',
+ baseURL: 'https://andura.app',
- // baseURL is the GitHub Pages origin; tests navigate to /andura/
+ // baseURL is the custom domain origin; tests navigate to / (root)
```

### 16 playwright tests
```diff
- const BASE_URL = '/andura/';
+ const BASE_URL = '/';
- await page.goto('/andura/');
+ await page.goto('/');
```

---

## Verify

| Check | Result |
|---|---|
| Tests | **1203 PASS** unchanged ✅ |
| Build | 3.22s success ✅ |
| `dist/CNAME` | `andura.app` preserved ✅ |
| `dist/manifest.json` | start_url+scope `/` ✅ |
| `dist/sw.js` | CACHE_VERSION `andura-v2`, BASE `''` ✅ |
| `grep '/andura/' dist/` | **0 hits** ✅ |
| `git grep '/andura/' -- src/ public/ tests/ vite.config.js playwright.config.js index.html` | **0 hits** ✅ |

---

## Smoke prod

Sandbox CC Opus blocheaza outbound HTTP HEAD. Daniel verifies manual browser-side post hard refresh:

```
curl -I https://andura.app/             # expected 200
curl -I https://andura.app/manifest.json # expected 200 (NOT 404)
curl -I https://andura.app/sw.js         # expected 200
```

DevTools Network tab: toate assets `200 OK`, NU `404`.

---

## Commits

- `5d955ae` — fix(custom-domain): base paths root-relative for andura.app deployment (22 files changed, 56+/56-)
- (acest commit final) — chore(vault): §36.79 + LATEST hotfix raport

---

## Pushed

✅ origin/main `5d955ae`
✅ `npm run deploy` → `gh-pages` Published (GitHub Pages auto-rebuild ~1-2 min CDN)

---

## Cumulative LOCKED count progression

- Pre-hotfix: 71 (post §36.78)
- Post-§36.79 hotfix: **72**

---

## Empirical Opus runtime

| Estimate spec | Actual | Factor |
|---|---|---|
| ~25 min | ~10 min | **2.5x** (hotfix simplu, pattern cunoscut din Phase 2) |

**Calibration update:** factor 7-9x optimism aplicabil la **clusters mari noi**. Hotfix-uri scope-clean (sweep cunoscut, fără descoperire) = factor 2-3x. Daniel poate aștepta hotfix-uri scope-clean sub 15 min.

---

## Next Daniel manual (post-CDN propagation ~1-2 min)

### Critical path (~1-2 min)

1. **Hard refresh browser:** `Ctrl+Shift+R` (Windows) sau `Cmd+Shift+R` (Mac) pe `https://andura.app/`
   - Forțare reload sw `andura-v1` → `andura-v2`
   - Drop cache vechi 404 paths
2. **Smoke confirm:**
   - Dashboard renders normal (NU "ReferenceError startSession is not defined")
   - DevTools Network tab → toate assets `200 OK`
   - DevTools Application tab → Service Workers → `andura-v2` activated
3. **Optional verify Application Manifest:**
   - DevTools → Application → Manifest → Verify name "Andura", start_url `/`, icons paths root

### Post-smoke OK

- Status Andura V1 prod: **LIVE** la `https://andura.app/` ✅
- Sprint UI cluster pending Path A re-spec (per §36.77) — next strategic chat
- Beta cohort 50 users §36.47 invitation post Sprint UI complete

---

## Lessons learned (anti-recurrence ext §36.79)

| Insight | Application |
|---|---|
| Custom domain deployment ≠ subpath deployment | Pre-rebrand checklist viitor: primul item = "destination URL type subpath sau custom domain root?" |
| CACHE_VERSION bump MANDATORY la schema change sw.js base paths | Anti zombie cache pe users existing care accesat în window-ul broken |
| Phase 4 spec original lipsea sw fetch intercept consideration | Flag pentru custom-domain projects future: spec sw + manifest paths separat de vite base |

---

## Cross-References

- §30 Rebrand SalaFull → Andura LOCKED 2026-05-01 RESUBMIT
- §36.78 Rebrand Sweep Phase 1-4 Complete (introduced base path mismatch)
- §36.79 Custom Domain Base Path Hotfix (acest raport)
- §36.77 anti-recurrence rule (pre-flight respected — root cause identified clean, fix surgical no-fabricate)
- §31 Investiții (andura.app €13.18 achitat 2026-05-03)
- §36.74 §BATCH_PROTOCOL.X single LATEST.md final centralizat (pattern aplicat)

---

*Generat 2026-05-03 evening. Single phase hotfix complete. Daniel hard refresh browser → smoke prod → Andura V1 LIVE la andura.app. Next: Sprint UI re-spec Path A vanilla JS post next strategic chat.*
