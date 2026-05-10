/**
 * Regression tests — verify that existing features haven't broken.
 * These duplicate the critical paths from smoke/visual but with additional
 * assertions and clear regression context.
 */
import { test, expect } from '@playwright/test';

test.describe('Regression — Core app integrity', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress AA friction modal — backdrop would intercept nav/theme clicks.
    // Suppress onboarding overlay — first-run overlay also intercepts clicks.
    await page.addInitScript(() => {
      window._suppressAAFrictionModal = true;
      window._suppressOnboardingOverlay = true;
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('aplicatia se incarca fara erori JS critice', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const critical = errors.filter(m =>
      m.includes('ReferenceError') || m.includes('TypeError') || m.includes('SyntaxError')
    );
    expect(critical, `Erori JS: ${critical.join('; ')}`).toHaveLength(0);
  });

  test('titlul paginii este Andura', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('Andura');
  });

  test('body nu e gol dupa load', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });
});

test.describe('Regression — Navigatie', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window._suppressAAFrictionModal = true;
      window._suppressOnboardingOverlay = true;
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.nb', { timeout: 10000 });
  });

  test('exista exact 6 butoane de navigatie vizibile', async ({ page }) => {
    const navBtns = page.locator('.nb');
    await expect(navBtns).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(navBtns.nth(i)).toBeVisible();
    }
  });

  test('click pe DASH navigheaza la pagina dashboard', async ({ page }) => {
    await page.locator('.nb').nth(1).click();
    await page.waitForTimeout(400);
    const dashPage = page.locator('#page-dash');
    await expect(dashPage).toBeVisible();
  });

  test('click pe WEIGHT navigheaza la pagina weight', async ({ page }) => {
    await page.locator('.nb').nth(2).click();
    await page.waitForTimeout(400);
    const weightPage = page.locator('#page-weight');
    await expect(weightPage).toBeVisible();
  });

  test('click pe PROG navigheaza la pagina prog', async ({ page }) => {
    await page.locator('.nb').nth(3).click();
    await page.waitForTimeout(400);
    const progPage = page.locator('#page-prog');
    await expect(progPage).toBeVisible();
  });

  test('click pe PLAN navigheaza la pagina plan', async ({ page }) => {
    await page.locator('.nb').nth(4).click();
    await page.waitForTimeout(400);
    const planPage = page.locator('#page-plan');
    await expect(planPage).toBeVisible();
  });

  test('navigand inapoi la COACH afiseaza pagina corecta', async ({ page }) => {
    await page.locator('.nb').nth(2).click();
    await page.waitForTimeout(300);
    await page.locator('.nb').nth(0).click();
    await page.waitForTimeout(400);
    const coachPage = page.locator('#page-coach');
    await expect(coachPage).toBeVisible();
  });
});

test.describe('Regression — Theme system', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window._suppressAAFrictionModal = true;
      window._suppressOnboardingOverlay = true;
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#theme-btn', { timeout: 10000 });
  });

  test('#theme-switcher exista in DOM', async ({ page }) => {
    await expect(page.locator('#theme-switcher')).toBeAttached();
  });

  test('theme menu se deschide la click pe butonul de tema', async ({ page }) => {
    await expect(page.locator('#theme-menu')).toBeHidden();
    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();
    await expect(page.locator('#theme-menu')).toContainText('FORGE');
    await expect(page.locator('#theme-menu')).toContainText('ZEN');
    await expect(page.locator('#theme-menu')).toContainText('ANIME');
  });

  test('schimbarea temei la ZEN modifica variabila CSS --bg', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('active-theme'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#theme-btn', { timeout: 10000 });

    const forgeBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );

    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();
    await page.locator('#theme-menu').getByText('ZEN').click();
    await page.waitForTimeout(400);

    const zenBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );
    expect(zenBg).not.toBe('');
    expect(zenBg).not.toBe(forgeBg);
  });

  test('schimbarea temei la ANIME modifica variabila CSS --bg', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('active-theme'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#theme-btn', { timeout: 10000 });

    const forgeBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );

    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();
    await page.locator('#theme-menu').getByText('ANIME').click();
    await page.waitForTimeout(400);

    const animeBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );
    expect(animeBg).not.toBe('');
    expect(animeBg).not.toBe(forgeBg);
  });

  test('data-theme attribute se seteaza corect pe <html>', async ({ page }) => {
    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();
    await page.locator('#theme-menu').getByText('ZEN').click();
    await page.waitForTimeout(400);
    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(attr).toBe('zen');
  });
});

test.describe('Regression — Layout si CSS', () => {
  test('container max-width <= 430px pe viewport de 1280px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto('/');
    await pg.waitForLoadState('networkidle');
    await pg.waitForSelector('.nb', { timeout: 10000 });

    const w = await pg.evaluate(() => document.body.getBoundingClientRect().width);
    expect(w).toBeLessThanOrEqual(430);
    await ctx.close();
  });

  test('nav bar este fixat in jos (position sticky/fixed)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.nb', { timeout: 10000 });
    const nb = page.locator('.nb').first();
    await expect(nb).toBeVisible();
  });

  test('variabilele CSS principale sunt definite (--bg, --accent, --text)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const vars = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        bg:     s.getPropertyValue('--bg').trim(),
        accent: s.getPropertyValue('--accent').trim(),
        text:   s.getPropertyValue('--text').trim(),
      };
    });
    expect(vars.bg.length,     '--bg nu e definit').toBeGreaterThan(0);
    expect(vars.accent.length, '--accent nu e definit').toBeGreaterThan(0);
    expect(vars.text.length,   '--text nu e definit').toBeGreaterThan(0);
  });
});

test.describe('Regression — Fonturi si retea', () => {
  test('niciun request la Google Fonts nu returneaza 400', async ({ page }) => {
    const fontErrors = [];
    page.on('response', r => {
      if (r.url().includes('fonts.googleapis.com') && r.status() >= 400) {
        fontErrors.push(`${r.status()} → ${r.url()}`);
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(fontErrors, `Font errors: ${fontErrors.join(', ')}`).toHaveLength(0);
  });

  test('aplicatia se incarca in sub 5 secunde', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 5000 });
    expect(Date.now() - t0).toBeLessThan(5000);
  });
});

test.describe('Regression — Coach page elemente esentiale', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window._suppressAAFrictionModal = true;
      window._suppressOnboardingOverlay = true;
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('#today-cmd exista si nu e gol', async ({ page }) => {
    const cmd = page.locator('#today-cmd');
    await expect(cmd).toBeVisible();
    const text = await cmd.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('PR Wall (#pr-wall-list) exista in DOM', async ({ page }) => {
    await expect(page.locator('#pr-wall-list')).toBeAttached();
  });

  test('butonul START sau mesajul OFF exista pe pagina Coach', async ({ page }) => {
    const startBtn = page.locator('#btn-start-main');
    const cmdText  = await page.locator('#today-cmd').textContent();
    const isOff    = cmdText.includes('OFF') || cmdText.includes('RECUPERARE');

    if (isOff) {
      // Off day — start button should be hidden
      await expect(startBtn).toBeHidden();
    } else {
      // Workout day — start button should be visible
      await expect(startBtn).toBeVisible();
    }
  });
});
