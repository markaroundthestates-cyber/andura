import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Phase 5 task_20 — bundle optimization + manual chunks pentru vendor split
// + production minify defaults. PWA manifest existing public/manifest.json
// Phase 6+ adds service worker via vite-plugin-pwa cand decision LOCKED.

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // smaller bundle prod
    rollupOptions: {
      input: {
        main: 'index.html',
        'react-test': 'react-test.html',
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
