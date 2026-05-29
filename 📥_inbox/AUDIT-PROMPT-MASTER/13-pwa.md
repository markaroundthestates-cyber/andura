# SECTION 13 — PWA / offline / service-worker / install / update / cache

> **Weight 4% · Gate 95% · Critical: no.**
>
> **Why this section exists (the exact Daniel pain).** After a deploy, Daniel
> opened the INSTALLED PWA (home-screen icon) and saw the OLD build — a stale
> service-worker cache served the previous app shell because a home-screen-launched
> PWA never navigates, so the browser's "check for a new SW on navigation / every
> ~24h" trigger never fired. Wave F added the update glue
> (`registration.update()` on `visibilitychange` + a 30-min `setInterval` + an
> initial nudge) and `UpdatePrompt` surfaces the new version for explicit consent.
> This section verifies — atomically — that an installed PWA actually *receives*
> the update without a manual reinstall, that it works offline, that install +
> manifest are correct, and that a deploy busts the cache. It also records, **honestly**,
> the two classes the harness cannot fully prove without a live deployed origin
> (a returning-client stale serve; the TWA/Play-Store wrapper NOT fixing SW cache).
>
> **Surface under audit (verbatim loci):**
> - `vite.config.js` — `VitePWA({...})` block (lines 35–169): `registerType`,
>   `injectRegister`, `manifest`, `workbox` (globPatterns, globIgnores,
>   cleanupOutdatedCaches, navigateFallback, navigateFallbackDenylist,
>   runtimeCaching), `devOptions`.
> - `src/react/components/UpdatePrompt.tsx` — the SW update glue + banner.
> - `src/react/components/InstallPrompt.tsx` — beforeinstallprompt capture + dismiss-persist.
> - `src/react/components/OfflineBanner.tsx` + `src/react/hooks/useNetworkStatus.ts`.
> - `src/react/routes/Layout.tsx:72–74` — mount points.
> - `index.html` — `<meta name="theme-color">`, PWA iOS hints.
> - `public/firebase-messaging-sw.js` — the SECOND service worker (FCM background).
> - `public/404.html` + `index.html:54–65` — SPA deep-link glue (interacts with navigateFallback).
> - `src/i18n/en.json` + `ro.json` — `install.*`, `updatePrompt.*`, `offlineBanner.*`.
> - Tests: `src/react/__tests__/config/sw-cache-invariants.test.ts`,
>   `.../components/{UpdatePrompt,InstallPrompt,OfflineBanner}.test.tsx`,
>   `tests/smoke-react.spec.ts:104` (E2E offline).
>
> **Build + serve note (applies to most Verify steps).** `devOptions.enabled: false`
> → **no SW in `npm run dev`**. SW/manifest/precache only exist after
> `npm run build` and serving `dist/` (`npm run preview` or `npx serve dist`).
> Playwright SW steps that hit `localhost` MUST run against the built+served
> `dist/`, not the dev server, or they BLOCK. The truest signal is the live
> deployed origin (`andura.app`) for the post-deploy stale-cache class.

---

## 13.A — vite-plugin-pwa configuration

### [13.001] PWA plugin is registered in the Vite build
- **Check:** `VitePWA` is imported and present in the `plugins` array.
- **Where:** `vite.config.js:3` (import), `:35` (`VitePWA({...})`).
- **Expected:** `import { VitePWA } from 'vite-plugin-pwa'` and a `VitePWA(...)` entry in `plugins:[react(), VitePWA({...})]`.
- **Verify:** `grep -nE "from 'vite-plugin-pwa'|VitePWA\(" vite.config.js` → both lines present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.002] vite-plugin-pwa dependency is installed at the expected major
- **Check:** `vite-plugin-pwa` (and `workbox-window`) are in package.json and `node_modules`.
- **Where:** `package.json:100` (`"vite-plugin-pwa": "^1.3.0"`), `:102` (`"workbox-window": "^7.4.1"`).
- **Expected:** declared deps resolve; `vite-plugin-pwa` ≥1.x bundles a matching Workbox.
- **Verify:** `grep -nE "vite-plugin-pwa|workbox-window" package.json`; `npm ls vite-plugin-pwa workbox-window` → no UNMET.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.003] registerType is 'prompt', NOT 'autoUpdate'
- **Check:** The SW does NOT silently `skipWaiting`+`clientsClaim` mid-session; it waits for explicit consent.
- **Where:** `vite.config.js:41` — `registerType: 'prompt'`.
- **Expected:** `registerType: 'prompt'` (per §S-12 audit fix — anti-paternalism, NU swap assets mid-session without consent).
- **Verify:** `grep -nE "registerType:\s*'(prompt|autoUpdate)'" vite.config.js` → `'prompt'`. The comment lines 36–40 must still describe the rationale.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Regression to `autoUpdate` would re-introduce the silent mid-session swap §S-12 fixed.

### [13.004] injectRegister is 'script-defer' (non-render-blocking SW registration)
- **Check:** The injected `registerSW.js` script does not block first paint.
- **Where:** `vite.config.js:48` — `injectRegister: 'script-defer'`.
- **Expected:** `injectRegister: 'script-defer'` (D060 / Lighthouse perf — eliminates ~952 ms render-block vs default `'auto'`).
- **Verify:** `grep -n "injectRegister" vite.config.js` → `'script-defer'`. In the built `dist/index.html`, the registerSW `<script>` carries `defer`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Touches §14 perf too; verified here because it gates whether the SW registers at all post-DOMContentLoaded.

### [13.005] devOptions.enabled is false (no SW in dev)
- **Check:** The SW is disabled in `npm run dev` to avoid HMR/SW lifecycle conflicts.
- **Where:** `vite.config.js:168` — `devOptions: { enabled: false }`.
- **Expected:** `devOptions: { enabled: false }`.
- **Verify:** `grep -n "devOptions" vite.config.js` → `{ enabled: false }`. Implication noted for every SW Verify below: build+serve `dist/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** This is WHY the E2E offline test (`smoke-react.spec.ts:120`) self-skips on a dev build.

### [13.006] base is '/' (root-domain scope, not a subpath)
- **Check:** PWA scope + asset URLs assume root domain `andura.app`, not a GH-pages subpath.
- **Where:** `vite.config.js:15` — `base: '/'`; manifest `scope: '/'`, `start_url: '/'` (`:58–59`).
- **Expected:** `base`, `scope`, `start_url` all `/`. Matches `public/404.html:14` `pathSegmentsToKeep=0`.
- **Verify:** `grep -nE "base:|scope:|start_url:" vite.config.js`; `grep -n pathSegmentsToKeep public/404.html` → 0.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** A `base` other than `/` would break the manifest `start_url`/`scope` + the precache URLs on the root domain.

---

## 13.B — Manifest correctness (install metadata)

### [13.007] Manifest name + short_name are 'Andura'
- **Check:** Installed app + home-screen label read "Andura".
- **Where:** `vite.config.js:51–52` — `name: 'Andura'`, `short_name: 'Andura'`.
- **Expected:** both `'Andura'`.
- **Verify:** build, then `curl -s http://localhost:4173/manifest.webmanifest | jq '.name, .short_name'` (preview port) → `"Andura"` twice.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.008] Manifest display is 'standalone'
- **Check:** Installed PWA launches without the browser URL bar/chrome.
- **Where:** `vite.config.js:56` — `display: 'standalone'`.
- **Expected:** `display: 'standalone'`.
- **Verify:** `jq '.display' dist/manifest.webmanifest` → `"standalone"`. Playwright (Chromium installed-mode emulation or DevTools Application → Manifest) shows standalone.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.009] Manifest start_url + scope are '/'
- **Check:** Launch + nav scope are the app root.
- **Where:** `vite.config.js:58–59`.
- **Expected:** `start_url: '/'`, `scope: '/'`.
- **Verify:** `jq '.start_url, .scope' dist/manifest.webmanifest` → `"/"` twice.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** `start_url: '/'` is critical to the stale-cache class: a home-screen launch hits `/` (the navigateFallback shell), never a deep route → no SW-update navigation trigger → Wave F glue is the ONLY update path.

### [13.010] Manifest orientation is 'portrait'
- **Check:** PWA locks to portrait (gym one-handed use).
- **Where:** `vite.config.js:57` — `orientation: 'portrait'`.
- **Expected:** `orientation: 'portrait'`.
- **Verify:** `jq '.orientation' dist/manifest.webmanifest` → `"portrait"`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.011] Manifest declares lang 'ro-RO'
- **Check:** Default install metadata language is Romanian.
- **Where:** `vite.config.js:60` — `lang: 'ro-RO'`.
- **Expected:** `lang: 'ro-RO'`; consistent with `index.html` `<html lang="ro">`.
- **Verify:** `jq '.lang' dist/manifest.webmanifest` → `"ro-RO"`; `grep -n 'html lang' index.html`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.012] Manifest description is present + no-diacritics
- **Check:** Description renders in app-store-style install dialogs; obeys NO_DIACRITICS (D-LEGACY-064 — user-facing string).
- **Where:** `vite.config.js:53` — `description: 'Coach AI personal pentru sala — facut in Romania'`.
- **Expected:** non-empty; zero diacritics (note: the em-dash `—` is punctuation, not a diacritic; `facut`/`sala` are intentionally undiacriticized).
- **Verify:** `jq -r '.description' dist/manifest.webmanifest`; `grep -nE "[ăâîșțĂÂÎȘȚ]" <<< "$(jq -r .description dist/manifest.webmanifest)"` → zero matches.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.013] Manifest theme_color matches the live app theme-color (#090b13 Pulse-dark) — KNOWN MISMATCH
- **Check:** The manifest `theme_color` matches the HTML `<meta name="theme-color">` and the current Pulse-dark default surface.
- **Where:** `vite.config.js:54` — `theme_color: '#c8412e'`; **vs** `index.html:6` — `<meta name="theme-color" content="#090b13">`; **vs** Pulse FOUC shell `index.html:76` `background:#090b13`.
- **Expected:** all three agree on the Pulse-dark surface `#090b13`. They DO NOT — the manifest still carries the OLD brick/clay `#c8412e` and `background_color: '#faf7f1'` (old cream paper), pre-dating the Pulse redesign (2026-05-29).
- **Verify:** `grep -nE "theme_color|background_color" vite.config.js` → `#c8412e` / `#faf7f1`. `grep -n 'theme-color' index.html` → `#090b13`. Compare. Mismatch = at least `PARTIAL`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(authoring note — flagged as a real mismatch to verify at audit time)*
- **Evidence:** manifest `theme_color:'#c8412e'` + `background_color:'#faf7f1'` (warm/light) contradict the installed app's actual theme-color `#090b13` and the dark FOUC shell. On Android the OS status-bar tint (theme_color) + the install splash background (background_color) would render the OLD palette while the app paints Pulse-dark → a visible color flash + wrong status bar on the installed PWA.
- **Notes:** Fix: set `theme_color: '#090b13'` + `background_color: '#090b13'` in `vite.config.js` manifest to match `index.html` + Pulse default. Cross-link §11 parity. (If light-mode is the persisted exception, the manifest should still track the DEFAULT, which is dark per CEO.)

### [13.014] Manifest background_color is set (splash background)
- **Check:** `background_color` produces a sensible install/splash background.
- **Where:** `vite.config.js:55` — `background_color: '#faf7f1'`.
- **Expected:** a valid hex; per [13.013] should be `#090b13` to match Pulse-dark default.
- **Verify:** `jq '.background_color' dist/manifest.webmanifest`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Same root cause as [13.013].

### [13.015] Manifest declares 192 + 512 icons
- **Check:** Both required icon sizes are declared with correct type.
- **Where:** `vite.config.js:61–65`.
- **Expected:** entries for `/icon-192.png` (192×192) and `/icon-512.png` (512×512), `type: 'image/png'`.
- **Verify:** `jq '.icons' dist/manifest.webmanifest` → 192 + 512 present.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.016] Manifest declares a maskable icon
- **Check:** A `purpose: 'maskable'` icon exists (Android adaptive-icon safe-zone).
- **Where:** `vite.config.js:64` — `{ src:'/icon-512.png', sizes:'512x512', type:'image/png', purpose:'maskable' }`.
- **Expected:** at least one icon with `purpose: 'maskable'`.
- **Verify:** `jq '.icons[] | select(.purpose=="maskable")' dist/manifest.webmanifest` → one entry.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Reuses the same 512 PNG as the non-maskable; verify the artwork actually has safe-zone padding (a full-bleed logo gets clipped to a circle on some launchers). Visual check, not just the declaration.

### [13.017] Declared icon files physically exist in public/ and are real PNGs
- **Check:** `/icon-192.png` + `/icon-512.png` exist and are non-empty PNG images at the right dimensions.
- **Where:** `public/icon-192.png`, `public/icon-512.png` (also `includeAssets:['icon-192.png','icon-512.png']` `vite.config.js:49`).
- **Expected:** both files exist, decode as PNG, dimensions 192² and 512².
- **Verify:** `file public/icon-192.png public/icon-512.png`; or Playwright `fetch('/icon-512.png')` → 200, `content-type: image/png`, body bytes start `\x89PNG`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** A 404 / placeholder icon → install dialog shows a broken/generic icon (Gigel: "looks fake").

### [13.018] apple-touch-icon + iOS standalone hints present
- **Check:** iOS "Add to Home Screen" launches standalone with a proper icon (no beforeinstallprompt on iOS).
- **Where:** `index.html:23` (`apple-touch-icon`), `:31–34` (`mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`).
- **Expected:** `apple-touch-icon` 192, `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-title=Andura`, status-bar-style declared.
- **Verify:** `grep -nE "apple-touch-icon|apple-mobile-web-app|mobile-web-app-capable" index.html`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** `apple-mobile-web-app-status-bar-style=default` comment (`index.html:24–30`) references the OLD `#faf7f1` cream background — same palette-drift as [13.013]; on a Pulse-dark app the iOS status bar copy/intent is stale.

### [13.019] theme-color meta vs color-scheme consistency
- **Check:** `<meta name="color-scheme">` and the theme-color/FOUC shell are internally consistent (dark default).
- **Where:** `index.html:6` (`theme-color #090b13`), `:8` (`color-scheme "dark light"`), `:73–80` (FOUC shell dark).
- **Expected:** dark-first; theme-color matches the dark surface.
- **Verify:** `grep -nE "theme-color|color-scheme" index.html`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** HTML side is consistent (dark); the MANIFEST is the outlier (see [13.013]).

---

## 13.C — Precache (workbox generateSW)

### [13.020] generateSW precaches the app shell asset types
- **Check:** `globPatterns` includes the JS/CSS/HTML/icon/font asset types needed for an offline app shell.
- **Where:** `vite.config.js:68` — `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`.
- **Expected:** at minimum `js,css,html` (+ `png,svg,ico,woff2` for icons/fonts).
- **Verify:** `grep -n globPatterns vite.config.js`. After build, inspect `dist/sw.js` precache manifest entries cover `index.html`, the main JS, the CSS, the woff2 fonts.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** woff2 in the precache is what makes self-hosted Inter render offline (D061).

### [13.021] Sentry + Dexie chunks are EXCLUDED from the install precache
- **Check:** The two heavy opt-in/destructive-only chunks are NOT in the first-install precache (weight budget).
- **Where:** `vite.config.js:86–89` — `globIgnores: ['**/assets/index-*.js', '**/assets/vendor-data-*.js']`.
- **Expected:** exactly those two globIgnore entries (Sentry `index-*.js` ~145 KB gzip; Dexie `vendor-data-*.js` ~32 KB gzip).
- **Verify:** `grep -nA3 globIgnores vite.config.js`. The `sw-cache-invariants.test.ts:83–95` already pins "exactly two `assets/` globIgnore entries".
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.022] cleanupOutdatedCaches is enabled (purge stale precache on SW activate)
- **Check:** When a new SW activates, the previous precache is purged.
- **Where:** `vite.config.js:90` — `cleanupOutdatedCaches: true`.
- **Expected:** `true`.
- **Verify:** `grep -n cleanupOutdatedCaches vite.config.js`; pinned by `sw-cache-invariants.test.ts:40`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** This cleans the PRECACHE only — NOT runtime caches. The §SW-STALE-404 bug was a *runtime* cache that this flag never touched. See [13.029].

### [13.023] Precache entries are revisioned (content-hash bust)
- **Check:** Hashed build assets carry a revision (the hash itself) so a new deploy's filenames bust the cache.
- **Where:** generated `dist/sw.js` precache manifest (`self.__WB_MANIFEST` / `precacheAndRoute([...])`).
- **Expected:** each precached hashed asset (`/assets/main-<hash>.js`, etc.) has `revision: null` (hash IS the revision) and non-hashed assets (`index.html`) carry a content `revision` string.
- **Verify:** build, then `grep -oE "\{url:\"[^\"]+\",revision:[^}]+\}" dist/sw.js | head` (or open `dist/sw.js`) → hashed assets `revision:null`, `index.html` has a revision hash.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** This is the mechanism that makes [13.039] cache-bust work. If `index.html` had `revision:null` with no hash, a deploy would NOT bust it.

### [13.024] Precache entry count + total size are within a sane budget
- **Check:** The precache isn't bloated (every entry is fetched on first install).
- **Where:** `dist/sw.js` precache manifest; build log `vite-plugin-pwa` "precache N entries (M KiB)".
- **Expected:** a bounded set (app shell + icons + fonts + route chunks), single-digit MB at most; the two heavy chunks excluded per [13.021]. Record the actual count + KiB.
- **Verify:** `npm run build 2>&1 | grep -iE "precache|entries"` (vite-plugin-pwa prints the count + size); or count entries in `dist/sw.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-link §14 perf (first-install weight on Maria-65 3G).

### [13.025] No source maps in the precache
- **Check:** `.map` files are not precached (and ideally not emitted).
- **Where:** `vite.config.js:173` — `sourcemap: false`; `globPatterns` does not list `map`.
- **Expected:** `sourcemap:false` so no maps emitted; `globPatterns` has no `map`.
- **Verify:** `grep -n "sourcemap" vite.config.js` → false; `ls dist/assets/*.map 2>/dev/null` → none.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 13.D — Navigation fallback (SPA deep links + the stale-404 guard)

### [13.026] navigateFallback serves the app shell for deep routes
- **Check:** A deep client-route request (e.g. `/app/progres`) falls back to `index.html` so the SPA boots + React Router resolves.
- **Where:** `vite.config.js:91` — `navigateFallback: '/index.html'`.
- **Expected:** `navigateFallback: '/index.html'`.
- **Verify:** `grep -n navigateFallback vite.config.js`; pinned by `sw-cache-invariants.test.ts:44`. Live: serve `dist/`, hard-navigate to `/app/progres` offline → app shell loads (no 404).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** This is WHY arbitrary client routes work offline AND why a static `/pulse-mock.html` that the SW intercepts as a navigation gets the index shell instead of the real file — call that out if a non-SPA HTML page is expected to render.

### [13.027] navigateFallbackDenylist excludes /assets/ (no HTML-masking a missing chunk)
- **Check:** A missing `/assets/*.js` returns a real 404, not an HTML-200 `index.html` (which would surface as a MIME error, masking the real failure).
- **Where:** `vite.config.js:99–105` — denylist includes `/^\/assets\//`.
- **Expected:** `/^\/assets\//` in `navigateFallbackDenylist`.
- **Verify:** `grep -nA6 navigateFallbackDenylist vite.config.js`; pinned by `sw-cache-invariants.test.ts:48`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Directly part of the §SW-STALE-404 fix — without it, the `antrenor:1 ...404` stale-chunk failure showed up as an HTML 200.

### [13.028] navigateFallbackDenylist excludes SW lifecycle + FCM worker
- **Check:** `sw.js`, `workbox-*`, `registerSW.js`, and `firebase-messaging-sw.js` bypass the SPA fallback (must hit network/cache directly).
- **Where:** `vite.config.js:100–104`.
- **Expected:** denylist contains `^\/sw\.js$`, `^\/workbox-`, `^\/registerSW\.js$`, `^\/firebase-messaging-sw\.js$`.
- **Verify:** `grep -nA6 navigateFallbackDenylist vite.config.js`; `sw-cache-invariants.test.ts:58–64` pins `sw.js` / `workbox-` / `registerSW.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** The FCM-worker denylist entry is NOT covered by the unit test (test only checks 3 of 5). If `firebase-messaging-sw.js` got the index shell, FCM registration would fail. Worth a dedicated live check.

---

## 13.E — Runtime caching (the stale-chunk class + offline data)

### [13.029] /assets runtime cache is SCOPED to ONLY the two globIgnored chunks
- **Check:** The `StaleWhileRevalidate` route does NOT match every same-origin `/assets/*.js` (the over-broad pattern that double-stored precached chunks → §SW-STALE-404).
- **Where:** `vite.config.js:155–165` — `urlPattern: ({url,sameOrigin}) => sameOrigin && (/\/assets\/index-[^/]*\.js$/.test(...) || /\/assets\/vendor-data-[^/]*\.js$/.test(...))`, `cacheName: 'app-assets-js'`.
- **Expected:** the urlPattern matches ONLY `index-*.js` + `vendor-data-*.js`, NOT a blanket `/assets/.*\.js$`.
- **Verify:** `grep -nB2 -A8 "app-assets-js" vite.config.js`; `sw-cache-invariants.test.ts:66–81` pins both the inclusion (`index-[^/]*\.js`, `vendor-data-[^/]*\.js`) and the anti-regression (`not /assets/.*\.js$`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** **This is the core stale-cache regression guard.** A broad pattern here is exactly what stranded a returning client on stale chunks after a deploy. Treat any broadening as `FAIL`.

### [13.030] Runtime-cached chunk set == precache globIgnores set (single source of truth)
- **Check:** Every chunk excluded from the precache is the set served by the runtime route — nothing double-cached, nothing uncacheable offline.
- **Where:** `vite.config.js:86–89` (globIgnores) ↔ `:155–165` (runtime route).
- **Expected:** both sides reference exactly `index-*.js` + `vendor-data-*.js`.
- **Verify:** `sw-cache-invariants.test.ts:83–95` enforces "exactly two `assets/` globIgnore entries"; cross-read the runtime route matches the same two.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** If someone adds a third globIgnore without a runtime route, that chunk fails offline; if they add a runtime route without a globIgnore, a precached chunk gets double-cached (regression).

### [13.031] Sentry + Dexie chunks ARE available offline after first online fetch
- **Check:** The two globIgnored chunks, though not precached, become offline-available via `StaleWhileRevalidate` once fetched online.
- **Where:** `vite.config.js:160` — `handler: 'StaleWhileRevalidate'` for `app-assets-js`.
- **Expected:** after one online load that triggers the Dexie import (export/delete flow) or Sentry opt-in, the chunk is in the `app-assets-js` cache and loads offline.
- **Verify:** Playwright on served `dist/`: trigger a Dexie-using flow online (Settings → Export, which lazy-imports `vendor-data`), confirm `caches.open('app-assets-js')` has the `vendor-data-*.js` entry; go offline, re-trigger → no network error.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Dexie offline-fail breaks Tier-1 IndexedDB export/delete — §S-13 rationale.

### [13.032] Firebase RTDB runtime cache is NetworkFirst with a short timeout
- **Check:** Firebase reads prefer the network (freshness) but fall back to cache offline, with a fast timeout.
- **Where:** `vite.config.js:106–125` — `urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*$/`, `handler: 'NetworkFirst'`, `networkTimeoutSeconds: 3`, `cacheName: 'firebase-cache'`.
- **Expected:** NetworkFirst, 3s timeout, maxEntries 50 / maxAge 24h.
- **Verify:** `grep -nA12 "firebaseio" vite.config.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Pattern only matches `*.firebaseio.com`. Verify against §08 — the app's RTDB host is `...europe-west1.firebasedatabase.app` (per `index.html:38` dns-prefetch + CSP `connect-src` `*.firebasedatabase.app`). **If RTDB traffic goes to `firebasedatabase.app`, this NetworkFirst route NEVER matches → no offline Firebase cache + no backgroundSync queue.** Flag as `FAIL`/`PARTIAL` pending §08 confirmation of the actual REST host.

### [13.033] Firebase write queue (BackgroundSync) replays on reconnect
- **Check:** Failed RTDB writes (PUT/POST/DELETE) while offline are queued and replayed when the network returns.
- **Where:** `vite.config.js:120–123` — `backgroundSync: { name: 'firebase-write-queue', options: { maxRetentionTime: 24*60 } }`.
- **Expected:** BackgroundSync plugin on the Firebase route, 24h retention.
- **Verify:** `grep -nA4 backgroundSync vite.config.js`. Live: offline, perform a write; reconnect; confirm the queued write replays (DevTools → Application → Background Sync, or the data lands server-side).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Soft-depends on §36-C1 conflict resolution; same host caveat as [13.032] — if the route doesn't match the real RTDB host, the queue never engages.

### [13.034] Google Fonts runtime cache (CacheFirst) — dead-or-alive check
- **Check:** Whether the gstatic/googleapis fonts route is still needed after the self-host migration (D061).
- **Where:** `vite.config.js:126–133` — `urlPattern: /fonts\.(googleapis|gstatic)\.com/`, `handler:'CacheFirst'`.
- **Expected:** EITHER the app still loads a Google-hosted font (route used) OR fonts are fully self-hosted (`@fontsource` per D061 + CSP `font-src 'self'`) and this route is dead config.
- **Verify:** `grep -n "font-src" index.html` → `'self'` only (no fonts.gstatic). `grep -rn "fonts.googleapis\|fonts.gstatic" src/ index.html` → if zero, the route is dead. CSP `font-src 'self'` would BLOCK any Google font fetch anyway.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Likely DEAD: D061 self-hosts Inter (Latin subset) + `index.html:36–37` says "Google Fonts preconnect removed post self-host" + CSP `font-src 'self'`. If dead, mark `PARTIAL` (harmless but misleading config) and recommend removal.

---

## 13.F — SW update flow (the Wave F glue — Daniel's exact pain)

### [13.035] UpdatePrompt drives the banner from the real registerSW(onNeedRefresh)
- **Check:** The new-version banner is driven by vite-plugin-pwa's `registerSW({ onNeedRefresh })`, NOT a dead custom event.
- **Where:** `UpdatePrompt.tsx:58–82` — dynamic `import('virtual:pwa-register')` → `registerSW({ onNeedRefresh(){ setNeedRefresh(true) } })`.
- **Expected:** banner appears only when `onNeedRefresh` fires (a new SW is installed + waiting).
- **Verify:** `grep -nE "virtual:pwa-register|onNeedRefresh|setNeedRefresh" UpdatePrompt.tsx`. Unit test `UpdatePrompt.test.tsx:38–65` mocks the virtual module + asserts the banner shows on `onNeedRefresh` and the CTA triggers `updateSW`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** §S-12 fixed the prior dead `'sw-updated'` custom event that nothing dispatched.

### [13.036] registration.update() forced on visibilitychange→visible
- **Check:** When the user returns to a visible tab/PWA, the app forces a SW update check (bypassing the browser's lazy navigation-only check).
- **Where:** `UpdatePrompt.tsx:52–53` (`handleVisibility`), `:76` (`addEventListener('visibilitychange', ...)`), `:44–50` (`checkForUpdate` → `registration.update()`).
- **Expected:** `document.addEventListener('visibilitychange', handleVisibility)`; on `visible`, `registration.update()` runs.
- **Verify:** `grep -nE "visibilitychange|visibilityState|registration.update" UpdatePrompt.tsx`. Live: install PWA, deploy a new build, background then foreground the PWA → within a foreground the UpdatePrompt should surface.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** **This is THE fix for Daniel's home-screen-launch stale build.** A home-screen PWA never navigates, so this visibility-driven `update()` is the primary path the new SW is even discovered.

### [13.037] registration.update() on a 30-min interval + initial nudge
- **Check:** While the app is open, it periodically re-checks for a new SW, and nudges once right after registration.
- **Where:** `UpdatePrompt.tsx:75` (`setInterval(checkForUpdate, 30*60*1000)`), `:79` (initial `checkForUpdate()`).
- **Expected:** a 30-min `setInterval` + one immediate `checkForUpdate()` inside `onRegisteredSW`.
- **Verify:** `grep -nE "setInterval|30 \* 60|checkForUpdate\(\)" UpdatePrompt.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Covers long-lived open sessions (gym session left open) without hammering the network.

### [13.038] Update is consent-gated — ZERO auto-reload
- **Check:** The new SW is NOT applied until the user taps "Actualizeaza"; the app does not reload mid-action.
- **Where:** `UpdatePrompt.tsx:109–116` — CTA `onClick={() => void updateSW?.()}`; `updateSW` is the registerSW return (applies + reloads only on call).
- **Expected:** `updateSW` is invoked only by the CTA; never auto-called. Pairs with `registerType:'prompt'` [13.003].
- **Verify:** `grep -nE "updateSW\?\(\)|onClick" UpdatePrompt.tsx`. Unit test `UpdatePrompt.test.tsx:59–62` asserts `updateSW` NOT called until the CTA click, then called once.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Anti-paternalism (Maria 65) — NU rip a workout mid-set to reload.

### [13.039] checkForUpdate bails safely when offline / no registration / 404
- **Check:** A failed update check does not throw or break the app.
- **Where:** `UpdatePrompt.tsx:44–50` — guards `cancelled || !registration`; `.catch(() => {})` on `registration.update()`.
- **Expected:** graceful no-op offline; no uncaught rejection.
- **Verify:** `grep -nE "registration.update\(\).catch|cancelled \|\| !registration" UpdatePrompt.tsx`. Unit: mount offline → no throw.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.040] UpdatePrompt cleans up listeners + interval on unmount
- **Check:** No leaked `setInterval` / `visibilitychange` listener after unmount.
- **Where:** `UpdatePrompt.tsx:87–91` — cleanup sets `cancelled=true`, `clearInterval`, `removeEventListener`.
- **Expected:** the effect returns a cleanup clearing the interval + removing the visibility listener.
- **Verify:** `grep -nE "clearInterval|removeEventListener|cancelled = true" UpdatePrompt.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.041] jsdom/SSR degrades gracefully (virtual:pwa-register absent)
- **Check:** In tests/SSR the `virtual:pwa-register` import rejects and the component falls back to a no-op (banner hidden, no crash).
- **Where:** `UpdatePrompt.tsx:84–86` — `.catch(() => {})`; comment `:24–26`.
- **Expected:** `import('virtual:pwa-register').catch(...)` → fallback no-op.
- **Verify:** `UpdatePrompt.test.tsx:18–36` — renders null + does not throw in jsdom.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.042] UpdatePrompt is mounted in the app shell on every route
- **Check:** The update banner can appear regardless of which tab the user is on.
- **Where:** `Layout.tsx:17` (import), `:73` (`<UpdatePrompt />`).
- **Expected:** `<UpdatePrompt />` rendered unconditionally in `Layout` (NOT gated by `inSession`).
- **Verify:** `grep -n "UpdatePrompt" Layout.tsx` → mounted at `:73`, no conditional.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Mounted always (unlike InstallPrompt which is `!inSession`-gated) — correct: a user mid-workout should still be told a new version is ready, but not auto-reloaded.

### [13.043] LIVE end-to-end: installed PWA receives an update without reinstall (the Daniel scenario)
- **Check:** An *installed* PWA, launched from the home-screen icon, surfaces the UpdatePrompt after a new deploy — WITHOUT a manual uninstall/reinstall.
- **Where:** whole flow — deploy bumps hashed assets + new `sw.js`; `UpdatePrompt.tsx` visibility/interval `update()` discovers it; banner → CTA → reload.
- **Expected:** install from `andura.app` → deploy a new build → reopen the installed PWA (or foreground it / wait ≤30 min) → "Versiune noua" banner appears → tap "Actualizeaza" → app reloads to the new build. No reinstall needed.
- **Verify:** Requires a real deployed origin + an install-capable device/Chromium installed mode. Steps: (1) install the current live build; (2) deploy a trivially-visible change; (3) background+foreground the installed PWA; (4) assert the UpdatePrompt shows; (5) tap CTA; (6) assert the new build renders. On desktop Chromium, emulate via `navigator.serviceWorker.getRegistration().then(r=>r.update())` after swapping the served `dist/`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** **This is the headline check of the whole section.** If it cannot be run against a live origin, mark `BLOCKED` with the reason (no deployed two-version pair) — do NOT pass it on unit-test evidence alone. The Wave F glue ([13.036]/[13.037]) is the mechanism; this step proves it actually reaches the installed client.

### [13.044] Returning-client stale-serve window is bounded (no permanent stale)
- **Check:** A returning client may serve cached content until the new SW activates, but this is a bounded window, not a permanent stale (the OLD bug).
- **Where:** SW lifecycle — `registerType:'prompt'` means the new SW waits in `installed` until the user consents; the OLD SW keeps serving until then.
- **Expected:** the stale window lasts only until the next foreground/30-min check surfaces the prompt + the user taps Actualizeaza. There is NO state where a fresh deploy is unreachable forever (the pre-Wave-F bug).
- **Verify:** Same harness as [13.043]; additionally confirm `cleanupOutdatedCaches:true` + revisioned precache ([13.022]/[13.023]) so the OLD precache is purged once the new SW activates.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Honest framing: with `'prompt'` the user MUST tap the CTA for the swap; if they keep dismissing/ignoring, they stay on the old build by design (consent). "Reliable update" = the prompt reliably *appears*, not that it auto-applies.

### [13.045] HONEST NOTE — TWA / Play-Store wrapper does NOT fix SW cache
- **Check:** Document that wrapping the PWA in a TWA (Android Trusted Web Activity, the planned Play-Store path) does not change SW caching behavior.
- **Where:** N/A (architectural note); ties to the launch-distribution decision (PWA → Play Store via TWA).
- **Expected:** the audit explicitly records that a TWA loads the SAME web app through the SAME service worker + caches; it adds a Play-Store shell but the stale-cache class is identical. The fix lives in the SW update glue ([13.036]/[13.037]), not the wrapper.
- **Verify:** Documentation assertion — confirm no one believes "ship via TWA → stale build solved". Cross-link the launch-distribution decision.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Record as `PASS` once the note is acknowledged in the audit; it exists to prevent a false "the store wrapper handles updates" assumption.

---

## 13.G — Install flow (InstallPrompt)

### [13.046] beforeinstallprompt is captured + default-prevented
- **Check:** The native mini-infobar is suppressed and the event deferred for a custom CTA.
- **Where:** `InstallPrompt.tsx:32–39` — `addEventListener('beforeinstallprompt', handler)`, `e.preventDefault()`, `setDeferredEvent(e)`.
- **Expected:** event captured, `preventDefault()` called, stored in state.
- **Verify:** `grep -nE "beforeinstallprompt|preventDefault|setDeferredEvent" InstallPrompt.tsx`. Unit `InstallPrompt.test.tsx:25–32` dispatches the event → banner renders.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.047] Install CTA calls the deferred prompt + reads userChoice
- **Check:** Tapping "Instaleaza" triggers the real native install dialog.
- **Where:** `InstallPrompt.tsx:41–48` — `await deferredEvent.prompt()`, `await deferredEvent.userChoice`, clears on `accepted`.
- **Expected:** `prompt()` called; `userChoice` awaited; `accepted` clears the deferred event (banner gone).
- **Verify:** `grep -nE "deferredEvent.prompt|userChoice|outcome" InstallPrompt.tsx`. Unit `InstallPrompt.test.tsx:53–69` asserts the deferred prompt fn is called.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.048] Dismiss persists to localStorage + suppresses future prompts
- **Check:** Dismissing the banner sets a flag so it does not re-nag on later mounts.
- **Where:** `InstallPrompt.tsx:20` (`DISMISS_KEY='wv2-install-prompt-dismissed'`), `:50–58` (handleDismiss → localStorage set), `:24–30` (initial read).
- **Expected:** dismiss → `localStorage['wv2-install-prompt-dismissed']='1'`; subsequent mount reads it and renders null.
- **Verify:** `grep -nE "wv2-install-prompt-dismissed|localStorage" InstallPrompt.tsx`. Unit `InstallPrompt.test.tsx:34–51` covers both persist + post-dismiss-no-render.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.049] localStorage failures degrade gracefully (private mode)
- **Check:** A throwing `localStorage` (Safari private mode / disabled) does not crash the prompt.
- **Where:** `InstallPrompt.tsx:24–30` (try/catch on read), `:51–55` (try/catch on write → in-memory dismiss).
- **Expected:** read/write wrapped in try/catch; falls back to in-memory dismiss.
- **Verify:** `grep -nE "try \{|catch" InstallPrompt.tsx` around the localStorage calls.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.050] InstallPrompt is hidden during a live workout session
- **Check:** The install banner does not appear mid-set (anti-misclick / focus).
- **Where:** `Layout.tsx:74` — `{!inSession && <InstallPrompt />}`; `inSession` from `IN_SESSION_ROUTES` (`:31–35`).
- **Expected:** InstallPrompt mounted only when NOT on `/app/antrenor/workout|post-rpe|post-summary`.
- **Verify:** `grep -nE "inSession|InstallPrompt" Layout.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.051] InstallPrompt renders null when no deferred event (no false banner)
- **Check:** Without a `beforeinstallprompt` (already installed, iOS, unsupported), the banner does not show.
- **Where:** `InstallPrompt.tsx:60` — `if (dismissed || !deferredEvent) return null`.
- **Expected:** returns null absent a deferred event.
- **Verify:** `InstallPrompt.test.tsx:20–23` — renders nothing when no event fired.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.052] iOS install path — fallback copy is honest (no beforeinstallprompt on iOS)
- **Check:** iOS Safari (no `beforeinstallprompt`) is handled — currently the banner simply never shows; the iOS hints in `index.html` cover the manual Add-to-Home path.
- **Where:** `InstallPrompt.tsx:5–8` comment ("iOS Safari: no beforeinstallprompt — fallback hidden (post-Beta detect navigator.standalone + instructional copy)"); `index.html:31–34` iOS meta.
- **Expected:** on iOS the prompt is silently absent (acceptable pre-Beta) and the manual A2HS still produces a standalone app via the iOS meta tags.
- **Verify:** `grep -n "navigator.standalone\|beforeinstallprompt" InstallPrompt.tsx` — confirm no iOS-specific instructional UI yet; verify the iOS meta hints exist (see [13.018]).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Deliberate post-Beta gap. Mark `PARTIAL` only if a missing iOS A2HS instruction is judged a real Gigel/Maria iPhone blocker; otherwise `PASS` with the gap recorded.

### [13.053] InstallPrompt overlay does not intercept taps on content beneath
- **Check:** The fixed install layer is `pointer-events-none` except the visible card, so it doesn't swallow taps (e.g. Istoric rows).
- **Where:** `InstallPrompt.tsx:67` (`pointer-events-none` on the layer), `:73` (`pointer-events-auto` on the card).
- **Expected:** outer layer `pointer-events-none`, card `pointer-events-auto`.
- **Verify:** `grep -nE "pointer-events-none|pointer-events-auto" InstallPrompt.tsx`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** E2E-01 idiom (mirrors ToastViewport).

---

## 13.H — Offline UX (OfflineBanner + useNetworkStatus)

### [13.054] OfflineBanner shows a steady banner when offline
- **Check:** Going offline surfaces a persistent "Esti offline…" banner.
- **Where:** `OfflineBanner.tsx:42–54` (offline branch); `useNetworkStatus.ts:70–74` (`handleOffline`).
- **Expected:** `status==='offline'` → banner with `data-state="offline"`, text `t('offlineBanner.offline')`.
- **Verify:** Unit `OfflineBanner.test.tsx`; live (served dist): DevTools offline → banner appears.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.055] OfflineBanner shows a transient "Reconectat" on reconnect
- **Check:** offline→online flips to a ~3s green "Reconectat" confirmation then hides.
- **Where:** `OfflineBanner.tsx:23–39` (reconnected branch); `useNetworkStatus.ts:55–68` (`handleOnline` → 3s flash via `RECONNECT_FLASH_MS=3000`).
- **Expected:** transient `reconnected` state ~3s then `online` (banner gone).
- **Verify:** `grep -nE "reconnected|RECONNECT_FLASH_MS|3000" useNetworkStatus.ts`; unit test on the hook/banner.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.056] useNetworkStatus is pure event-driven (no polling) + cleans up
- **Check:** The hook uses `online`/`offline` events (no `setInterval` polling) and removes listeners + clears the flash timer on unmount.
- **Where:** `useNetworkStatus.ts:76–85` — add/remove `online`/`offline` listeners + `clearFlash`.
- **Expected:** no polling; cleanup removes both listeners + clears the timer.
- **Verify:** `grep -nE "addEventListener\('online'|addEventListener\('offline'|setInterval|clearTimeout" useNetworkStatus.ts` → events present, no setInterval.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** §36 LOW-L3 preserved (no polling).

### [13.057] useNetworkStatus is SSR/jsdom-safe
- **Check:** Absent `navigator`/`window` defaults to 'online' and skips listeners.
- **Where:** `useNetworkStatus.ts:34–37` (`typeof navigator === 'undefined'` → online), `:76` (`typeof window === 'undefined'` → no-op).
- **Expected:** safe defaults, no throw.
- **Verify:** `grep -nE "typeof navigator|typeof window" useNetworkStatus.ts`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

### [13.058] App shell + cached data work offline; network-only flows fail gracefully
- **Check:** Offline, the app shell + cached IndexedDB data render; network-only flows (Firebase sync, magic-link) are clearly signalled, not silent crashes.
- **Where:** precache app shell ([13.020]); IndexedDB per-UID (§08); Firebase NetworkFirst ([13.032]); OfflineBanner signals "sync paused".
- **Expected:** offline → navigate tabs, view seeded data (IndexedDB), banner shows "datele se salveaza local. Sync reluat la conexiune"; attempting a magic-link / fresh Firebase read shows a graceful state, not a white screen.
- **Verify:** Playwright on served `dist/` with a SEEDED account: go offline → navigate the 4 tabs (render OK from cache) → confirm banner copy → trigger a sync-requiring action → assert graceful messaging.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Magic-link auth inherently needs network (the email round-trip) — offline failure is expected; verify it's communicated, not a crash. Cross-link §08 + §12.

### [13.059] E2E: SW registers + precache populates on the served build
- **Check:** On a built+served (or live) build, a SW registers and the precache fills (offline shell ready).
- **Where:** `tests/smoke-react.spec.ts:104–147`.
- **Expected:** SW registration found within 5s; a populated Cache Storage entry within ~12s (soft-asserted).
- **Verify:** `npx playwright test smoke-react.spec.ts -g "PWA offline"` against `dist/` preview (or live). On a dev build it self-skips (`:120–122`) — re-run against a prod build so it does NOT skip.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** A `test.skip` here = BLOCKED for this section's offline proof, NOT a pass. Must run on a prod build.

---

## 13.I — i18n of PWA strings (cross-link §09)

### [13.060] InstallPrompt strings are all via t() (no hardcode)
- **Check:** title/subtitle/CTA/aria are `t('install.*')`, not literals.
- **Where:** `InstallPrompt.tsx:72` (ariaLabel), `:79` (title), `:80` (subtitle), `:88` (installCta), `:94` (dismissAria).
- **Expected:** every visible/aria string is `t('install.*')`.
- **Verify:** `grep -nE "Instaleaza|Acces rapid" InstallPrompt.tsx` → ZERO hardcoded literals (this is the WORKED EXAMPLE [09.001] regression guard — confirm it is now via `t()`).
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** The §09 worked example flagged this file historically; confirm the current source uses `t('install.title')` etc. (lines above) — appears FIXED, verify at audit time.

### [13.061] install.* keys exist + match in en.json and ro.json
- **Check:** Every `install.*` key used by the component exists in both locales.
- **Where:** `en.json:1961–1969`, `ro.json:1961–1969` — `title, subtitle, installCta, ariaLabel, dismissAria` (+ legacy `prompt, dismissCta`).
- **Expected:** all five used keys present in both; RO no-diacritics.
- **Verify:** `grep -nA8 '"install"' src/i18n/en.json src/i18n/ro.json`; confirm `title/subtitle/installCta/ariaLabel/dismissAria` in both.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** `install.prompt` + `install.dismissCta` exist in BOTH locales but are NOT referenced by `InstallPrompt.tsx` (component uses `subtitle` + `dismissAria` instead) → DEAD keys. Mark `PARTIAL`; recommend pruning. Per WORKED EXAMPLE [09.001], the live component IS internationalized (FAIL there was a historical snapshot).

### [13.062] updatePrompt.* keys exist + match (en/ro)
- **Check:** `updatePrompt.ariaLabel/title/body/updateCta` exist in both locales.
- **Where:** `UpdatePrompt.tsx:100,106,107,115`; `en.json:1989–1994`, `ro.json:1989–1994`.
- **Expected:** all four keys in both; RO no-diacritics ("Versiune noua", "Actualizeaza").
- **Verify:** `grep -nA5 '"updatePrompt"' src/i18n/en.json src/i18n/ro.json`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Harness i18n'd this banner ("now i18n'd by the harness" per the section brief) — confirm no literal "Versiune noua" remains in the TSX.
### [13.063] offlineBanner.* keys exist + match (en/ro)
- **Check:** `offlineBanner.reconnected` + `offlineBanner.offline` exist in both locales.
- **Where:** `OfflineBanner.tsx:37,52`; `en.json:1984–1987`, `ro.json:1984–1987`.
- **Expected:** both keys in both locales; RO no-diacritics.
- **Verify:** `grep -nA3 '"offlineBanner"' src/i18n/en.json src/i18n/ro.json`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Note a separate legacy `offline.banner` key may exist (`en.json:1957–1958`) — check it is not a stale duplicate.

### [13.064] PWA strings are no-diacritics (D-LEGACY-064)
- **Check:** All RO PWA strings + manifest description obey the no-diacritics rule.
- **Where:** `ro.json` `install.*`/`updatePrompt.*`/`offlineBanner.*`; `vite.config.js:53` description.
- **Expected:** zero `ăâîșțĂÂÎȘȚ`.
- **Verify:** `grep -nE "[ăâîșțĂÂÎȘȚ]" <(jq -r '.install,.updatePrompt,.offlineBanner' src/i18n/ro.json)` → none; InstallPrompt unit `InstallPrompt.test.tsx:71–78` already asserts no-diacritics in rendered text.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:**

---

## 13.J — Cache invalidation on deploy + the second (FCM) service worker

### [13.065] Deploy emits new hashed assets that bust the cache
- **Check:** A new deploy produces different `/assets/*-<hash>.js|css` filenames + a new `sw.js`, so the precache references the new files.
- **Where:** Vite content-hash output (`build.rollupOptions.output`); `.github/workflows/deploy.yml`.
- **Expected:** changing source → different asset hashes → new precache manifest in `dist/sw.js` → returning client's new SW fetches the new files.
- **Verify:** build twice with a trivial source change between → `diff <(ls dist/assets) <(ls dist/assets)` shows changed hashes; the precache list in `dist/sw.js` references the new names.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Pairs with [13.023] revisioning — this is the bust mechanism.

### [13.066] The SW version bumps on each deploy
- **Check:** `dist/sw.js` content changes per deploy (so `registration.update()` detects a byte-different SW → triggers install).
- **Where:** generated `dist/sw.js` (precache manifest hash embedded).
- **Expected:** `sw.js` bytes differ between two builds with changed assets (the embedded `__WB_MANIFEST` revisions change).
- **Verify:** build twice with a change → `cmp dist/sw.js dist_prev/sw.js` → differ.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** If `sw.js` were byte-identical across deploys, the browser would NOT see a "new SW" → no update — the original stale-build class. Confirm it changes.

### [13.067] FCM service worker (firebase-messaging-sw.js) is a SEPARATE SW with its own scope
- **Check:** The FCM background worker is distinct from the workbox SW and registered under a dedicated scope (no collision).
- **Where:** `public/firebase-messaging-sw.js`; registered in `src/react/lib/pushNotifications.ts` with scope `/firebase-cloud-messaging-push-scope`.
- **Expected:** two SWs: workbox `/sw.js` (root scope) + FCM `/firebase-messaging-sw.js` (dedicated push scope). They do not clobber each other.
- **Verify:** `grep -nE "firebase-cloud-messaging-push-scope|register\(" src/react/lib/pushNotifications.ts`; live: `navigator.serviceWorker.getRegistrations()` shows both with distinct scopes.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-link §28 push. The FCM SW is NOT managed by vite-plugin-pwa updates — it's a static `public/` file; verify it has its own update consideration (it's small + rarely changes).

### [13.068] FCM SW config placeholders are flagged (not real secrets, but must be filled pre-launch)
- **Check:** The hardcoded Firebase web config in the FCM SW is clearly a placeholder + must be replaced before push works.
- **Where:** `public/firebase-messaging-sw.js:31–33` — `apiKey:'PLACEHOLDER_WEB_API_KEY'`, `messagingSenderId:'PLACEHOLDER_SENDER_ID'`, `appId:'PLACEHOLDER_APP_ID'`.
- **Expected:** placeholders present + documented as non-secret web config to be filled pre-launch (per the file's own comment) — push background messages will NOT work until replaced.
- **Verify:** `grep -nE "PLACEHOLDER_" public/firebase-messaging-sw.js`.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Pre-launch blocker for push (NOT a security secret per Firebase docs). Cross-link §12 secrets + §28 push. Record as `PARTIAL` (works as scaffold, push dead until filled).

### [13.069] SW + manifest are served with correct MIME + no-cache headers (host-dependent)
- **Check:** `sw.js` is served as JS and ideally with a short/zero max-age so the browser re-checks it (the SW itself must not be HTTP-cached long).
- **Where:** host config (GH Pages / andura.app). GH Pages cannot set custom headers (`index.html:9–15` accepts this).
- **Expected:** `GET /sw.js` → `content-type: text/javascript`; browser updates SW via `registration.update()` regardless (it bypasses HTTP cache for sw.js by spec on update calls).
- **Verify:** live: `curl -sI https://andura.app/sw.js` → content-type JS; observe response cache headers.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Modern browsers bypass HTTP cache for the SW script on `update()` (and after 24h) per spec, so even a default-cached `sw.js` updates — but a long-cached `sw.js` slows discovery. The Wave F `registration.update()` ([13.036]) explicitly forces the bypass, which is the safety net for GH-Pages default caching. BLOCKED unless a live origin is available.

---

## 13.K — Mobile (real PWA — the gym device) vs desktop

### [13.070] Installed standalone mode renders edge-to-edge (no browser chrome)
- **Check:** On the gym phone, the installed PWA launches standalone (no URL bar), portrait, full-bleed.
- **Where:** manifest `display:'standalone'` + `orientation:'portrait'`; `index.html:5` viewport `viewport-fit=cover`.
- **Expected:** standalone, portrait, safe-area-aware (notch) via `viewport-fit=cover`.
- **Verify:** install on a real Android device (or Chromium installed mode) → confirm no URL bar, portrait lock, content respects safe-area insets.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Desktop install (Chromium) is a windowed PWA — verify it also launches + the BottomNav/SubHeader layout holds (cross-link the desktop phone-frame note + §11/§14).

### [13.071] Installed PWA respects safe-area insets (notch / home indicator)
- **Check:** Fixed chrome (BottomNav, banners) is not occluded by the notch/home indicator in standalone.
- **Where:** `index.html:5` `viewport-fit=cover`; CSS `env(safe-area-inset-*)` usage (global.css / nav).
- **Expected:** `viewport-fit=cover` + safe-area-inset padding so BottomNav sits above the home indicator.
- **Verify:** `grep -n "viewport-fit" index.html`; `grep -rn "safe-area-inset" src/` ; visual on a notched device / DevTools device emulation.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Cross-link §11 parity + §10 a11y (tap targets not under the indicator).

### [13.072] Status-bar tint matches app surface in standalone (theme_color)
- **Check:** The Android status bar tint = `theme_color`; iOS status bar = `apple-mobile-web-app-status-bar-style`.
- **Where:** manifest `theme_color` ([13.013]); `index.html:33` iOS status-bar-style.
- **Expected:** status bar matches the Pulse-dark surface.
- **Verify:** install + screenshot the status bar region.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(authoring note — depends on [13.013] mismatch)*
- **Evidence:** Until [13.013] is fixed, Android status bar tints to the OLD `#c8412e` brick (manifest) while the app is Pulse-dark `#090b13` → visible mismatch on the gym device.
- **Notes:** Fixing [13.013] resolves this too.

### [13.073] No SW on dev server (developer-experience guard)
- **Check:** `npm run dev` does NOT register a SW (avoids caching dev assets + HMR breakage).
- **Where:** `vite.config.js:168` `devOptions.enabled:false`.
- **Expected:** dev → `navigator.serviceWorker.getRegistration()` is undefined.
- **Verify:** run dev server, in console `navigator.serviceWorker.getRegistration()` → undefined/null.
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:**
- **Notes:** Inverse of [13.059]; confirms the prod-only nature of the SW.

---

## SECTION 13 SCORECARD (fill at audit time)

```
13.A config           PASS  PART  FAIL  BLOCK   (steps 13.001–006)
13.B manifest         ...                        (13.007–019)
13.C precache         ...                        (13.020–025)
13.D nav-fallback     ...                        (13.026–028)
13.E runtime-cache    ...                        (13.029–034)
13.F update-flow      ...                        (13.035–045)
13.G install          ...                        (13.046–053)
13.H offline-ux       ...                        (13.054–059)
13.I i18n             ...                        (13.060–064)
13.J invalidation/FCM ...                        (13.065–069)
13.K mobile/desktop   ...                        (13.070–073)
SECTION 13 TOTAL      --    --    --    --    --%   GATE 95%   ----
```

**Authoring-time pre-flagged findings (verify, do not assume):**
- **[13.013]/[13.014]/[13.018]/[13.072] — manifest palette drift:** `theme_color:'#c8412e'` + `background_color:'#faf7f1'` are PRE-Pulse (old brick/cream); HTML theme-color + FOUC shell are `#090b13` (Pulse-dark). Installed-PWA status bar + splash render the old palette. **Fix in `vite.config.js` manifest.**
- **[13.032]/[13.033] — Firebase runtime cache host mismatch (suspected):** the NetworkFirst route matches `*.firebaseio.com`, but the app's RTDB host appears to be `*.firebasedatabase.app` (CSP + dns-prefetch). If so, offline Firebase cache + the write-replay queue never engage. **Confirm against §08.**
- **[13.034] — dead Google-Fonts runtime route:** likely unused post self-host (D061) + CSP `font-src 'self'`. Harmless but misleading config.
- **[13.061] — dead i18n keys:** `install.prompt` + `install.dismissCta` exist in both locales but are unused by the component.
- **[13.043]/[13.059] — the headline checks (installed-PWA update + SW precache) require a live/served prod build;** if no two-version live pair is available, record `BLOCKED` with the reason — do NOT pass on unit-test evidence alone. Per scoring, >5% BLOCKED fails the section, so a real served `dist/` (or `andura.app`) is required to clear the gate honestly.
- **[13.045] — TWA does NOT fix SW cache:** documented anti-assumption for the launch-distribution path.
```
