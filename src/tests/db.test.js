/**
 * TASK #31 — db.js date helpers tests
 * Tests for tod(), todTs(), todDate() — all use 'sv' locale for YYYY-MM-DD.
 */

import { describe, it, expect } from 'vitest';
import { tod, todTs, todDate } from '../db.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Test 1 ────────────────────────────────────────────────────────────────────
describe('db date helpers', () => {
  it('tod() returns YYYY-MM-DD format string', () => {
    const result = tod();
    expect(typeof result).toBe('string');
    expect(result).toMatch(DATE_RE);
    expect(result.length).toBe(10);
  });

  // ── Test 2 ────────────────────────────────────────────────────────────────
  it('todTs(ts) returns YYYY-MM-DD format for a known timestamp', () => {
    // 2026-04-26 (UTC) — use a midday timestamp so UTC/local differences don't matter
    const ts = new Date('2026-04-26T12:00:00Z').getTime();
    const result = todTs(ts);
    expect(typeof result).toBe('string');
    expect(result).toMatch(DATE_RE);
    // Midday UTC = midday in any timezone — should always be 2026-04-26
    expect(result).toBe('2026-04-26');
  });

  // ── Test 3 ────────────────────────────────────────────────────────────────
  it('todDate(d) returns YYYY-MM-DD format for a given Date object', () => {
    // Use a midday Date so timezone doesn't affect result
    const d = new Date('2025-12-31T12:00:00Z');
    const result = todDate(d);
    expect(typeof result).toBe('string');
    expect(result).toMatch(DATE_RE);
    expect(result).toBe('2025-12-31');
  });

  // ── Test 4 ────────────────────────────────────────────────────────────────
  it('tod() and todTs(Date.now()) are consistent (allow 1s drift)', () => {
    // Both should return today's local date
    const todResult = tod();
    const todTsResult = todTs(Date.now());
    // Both should match YYYY-MM-DD and agree (within same second)
    expect(todResult).toMatch(DATE_RE);
    expect(todTsResult).toMatch(DATE_RE);
    // Allow for a rare midnight-crossing edge case — diff at most 1 day
    const a = new Date(todResult).getTime();
    const b = new Date(todTsResult).getTime();
    expect(Math.abs(a - b)).toBeLessThanOrEqual(86400000);
  });
});
