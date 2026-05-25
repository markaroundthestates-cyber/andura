/**
 * Tests for TASK #22b P2 batch fixes:
 * H11c — COACH_RELEVANT_KEYS completeness
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── H11c — COACH_RELEVANT_KEYS ────────────────────────────────────────────
// COACH_RELEVANT_KEYS moved to dataRegistry.js (Task #27); firebase.js imports from there.

describe('H11c — COACH_RELEVANT_KEYS completeness', () => {
  const registrySrc = readFileSync(resolve(__dirname, '../../util/dataRegistry.js'), 'utf8');

  it('includes all 6 previously missing keys', () => {
    const required = [
      'unavailable-equipment',
      'equipment-occupied-session',
      'applied-patterns',
      'session-burns',
      'early-stops',
      'workout-skips',
    ];
    for (const key of required) {
      expect(registrySrc).toContain(`'${key}'`);
    }
  });

  it('original 5 keys still present', () => {
    const original = ['logs', 'readiness', 'phase-override', 'current-kcal', 'weights'];
    for (const key of original) {
      expect(registrySrc).toContain(`'${key}'`);
    }
  });

  it('firebase.js imports COACH_RELEVANT_KEYS from dataRegistry', () => {
    const firebaseSrc = readFileSync(resolve(__dirname, '../../firebase.js'), 'utf8');
    expect(firebaseSrc).toContain("import { COACH_RELEVANT_KEYS } from './util/dataRegistry.js'");
  });
});
