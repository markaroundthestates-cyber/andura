# task_21 — vite-plugin-pwa Service Worker

**Phase:** 6 (polish pre-Beta)
**Type:** Feature — Service Worker offline mode + PWA install
**Deps:** task_20 LANDED
**Backup tag:** `pre-phase6-task-21-2026-05-18`
**Est commits:** 1 atomic
**Est tests delta:** +3-6

---

## §1 Scope

Phase 5 task_20 `public/manifest.json` enrich LANDED + Vite manual chunks vendor split. NU service worker. Phase 6 adds `vite-plugin-pwa` cu service worker pentru offline mode + PWA install prompt + auto-update notification.

PWA install mandatory Android primary target (Maria 65 + Marius). Offline mode critical pentru gym low-connectivity environments.

## §2 Changes

### A. Install dependency

```bash
npm install --save-dev vite-plugin-pwa workbox-window
```

### B. `vite.config.js` (extend)

```js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Andura',
        short_name: 'Andura',
        description: 'Coach AI personal pentru sala — facut in Romania',
        theme_color: '#1a3d2b',
        background_color: '#0f1f17',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
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
        ],
      },
      devOptions: { enabled: false }, // dev mode skip — only build production
    }),
  ],
});
```

### C. NEW `src/react/components/UpdatePrompt.tsx`

Auto-update notification banner când service worker detects new version:
```tsx
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  if (!needRefresh[0]) return null;
  return (
    <div className="update-prompt">
      <span>Versiune noua disponibila</span>
      <button onClick={() => updateServiceWorker(true)}>Actualizeaza</button>
    </div>
  );
}
```

Wire în Layout root (above Outlet).

### D. `index.html` icons + manifest link

Ensure `<link rel="manifest" href="/manifest.webmanifest">` + apple-touch-icon link present.

### E. Tests `src/react/__tests__/UpdatePrompt.test.tsx`

```js
- renders null when needRefresh false
- renders update prompt when needRefresh true
- updateServiceWorker dispatched on button click
- ZERO actual SW register în jsdom (mock virtual:pwa-register/react)
```

### F. Build verify

```bash
npm run build
# Verify dist/sw.js generated + dist/manifest.webmanifest + workbox-* chunks
```

## §3 Acceptance criteria

- [ ] `vite-plugin-pwa` + `workbox-window` installed
- [ ] `vite.config.js` VitePWA plugin configured
- [ ] Service worker generated build output
- [ ] `UpdatePrompt.tsx` NEW component wired Layout root
- [ ] Manifest enriched icons 192/512/512-maskable
- [ ] Firebase NetworkFirst runtime cache 3sec timeout
- [ ] Tests +3 minim PASS
- [ ] TS strict 0 errors

## §4 Tests delta target +3-6

## §5 Commit

```
feat(build): vite-plugin-pwa service worker offline mode + auto-update

NEW vite-plugin-pwa + workbox-window dependencies. Service worker generated
production build (NU dev — devOptions disabled). Runtime cache strategy:
NetworkFirst Firebase API 3sec timeout fallback offline.

UpdatePrompt component Layout root — auto-detect new version + manual
"Actualizeaza" button dispatch updateServiceWorker(true). PWA install
prompt enabled via manifest icons 192/512/512-maskable.

Offline mode critical gym low-connectivity. Android primary target Maria
65 + Marius preserved.
```

## §6 Next

task_22 Progres full dashboard (TDEE + fatigue + heat map + charts).
