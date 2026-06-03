// REGRESSION — Wave 2 CORE library gate (Daniel live bug 2026-06-03: "cum drq sa
// imi dai farmer walk... reverse grip cand am un spate intreg de lucrat...
// recomandarile trebuie sa fie first common exercises... gigel oare stia vre-o
// unu?"). Auto-selection must draw ONLY from the curated CORE_AUTO catalog when
// equipment is available; esoteric long-tail + MANUAL_ADVANCED variants must NOT
// surface over common staples. Locks the poolForGroup CORE-first gate across
// every cluster + many seeds.

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { EXERCISE_METADATA, getExerciseMetadata } from '../exerciseLibrary.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const ctx = (over = {}) => ({
  equipment: { available: over.available ?? allEquip },
  weakGroups: over.weakGroups ?? [],
  profileTier: 'profileTier' in over ? over.profileTier : 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
});

const CLUSTERS = ['push', 'pull', 'legs', 'upper', 'lower', 'full'];

describe('CORE library gate — full equipment auto-selection is CORE_AUTO only', () => {
  it('every auto-selected exercise is CORE_AUTO or FALLBACK (no untagged long-tail) across all clusters + 25 seeds', () => {
    for (const cluster of CLUSTERS) {
      for (let s = 0; s < 25; s++) {
        const session = buildSession(cluster, ctx({ seed: `core|${cluster}|${s}` }));
        for (const ex of session.exercises) {
          const status = getExerciseMetadata(ex.name).status;
          // No PR history → auto pool is CORE_AUTO (preferred) + FALLBACK (last
          // resort). An untagged long-tail / MANUAL_ADVANCED variant must NEVER
          // surface — that was the "farmer's walk / reverse-grip exotic" bug.
          expect(['CORE_AUTO', 'FALLBACK'], `${cluster} seed ${s}: "${ex.name}" status=${status}`)
            .toContain(status);
        }
      }
    }
  });

  it('sessions stay substantial — never thinned below the floor by the CORE gate', () => {
    for (const cluster of CLUSTERS) {
      for (let s = 0; s < 25; s++) {
        const n = buildSession(cluster, ctx({ seed: `size|${cluster}|${s}` })).exercises.length;
        expect(n, `${cluster} seed ${s} produced only ${n} exercises`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('a MANUAL_ADVANCED movement (Wall-Supported Handstand Push-up) NEVER auto-appears', () => {
    expect(EXERCISE_METADATA['Wall-Supported Handstand Push-up'].status).toBe('MANUAL_ADVANCED');
    for (const cluster of ['push', 'upper', 'full']) {
      for (let s = 0; s < 40; s++) {
        const names = buildSession(cluster, ctx({ seed: `ma|${cluster}|${s}` })).exercises.map((e) => e.name);
        expect(names).not.toContain('Wall-Supported Handstand Push-up');
      }
    }
  });

  it('Conventional Deadlift (reclassified MANUAL_ADVANCED) never auto-appears on a leg/pull day', () => {
    expect(EXERCISE_METADATA['Conventional Deadlift'].status).toBe('MANUAL_ADVANCED');
    for (const cluster of ['legs', 'lower', 'pull', 'full']) {
      for (let s = 0; s < 40; s++) {
        const names = buildSession(cluster, ctx({ seed: `cd|${cluster}|${s}` })).exercises.map((e) => e.name);
        expect(names).not.toContain('Conventional Deadlift');
      }
    }
  });

  it('PR continuity: a logged non-CORE exercise IS still offered (user keeps their lift)', () => {
    // Pick a real non-CORE back exercise the user "logged" → must be selectable.
    const nonCoreBack = Object.entries(EXERCISE_METADATA).find(
      ([, m]) => m.muscle_target_primary === 'spate' && m.status !== 'CORE_AUTO'
        && m.status !== 'MANUAL_ADVANCED' && m.status !== 'DEPRECATED',
    );
    expect(nonCoreBack).toBeDefined();
    const [name] = nonCoreBack;
    let appeared = false;
    for (let s = 0; s < 30 && !appeared; s++) {
      const names = buildSession('pull', ctx({ seed: `pr|${s}`, prNames: [name] })).exercises.map((e) => e.name);
      if (names.includes(name)) appeared = true;
    }
    expect(appeared).toBe(true);
  });
});
