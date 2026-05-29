import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Phase 5 task_20 — bundle optimization + manual chunks pentru vendor split
// + production minify defaults.
//
// Phase 6 task_21 — vite-plugin-pwa service worker offline mode + PWA
// install prompt + auto-update notification. Generates dist/sw.js +
// dist/manifest.webmanifest production build. devOptions.enabled=false →
// dev mode skip (HMR conflicts cu SW lifecycle).

export default defineConfig({
  base: '/',
  // §1-C2 audit fix: strip console.*/debugger in production bundles (data privacy
  // + DevTools-driven perf cost + anti-surveillance branding §43.8). Dev mode
  // preserves console (drop is build-only via esbuild minify step).
  esbuild: {
    drop: ['console', 'debugger'],
  },
  // §B014 audit fix (CODE-REVIEW L-4) — path aliases pentru import readability.
  // Forward-compat: existing imports (relative) keep working; new code can use @-prefix.
  resolve: {
    alias: {
      '@auth': fileURLToPath(new URL('./src/auth.js', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/react/routes', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/react/stores', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/react/components', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/react/lib', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // §S-12 audit fix (AUDIT-3) — 'prompt' (not 'autoUpdate'). autoUpdate
      // silently skipWaiting+clientsClaim → SW could swap assets mid-session
      // without consent (anti Maria 65 anti-paternalism). 'prompt' keeps the
      // new SW waiting until the user taps "Actualizeaza" in UpdatePrompt,
      // which drives the reload via registerSW({ onNeedRefresh }).
      registerType: 'prompt',
      // LOCK V1 D060 — PWA quadruple optimization (defer + lazy + precache + modulepreload) (DECISIONS.md §D060)
      // Perf chat 5 (LIGHTHOUSE-PERF-AUDIT) — eliminate 952ms render-block
      // on registerSW.js. Default 'auto' injects <script src="/registerSW.js">
      // in <head> blocking render. 'script-defer' adds defer attribute so
      // browser keeps parsing HTML in parallel, SW registration runs post
      // DOMContentLoaded. Maria 65 mobile 3G LCP improvement ~1s estimated.
      injectRegister: 'script-defer',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Andura',
        short_name: 'Andura',
        description: 'Coach AI personal pentru sala — facut in Romania',
        // Pulse-dark palette (D094) — match index.html theme-color #090b13 +
        // global.css --paper dark token (Pulse --bg phone near-black blue).
        // Installed Android splash + status bar render Pulse, not old terracotta.
        theme_color: '#090b13',
        background_color: '#090b13',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ro-RO',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // LOCK V1 D060 — PWA quadruple optimization §3 SW precache excludes (DECISIONS.md §D060)
        // Perf chat 5 HIGH ROI #3 (ROUTE_LAZY_LOAD_INVESTIGATION) — exclude
        // Sentry chunk din precache install. Sentry lazy import pe opt-in
        // telemetry only (src/util/sentry.js:26 await import('@sentry/browser')).
        // Rollup default chunk name pentru dynamic imports fara name = 'index'
        // → assets/index-<hash>.js = Sentry chunk (~145 KB gzip). Users care NU
        // opt-in primesc precache install fara reason; SW runtime cache still
        // serves Sentry on-demand cand initSentry trigger-uie import.
        // Maria 65 mobile 3G install UX: -145 KB gzip first install.
        //
        // Perf chat 5 VENDOR_DATA_LAZY_INVESTIGATION — extend pattern Sentry
        // pentru vendor-data chunk (Dexie ~32 KB gzip). Dexie lazy import doar
        // din DeleteAccountConfirm + SettingsExport (destructive actions).
        // Users care NU sterg cont la primul touch primesc precache fara
        // reason; SW runtime cache still serves Dexie on-demand prin
        // NetworkFirst cand action destructive trigger import.
        // Maria 65 + Gigel first-install: -32 KB gzip install UX.
        globIgnores: [
          '**/assets/index-*.js',
          '**/assets/vendor-data-*.js',
        ],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        // §SW-STALE-404 fix — exclude non-navigation paths from the SPA
        // navigation fallback. Without a denylist the NavigationRoute returns
        // /index.html (HTML) for ANY navigation-mode request, which can mask a
        // genuinely-missing /assets/* chunk or sub-SW as an HTML 200 (MIME
        // error) instead of a clean 404. /assets/ (hashed build output),
        // sw.js + workbox-* + registerSW.js (SW lifecycle), and the FCM worker
        // must hit the network/cache directly, never the app shell.
        navigateFallbackDenylist: [
          /^\/assets\//,
          /^\/sw\.js$/,
          /^\/workbox-/,
          /^\/registerSW\.js$/,
          /^\/firebase-messaging-sw\.js$/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              // §36-H1 audit fix — Queued operations replay on reconnect.
              // BackgroundSync scaffold registered pe Firebase RTDB writes
              // (PUT/POST/DELETE). Soft dep §36-C1 — full sync conflict
              // resolution depends on CRIT wave resolution. See §36-C1.
              // Workbox BackgroundSync plugin retries failed writes when
              // browser detects network restored (max 24h queue lifetime).
              backgroundSync: {
                name: 'firebase-write-queue',
                options: { maxRetentionTime: 24 * 60 }, // minutes
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // §S-13 audit fix (AUDIT-3) — runtime cache for the two chunks that
          // globIgnores keeps OUT of the precache: index-*.js (Sentry) +
          // vendor-data-*.js (Dexie). They are excluded from install precache
          // for first-load weight, but without a runtime cache they failed to
          // load offline. Dexie offline-fail breaks Tier 1 IndexedDB (export +
          // delete flows lazy-import vendor-data) — notable for a local-first
          // PWA. StaleWhileRevalidate makes both available offline after first
          // fetch while still updating in the background on the next online load.
          //
          // §SW-STALE-404 fix — SCOPE this route to ONLY those two globIgnored
          // chunks. The prior pattern matched EVERY same-origin /assets/*.js,
          // which double-stored the precached hashed chunks (main, vendor-react,
          // route chunks like Antrenor-<hash>.js) in a second cache that
          // cleanupOutdatedCaches never purges (it cleans the precache only).
          // After a deploy the SW served those stale runtime copies, and once
          // an entry was evicted (maxEntries 60 / 30d) the stale shell fetched a
          // hashed chunk the new deploy had already replaced → 404 (observed as
          // `antrenor:1 ...404` when opening the Antrenor tab). Precached hashed
          // chunks are content-addressed (hash = revision) + self-cleaned on SW
          // activation, so they need NO runtime cache. Only the globIgnored two
          // belong here. globIgnores list above is the single source of truth.
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin &&
              (/\/assets\/index-[^/]*\.js$/.test(url.pathname) ||
                /\/assets\/vendor-data-[^/]*\.js$/.test(url.pathname)),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-assets-js',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false, // smaller bundle prod
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        // Phase 5 task_20 vendor split: react + zustand stack into
        // separate chunk pentru better caching cross-deploys.
        //
        // Perf 2026-05-27 (size-limit ratchet) — manualChunks function form
        // so we can match src/ paths, not just node_modules. The 657-exercise
        // dataset (src/engine/exerciseLibrary.js ~485 KB raw — nameRo +
        // equipment_type + muscle_target per record) plus the equipmentMap +
        // muscleGroupMap static lookup tables previously landed in main,
        // pushing it over the 135 KB gzip budget. Routing them into a
        // dedicated 'data-library' chunk pulls that compressible static
        // payload out of main. STATIC split only — engine pipeline stays sync
        // (WP-7 lazy-load consciously deferred, session builder stabilized
        // 2026-05-27).
        //
        // The 4 vendor splits below reproduce the prior object-form behavior
        // exactly so vendor chunks do not regress: vendor-react keeps the
        // react core + react-router stack, while react-dom (incl. the
        // react-dom-client production build) + scheduler are imported directly
        // by the app entry and stay in main, matching the object form which
        // never grouped them into vendor-react.
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('node_modules')) {
            if (/node_modules\/(react-dom|scheduler)\//.test(normalized)) {
              return undefined;
            }
            if (/node_modules\/(react|react-router|react-router-dom|@remix-run\/router)\//.test(normalized)) {
              return 'vendor-react';
            }
            if (/node_modules\/zustand\//.test(normalized)) {
              return 'vendor-state';
            }
            if (/node_modules\/lucide-react\//.test(normalized)) {
              return 'vendor-icons';
            }
            if (/node_modules\/dexie\//.test(normalized)) {
              return 'vendor-data';
            }
            return undefined;
          }
          if (/src\/engine\/(exerciseLibrary|equipmentMap|muscleGroupMap)\.js$/.test(normalized)) {
            return 'data-library';
          }
          return undefined;
        },
      },
    },
    // Phase 5 task_20: chunk size warning threshold (default 500). Raise
    // for known vendor chunks; main chunks should stay under default.
    chunkSizeWarningLimit: 600,
  },
});
