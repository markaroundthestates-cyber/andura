# task_20 — Lighthouse Audit + Bundle Size + PWA Manifest Icons

**Phase:** 6 (polish, FINAL pre-Beta)
**Type:** Audit + production-ready polish
**Deps:** task_19 (post lazy splitting + skeletons)
**Backup tag:** `pre-phase5-task-20-2026-05-17`
**Est commits:** 2-3 atomic (manifest + icons + audit fixes)
**Est tests delta:** +3-5

---

## §1 Scope

Final pre-Beta polish:
- Lighthouse audit (Performance / Accessibility / Best Practices / SEO / PWA)
- Bundle size optimization (target <300KB initial gzipped — Marius mid-range 4G)
- PWA manifest icons multi-size + Apple touch icon
- Service Worker offline support basic (cache static + API offline-first)
- Logo final replace task_15 placeholder

## §2 Changes

### A. PWA manifest `public/manifest.webmanifest` (NEW/extend)

```json
{
  "name": "Andura — Antrenor AI",
  "short_name": "Andura",
  "description": "Antrenorul tau personal AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf6ee",
  "theme_color": "#c2410c",
  "lang": "ro-RO",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### B. Generate PWA icons placeholder

Generate SVG → PNG via inline tool (sharp/ImageMagick CLI sau equivalent JS):
- icon-192.png (192×192)
- icon-512.png (512×512)
- icon-maskable-192.png (cu safe zone padding)
- icon-maskable-512.png
- apple-touch-icon.png (180×180)
- favicon.ico (32×32 + 16×16)

Placeholder = same Logo SVG (task_15) rasterized. Final design Bugatti audit fază pre-Launch.

### C. Service Worker `public/sw.js` (basic offline)

```js
const CACHE_NAME = 'andura-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
```

Register în main.tsx:
```tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
```

### D. Bundle audit + fixes

```bash
npm run build
npx vite-bundle-visualizer  # OR rollup-plugin-visualizer
```

Common fixes:
- Tree-shake lucide-react (use specific imports vs barrel)
- Replace lodash usage cu native (daca exists)
- Dynamic import heavy libraries (chart.js, mathjs daca utilizate Progres)
- Compress images / SVG

### E. Lighthouse run + fixes

```bash
npx lighthouse https://andura.app --view --quiet
```

Common fixes:
- `<meta name="viewport">` ensure correct
- Add `<meta name="description">`
- Add `<link rel="apple-touch-icon">`
- Verify color contrast WCAG AA (paper-cream + ink dark = ok)
- Lazy load images (loading="lazy")
- Add `lang="ro"` to `<html>`

### F. index.html final

```html
<!DOCTYPE html>
<html lang="ro-RO">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#c2410c" />
  <meta name="description" content="Andura — antrenorul tau personal AI. Programe adaptive, monitorizare progres, nutritie inteligenta." />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <link rel="icon" href="/favicon.ico" />
  <title>Andura</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/react/main.tsx"></script>
</body>
</html>
```

## §3 Acceptance criteria

- [ ] Manifest valid PWA (Lighthouse PWA check verde)
- [ ] Icons 192 + 512 + maskable + apple-touch + favicon generated
- [ ] Service Worker registers + caches static assets
- [ ] Bundle size <300KB initial gzipped (verify dist)
- [ ] Lighthouse Performance ≥80, Accessibility ≥90, Best Practices ≥90, PWA ✓
- [ ] index.html lang="ro-RO" + meta description + viewport correct
- [ ] Tests +3-5 PASS (manifest schema validation + SW basic)
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/manifest.test.ts
- manifest.webmanifest valid JSON
- required PWA fields present
- icons array has 192 + 512 + maskable

src/react/__tests__/sw.test.ts
- SW installs cache static assets
- fetch falls back to network on cache miss

# Lighthouse run manual pre-Beta gate:
npx lighthouse https://andura.app --output json --output-path lh-report.json
```

## §5 Commits (atomic 2-3)

```
feat(public): PWA manifest + icons + service worker basic offline

Manifest.webmanifest cu start_url + theme_color + lang ro-RO + icons
multi-size 192/512 + maskable. SW caches static assets offline-first.
Icons placeholder rasterized SVG Logo (final design Bugatti audit
pre-Launch).

refactor(react): bundle size optimization tree-shake lucide + lazy heavy

lucide-react specific imports (NU barrel). Dynamic import chart.js + 
mathjs daca utilizate. Target <300KB initial gzipped Marius mid-range
4G constraint.

fix(html): index.html final meta + lang + apple-touch-icon

lang="ro-RO" + meta description RO copy + viewport-fit cover iOS notch
safe + apple-touch-icon link + favicon.ico link.
```

## §6 Raport final batch close

`📤_outbox/LATEST.md` FINAL raport §0-§8 aggregate Phase 5 batch 20 task:

```markdown
# Phase 5 BATCH 20 task LANDED + Polish pre-Beta

## §0 Orchestrator compliance ✓
- Sequential fail-stop ✓
- Atomic per-task commits ✓
- Backup tags pushed origin per-task ✓
- vitest verde pre-commit ✓
- ZERO --no-verify bypass ✓

## §1 Commits aggregate
[Table SHA + task + subject 20+ commits]

## §2 Tests baseline → final
- Baseline: 4209 PASS / 213 files @ f3cb7dc
- Final: ~4400-4500 PASS / 250+ files @ HEAD-final
- TS errors: 0 → 0 invariant

## §3 Modifications aggregate
- NEW files: ~50 (components + screens + stores + tests)
- Modified files: ~30
- Engine module mutations: 0 ✓ (ADR 026 §9 invariant)

## §4 Issues observations
[Any task-specific friction surfaced]

## §5 Acceptance per task ✓

## §6 Wording autonomous-composed D024 NEW
[Catalog text final RO inline per file]

## §7 Backup tags pushed origin
[20 tags pre-phase5-task-NN-2026-05-17]

## §8 Phase 7 carry-forward
- Bugatti audit nuclear pre-Launch single comprehensive gate
- Lighthouse pe live andura.app post-deploy
- Daniel Gates production smoke manual
- Beta wording review a-z (D024)
- Real users feedback iteration loop
```

DECISIONS.md append D025 "Phase 5 BATCH 20 task LANDED milestone" + milestone tag `phase-5-batch-landed-2026-05-XX` push origin. Archive `📥_inbox/phase-5-tasks/` → `📥_inbox/_CONSUMED/`.

---

🦫 **FINAL task pre-Beta. Bugatti craft cumulative 20 task batch closure. Path forward = Daniel Gates manual smoke + Bugatti audit nuclear single comprehensive gate pre-Launch.**
