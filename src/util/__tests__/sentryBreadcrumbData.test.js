// §SEC-23-01 (audit) — Sentry beforeSend breadcrumb DATA scrub regression.
//
// Defect: §SEC-22-01 scrubbed only bc.data.url (the fetch/xhr integration key).
// The default Sentry Breadcrumbs integration records NAVIGATION breadcrumbs with
// the URL under bc.data.from + bc.data.to — which beforeSend NEVER scrubbed. On
// /auth-callback?mode=signIn&oobCode=<token>&email=<addr> the navigation crumbs
// (page-load history + the verify-fail navigate('/auth?error=...') with NO
// replaceState) shipped the single-use sign-in oobCode + email in cleartext.
//
// This test extracts the REAL beforeSend body verbatim from src/util/sentry.js
// (so it can't drift from production) and runs it over constructed event shapes.
// Fails before the fix (from/to/arbitrary keys leaked); passes after (all
// string-valued bc.data fields scrubbed; benign fields + bc.data.url unchanged).

import { describe, it, expect, beforeEach } from 'vitest';

let prodBeforeSend;

beforeEach(async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/util/sentry.js'),
    'utf-8'
  );
  // Extract the beforeSend(event) { ... return event; } body verbatim.
  const match = src.match(/beforeSend\(event\)\s*\{([\s\S]*?)\n\s{6}\},/);
  if (!match) throw new Error('Could not extract beforeSend from sentry.js — source structure changed');
  // Strip JSDoc /** @type {string} */ casts (not valid runtime JS).
  const body = match[1].replace(/\/\*\*[\s\S]*?\*\//g, '');
  prodBeforeSend = new Function('event', body);
});

const OOB = 'ABCdef123_THE_REAL_SIGNIN_TOKEN_xyz789';
const NAV_FROM = `https://andura.app/auth-callback?mode=signIn&oobCode=${OOB}&email=gigel%40example.com`;
const NAV_TO = 'https://andura.app/auth?error=expired-action-code';

describe('Sentry beforeSend — navigation breadcrumb data leak (§SEC-23-01)', () => {
  it('scrubs oobCode + encoded email out of bc.data.from (navigation crumb)', () => {
    const event = {
      breadcrumbs: [
        { category: 'navigation', data: { from: NAV_FROM, to: NAV_TO } },
      ],
    };
    const out = prodBeforeSend(event);
    const data = out.breadcrumbs[0].data;
    expect(data.from).not.toContain(OOB);
    expect(data.from).not.toContain('%40');
    expect(data.from).toContain('oobCode=[REDACTED]');
    expect(data.from).toContain('email=[REDACTED]');
  });

  it('scrubs an ARBITRARY string-valued bc.data key (future-key class closed)', () => {
    const event = {
      breadcrumbs: [
        { category: 'navigation', data: { someFutureKey: NAV_FROM } },
      ],
    };
    const out = prodBeforeSend(event);
    expect(out.breadcrumbs[0].data.someFutureKey).not.toContain(OOB);
    expect(out.breadcrumbs[0].data.someFutureKey).toContain('oobCode=[REDACTED]');
  });

  it('leaves a benign string bc.data field untouched', () => {
    const event = {
      breadcrumbs: [
        { category: 'ui.click', data: { from: NAV_FROM, label: 'Save settings' } },
      ],
    };
    const out = prodBeforeSend(event);
    expect(out.breadcrumbs[0].data.label).toBe('Save settings');
  });

  it('does NOT mangle non-string bc.data fields (numbers/objects pass through)', () => {
    const nested = { inner: NAV_FROM };
    const event = {
      breadcrumbs: [
        { category: 'navigation', data: { statusCode: 302, meta: nested } },
      ],
    };
    const out = prodBeforeSend(event);
    expect(out.breadcrumbs[0].data.statusCode).toBe(302);
    // non-string nested object is left as-is (only top-level strings scrubbed)
    expect(out.breadcrumbs[0].data.meta).toBe(nested);
  });

  it('REGRESSION — existing bc.data.url scrub still works (fetch crumb)', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    const event = {
      breadcrumbs: [
        { category: 'fetch', data: { url: `https://rtdb/users/${uid}/sessions.json?auth=eyJh.bcd.efg` } },
      ],
    };
    const out = prodBeforeSend(event);
    expect(out.breadcrumbs[0].data.url).toBe('https://rtdb/users/<UID>/sessions.json?auth=[REDACTED]');
  });

  it('REGRESSION — bc.message scrub still works', () => {
    const event = {
      breadcrumbs: [
        { category: 'console', message: 'sent to alice@example.com', data: {} },
      ],
    };
    const out = prodBeforeSend(event);
    expect(out.breadcrumbs[0].message).toBe('sent to <EMAIL>');
  });
});
