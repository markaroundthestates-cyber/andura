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
      registerType: 'autoUpdate',
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
        theme_color: '#c8412e',
        background_color: '#faf7f1',
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
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
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
        manualChunks: {
          // Phase 5 task_20 vendor split: react + zustand stack into
          // separate chunk pentru better caching cross-deploys.
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand'],
          'vendor-icons': ['lucide-react'],
          'vendor-data': ['dexie'],
        },
      },
    },
    // Phase 5 task_20: chunk size warning threshold (default 500). Raise
    // for known vendor chunks; main chunks should stay under default.
    chunkSizeWarningLimit: 600,
  },
});
