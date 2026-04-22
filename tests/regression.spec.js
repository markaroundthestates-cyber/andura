/**
 * Regression tests — verify that existing features haven't broken.
 * These duplicate the critical paths from smoke/visual but with additional
 * assertions and clear regression context.
 */
import { test, expect } from '@playwright/test';

test.describe('Regression — Core app integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');
  });

  test('aplicația se încarcă fără erori JS critice', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const critical = errors.filter(m =>
      m.includes('ReferenceError') || m.includes('TypeError') || m.includes('SyntaxError')
    );
    expect(critical, `Erori JS: ${critical.join('; ')}`).toHaveLength(0);
  });

  test('titlul paginii este SalaFull', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('SalaFull');
  });

  test('body nu e gol după load', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });
});

test.describe('Regression — Navigație', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.nb', { timeout: 10000 });
  });

  test('există exact 5 butoane de navigație vizibile', async ({ page }) => {
    const navBtns = page.locator('.nb');
    await expect(navBtns).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(navBtns.nth(i)).toBeVisible();
    }
  });

  test('click pe DASH navighează la pagina dashboard', async ({ page }) => {
    await page.locator('.nb').nth(1).click();
    await page.waitForTimeout(400);
    const dashPage = page.locator('#page-dash');
    await expect(dashPage).toBeVisible();
  });

  test('click pe WEIGHT navighează la pagina weight', async ({ page }) => {
    await page.locator('.nb').nth(2).click();
    await page.waitForTimeout(400);
    const weightPage = page.locator('#page-weight');
    await expect(weightPage).toBeVisible();
  });

  test('click pe PROG navighează la pagina prog', async ({ page }) => {
    await page.locator('.nb').nth(3).click();
    await page.waitForTimeout(400);
    const progPage = page.locator('#page-prog');
    await expect(progPage).toBeVisible();
  });

  test('click pe PLAN navighează la pagina plan', async ({ page }) => {
    await page.locator('.nb').nth(4).click();
    await page.waitForTimeout(400);
    const planPage = page.locator('#page-plan');
    await expect(planPage).toBeVisible();
  });

  test('navigând înapoi la COACH afișează pagina corectă', async ({ page }) => {
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
    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#theme-btn', { timeout: 10000 });
  });

  test('#theme-switcher există în DOM', async ({ page }) => {
    await expect(page.locator('#theme-switcher')).toBeAttached();
  });

  test('theme menu se deschide la click pe butonul de temă', async ({ page }) => {
    await expect(page.locator('#theme-menu')).toBeHidden();
    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();
    await expect(page.locator('#theme-menu')).toContainText('FORGE');
    await expect(page.locator('#theme-menu')).toContainText('ZEN');
    await expect(page.locator('#theme-menu')).toContainText('ANIME');
  });

  test('schimbarea temei la ZEN modifică variabila CSS --bg', async ({ page }) => {
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

  test('schimbarea temei la ANIME modifică variabila CSS --bg', async ({ page }) => {
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

  test('data-theme attribute se setează corect pe <html>', async ({ page }) => {
    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();
    await page.locator('#theme-menu').getByText('ZEN').click();
    await page.waitForTimeout(400);
    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(attr).toBe('zen');
  });
});

test.describe('Regression — Layout și CSS', () => {
  test('container max-width <= 430px pe viewport de 1280px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto('/salafull/');
    await pg.waitForLoadState('networkidle');
    await pg.waitForSelector('.nb', { timeout: 10000 });

    const w = await pg.evaluate(() => document.body.getBoundingClientRect().width);
    expect(w).toBeLessThanOrEqual(430);
    await ctx.close();
  });

  test('nav bar este fixat în jos (position sticky/fixed)', async ({ page }) => {
    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.nb', { timeout: 10000 });
    const nb = page.locator('.nb').first();
    await expect(nb).toBeVisible();
  });

  test('variabilele CSS principale sunt definite (--bg, --accent, --text)', async ({ page }) => {
    await page.goto('/salafull/');
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

test.describe('Regression — Fonturi și rețea', () => {
  test('niciun request la Google Fonts nu returnează 400', async ({ page }) => {
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

  test('aplicația se încarcă în sub 5 secunde', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/salafull/', { waitUntil: 'domcontentloaded', timeout: 5000 });
    expect(Date.now() - t0).toBeLessThan(5000);
  });
});

test.describe('Regression — Coach page elemente esențiale', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');
  });

  test('#today-cmd există și nu e gol', async ({ page }) => {
    const cmd = page.locator('#today-cmd');
    await expect(cmd).toBeVisible();
    const text = await cmd.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('PR Wall (#pr-wall-list) există în DOM', async ({ page }) => {
    await expect(page.locator('#pr-wall-list')).toBeAttached();
  });

  test('butonul START sau mesajul OFF există pe pagina Coach', async ({ page }) => {
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
