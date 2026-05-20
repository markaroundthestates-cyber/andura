const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 380, height: 812 } });
  const page = await ctx.newPage();
  page.on('console', (msg) => console.log(`[console.${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (e) => console.log(`[pageerr] ${e.message}`));

  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log('on auth, looking for mock button');
  const btn = await page.$('[data-testid="auth-mock"]');
  console.log('mock btn found:', !!btn);
  if (!btn) {
    console.log('body innerText:', await page.evaluate(() => document.body.innerText.slice(0, 500)));
    await browser.close();
    return;
  }
  await btn.click();
  await page.waitForTimeout(1000);
  console.log('after click, url=', page.url());
  console.log('content after click:', await page.evaluate(() => document.body.innerText.slice(0, 300)));

  // Try in-app nav
  await page.evaluate(() => {
    window.history.pushState({}, '', '/app/antrenor');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForTimeout(2000);
  console.log('after pushState, url=', page.url());
  console.log('content after pushState:', await page.evaluate(() => document.body.innerText.slice(0, 400)));
  await browser.close();
})();
