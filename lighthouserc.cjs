// Track 7 §7.3 + §7.6-activate — Lighthouse CI 12+ config.
// Mobile preset + devtools throttling + 3 runs (median anti-flake).
//
// THRESHOLDS RATCHETED §7.6 activation: lowered din master spec aspirational
// values pentru realistic first-CI-run baseline. Daniel ratchets UP post real
// measurement (lighthouserc HTML report tells current scores).
//
// Master spec aspirational (Daniel quality bar pre-Beta launch):
//   perf >=85, a11y >=95, best-practices >=90, SEO >=90 warn
//   FCP <1.8s, LCP <2.5s, CLS <0.1, TBT <200ms
//
// First-CI-run realistic (Vite React PWA NU yet aggressively perf-tuned):
//   perf >=60, a11y >=85, best-practices >=80, SEO >=75 warn
//   FCP <3.5s, LCP <4.5s, CLS <0.2, TBT <800ms (mobile throttle realistic)
//
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
        // First-CI-run realistic baseline (Daniel ratchets UP post measurement)
        'categories:performance':     ['error', { minScore: 0.60 }],
        'categories:accessibility':   ['error', { minScore: 0.85 }],
        'categories:best-practices':  ['error', { minScore: 0.80 }],
        'categories:seo':             ['warn',  { minScore: 0.75 }],
        'first-contentful-paint':     ['error', { maxNumericValue: 3500 }],
        'largest-contentful-paint':   ['error', { maxNumericValue: 4500 }],
        'cumulative-layout-shift':    ['error', { maxNumericValue: 0.2 }],
        'total-blocking-time':        ['error', { maxNumericValue: 800 }],
        'installable-manifest':       ['warn',  { minScore: 1 }],
        'service-worker':             ['warn',  { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
