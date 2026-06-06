// ══ ACTIVE VISIBILITY GATE — Daniel SSOT 2026-06-05 ══════════════════════════
// Founder decision: ONLY the curated CORE_AUTO staples are ACTIVE (selectable or
// offered). The other ~514 entries (MANUAL_ADVANCED, FALLBACK, untagged long-tail)
// stay in exercises.json but must NEVER surface where the engine selects/offers an
// exercise: daily-plan SELECTION (sessionBuilder) + every swap/alternative path
// (alternativeFinder). This locks that gate at every offer point and proves every
// Big-11 muscle group has enough CORE_AUTO options that selection + swaps never
// starve. Uses REAL data from exercises.json.

import { describe, it, expect } from 'vitest';
import {
  EXERCISE_METADATA,
  isActiveExercise,
  ACTIVE_STATUSES,
} from '../exerciseLibrary.js';
import {
  findAlternatives,
  findRefusalPool,
  getFallbackCascade,
} from '../alternativeFinder.js';
import { buildSession } from '../sessionBuilder.js';

const BIG11 = [
  'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core',
  'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
];

const isActive = (name) => isActiveExercise(name);

// All coarse equipment available (full commercial gym) — the normal case.
const ALL_EQUIP = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight'];

describe('ACTIVE visibility gate — single source of truth', () => {
  it('ACTIVE_STATUSES is exactly { CORE_AUTO } (one place to widen)', () => {
    expect([...ACTIVE_STATUSES].sort()).toEqual(['CORE_AUTO']);
  });

  it('isActiveExercise: CORE_AUTO true; untagged / MANUAL_ADVANCED / FALLBACK / unknown false', () => {
    // Real entries (verified against exercises.json).
    expect(isActiveExercise('Flat Barbell Bench')).toBe(true); // CORE_AUTO
    expect(isActiveExercise('Wall-Supported Handstand Push-up')).toBe(false); // MANUAL_ADVANCED
    expect(isActiveExercise('Conventional Deadlift')).toBe(false); // MANUAL_ADVANCED
    expect(isActiveExercise('Nordic Hamstring Curl Assisted')).toBe(false); // FALLBACK
    expect(isActiveExercise('Lateral Raises')).toBe(false); // untagged long-tail
    expect(isActiveExercise('Totally Not Real')).toBe(false); // unknown
  });

  it('the active catalog is the 144 CORE_AUTO entries (data preserved, just hidden)', () => {
    // 144 = the original 143 + `45-Degree Leg Press`, tagged CORE_AUTO 2026-06-06
    // so the founder's real gym machine (a 45deg sled press, not the generic
    // horizontal Leg Press) is selectable in the swap pick-list. Tagging only —
    // no load-model / cold-start change (the 45-vs-horizontal load delta is a
    // separate per-user equipment decision, deliberately deferred).
    const active = Object.keys(EXERCISE_METADATA).filter(isActive);
    const coreAuto = Object.entries(EXERCISE_METADATA)
      .filter(([, m]) => m.status === 'CORE_AUTO').map(([n]) => n);
    expect(active.sort()).toEqual(coreAuto.sort());
    expect(active.length).toBe(144);
    expect(active).toContain('45-Degree Leg Press');
    // Full library untouched (reversibility): all 657 still present.
    expect(Object.keys(EXERCISE_METADATA).length).toBe(657);
  });
});

describe('ACTIVE gate — daily-plan SELECTION (sessionBuilder)', () => {
  const CLUSTERS = ['push', 'pull', 'legs', 'upper', 'lower', 'full'];
  const ctx = (seed) => ({
    equipment: { available: ['barbell', 'dumbbell', 'machine', 'cable', 'band'] },
    profileTier: 'T2',
    prNames: [],
    seed,
  });

  it('every auto-selected exercise is ACTIVE (CORE_AUTO) — no untagged / FALLBACK / MANUAL_ADVANCED', () => {
    for (const cluster of CLUSTERS) {
      for (let s = 0; s < 30; s++) {
        const session = buildSession(cluster, ctx(`gate|${cluster}|${s}`));
        for (const ex of session.exercises) {
          expect(
            isActive(ex.name),
            `${cluster} seed ${s}: "${ex.name}" status=${EXERCISE_METADATA[ex.name]?.status}`,
          ).toBe(true);
        }
      }
    }
  });
});

describe('ACTIVE gate — every alternativeFinder OFFER is active', () => {
  // Drive each path with a broad set of active source exercises + equipment
  // scenarios and assert no path EVER hands back a non-active name.
  const SOURCES = Object.entries(EXERCISE_METADATA)
    .filter(([, m]) => m.status === 'CORE_AUTO')
    .map(([n]) => n);
  const EQUIP_SCENARIOS = [
    ALL_EQUIP,
    ['dumbbell', 'bodyweight'],
    ['machine', 'bodyweight'],
    ['cable', 'bodyweight'],
    ['bodyweight'],
    [],
  ];

  it('findAlternatives never offers a non-active candidate', () => {
    for (const src of SOURCES) {
      for (const alt of findAlternatives(src).alternatives) {
        expect(isActive(alt.name), `findAlternatives(${src}) → ${alt.name}`).toBe(true);
      }
    }
  });

  it('findRefusalPool never offers a non-active candidate (broad 657 pool, gated)', () => {
    for (const src of SOURCES) {
      const { candidates } = findRefusalPool(src, []);
      for (const c of candidates) {
        expect(isActive(c.name), `findRefusalPool(${src}) → ${c.name}`).toBe(true);
      }
    }
  });

  it('getFallbackCascade (cascade + ranking + broad-library) never offers a non-active swap', () => {
    for (const src of SOURCES) {
      for (const equip of EQUIP_SCENARIOS) {
        const r = getFallbackCascade(src, equip);
        if (r.noAlt) continue;
        if (r.isAlternative === false) {
          // Returned the original unchanged (performable as-is): the source is
          // itself active (we only iterate active sources), so fine.
          continue;
        }
        const offered = [];
        if (typeof r.exercise === 'string') offered.push(r.exercise);
        if (Array.isArray(r.exercises)) offered.push(...r.exercises);
        for (const name of offered) {
          expect(
            isActive(name),
            `getFallbackCascade(${src}, [${equip}]) step=${r.cascadeStep} → ${name}`,
          ).toBe(true);
        }
      }
    }
  });
});

describe('ACTIVE coverage guardrail — no Big-11 group starves under CORE_AUTO-only', () => {
  // Per group, count CORE_AUTO entries selectable at the conservative tier-2
  // ceiling (T0/T1 default). A group must carry a sane minimum so selection AND
  // swaps always have a few valid same-muscle alternatives. ZERO would be a
  // ship-stopper (broken plan for that group).
  const MIN_CORE_PER_GROUP = 3; // a skip must always find a few valid swaps
  const coreAutoCount = (group, maxTier = 2) =>
    Object.values(EXERCISE_METADATA).filter(
      (m) => m.muscle_target_primary === group
        && m.status === 'CORE_AUTO' && m.tier <= maxTier,
    ).length;

  it('every Big-11 group has >= MIN_CORE_PER_GROUP CORE_AUTO options (tier<=2)', () => {
    const thin = [];
    for (const g of BIG11) {
      const n = coreAutoCount(g);
      if (n < MIN_CORE_PER_GROUP) thin.push(`${g}: ${n}`);
    }
    expect(thin, `THIN/EMPTY groups under CORE_AUTO-only: ${thin.join(', ')}`).toEqual([]);
  });

  it('no Big-11 group is EMPTY of CORE_AUTO even including tier-3 (hard ship-stopper)', () => {
    for (const g of BIG11) {
      expect(coreAutoCount(g, 3), `group "${g}" has ZERO CORE_AUTO`).toBeGreaterThan(0);
    }
  });

  it('a refusal swap always finds at least one active same-muscle alternative for every group', () => {
    // For each group, take a CORE_AUTO source and prove findRefusalPool yields a
    // non-empty active pool (a skip never dead-ends "no alternative" on a fresh
    // refusal for a populated group).
    for (const g of BIG11) {
      const src = Object.entries(EXERCISE_METADATA).find(
        ([, m]) => m.muscle_target_primary === g && m.status === 'CORE_AUTO',
      );
      expect(src, `no CORE_AUTO source for group ${g}`).toBeDefined();
      const { candidates } = findRefusalPool(src[0], []);
      expect(candidates.length, `group ${g}: refusal pool empty for ${src[0]}`).toBeGreaterThan(0);
      expect(candidates.every((c) => isActive(c.name))).toBe(true);
    }
  });
});
