// ══ SERVICE WORKER CACHE INVARIANTS — STALE-CHUNK 404 GUARD ══════════════
// §SW-STALE-404 fix verify. Returning users were stranded on a stale app
// shell after a deploy: the OLD service worker served stale hashed chunks
// (e.g. assets/Antrenor-<oldhash>.js) from a runtime cache that
// cleanupOutdatedCaches never purged (it cleans the PRECACHE only), and once
// an entry was evicted the stale shell fetched a hashed chunk the new deploy
// had already replaced -> 404 (observed as `antrenor:1 ...404`).
//
// Root cause was the over-broad StaleWhileRevalidate runtime route matching
// EVERY same-origin /assets/*.js, double-storing precached chunks in a second,
// uncleaned cache. Fix scopes that route to ONLY the two globIgnored chunks
// (Sentry index-*.js + Dexie vendor-data-*.js) which are intentionally kept
// out of the precache, plus adds a navigateFallbackDenylist so the SPA
// navigation fallback never masks a missing asset as an HTML 200.
//
// VitePWA does not run under vitest, so we cannot assert the generated dist/sw.js
// here. Practical Bugatti (mirrors styles/focus-visible.test.tsx): read
// vite.config.js as text + assert the workbox invariants that prevent the bug.
// A real build + manual SW smoke confirm the compiled output separately.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const viteConfig = readFileSync(
  resolve(__dirname, '../../../../vite.config.js'),
  'utf-8',
);

// Isolate the workbox block so assertions do not accidentally match the
// build.rollupOptions section (which also mentions vendor-data / index chunks).
const workboxBlock = (() => {
  const start = viteConfig.indexOf('workbox: {');
  expect(start).toBeGreaterThan(-1);
  const devOpts = viteConfig.indexOf('devOptions', start);
  return viteConfig.slice(start, devOpts > -1 ? devOpts : undefined);
})();

describe('vite.config workbox — stale-chunk 404 guard (§SW-STALE-404)', () => {
  it('keeps cleanupOutdatedCaches enabled (purges stale precache on activate)', () => {
    expect(workboxBlock).toMatch(/cleanupOutdatedCaches:\s*true/);
  });

  it('declares a navigateFallback for SPA deep links', () => {
    expect(workboxBlock).toMatch(/navigateFallback:\s*['"]\/index\.html['"]/);
  });

  it('denies /assets/ from the navigation fallback (no HTML-masking a 404)', () => {
    // navigateFallbackDenylist must exist and cover the hashed build output so
    // a missing /assets/*.js returns a clean 404 instead of index.html (HTML).
    expect(workboxBlock).toMatch(/navigateFallbackDenylist:\s*\[/);
    const denyMatch = workboxBlock.match(/navigateFallbackDenylist:\s*\[([\s\S]*?)\]/);
    expect(denyMatch).not.toBeNull();
    const deny = denyMatch?.[1] ?? '';
    expect(deny).toMatch(/\^\\\/assets\\\//); // /^\/assets\//
  });

  it('denies the SW lifecycle files from the navigation fallback', () => {
    const denyMatch = workboxBlock.match(/navigateFallbackDenylist:\s*\[([\s\S]*?)\]/);
    const deny = denyMatch?.[1] ?? '';
    expect(deny).toMatch(/sw\\\.js/);
    expect(deny).toMatch(/workbox-/);
    expect(deny).toMatch(/registerSW\\\.js/);
  });

  it('scopes the /assets runtime cache to ONLY the two globIgnored chunks', () => {
    // The runtime StaleWhileRevalidate route must NOT match every /assets/*.js
    // (that double-stored precached chunks -> stale 404). It must target only
    // index-*.js (Sentry) + vendor-data-*.js (Dexie).
    const appAssetsRoute = (() => {
      const idx = workboxBlock.indexOf("cacheName: 'app-assets-js'");
      expect(idx).toBeGreaterThan(-1);
      // Walk back to the start of this runtimeCaching entry's urlPattern.
      const urlPatIdx = workboxBlock.lastIndexOf('urlPattern', idx);
      return workboxBlock.slice(urlPatIdx, idx);
    })();
    expect(appAssetsRoute).toMatch(/index-\[\^\/\]\*\\\.js/); // index-[^/]*\.js
    expect(appAssetsRoute).toMatch(/vendor-data-\[\^\/\]\*\\\.js/); // vendor-data-[^/]*\.js
    // Guard against the regression: a blanket /assets/.*\.js$ pattern.
    expect(appAssetsRoute).not.toMatch(/\\\/assets\\\/\.\*\\\.js\$/);
  });

  it('runtime-cached chunks match exactly the precache globIgnores set', () => {
    // Single-source-of-truth invariant: every chunk excluded from the precache
    // (globIgnores) must be the set served by the runtime route, so nothing is
    // double-cached and nothing is left uncacheable offline.
    const ignoresMatch = workboxBlock.match(/globIgnores:\s*\[([\s\S]*?)\]/);
    expect(ignoresMatch).not.toBeNull();
    const ignores = ignoresMatch?.[1] ?? '';
    expect(ignores).toMatch(/assets\/index-\*\.js/);
    expect(ignores).toMatch(/assets\/vendor-data-\*\.js/);
    // Exactly two globIgnore entries -> exactly two runtime-cached chunk kinds.
    const ignoreEntries = (ignores.match(/assets\//g) ?? []).length;
    expect(ignoreEntries).toBe(2);
  });
});
