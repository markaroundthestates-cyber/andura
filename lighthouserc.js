// Track 7 §7.3 — Lighthouse CI 12+ config per master spec §1.4.
// Mobile preset + devtools throttling + 3 runs (median anti-flake).
// Thresholds: perf >=85, a11y >=95, best-practices >=90, SEO >=90.
// Core Web Vitals: FCP <1.8s, LCP <2.5s, CLS <0.1, TBT <200ms.
// Lighthouse 12+ scos PWA category → preset 'lighthouse:no-pwa'.
//
// Local invocation: `npx lhci autorun`
// CI invocation: treosh/lighthouse-ci-action@v12 in deploy.yml (§7.6 augment).
// Live URL: `npx lhci autorun --collect.url=https://andura.app`.

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local',
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
        throttlingMethod: 'devtools',
        skipAudits: [
          // Skip audits that require network conditions inconsistent with
          // local preview (cache headers, HTTP/2, etc.) — re-enabled in
          // post-deploy live URL run.
          'uses-http2',
          'uses-long-cache-ttl',
        ],
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance':     ['error', { minScore: 0.85 }],
        'categories:accessibility':   ['error', { minScore: 0.95 }],
        'categories:best-practices':  ['error', { minScore: 0.90 }],
        'categories:seo':             ['warn',  { minScore: 0.90 }],
        'first-contentful-paint':     ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint':   ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift':    ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time':        ['error', { maxNumericValue: 200 }],
        'installable-manifest':       ['warn',  { minScore: 1 }],
        'service-worker':             ['warn',  { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
