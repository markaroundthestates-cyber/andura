# §15 — Cross-Browser Compatibility Audit

**Scope:** Android Chrome primary + Firefox/Edge + Browser APIs (IDB, SW, navigator.share, crypto.subtle) + iOS Safari deferred + Polyfills + Caniuse Android 12+ + Safe area insets + Orientation + Pull-to-refresh + Viewport meta + theme-color + PWA standalone + Web Share fallback + Clipboard + Webview detection

## Severity matrix §15

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MED | 5 |
| LOW | 3 (positive) |
| NIT | 2 |
| **Total** | **14** |

---

## CRITICAL findings

### §15-C1 — Viewport meta missing `viewport-fit=cover` → iOS notch safe-area not respected
**Severity:** CRITICAL (§15.7 + §15.10)
**Evidence:** `index.html:5` (source) `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Missing `viewport-fit=cover`. iOS deferred PERMANENT per §15.4, but Android Chrome on devices with display cutouts (e.g., Galaxy Note Edge, Samsung S22+ punch-hole) also use safe-area-inset-*. Currently no use of `env(safe-area-inset-*)` in React global.css.
**Karpathy:** Surgical Changes — single meta tag edit.
**Fix log:** Per §1-C1 fix → `viewport-fit=cover` + `<style>body { padding-bottom: env(safe-area-inset-bottom); }</style>` or Tailwind safe-area utility. Vanilla legacy index has this ✓ — propagate to React index.html.

---

## HIGH findings

### §15-H1 — `prefers-reduced-motion` cross-browser support absent (§15.x + §6-C1 reaffirmed)
**Severity:** HIGH
**Resolution:** Per §6-C1.

### §15-H2 — `theme-color` meta missing → Android Chrome status bar generic gray (§15.11)
**Severity:** HIGH (§1-C1 reaffirmed)
**Resolution:** Per §1-C1.

### §15-H3 — Webview detection (Facebook/Instagram in-app browser) absent → potential auth flow issue
**Severity:** HIGH (§15.15)
**Evidence:** No detection of webview vs browser context. Magic Link emails opened in FB/IG in-app browser → potentially different localStorage scope → user clicks link, lands in WebView, no auth state synced back to main Chrome → loop.
**Fix log:** Document workaround in onboarding: "Deschide linkul în Chrome, NU în Facebook/Instagram." OR auto-detect WebView via `navigator.userAgent` + show banner.

---

## MED findings

### §15-M1 — Polyfills absent — assume modern browsers only ✓
**Severity:** MED (§15.5)
**Evidence:** No core-js, no polyfill imports. Vite targets ESNext per tsconfig. Android Chrome 90+ assumed (Caniuse Android 12+ §15.6). OK trade-off for bundle size.

### §15-M2 — Caniuse coverage Android 12+ primary target — verify React 19 + Dexie 4 + Workbox 7 compatibility (§15.6)
**Severity:** MED
**Evidence:** React 19, Vite 5, Workbox 7, Dexie 4 — all modern. Verify Android 12 default Chrome version supports.

### §15-M3 — Orientation lock decisions (portrait primary per manifest ✓; landscape allowed?)
**Severity:** MED (§15.8)
**Evidence:** Manifest `"orientation": "portrait"` ✓. CSS not optimized for landscape — flex column likely OK.

### §15-M4 — Pull-to-refresh handling `overscroll-behavior: contain` ABSENT
**Severity:** MED (§15.9)
**Evidence:** Grep `overscroll-behavior` → 0 hits. Android Chrome pull-to-refresh fires when scrolling up at top → user accidentally reloads mid-workout → STATE LOSS unless paused.
**Fix log:** Add `body { overscroll-behavior: contain; }` to global.css.

### §15-M5 — Web Share API / Clipboard API fallback (§15.13 + §15.14)
**Severity:** MED
**Evidence:** No `navigator.share` usage observed. Future feature parity (share workout summary?) requires fallback.

---

## LOW (POSITIVE)

### §15-L1 — Android Chrome primary target documented ✓
**Severity:** LOW positive (§15.1)
**Resolution:** Daniel uses Android Chrome.

### §15-L2 — iOS Safari deferred PERMANENT per D015 — degrades gracefully ✓
**Severity:** LOW positive (§15.4)
**Resolution:** Documented decision; React app works on iOS Safari as PWA web app (limitations doc'd).

### §15-L3 — PWA standalone manifest `display: standalone` ✓
**Severity:** LOW positive (§15.12)

---

## NIT findings

### §15-N1 — `mobile-web-app-capable` meta absent (Apple legacy compat)
**Resolution:** Modern PWA uses manifest; legacy iOS deferred. OK.

### §15-N2 — Status bar color iOS `apple-mobile-web-app-status-bar-style` absent
**Resolution:** iOS deferred §15.4. NIT.

## Coverage map §15.x condensed

| Sub | Severity |
|-----|----------|
| 15.1 Android Chrome | §15-L1 ✓ |
| 15.2 Firefox/Edge fallback | NOT TESTED MED |
| 15.3 Browser APIs IDB/SW/share/crypto | NOT VERIFIED |
| 15.4 iOS Safari deferred | §15-L2 ✓ |
| 15.5 Polyfills | §15-M1 ✓ |
| 15.6 Caniuse Android 12+ | §15-M2 verify |
| 15.7 Safe area insets | §15-C1 |
| 15.8 Orientation lock | §15-M3 |
| 15.9 Pull-to-refresh | §15-M4 |
| 15.10 Viewport meta | §15-C1 |
| 15.11 Theme-color | §15-H2 |
| 15.12 PWA standalone | §15-L3 ✓ |
| 15.13 Web Share fallback | §15-M5 |
| 15.14 Clipboard API | §15-M5 |
| 15.15 Webview detection | §15-H3 |

## Karpathy distribution §15
- Surgical Changes: 3 (C1, H2, M4)
- Goal-Driven: 1 (H3)
