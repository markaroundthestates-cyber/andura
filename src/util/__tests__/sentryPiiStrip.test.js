// §17-M3 audit fix — Sentry beforeSend PII strip pattern verification.
// Tests the scrubMsg logic standalone (Sentry init not invoked here —
// production-only guard prevents test env init).

import { describe, it, expect } from 'vitest';

// Re-implement scrubber inline (matches sentry.js beforeSend body) so we
// test the regex patterns without triggering Sentry initialization in jsdom.
function scrubMsg(s) {
  if (typeof s !== 'string') return s;
  let out = s.replace(/\b[A-Za-z0-9]{28}\b/g, '<UID>');
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<EMAIL>');
  return out;
}

describe('Sentry PII strip — Firebase uid 28-char pattern', () => {
  it('replaces 28-char alphanumeric uid with <UID>', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(uid.length).toBe(28);
    expect(scrubMsg(`User ${uid} failed`)).toBe('User <UID> failed');
  });

  it('replaces multiple uids in same message', () => {
    const uid1 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const uid2 = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    expect(scrubMsg(`${uid1} -> ${uid2}`)).toBe('<UID> -> <UID>');
  });

  it('does NOT replace shorter strings (27 chars)', () => {
    const short = 'aaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 27
    expect(scrubMsg(`${short} test`)).toBe(`${short} test`);
  });

  it('does NOT replace longer strings (29 chars)', () => {
    const long = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 29
    expect(scrubMsg(`${long} test`)).toBe(`${long} test`);
  });
});

describe('Sentry PII strip — email pattern', () => {
  it('replaces standard email with <EMAIL>', () => {
    expect(scrubMsg('User maziludanielconstantin90@gmail.com failed'))
      .toBe('User <EMAIL> failed');
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

  it('combined uid + email in one message', () => {
    const uid = 'abcDEF1234567890XYZabcde9876';
    expect(scrubMsg(`${uid} sent to user@example.com`))
      .toBe('<UID> sent to <EMAIL>');
  });
});
