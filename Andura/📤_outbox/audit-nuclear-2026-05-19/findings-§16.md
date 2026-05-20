# §16 — PWA Spec Compliance Audit

**Scope:** manifest.webmanifest fields + icons all sizes + maskable + offline support + install prompt + UpdatePrompt + SW scope + Workbox strategies + Lighthouse PWA + skipWaiting/clientsClaim + SW versioning + cache invalidation + background sync + push + cross-tab SW state + app icons + splash iOS + install criteria

## Severity matrix §16

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 4 |
| MED | 4 |
| LOW | 3 (positive) |
| NIT | 2 |
| **Total** | **15** |

---

## CRITICAL findings

### §16-C1 — Duplicate SW + manifest conflict (§1-H6 reaffirmed)
**Severity:** CRITICAL
**Evidence:**
- `public/sw.js` (manual, 2KB) AND vite-plugin-pwa `dist/sw.js` (generated) — same path, overwrite during build.
- `public/manifest.json` AND `dist/manifest.webmanifest` — both shipped, only `manifest.webmanifest` linked from dist/index.html. manifest.json wastes bytes.
- Cache version mismatch: manual `andura-v2` vs workbox versioning.
**Fix log:** Per §1-H6 — delete public/sw.js + public/manifest.json. Rely on vite-plugin-pwa entirely.

### §16-C2 — Manifest icon sizes incomplete (only 192+512, missing 72/96/128/144/152/384)
**Severity:** CRITICAL (§16.2)
**Evidence:**
- `public/manifest.json`: only 192 + 512 + 512 maskable.
- `vite.config.js:30-34` VitePWA manifest: same 3 entries.
- Per §16.2 spec "16/32/72/96/128/144/152/192/384/512" all sizes.
- Android Chrome PWA install picks closest size; missing intermediates → upscale blurry on some devices. iOS apple-touch-icon-precomposed missing.
**Fix log:** Generate icon set via `npx pwa-asset-generator` from logo source. Add to `public/icons/*` + manifest icons array.

---

## HIGH findings

### §16-H1 — `<link rel="apple-touch-icon">` absent in index.html (§16.16 iOS support)
**Severity:** HIGH
**Evidence:** Per §1-C1. iOS Add to Home Screen uses generic icon.
**Resolution:** Per §1-C1 fix.

### §16-H2 — UpdatePrompt component LANDED but fallback handling NOT VERIFIED
**Severity:** HIGH (§16.6 Phase 6 task_21)
**Evidence:** `UpdatePrompt.tsx` imports `virtual:pwa-register/react` (vite-plugin-pwa virtual module). Comment "Stub fallback când virtual:pwa-register/react NU disponibil (test/SSR)". Production build: virtual module resolves to runtime SW registration ✓. Component receives `[needRefresh, setNeedRefresh]` + `[offlineReady, setOfflineReady]`. UX flow when update available: prompt user → call setNeedRefresh + reload?
**Fix log:** Sample UpdatePrompt.tsx; verify update flow (user accepts → SW skipWaiting → reload).

### §16-H3 — Background sync (offline write queue) NOT IMPLEMENTED (§16.13)
**Severity:** HIGH (offline-first promise gap)
**Evidence:** No `BackgroundSync` plugin in workbox config. Offline writes via Zustand persist localStorage → on reconnect, no automatic Firebase sync trigger.
**Fix log:** Document "offline = local-only; user must reopen app online to sync." Or implement Workbox BackgroundSync queue for Firebase writes.

### §16-H4 — Push notifications support state (§16.14)
**Severity:** HIGH
**Evidence:** No `Notification.requestPermission()` flow observed in React. SettingsNotifications.tsx exists (Phase 6 task_10 LANDED). Push subscription register via SW endpoint absent — limits to local notifications only (which themselves NOT implemented?). Verify.

---

## MED findings

### §16-M1 — Workbox cache strategies (§16.8): NetworkFirst Firebase ✓ + CacheFirst Fonts ✓ — appropriate
**Severity:** MED — POSITIVE
**Evidence:** vite.config.js workbox runtimeCaching configured. NetworkFirst Firebase 3s timeout + 1d maxAge ✓. CacheFirst Google Fonts 1y maxAge OK (fonts immutable).

### §16-M2 — `registerType: 'autoUpdate'` (§16.10)
**Severity:** MED — POSITIVE
**Evidence:** vite.config.js line 18.

### §16-M3 — `cleanupOutdatedCaches: true` (§16.12)
**Severity:** MED — POSITIVE
**Evidence:** vite.config.js line 39.

### §16-M4 — Cross-tab SW state sync clients.matchAll broadcast (§16.15)
**Severity:** MED
**Evidence:** vite-plugin-pwa workbox default uses skipWaiting + clientsClaim — on activation, claims all clients. Cross-tab sync: workbox-window detects via `controllerchange` event. Verify Update prompt fires across tabs.

---

## LOW (POSITIVE)

### §16-L1 — Manifest required fields ✓ (name/short_name/description/start_url/display/theme_color/background_color/orientation/lang)
**Severity:** LOW positive (§16.1)
**Evidence:** vite.config.js VitePWA manifest covers all required.

### §16-L2 — Maskable icon provided ✓
**Severity:** LOW positive (§16.3)
**Evidence:** vite.config.js line 34 `purpose: 'maskable'`.

### §16-L3 — Service Worker scope `/` correct (§16.7)
**Severity:** LOW positive
**Evidence:** vite-plugin-pwa default. PWA installs from root.

---

## NIT findings

### §16-N1 — `lang: 'ro-RO'` in manifest ✓
**Resolution:** OK.

### §16-N2 — Description "Coach AI personal pentru sala — facut in Romania" Daniel-direct ✓
**Resolution:** OK.

## Coverage map §16.x condensed

| Sub | Severity |
|-----|----------|
| 16.1 Manifest fields | §16-L1 ✓ |
| 16.2 Icons all sizes | §16-C2 |
| 16.3 Maskable | §16-L2 ✓ |
| 16.4 Offline NetworkFirst Firebase | ✓ |
| 16.5 Install prompt UX | §7-H5 |
| 16.6 UpdatePrompt | §16-H2 |
| 16.7 SW scope `/` | §16-L3 ✓ |
| 16.8 Workbox strategies | §16-M1 ✓ |
| 16.9 PWA Lighthouse | NOT MEASURED §5-C4 |
| 16.10 skipWaiting + clientsClaim | §16-M2 ✓ |
| 16.11 SW versioning | §16-C1 conflict |
| 16.12 Cache invalidation cleanupOutdatedCaches | §16-M3 ✓ |
| 16.13 Background sync | §16-H3 |
| 16.14 Push notifications | §16-H4 |
| 16.15 Cross-tab SW state sync | §16-M4 |
| 16.16 App icons branding | §16-H1 + §16-C2 |
| 16.17 Splash iOS | deferred D015 OK |
| 16.18 PWA install criteria | manifest ✓ SW ✓ HTTPS ✓ engagement heuristic browser-driven |

## Karpathy distribution §16
- Surgical Changes: 3 (C1, C2, H1)
- Goal-Driven: 2 (H2, H3)
