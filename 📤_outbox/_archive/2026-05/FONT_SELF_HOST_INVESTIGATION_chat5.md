# Font self-host Inter investigation chat 5 — 2026-05-23

**Mission:** Daniel CEO option #1 din LIGHTHOUSE-PERF-AUDIT — self-host Inter font WOFF2 + preload pentru eliminate Google Fonts render-block (-300ms LCP estimat, perf 97→99).

**Status:** READ-ONLY investigation. ZERO src/ modificat. ZERO commit. Raport informativ pentru Daniel decision pre-implementation.

---

## 1. Current state — Google Fonts CDN

**`index.html:33`** (verbatim):

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
```

**Preconnect already în place** (`index.html:27-28`, §36-M3 audit fix):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

**CSP allows** (`index.html:16`):

```
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
```

**Workbox runtime cache** (`vite.config.js:94-101`) — Google Fonts cached an întreg după prima încărcare:

```js
urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
handler: 'CacheFirst',
options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 30, maxAgeSeconds: 60*60*24*365 } }
```

---

## 2. Weights + subsets used

**Family + weights din URL Google Fonts** (`index.html:33`):
- `Inter:wght@400;500;600;700` — 4 weights (400 regular, 500 medium, 600 semibold, 700 bold)
- `display=swap` — FOUT pattern (visible text imediat, swap when font loaded)

**Subset livrat de Google** (per `reports/lighthouse/chat5-final.json:323`):
- Singular fișier WOFF2: `inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2`
- Transfer size: **48464 bytes** (~48 KB)
- **Latin subset doar** (Google trimite latin pentru `lang="ro"` fără diacritics, conform Unicode-range optimization). RO no-diacritics policy (D-LEGACY-064) = latin sufficient.

**Font family declarations în src:**
- `tailwind.config.js:17` — `sans: ['Inter', 'system-ui', 'sans-serif']`
- `src/styles/global.css:168` — `font-family: 'Inter', system-ui, sans-serif` (html, body base reset)
- `index.html:59` — inline FOUC fallback `font-family: 'Inter', system-ui, sans-serif`

**`font-feature-settings`:** NU folosit nicăieri în src (verified grep — singurele match-uri sunt în Obsidian themes, NU în Andura code). ZERO ligatures/alternates dependent.

**Legacy non-Inter fonts (`src/styles/main.css` vanilla — `_legacy-vanilla/` excluded din tailwind content):**
- DM Sans, Bebas Neue, JetBrains Mono — apar în `main.css` (vanilla legacy NU loaded în React)
- `index.html` grep `Bebas|DM Sans|JetBrains` = **ZERO matches** → confirm NU livrate prin Google Fonts în React build
- Per D015 STRAT PIVOT (2026-05-16): vanilla legacy retired post Andura Clasic React entry swap. Aceste fonts referenced doar în `_legacy-vanilla/` CSS, never fetched

---

## 3. Measured impact (Lighthouse `chat5-final.json`)

**Critical request chain** (`json:300-330`):

```
localhost:4173/ (HTML)
  └─ fonts.googleapis.com/css2 (Inter CSS, 1233 B, h2)
      └─ fonts.gstatic.com/.../UcC73...woff2 (48464 B, h3)
```

**Render-blocking-resources audit** (`json:2632-2647`):

| URL | totalBytes | wastedMs |
|-----|-----------|----------|
| `fonts.googleapis.com/css2?family=Inter...` | 1233 | **843** |
| `localhost:4173/registerSW.js` | 465 | 952 |
| `localhost:4173/assets/main-DSNaTzeh.css` | 23786 | 952 |

**Overall savings render-block:** 502 ms (multi-resource overlap).

**Inter font fetch waterfall** (`json:748-898`):
- CSS request: rendererStart=323ms → networkEnd=448ms (**125ms CSS roundtrip**)
- WOFF2 fetch: rendererStart=528ms → networkEnd=611ms (**83ms font fetch**)
- Total Inter critical path: ~290ms from page nav start (preconnect helped)

**Note:** Mission prompt citat "886ms render-block" — Lighthouse `chat5-final.json` arată **843ms wastedMs Google Fonts CSS**. Close enough; cifra prompt stale by ~40ms. Confirm reality din JSON.

---

## 4. Options compared

### Option A: Static WOFF2 `public/fonts/` + preload (RECOMMENDED)

**Setup:**
1. Download Inter latin WOFF2 v20 din rsms.me/inter sau direct Google Fonts subset URL
2. Plasează `public/fonts/inter-400.woff2`, `inter-500.woff2`, `inter-600.woff2`, `inter-700.woff2` (sau **variable font** singular `inter-var.woff2`)
3. `@font-face` declarations în `src/styles/global.css` cu `font-display: swap`
4. `<link rel="preload" as="font" type="font/woff2" crossorigin>` în `index.html` pentru weight 400 (critical)
5. Remove `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` din `index.html:33`
6. Remove `<link rel="preconnect" href="https://fonts.*com">` (no longer needed)

**Bundle size delta:**
- Static 4 files latin WOFF2: **~120-160 KB total** (~30-40 KB per weight gzipped)
- **Variable font** singular WOFF2: **~75-95 KB total** (single file, range 100-900 weight axis)
- Current Google fetch: 1233 B CSS + 48464 B WOFF2 = ~50 KB
- **Delta variable:** +25-45 KB (one-time install, then SW precache)
- **Delta static 4-weight:** +70-110 KB

**Latency improvement:**
- Eliminates 843ms render-block Google Fonts CSS (~125ms roundtrip + parse)
- Self-host WOFF2 served din same-origin HTTP/1.1 cache (browser native + Workbox runtime)
- Preload directive starts font fetch parallel cu HTML parse → font ready before FCP
- **LCP estimated:** 2.1s → 1.7-1.8s (-300-400ms)
- **Perf score estimated:** 97 → 99-100 (+2-3 points)

**CSP changes needed:**
- `style-src` remove `https://fonts.googleapis.com` (only `'self'` remains)
- `font-src` remove `https://fonts.gstatic.com` (only `'self'` remains)
- CSP tightening = SECURITY WIN (smaller attack surface, fewer external origins)

**vite-plugin-pwa precache:**
- `vite.config.js:62` already `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']` → woff2 included by default
- Just landed pattern (`8bd8ab44` Sentry exclusion): font would precache by default, similar pattern available if exclude needed (UNLIKELY pentru small static font assets)

**Effort:** ~30-45 min (download fonts + @font-face block + preload tag + index.html cleanup + CSP tightening + smoke test).

**Risk:** **LOW**. No logic change. Font swap visual identical (Inter v20 same in both places). FOUT pattern preserved cu `font-display: swap`. Browser compat: Variable font supported ~96% global (caniuse), WOFF2 supported ~98%.

---

### Option B: `@fontsource/inter` npm package

**Setup:**
1. `npm i @fontsource/inter` (sau `@fontsource-variable/inter` pentru variable axis)
2. Import în `src/main.tsx` sau `src/styles/global.css`:
   ```js
   import '@fontsource/inter/400.css';
   import '@fontsource/inter/500.css';
   import '@fontsource/inter/600.css';
   import '@fontsource/inter/700.css';
   ```
3. Tree-shake unused weights via explicit imports
4. CSS variants bundle automat în Vite build, served din `assets/`

**Bundle size delta:**
- 4 weights static `@fontsource/inter`: **~140-180 KB** (similar to Option A static)
- Variable `@fontsource-variable/inter`: **~80-100 KB** (similar to Option A variable)
- Plus CSS overhead per weight: ~1-2 KB
- Risk minor: package version drift, depcheck noise

**Latency improvement:**
- Identical to Option A (same WOFF2 files, same hosting)
- Minor difference: weights served as separate CSS imports (Vite bundles → main CSS chunk) vs single `@font-face` block

**Effort:** ~15 min (npm install + 4 import lines + remove Google Fonts link). FASTER than Option A.

**Risk:** **LOW-MEDIUM**. Package dependency adds maintenance (Renovate/Dependabot bumps). Build-time integration tested in many React projects. Tree-shake gotcha: must explicit import each weight pentru NU bundle entire family.

**Tradeoff vs A:** Less control over `@font-face` declarations + harder to add `font-display: swap` granular per weight. Vite plugin friction zero. Recommended dacă Daniel preferă npm hygiene over filesystem assets.

---

### Option C: Alternative CDN (Cloudflare Fonts, jsDelivr, Bunny Fonts)

**Setup:**
1. Replace Google Fonts URL cu Bunny Fonts equivalent:
   ```html
   <link rel="stylesheet" href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" />
   ```
2. Bunny Fonts = drop-in Google Fonts replacement, GDPR-friendly (no Google tracking)
3. Update CSP `style-src` + `font-src` cu Bunny domains

**Bundle size delta:**
- ZERO local bundle increase
- External fetch identical pattern Google Fonts (CSS → WOFF2 chain)

**Latency improvement:**
- Bunny/Cloudflare CDN may be 10-30ms faster than Google Fonts (varies geo)
- **Still external dependency** = preserves render-block risk dacă CDN slow
- **NU elimina 843ms render-block fundamental** — same critical chain pattern

**Effort:** ~5 min (URL swap + CSP update).

**Risk:** **MEDIUM**. External dependency persistent. New origin trust required. GDPR win (Bunny) but minimal perf gain. Doesn't address root cause.

**Verdict:** **NU recommended** — preserves render-block, only marginal latency win. Self-host elimina problema fundamental.

---

## 5. Recommendation Co-CTO

**Option A: Static WOFF2 Variable font self-host + preload critical weight.**

**Rationale:**
1. **Eliminează 843ms render-block** Google Fonts CSS — root cause fix
2. **Lighthouse perf 97 → 99-100** (+2-3 points)
3. **LCP 2.1s → 1.7-1.8s** (-300-400ms estimate)
4. **CSP tightening** — drop 2 external origins (security win)
5. **Same-origin caching** — Workbox SW precache + browser HTTP cache cooperate seamless
6. **Variable font** = singular ~80 KB file vs 4 static ~150 KB total (better tradeoff bundle vs flexibility)
7. **No npm dependency** — zero version drift surface
8. **GDPR/privacy win** — no Google Fonts fetch = no IP leak la Google

**De ce NU Option B (`@fontsource`):**
- Adaugă dependency for trivial functionality (4 lines @font-face block)
- `@fontsource-variable/inter` viable alternative dacă Daniel preferă npm hygiene, ~same outcome
- Effort delta minor (15min vs 30min)

**De ce NU Option C (alt CDN):**
- Doesn't fix render-block root cause
- Preserves external dependency
- Minimal LCP gain

---

## 6. Implementation path (~30-45 min)

**Pre-conditions:**
- Decide variable font (recommended) sau static 4-weight
- Confirm latin subset sufficient (D-LEGACY-064 no-diacritics) — verified YES

**Steps:**

1. **Download font asset(s):**
   - Variable: `https://rsms.me/inter/font-files/InterVariable.woff2` (~95 KB)
   - SAU static 4: `https://gwfh.mranftl.com/api/fonts/inter?download=zip&subsets=latin&variants=regular,500,600,700&formats=woff2`
   - Plasează în `public/fonts/`

2. **Add `@font-face` block în `src/styles/global.css`** (post `@tailwind` imports, înainte `:root`):
   ```css
   @font-face {
     font-family: 'Inter';
     font-style: normal;
     font-weight: 100 900;
     font-display: swap;
     src: url('/fonts/InterVariable.woff2') format('woff2-variations');
   }
   ```

3. **Preload critical weight în `index.html`** (înlocuind link Google Fonts):
   ```html
   <link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin />
   ```

4. **Remove obsolete din `index.html`:**
   - `<link rel="preconnect" href="https://fonts.googleapis.com" />` (line 27)
   - `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />` (line 28)
   - `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter..." />` (line 33)

5. **Tighten CSP în `index.html:16`:**
   - `style-src 'self' 'unsafe-inline'` (drop `https://fonts.googleapis.com`)
   - `font-src 'self'` (drop `https://fonts.gstatic.com`)

6. **Update Workbox runtime cache `vite.config.js:95`:**
   - Optional: remove `google-fonts-cache` runtime entry (no longer needed, font served din precache)
   - SAU lăsa pentru backward-compat dacă orice legacy reference rămâne

7. **Smoke test:**
   - `npm run build && npm run preview`
   - Verify FCP < 1.5s, no FOUT visible cu `font-display: swap`
   - Lighthouse run pentru verify score 99+

8. **Atomic commit per Bugatti:** `perf(font): self-host Inter Variable WOFF2 + preload — eliminate Google Fonts render-block`

---

## 7. Risks + tradeoffs

| Risk | Severity | Mitigation |
|------|---------|------------|
| Variable font browser compat | LOW | 96%+ support (caniuse). Fallback `system-ui` via Tailwind `sans` stack handles edge case |
| Bundle bloat ~80 KB | LOW | Variable font 1-time cost, Workbox precache amortize cross-sessions. Sentry exclusion landed (`8bd8ab44`) showed precache budget healthy |
| Font version drift (Inter updates) | LOW | Inter v20 stable, ~yearly release cycle. Manual update opt-in |
| FOUT flash visible cu `font-display: swap` | LOW | Inherent tradeoff (Google Fonts had same). System-ui fallback close enough metric-wise |
| Preload tag misuse (over-preloading) | LOW | Only 1 critical font preloaded (Variable file). Static 4-weight scenario: only preload weight 400 |
| CSP tightening breaks dev mode | LOW | Vite dev server uses own HMR pipeline, CSP applies only to prod build. Verify smoke OK |

---

## 8. Conclusion + ask

**Recommended:** Option A static WOFF2 Variable font self-host + preload critical weight.

**Expected outcome:**
- Lighthouse perf: 97 → 99-100 (+2-3 points)
- LCP: 2.1s → 1.7-1.8s (-300-400ms)
- 843ms render-block eliminated (root cause fix)
- CSP tightening (security win, 2 fewer external origins)
- GDPR/privacy win (no Google Fonts IP leak)

**Effort:** ~30-45 min (download + @font-face + preload + cleanup + CSP + smoke test).

**Risk:** LOW (font swap, no logic change, identical visual rendering Inter v20).

**Blockers:** ZERO. Standalone work, no dependency on other chat 5 parallel investigations (LIGHTHOUSE-POST-LAZY + W10-PARITY-CONTINUE + LEDGER-SYNC-WAVE-10).

**Daniel ask:** Confirm Option A Variable font preference (vs Option B `@fontsource-variable/inter` npm alternative). Both viable, Option A surgical filesystem-only.

---

**Raport informativ ONLY. ZERO src/ touched. ZERO commit. Daniel CEO decides trigger pentru implementation.**
