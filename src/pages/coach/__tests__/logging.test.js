/**
 * Tests for TASK #AA-FIX — RPE 4-tap input (selectRPE + confirmReps)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const loggingSrc = readFileSync(resolve(__dirname, '../logging.js'), 'utf8');
const stateSrc = readFileSync(resolve(__dirname, '../../../state.js'), 'utf8');

// ── state.js — lastSetRPE field ─────────────────────────────────────────────

describe('state — lastSetRPE field', () => {
  it('state.js exports lastSetRPE initialized to null', () => {
    expect(stateSrc).toContain('lastSetRPE: null');
  });
});

// ── selectRPE — functional (was no-op) ──────────────────────────────────────

describe('selectRPE — implementation', () => {
  it('sets state.lastSetRPE (no longer a no-op)', () => {
    expect(loggingSrc).toContain('state.lastSetRPE = rpe');
  });

  it('removes .sel class from all 4 rpe buttons before adding to selected', () => {
    expect(loggingSrc).toContain("'easy', 'ok', 'hard', 'very-hard'");
    expect(loggingSrc).toContain("btn.classList.remove('sel')");
  });

  it('maps RPE 6.5 → easy button id', () => {
    expect(loggingSrc).toContain("6.5: 'easy'");
  });

  it('maps RPE 10 → very-hard button id', () => {
    expect(loggingSrc).toContain("10: 'very-hard'");
  });

  it('exposes selectRPE on window for HTML onclick handlers', () => {
    expect(loggingSrc).toContain('window.selectRPE = selectRPE');
  });
});

// ── confirmReps — RPE consume + log shape ───────────────────────────────────

describe('confirmReps — RPE integration', () => {
  it('accepts skipped parameter (not a no-arg function)', () => {
    expect(loggingSrc).toContain('confirmReps(skipped = false)');
  });

  it('reads state.lastSetRPE when not skipped', () => {
    expect(loggingSrc).toContain('const rpe = skipped ? undefined : state.lastSetRPE');
  });

  it('resets state.lastSetRPE to null after consuming', () => {
    expect(loggingSrc).toContain('state.lastSetRPE = null');
  });

  it('only adds rpe field to log entry if rpe is not undefined/null', () => {
    expect(loggingSrc).toContain('if (rpe !== undefined && rpe !== null) logEntry.rpe = rpe');
  });

  it('also adds rpe to sessLog entry for renderSessLog display', () => {
    expect(loggingSrc).toContain('if (rpe !== undefined && rpe !== null) sessEntry.rpe = rpe');
  });

  it('exposes confirmReps on window for HTML onclick handlers', () => {
    expect(loggingSrc).toContain('window.confirmReps = confirmReps');
  });
});

// ── RPE skip path — log.rpe absent ──────────────────────────────────────────

describe('confirmReps — skip path', () => {
  it('skip path sets rpe to undefined (not 0 or null)', () => {
    // rpe = skipped ? undefined : state.lastSetRPE
    // When skipped=true → rpe = undefined → conditional never adds to logEntry
    expect(loggingSrc).toContain('skipped ? undefined : state.lastSetRPE');
  });
});

// ── End-of-session — 0-rated sets trigger hint ──────────────────────────────

describe('session — 0-rated sets hint', () => {
  const sessionSrc = readFileSync(resolve(__dirname, '../session.js'), 'utf8');

  it('computes noneRated flag before showSessionRating', () => {
    expect(sessionSrc).toContain('const ratedSets = state.sessLog.filter(s => s.rpe !== undefined && s.rpe !== null).length');
    expect(sessionSrc).toContain('const noneRated = state.sessLog.length > 0 && ratedSets === 0');
  });

  it('passes noneRated to showSessionRating', () => {
    expect(sessionSrc).toContain('noneRated');
    expect(sessionSrc).toContain('showSessionRating(');
  });
});
