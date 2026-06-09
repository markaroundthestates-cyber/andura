// Wave 1 — "Andura picks like Daniel". With dp_daniel_tier_select_v1 ON (the
// ctx.danielTierSelect override on the pure builder), each muscle's auto-pool must
// lead with Daniel's S/A picks and must contain NO D-band anti-pattern (unless it
// is the muscle's last option). Flag OFF → unchanged behavior (covered elsewhere).

import { describe, it, expect } from 'vitest';
import { buildSession } from '../sessionBuilder.js';
import { EXERCISE_METADATA, getExerciseMetadata, isActiveMeta } from '../exerciseLibrary.js';
import { EXERCISE_TIER_RANK, tierRankOf } from '../exerciseTierRank.js';

const allEquip = ['barbell', 'dumbbell', 'machine', 'cable', 'band'];
const ctx = (over = {}) => ({
  equipment: { available: over.available ?? allEquip },
  weakGroups: over.weakGroups ?? [],
  profileTier: 'profileTier' in over ? over.profileTier : 'T2',
  prNames: over.prNames ?? [],
  seed: over.seed ?? 'user-1|2026-05-25|0',
  danielTierSelect: over.danielTierSelect ?? true,
});

const CLUSTERS = ['push', 'pull', 'legs', 'upper', 'lower', 'full'];

// The D-band library entries (anti-pattern blocklist) Daniel hard-excludes.
const D_BAND = Object.keys(EXERCISE_TIER_RANK).filter((n) => EXERCISE_TIER_RANK[n] === 'D');

describe('dp_daniel_tier_select_v1 — selection follows Daniel\'s expert tier list', () => {
  it('NO D-band anti-pattern is ever auto-selected (no PR history, flag ON)', () => {
    for (const cluster of CLUSTERS) {
      for (let s = 0; s < 40; s++) {
        const names = buildSession(cluster, ctx({ seed: `noD|${cluster}|${s}` }))
          .exercises.map((e) => e.name);
        for (const n of names) {
          expect(D_BAND, `${cluster} seed ${s}: D-band "${n}" was selected`).not.toContain(n);
        }
      }
    }
  });

  it('each muscle group present leads with an S/A pick (its highest band) when one exists', () => {
    for (const cluster of CLUSTERS) {
      for (let s = 0; s < 25; s++) {
        const ex = buildSession(cluster, ctx({ seed: `lead|${cluster}|${s}` })).exercises;
        // First selected exercise per muscle group (selection order is preserved
        // within a tier band; the builder reorders compounds-first across the whole
        // session, so compare WITHIN a group only).
        const firstOfGroup = {};
        for (const e of ex) {
          const g = getExerciseMetadata(e.name).muscle_target_primary;
          if (!(g in firstOfGroup)) firstOfGroup[g] = e.name;
        }
        // Within each group, the group's lead must not be out-ranked by a later
        // same-group selected exercise (tier-rank ordering holds inside the group).
        const seenGroupRanks = {};
        for (const e of ex) {
          const g = getExerciseMetadata(e.name).muscle_target_primary;
          const r = tierRankOf(e.name);
          if (g in seenGroupRanks) {
            expect(
              r,
              `${cluster} seed ${s}: group ${g} — "${e.name}" (rank ${r}) sorted after a worse-ranked pick (${seenGroupRanks[g]})`,
            ).toBeGreaterThanOrEqual(seenGroupRanks[g]);
          }
          seenGroupRanks[g] = r;
        }
      }
    }
  });

  it('group lead is S or A whenever the group has an S/A CORE_AUTO option available', () => {
    // For each library muscle group, does an S/A CORE_AUTO entry exist? If so, the
    // group's lead in any session that trains it should be S/A (rank <= 1).
    const groupHasSA = {};
    for (const [name, meta] of Object.entries(EXERCISE_METADATA)) {
      const g = meta.muscle_target_primary;
      if (!g) continue;
      const band = EXERCISE_TIER_RANK[name];
      if ((band === 'S' || band === 'A') && isActiveMeta(meta)) groupHasSA[g] = true;
    }
    for (const cluster of CLUSTERS) {
      for (let s = 0; s < 25; s++) {
        const ex = buildSession(cluster, ctx({ seed: `sa|${cluster}|${s}` })).exercises;
        const firstOfGroup = {};
        for (const e of ex) {
          const g = getExerciseMetadata(e.name).muscle_target_primary;
          if (!(g in firstOfGroup)) firstOfGroup[g] = e.name;
        }
        for (const [g, name] of Object.entries(firstOfGroup)) {
          if (!groupHasSA[g]) continue;
          expect(
            tierRankOf(name),
            `${cluster} seed ${s}: group ${g} led with "${name}" (rank ${tierRankOf(name)}) but an S/A option exists`,
          ).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('a logged D-band lift (PR continuity) is STILL offered — never yanked', () => {
    // PR-history continuity must override the D-band exclusion (don't remove a lift
    // the user actually logged). "Band Leg Curl" is D-band + the ONLY band-equipment
    // hamstring; with ONLY band gear available its machine leg-curl siblings are
    // equipment-gated out, so the logged D lift must surface — proving the D-removal
    // honored the PR guard (without it, the pool would be empty/skip the lift).
    const dName = 'Band Leg Curl';
    expect(EXERCISE_TIER_RANK[dName]).toBe('D');
    let appeared = false;
    for (let s = 0; s < 40 && !appeared; s++) {
      const names = buildSession('legs', ctx({
        seed: `prD|${s}`,
        prNames: [dName],
        available: ['band', 'bodyweight'],
        weakGroups: ['picioare-hamstrings'],
      })).exercises.map((e) => e.name);
      if (names.includes(dName)) appeared = true;
    }
    expect(appeared, `logged D-band "${dName}" was never offered (PR guard broke)`).toBe(true);
  });
});
