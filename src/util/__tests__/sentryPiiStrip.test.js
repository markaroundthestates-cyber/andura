// §17-M3 + §S2.1 audit fix — Sentry beforeSend PII strip pattern verification.
// Tests the scrubMsg logic standalone (Sentry init not invoked here —
// production-only guard prevents test env init).

import { describe, it, expect } from 'vitest';

// Re-implement scrubber inline (matches sentry.js beforeSend body) so we
// test the regex patterns without triggering Sentry initialization in jsdom.
// Anti-drift verification of the EXACT production source lives in
// sentryBeforeSend.test.js (extracts scrubMsg verbatim via regex from src).
function scrubMsg(s) {
  if (typeof s !== 'string') return s;
  let out = s.replace(/\b(uid|userId|user_id)["':=\s/]+([A-Za-z0-9]{28})\b/gi, '$1=<UID>');
  out = out.replace(/\/users\/[A-Za-z0-9]{28}\b/g, '/users/<UID>');
  out = out.replace(/([?&]auth=)[^&\s"'<]+/gi, '$1[REDACTED]');
  out = out.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<EMAIL>');
  return out;
}

describe('Sentry PII strip — Firebase uid context-anchored pattern', () => {
  it('replaces uid= with <UID>', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(uid.length).toBe(28);
    expect(scrubMsg(`uid=${uid} failed`)).toBe('uid=<UID> failed');
  });

  it('replaces userId: variant case-insensitive', () => {
    const uid = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(scrubMsg(`userId: ${uid} oops`)).toBe('userId=<UID> oops');
  });

  it('replaces /users/<uid> path (Firebase REST URL)', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    const url = `https://andura-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}/sessions.json`;
    expect(scrubMsg(url))
      .toBe('https://andura-default-rtdb.europe-west1.firebasedatabase.app/users/<UID>/sessions.json');
  });

  it('does NOT scrub bare 28-char string lacking uid context (anti-Vite-hash collision)', () => {
    // Vite chunk hash example in source-map ref — must be preserved.
    const viteRef = 'webpack:///./src/abcDEFGHIJ1234567890XYZ.js';
    expect(scrubMsg(viteRef)).toBe(viteRef);
  });

  it('does NOT scrub random 28-char alphanumeric in arbitrary context', () => {
    const random = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 28 chars but no uid prefix
    expect(scrubMsg(`token ${random} payload`)).toBe(`token ${random} payload`);
  });

  it('does NOT replace shorter strings (27 chars) with uid prefix', () => {
    const short = 'aaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 27
    expect(scrubMsg(`uid=${short} test`)).toBe(`uid=${short} test`);
  });
});

describe('Sentry PII strip — §MED-1 JSON-quoted uid coverage', () => {
  it('redacts JSON-encoded uid payload (Sentry breadcrumb data path)', () => {
    // Sentry fetch integration parks request bodies as JSON in breadcrumb.data.
    // Pre-fix regex /[=:\s/]/ excluded " so '"uid":"<28chars>"' leaked through.
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`{"uid":"${uid}"}`)).toBe('{"uid=<UID>"}');
  });

  it('redacts JSON-encoded userId with extra whitespace', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`{ "userId" : "${uid}" }`)).toBe('{ "userId=<UID>" }');
  });

  it('redacts single-quoted uid pattern (JS object literal serialization)', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`{'uid':'${uid}'}`)).toBe("{'uid=<UID>'}");
  });

  it('REGRESSION — uid=<uid> (legacy = separator) still works', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`uid=${uid} failed`)).toBe('uid=<UID> failed');
  });

  it('REGRESSION — userId: <uid> (legacy : separator) still works', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`userId: ${uid} oops`)).toBe('userId=<UID> oops');
  });
});

describe('Sentry PII strip — §S-08 auth= JWT token (RTDB URL leak)', () => {
  // Realistic Firebase idToken shape: header.payload.signature (base64url),
  // contains '.', '-', '_' chars. _buildUrl appends ?auth=<encoded token>.
  const JWT = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYyJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

  it('redacts ?auth=<jwt> in RTDB GET URL', () => {
    const url = `https://andura-default-rtdb.europe-west1.firebasedatabase.app/users/abc.json?auth=${JWT}`;
    expect(scrubMsg(url))
      .toBe('https://andura-default-rtdb.europe-west1.firebasedatabase.app/users/abc.json?auth=[REDACTED]');
  });

  it('redacts &auth=<jwt> when preceded by another query param', () => {
    const url = `https://rtdb/users/x.json?print=pretty&auth=${JWT}`;
    expect(scrubMsg(url)).toBe('https://rtdb/users/x.json?print=pretty&auth=[REDACTED]');
  });

  it('redacts auth= token but preserves trailing query params', () => {
    const url = `https://rtdb/x.json?auth=${JWT}&shallow=true`;
    expect(scrubMsg(url)).toBe('https://rtdb/x.json?auth=[REDACTED]&shallow=true');
  });

  it('redacts percent-encoded token value (encodeURIComponent output)', () => {
    // encodeURIComponent may emit %2F etc.; token chars consumed up to delimiter.
    const url = 'https://rtdb/x.json?auth=eyJhbGci%2BzI1NiJ9.payload.sig';
    expect(scrubMsg(url)).toBe('https://rtdb/x.json?auth=[REDACTED]');
  });

  it('NON-REGRESSION — /users/<uid> AND ?auth= both redacted in one URL', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    const url = `https://rtdb/users/${uid}/sessions.json?auth=${JWT}`;
    expect(scrubMsg(url)).toBe('https://rtdb/users/<UID>/sessions.json?auth=[REDACTED]');
  });

  it('leaves URLs without auth= untouched', () => {
    const url = 'https://rtdb/users/x.json?shallow=true';
    expect(scrubMsg(url)).toBe('https://rtdb/users/x.json?shallow=true');
  });
});

describe('Sentry PII strip — email pattern (word-boundary anchored)', () => {
  it('replaces standard email with <EMAIL>', () => {
    expect(scrubMsg('User maziludanielconstantin90@gmail.com failed'))
      .toBe('User <EMAIL> failed');
  });

  it('preserves preceding word (word-boundary fix)', () => {
    // Pre-fix bug: regex without \b prefix stripped "User" along with email
    // ('User user@example.com' -> '<EMAIL>').
    expect(scrubMsg('User user@example.com')).toBe('User <EMAIL>');
  });

  it('replaces email with subdomain', () => {
    expect(scrubMsg('Sent to user@mail.example.co.uk'))
      .toBe('Sent to <EMAIL>');
  });

  it('replaces email with plus alias', () => {
    expect(scrubMsg('alias user+test@example.com here'))
      .toBe('alias <EMAIL> here');
  });

  it('replaces multiple emails', () => {
    expect(scrubMsg('a@b.com and c@d.com'))
      .toBe('<EMAIL> and <EMAIL>');
  });
});

describe('Sentry PII strip — edge cases', () => {
  it('returns non-string unchanged', () => {
    expect(scrubMsg(null)).toBeNull();
    expect(scrubMsg(undefined)).toBeUndefined();
    expect(scrubMsg(42)).toBe(42);
  });

  it('handles empty string', () => {
    expect(scrubMsg('')).toBe('');
  });

  it('combined uid context + email in one message', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`uid=${uid} sent to user@example.com`))
      .toBe('uid=<UID> sent to <EMAIL>');
  });

  it('combined URL path + email scrub', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`/users/${uid} from alice@host.com`))
      .toBe('/users/<UID> from <EMAIL>');
  });
});
