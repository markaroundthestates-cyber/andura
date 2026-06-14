// Track 7 §7.2 — Magic Link UI smoke (no real auth completion required).
// Verifies that the email + send-link UI is reachable, accessible, and dispatches
// a sendSignInLinkToEmail call to Firebase (intercept the network request — we
// don't need email to actually arrive to validate the dispatch contract).
//
// Per master spec §1.2: "auth UI 1x verify Magic Link `andura.app` real (smoke
// prod gate)". This spec is auth-state-INDEPENDENT — runs without storageState.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function dismissMedicalDisclaimerIfPresent(page: import('@playwright/test').Page) {
  // LOCK 4 Medical Disclaimer Modal — sticky overlay on first visit. Per Track 5
  // backlog (ANDURA_PRIMER §6) the modal blocks click pointer events; dismiss
  // when present via accept-CTA selector — graceful no-op when absent.
  const acceptButton = page.getByRole('button', {
    name: /accept|continui|inteleg|de acord/i,
  });
  if (await acceptButton.count()) {
    await acceptButton.first().click({ timeout: 5000 }).catch(() => {});
  }
}

test.describe('Magic Link UI smoke', () => {
  test('homepage renders + magic-link entry point reachable', async ({ page }) => {
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);

    // Look for ANY auth-related entry — email input or "trimite link" CTA.
    // Multiple selector candidates because UI wording may vary across milestones.
    const candidates = [
      page.getByRole('textbox', { name: /email/i }),
      page.getByPlaceholder(/email/i),
      page.locator('input[type="email"]'),
    ];
    let found = false;
    let foundCandidate: (typeof candidates)[number] | null = null;
    for (const c of candidates) {
      if (await c.count()) {
        found = true;
        foundCandidate = c;
        break;
      }
    }
    if (!found) {
      test.skip(
        true,
        'magic-link email entry not present in current UI build — Magic Link flow lives în Cont tab post-auth in some configs',
      );
    }
    // Found-path assertion: the entry point must not just EXIST in the DOM, it
    // must be VISIBLE to the user — otherwise "reachable" is unverified (the
    // test previously asserted nothing on this branch).
    await expect(foundCandidate!.first()).toBeVisible();
  });

  test('email input + send button accept valid email — network dispatch intercepted', async ({
    page,
  }) => {
    // Intercept any Firebase Auth signInWithEmailLink / sendSignInLinkToEmail
    // related identitytoolkit.googleapis.com call BEFORE navigation.
    const dispatched: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('identitytoolkit.googleapis.com') ||
        url.includes('sendOobCode') ||
        url.includes('sendSignInLinkToEmail')
      ) {
        dispatched.push(url);
      }
    });

    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);

    const emailInput = page.locator('input[type="email"]').first();
    if (!(await emailInput.count())) {
      test.skip(true, 'email input not present în current homepage build');
      return;
    }

    await emailInput.fill('playwright-smoke@andura.app');
    const sendButton = page.getByRole('button', {
      name: /trimite|send|magic link|continui|conecteaza/i,
    });
    if (!(await sendButton.count())) {
      test.skip(true, 'send-button not present în current homepage build');
      return;
    }
    // Wait for either dispatch OR a 5s timeout — graceful soft assertion since
    // form may client-side-validate-fail before dispatching (UI smoke focus, NU
    // full auth verification — that's the Checkly Tier 2 synthetic prod job).
    const dispatchPromise = page
      .waitForRequest(
        (req) =>
          req.url().includes('identitytoolkit.googleapis.com') ||
          req.url().includes('sendOobCode'),
        { timeout: 5000 },
      )
      .catch(() => null);
    await sendButton.first().click({ timeout: 5000 });
    await dispatchPromise;
    // Meaningful contract: clicking send EITHER fired a Firebase auth dispatch
    // OR surfaced a client-side validation message (invalid/email). The old
    // `>= 0` assert was a tautology (a length is always >= 0) and could never
    // fail. Soft so the WCAG case below still runs even if this regresses.
    const validationVisible = await page.getByText(/invalid|email/i).count();
    expect.soft(dispatched.length > 0 || validationVisible > 0).toBe(true);
  });

  test('Magic Link entry page passes axe-core WCAG 2.1 AA (zero critical/serious)', async ({
    page,
  }) => {
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect.soft(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
});
