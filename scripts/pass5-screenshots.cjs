/* Pass 5 — Mockup vs Prod parity visual proof screenshots.
 * Log-only artifact; no src/ side-effects.
 * Output: 📤_outbox/mockup-vs-prod-parity-2026-05-20/screenshots/
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const VAULT = process.cwd();
const MOCKUP_FILE = `file:///${path.join(VAULT, '04-architecture', 'mockups', 'andura-clasic.html').replace(/\\/g, '/')}`;
const OUTDIR = path.join(VAULT, '📤_outbox', 'mockup-vs-prod-parity-2026-05-20', 'screenshots');
const PROD_BASE = 'https://andura.app';
const LOCAL_BASE = 'http://localhost:5173';

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const VIEWPORT = { width: 380, height: 812 };

// (screen-id without "screen-" prefix, output-suffix)
const MOCKUP_SCREENS = [
  // Main entries
  ['splash',                '_mockup-splash-F-splash-overall.png'],
  ['auth',                  '_mockup-auth-F-auth-03-04.png'],
  ['antrenor',              '_mockup-antrenor-F-pass2-coachtoday-F-antrenor-03.png'],
  ['progres',               '_mockup-progres-F-progres-07-F-pass2-heatmap.png'],
  ['istoric',               '_mockup-istoric-F-istoric-01-03.png'],
  ['settings',              '_mockup-cont-F-cont-04-ajutor.png'],
  // Workout flow
  ['workout-preview',       '_mockup-workout-preview-F-workout-preview-01-02-03.png'],
  ['workout',               '_mockup-workout-F-pass2-sessiontimer-01-restoverlay-01.png'],
  // Antrenor secondary paradigm divergences
  ['ceva-nu-merge',         '_mockup-ceva-nu-merge-F-ceva-nu-merge-01.png'],
  ['pain-button',           '_mockup-pain-button-F-pain-button-01.png'],
  ['equipment-swap',        '_mockup-equipment-swap-F-equipment-swap-01.png'],
  // Cont sub-screens
  ['settings-profile',      '_mockup-settings-profile-F-pass2-settings-profile-03-04.png'],
  ['settings-prefs',        '_mockup-settings-prefs-F-pass2-settings-prefs-01-paradigm-swap.png'],
  ['settings-danger',       '_mockup-settings-danger-F-pass2-settings-danger-01-03.png'],
  // MISSING-only mockup proof (no prod equivalent exists)
  ['weight-timeline',       '_mockup-weight-timeline-F-missing-weight-timeline.png'],
  ['loguri-greutate',       '_mockup-loguri-greutate-F-missing-loguri-greutate.png'],
  ['settings-support',      '_mockup-settings-support-F-missing-settings-support.png'],
  ['settings-about',        '_mockup-settings-about-F-missing-settings-about.png'],
  ['settings-faq',          '_mockup-settings-faq-F-missing-settings-faq.png'],
  // 7 confirm modals (ALL missing in prod — mockup proof only)
  ['confirm-reset-coach',     '_mockup-confirm-reset-coach-F-missing-confirms.png'],
  ['confirm-schimba-faza',    '_mockup-confirm-schimba-faza-F-missing-confirms.png'],
  ['confirm-redo-onboarding', '_mockup-confirm-redo-onboarding-F-missing-confirms.png'],
  ['confirm-logout',          '_mockup-confirm-logout-F-missing-confirms.png'],
  ['confirm-delete',          '_mockup-confirm-delete-F-missing-confirms.png'],
  ['confirm-program-change',  '_mockup-confirm-program-change-F-missing-confirms.png'],
  ['confirm-finish-early',    '_mockup-confirm-finish-early-F-missing-confirms.png'],
];

// (route after PROD_BASE, output-suffix)
const PROD_ROUTES = [
  ['/',                                 '_prod-splash-F-splash-overall.png'],
  ['/auth',                             '_prod-auth-F-auth-03-04.png'],
  ['/app/antrenor',                     '_prod-antrenor-F-pass2-coachtoday-F-antrenor-03.png'],
  ['/app/progres',                      '_prod-progres-F-progres-07-F-pass2-heatmap.png'],
  ['/app/istoric',                      '_prod-istoric-F-istoric-01-03.png'],
  ['/app/cont',                         '_prod-cont-F-cont-04-ajutor.png'],
  ['/app/antrenor/workout-preview',     '_prod-workout-preview-F-workout-preview-01-02-03.png'],
  ['/app/antrenor/workout',             '_prod-workout-F-pass2-sessiontimer-01-restoverlay-01.png'],
  ['/app/antrenor/ceva-nu-merge',       '_prod-ceva-nu-merge-F-ceva-nu-merge-01.png'],
  ['/app/antrenor/pain-button',         '_prod-pain-button-F-pain-button-01.png'],
  ['/app/antrenor/equipment-swap',      '_prod-equipment-swap-F-equipment-swap-01.png'],
  ['/app/cont/settings-profile',        '_prod-settings-profile-F-pass2-settings-profile-03-04.png'],
  ['/app/cont/settings-prefs',          '_prod-settings-prefs-F-pass2-settings-prefs-01-paradigm-swap.png'],
  ['/app/cont/settings-danger',         '_prod-settings-danger-F-pass2-settings-danger-01-03.png'],
];

async function captureMockup(browser) {
  console.log('\n=== MOCKUP CAPTURE ===');
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [mockup page err] ${e.message}`));
  await page.goto(MOCKUP_FILE, { waitUntil: 'domcontentloaded' });
  // Allow Lucide + scripts to initialize.
  await page.waitForTimeout(800);

  for (const [screen, fileName] of MOCKUP_SCREENS) {
    try {
      await page.evaluate((name) => {
        if (typeof window.goto === 'function') {
          window.goto(name);
        } else {
          document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
          const el = document.getElementById('screen-' + name);
          if (el) el.classList.add('active');
        }
      }, screen);
      await page.waitForTimeout(350);
      const phone = await page.$('#phone');
      const outPath = path.join(OUTDIR, fileName);
      if (phone) {
        await phone.screenshot({ path: outPath });
      } else {
        await page.screenshot({ path: outPath });
      }
      console.log(`  OK mockup ${screen} -> ${fileName}`);
    } catch (e) {
      console.log(`  FAIL mockup ${screen}: ${e.message}`);
    }
  }
  await ctx.close();
}

async function captureProd(browser) {
  console.log('\n=== PROD CAPTURE ===');
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    storageState: {
      cookies: [],
      origins: [
        {
          origin: PROD_BASE,
          localStorage: [
            { name: 'firebase-id-token',         value: 'fake-pass5-token-for-screenshot-bypass' },
            { name: 'firebase-uid',              value: 'pass5-screenshot-uid' },
            { name: 'firebase-id-token-expiry',  value: String(Date.now() + 1000 * 60 * 60 * 24 * 365) },
            { name: 'andura-pass5-audit',        value: '1' },
          ],
        },
      ],
    },
  });

  // Pre-React patch: ProtectedRoute redirects to /auth synchronously on first
  // render (before its localStorage sync useEffect fires). Block /auth
  // redirects so React Router stays on /app/X long enough for useEffect to
  // setAuthenticated(true), at which point ProtectedRoute re-renders cu children.
  await ctx.addInitScript(() => {
    const origReplace = history.replaceState.bind(history);
    const origPush = history.pushState.bind(history);
    const isAuthRedirect = (u) => typeof u === 'string' && (u === '/auth' || u.endsWith('/auth'));
    history.replaceState = function (state, title, url) {
      if (isAuthRedirect(url)) {
        return;
      }
      return origReplace(state, title, url);
    };
    history.pushState = function (state, title, url) {
      if (isAuthRedirect(url)) {
        return;
      }
      return origPush(state, title, url);
    };
    // Also block window.location.replace/assign to /auth.
    const origAssign = window.location.assign?.bind(window.location);
    const origLocReplace = window.location.replace?.bind(window.location);
    try {
      Object.defineProperty(window.location, 'replace', {
        configurable: true,
        value: (url) => { if (isAuthRedirect(url)) return; return origLocReplace && origLocReplace(url); },
      });
    } catch {}
    try {
      Object.defineProperty(window.location, 'assign', {
        configurable: true,
        value: (url) => { if (isAuthRedirect(url)) return; return origAssign && origAssign(url); },
      });
    } catch {}
  });

  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [prod page err] ${e.message}`));

  for (const [route, fileName] of PROD_ROUTES) {
    try {
      const url = PROD_BASE + route;
      // For /auth and / we don't want the redirect block to interfere — these
      // are public routes we want to capture as-is.
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      const status = resp ? resp.status() : 'noresp';
      // Give ProtectedRoute's useEffect + state update + re-render time to land.
      await page.waitForTimeout(1500);
      const outPath = path.join(OUTDIR, fileName);
      await page.screenshot({ path: outPath, fullPage: false });
      // Capture landed URL for diagnostics — if app stayed on intended route, bypass worked.
      const landedUrl = page.url();
      const ok = landedUrl.replace(PROD_BASE, '') === route || landedUrl.endsWith(route);
      console.log(`  ${ok ? 'OK' : 'PARTIAL'} prod ${route} (${status}) landed=${landedUrl.replace(PROD_BASE, '')} -> ${fileName}`);
    } catch (e) {
      console.log(`  FAIL prod ${route}: ${e.message}`);
    }
  }
  await ctx.close();
}

async function captureLocalDev(browser) {
  console.log('\n=== LOCAL DEV CAPTURE ===');
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [local page err] ${e.message}`));

  // Phase A — public routes first (full reload OK; doesn't affect later auth).
  const publicRoutes = PROD_ROUTES.filter(([r]) => !r.startsWith('/app'));
  for (const [route, fileName] of publicRoutes) {
    try {
      await page.goto(LOCAL_BASE + route, { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(1000);
      const outPath = path.join(OUTDIR, fileName.replace('_prod-', '_localdev-'));
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  OK local ${route} -> ${path.basename(outPath)}`);
    } catch (e) {
      console.log(`  FAIL local ${route}: ${e.message}`);
    }
  }

  // Phase B — bootstrap mock-login (sets appStore.isAuthenticated=true via
  // Auth.tsx handleMockLogin, gated behind import.meta.env.DEV).
  console.log('  bootstrapping mock-login via /auth ...');
  await page.goto(LOCAL_BASE + '/auth', { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForTimeout(600);
  const mockBtn = await page.$('[data-testid="auth-mock"]');
  if (!mockBtn) {
    console.log('  FATAL: [data-testid="auth-mock"] not found — is local Vite running in DEV mode?');
    await ctx.close();
    return;
  }
  await mockBtn.click();
  await page.waitForTimeout(800);
  console.log(`  mock-login OK, landed on ${page.url()}`);

  // Phase C — protected /app/* via in-app navigation (pushState + popstate).
  // Each navigation preserves Zustand state because there's no full reload.
  const protectedRoutes = PROD_ROUTES.filter(([r]) => r.startsWith('/app'));
  for (const [route, fileName] of protectedRoutes) {
    try {
      await page.evaluate((r) => {
        window.history.pushState({}, '', r);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, route);
      await page.waitForTimeout(1200);
      const outPath = path.join(OUTDIR, fileName.replace('_prod-', '_localdev-'));
      await page.screenshot({ path: outPath, fullPage: false });
      const landed = page.url().replace(LOCAL_BASE, '');
      const ok = landed === route || landed.endsWith(route);
      console.log(`  ${ok ? 'OK' : 'PARTIAL'} local ${route} landed=${landed} -> ${path.basename(outPath)}`);
    } catch (e) {
      console.log(`  FAIL local ${route}: ${e.message}`);
    }
  }
  await ctx.close();
}

const args = process.argv.slice(2);
const ONLY_PROD = args.includes('--prod-only');
const ONLY_MOCKUP = args.includes('--mockup-only');
const ONLY_LOCAL = args.includes('--local-only');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    if (!ONLY_PROD && !ONLY_LOCAL) await captureMockup(browser);
    if (!ONLY_MOCKUP && !ONLY_LOCAL) await captureProd(browser);
    if (!ONLY_MOCKUP && !ONLY_PROD) await captureLocalDev(browser);
  } finally {
    await browser.close();
  }
  // Final inventory log.
  const files = fs.readdirSync(OUTDIR).filter((f) => f.endsWith('.png')).sort();
  console.log('\n=== INVENTORY ===');
  console.log(`Total PNG files: ${files.length}`);
  files.forEach((f) => console.log('  ' + f));
})();
