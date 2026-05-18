import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Phase 5 task_20 — bundle optimization + manual chunks pentru vendor split
// + production minify defaults.
//
// Phase 6 task_21 — vite-plugin-pwa service worker offline mode + PWA
// install prompt + auto-update notification. Generates dist/sw.js +
// dist/manifest.webmanifest production build. devOptions.enabled=false →
// dev mode skip (HMR conflicts cu SW lifecycle).

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Andura',
        short_name: 'Andura',
        description: 'Coach AI personal pentru sala — facut in Romania',
        theme_color: '#c8412e',
        background_color: '#f5f0e8',
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
