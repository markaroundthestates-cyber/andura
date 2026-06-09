// Wave 1 — "Andura picks like Daniel". With dp_daniel_tier_select_v1 ON (the
// ctx.danielTierSelect override on the pure builder), each muscle's auto-pool must
// lead with Daniel's S/A picks and must contain NO D-band anti-pattern (unless it
// is the muscle's last option). Flag OFF → unchanged behavior (covered elsewhere).

import { describe, it, expect } from 'vitest';
import { buildSession, movementKey, poolForGroup } from '../sessionBuilder.js';
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

  it('every CORE_AUTO library nameEn has an explicit band (unrankedCount === 0)', () => {
    // The alias-gap bug class: a CORE_AUTO lift with NO entry in EXERCISE_TIER_RANK
    // ranks UNRANKED (flag ON) and almost never gets picked (e.g. Lat Pulldown /
    // Leg Press once had no band). A missing band is a MAP GAP = a TEST FAILURE,
    // not a silent low tier. DEFAULT_UNRANKED_TIER is the production fail-safe; this
    // test is the gate that forbids the gap in the first place.
    const coreAuto = Object.entries(EXERCISE_METADATA)
      .filter(([, meta]) => isActiveMeta(meta))
      .map(([name]) => name);
    const unranked = coreAuto.filter((name) => !(name in EXERCISE_TIER_RANK));
    expect(
      coreAuto.length,
      'expected the curated CORE_AUTO catalog to be 143 entries (SSOT 2026-06-09)',
    ).toBe(143);
    expect(
      unranked,
      `CORE_AUTO entries with NO band (map gap — add them to EXERCISE_TIER_RANK): ${unranked.join(', ')}`,
    ).toEqual([]);
  });

  it('a logged D-band lift is NEVER yanked from the pool (PR-continuity safety guard)', () => {
    // Wave 1.1: hasLog is a BOUNDED bonus, not an absolute override — a logged D lift
    // no longer LEADS over a much-better unlogged S/A/C (that is the point of the score
    // model). But the PR-continuity SAFETY must hold: the D-removal must NEVER drop a
    // lift the user has actually LOGGED. Asserted at the pool level (poolForGroup): an
    // unlogged D entry is hard-removed (anti-pattern blocklist), but the SAME D entry,
    // once logged, is retained in the pool so it stays a last-resort fallback for that
    // muscle. "Band Leg Curl" is the band-equipment D-band hamstring.
    const dName = 'Band Leg Curl';
    expect(EXERCISE_TIER_RANK[dName]).toBe('D');
    const args = (prNames) =>
      ['picioare-hamstrings', new Set(['band', 'machine', 'cable', 'dumbbell', 'barbell']),
        3, 2, prNames, 12345, null, null, null, true];
    // Unlogged → the D anti-pattern is removed from the auto-pool.
    const unlogged = poolForGroup(...args(new Set())).map((e) => e.name);
    expect(unlogged, 'unlogged D-band should be removed from the auto-pool').not.toContain(dName);
    // Logged → the PR guard retains it (still offered as a last-resort fallback).
    const logged = poolForGroup(...args(new Set([dName]))).map((e) => e.name);
    expect(logged, 'logged D-band must be retained in the pool (PR guard)').toContain(dName);
  });

  it('hasLog is a BOUNDED bonus: a logged C lift does NOT beat a much-higher unlogged S', () => {
    // The core Wave-1.1 contract: a logged mediocre lift can't lead over a far better
    // unlogged one. With full equipment, a back session led with a logged C-band lift
    // ("Inverted Row Bar", C) must NOT out-rank the unlogged S-band pulls — the S lead
    // (Lat Pulldown / Cable Row / Chest-Supported Row, all S) must still front the back
    // block. tierSelectScore: logged-C = 35+10 = 45 < unlogged-S = 100.
    const loggedC = 'Inverted Row Bar';
    expect(EXERCISE_TIER_RANK[loggedC]).toBe('C');
    for (let s = 0; s < 25; s++) {
      const ex = buildSession('pull', ctx({ seed: `bonus|${s}`, prNames: [loggedC] })).exercises;
      const firstBack = ex.find((e) => getExerciseMetadata(e.name).muscle_target_primary === 'spate');
      expect(firstBack, `pull seed ${s}: no back exercise selected`).toBeTruthy();
      expect(
        tierRankOf(firstBack.name),
        `pull seed ${s}: back led with "${firstBack.name}" (rank ${tierRankOf(firstBack.name)}) — a logged C beat an unlogged S/A`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it('BACK session prefers pattern COVERAGE: not 3 vertical pulls', () => {
    // A spate session must cover ≥1 vertical pull + ≥1 horizontal row when both exist
    // in the pool, instead of stacking 3 vertical pulls (the bad example: Neutral-Grip
    // Pulldown + Wide-Grip Pulldown + V-Bar Pulldown + Chin-up). Verticals = pulldown/
    // pull-up/chin-up tokens; rows = row token. Whenever a back session selects ≥2
    // pull-pattern back lifts, it must include at least one of EACH pattern (coverage),
    // never all-vertical.
    const vert = new Set(['pulldown', 'pull-up', 'chin-up']);
    const tokenOf = (name) =>
      movementKey(name, getExerciseMetadata(name)).split('::')[1] ?? '';
    for (const cluster of ['pull', 'upper', 'full']) {
      for (let s = 0; s < 30; s++) {
        const ex = buildSession(cluster, ctx({ seed: `cover|${cluster}|${s}` })).exercises;
        const backTokens = ex
          .filter((e) => getExerciseMetadata(e.name).muscle_target_primary === 'spate')
          .map((e) => tokenOf(e.name));
        const pulls = backTokens.filter((t) => vert.has(t) || t === 'row');
        if (pulls.length >= 2) {
          const hasVert = pulls.some((t) => vert.has(t));
          const hasRow = pulls.some((t) => t === 'row');
          expect(
            hasVert && hasRow,
            `${cluster} seed ${s}: back pull set = [${backTokens.join(', ')}] — no pattern mix (all one pattern)`,
          ).toBe(true);
        }
      }
    }
  });
});
